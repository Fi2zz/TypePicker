import {
    pickerHandler,
    handleDoubleSelect
} from './datepicker.interfaces'
import {
    diff,
    attr,
    removeClass,
    addClass,
    attrSelector,
    hasClass,
    getFront,
    getPeek,
    gap
} from "./util"

import {parseFormatted, format} from "./datepicker.formatter";
import {setRange} from './datepicker.ranger'

export default function (options: pickerHandler) {
    let {
        element,
        selected,
        isDouble,
        limit,
        inDates,
        bindData,
        dateFormat,
        emitter
    } = options;
    const collection = element.querySelectorAll(".calendar-date-cell");
    for (let i = 0; i < collection.length; i++) {
        const item = collection[i];
        item.addEventListener("click", () => {
                //缓存已选的日期
                const cache = selected;
                const date = attr(item, "data-date");
                const index = selected.indexOf(date);
                //不可选的日期
                //点击无效日期时，返回false
                //初始化时，selected的length为0，点击不可选日期
                //当前点击的日期的前一天是无效日期，则返回false
                // 如  2018-02-23，2018-02-24 为无效日期，则点击2018-02-24返回无效日期
                const now = parseFormatted(date, dateFormat);
                const prevDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                const prevDateString = format(prevDate, dateFormat).value;
                const prevDateIsValid = inDates(prevDateString)
                if (!date
                    || (selected.length <= 0 && !inDates(date) && bindData)
                    || (isDouble && !prevDateIsValid && !inDates(date))
                    || index >= 0 && !inDates(date)
                ) {
                    return false;
                }
                //重复选择
                //如选择了 2018-02-04 ~ 2018-02-06
                //但是用户实际想选择的是 2018-02-04~2018-02-05，
                //此时 用户再次选择 2018-02-04，其他日期将被删除
                if (index >= 0) {

                    selected = inDates(getPeek(selected)) ? [getPeek(selected)] : [getFront(selected)]
                }
                //双选，但选择的日期数量大于2，或单选
                if (isDouble && selected.length >= 2 || !isDouble) {
                    selected = []
                }
                selected.push(date);
                if (!isDouble) {
                    const handled = singlePick(item, element, inDates(date), selected)
                    selected = handled.length > 0 ? handled : cache;
                } else {
                    const beforeHandled = {
                        start: getFront(selected),
                        end: getPeek(selected)
                    };
                    const diffBeforeHandled = gap(
                        parseFormatted(beforeHandled.start, dateFormat),
                        parseFormatted(beforeHandled.end, dateFormat));
                    if (diffBeforeHandled < 0) {
                        if (!inDates(beforeHandled.end)) {
                            selected.pop()  //= [date]
                        } else {
                            selected = [date]
                        }
                    }
                    else {
                        if (!inDates(beforeHandled.end) && !prevDateIsValid) {
                            selected = [beforeHandled.start]
                        }
                    }

                    const handled = handleDoubleSelect({
                        date,
                        dateFormat,
                        selected,
                        limit,
                    }, inDates);
                    const afterHandled = {
                        start: getFront(handled.selected),
                        end: getPeek(handled.selected)
                    };
                    const diffAfterHandled = gap(parseFormatted(afterHandled.start, dateFormat), parseFormatted(afterHandled.end, dateFormat));
                    //找出全部选中的无效日期
                    const dates = handled.dates;
                    const datesList = [];
                    const notInDatesList = [];
                    for (let date of dates) {
                        if (date !== afterHandled.start && date !== afterHandled.end) {
                            if (inDates(date)) {
                                datesList.push(date)
                            } else {
                                notInDatesList.push(date)
                            }
                        }
                    }

                    if (notInDatesList.length > 0) {
                        handled.selected.shift();
                        afterHandled.start = afterHandled.end;
                        afterHandled.end = null;
                    }
                    doublePick(
                        element,
                        afterHandled.start,
                        afterHandled.end,
                        diffAfterHandled,
                        diffAfterHandled > limit || diffAfterHandled < 0,
                    );
                    if (bindData) {
                        if (notInDatesList.length <= 0) {
                            setRange(datesList, element, dates.length <= 0)
                        }
                    }
                    else {
                        setRange(datesList, element, dates.length <= 0)
                    }
                    selected = handled.selected;
                }
                emitter('select', {
                    type: "selected",
                    value: selected
                })
            }
        );
    }
}
function handleDoubleSelect(options: handleDoubleSelect, inDates: Function) {
    let selected = options.selected;
    const start = getFront(selected);
    const end = getPeek(selected);
    const startDate = parseFormatted(start, options.dateFormat);
    const endDate = parseFormatted(end, options.dateFormat);
    const dates = [];
    if (start === end && selected.length >= 2) {
        selected.pop();
    }
    const diffs = gap(startDate, endDate);

    //选择了两个不同的日期，且第一个日期小于第二个日期
    if (diffs > 0) {
        if (diffs <= options.limit) {
            for (let i = 1; i < diffs; i++) {
                let date = format(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i), options.dateFormat).value;
                dates.push(date);
            }
        } else {
            if (!inDates(end)) {
                selected.pop()
            }
            else {
                selected.shift();
            }

        }
    }
    else if (diffs <= 0) {
        if (selected.length >= 2) {
            selected.pop();
        }
    }
    return {
        dates,
        selected
    }
}
function singlePick(selector: string, collector: HTMLElement, shouldChange: boolean, selected) {
    if (shouldChange) {
        const actives = collector.querySelectorAll(".active");
        for (let i = 0; i < actives.length; i++) {
            removeClass(actives[i], "active")
        }
        if (!hasClass(selector, "disabled")) {
            addClass(selector, "active")
        }
        return selected
    }
    return []
}
function doublePick(collector: HTMLElement, start: string, end: string, diff: number, outOfLimit: boolean) {
    //缓存已选的开始日期和结束日期
    const cache = {
        start: collector.querySelector(".start-date"),
        end: collector.querySelector(".end-date")
    };
    const current = {
        start: collector.querySelector(<string>attrSelector("data-date", start)),
        end: collector.querySelector(<string>attrSelector("data-date", end))
    };
    //选择了开始日期，尚未选择结束日期
    if (diff === 0) {
        if (!hasClass(current.start, "disabled")) {
            removeClass(cache.start, "start-date");
            removeClass(cache.start, "active");
            removeClass(cache.end, "end-date");
            removeClass(cache.end, "active");
            addClass(current.start, "active");
            addClass(current.start, "start-date");
        }
    } else {
        addClass(current.end, "active");
        if (diff > 0) {
            if (outOfLimit) {
                addClass(current.end, "start-date");
                removeClass(cache.start, "start-date");
                removeClass(cache.start, "active");
            } else {
                if (start && !end) {
                    removeClass(cache.start, "active");
                    removeClass(cache.start, "start-date");
                    addClass(current.start, 'active');
                    addClass(current.start, 'start-date');
                }
                else if (end && start !== end) {
                    addClass(current.end, 'active');
                    addClass(current.end, 'end-date');
                }
            }
        } else if (diff < 0) {
            removeClass(current.start, "active");
            removeClass(current.start, "start-date");
            addClass(current.end, "start-date")
        }
    }
}