import {
    pickerHandler,
    handleDoubleSelect
} from './datepicker.interfaces'
import {
    attr,
    getFront,
    getPeek,
    gap,
    // setRange,
} from "./util"

import Observer from './datepicker.observer'


import {parseFormatted, format} from "./datepicker.formatter";

export default function (options: pickerHandler) {
    let {
        element,
        selected,
        isDouble,
        limit,
        inDates,
        bindData,
        dateFormat,
        infiniteMode
    } = options;
    const collection = element.querySelectorAll(".calendar-date-cell");
    const cache = selected;

    for (let i = 0; i < collection.length; i++) {
        const item = collection[i];
        item.addEventListener("click", () => {
                //缓存已选的日期
                let subCache = selected;
                let type = 'selected';
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
                const prevDateIsValid = inDates(prevDateString);

                if (!date
                    || (selected.length <= 0 && !inDates(date) && bindData && !infiniteMode)
                    || (isDouble && !prevDateIsValid && !inDates(date) && !infiniteMode)
                    || index >= 0 && !inDates(date) && !infiniteMode
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
                    selected = inDates(date) ? selected : cache;
                } else {
                    const beforeHandled = {
                        start: getFront(selected),
                        end: getPeek(selected)
                    };
                    const diffBeforeHandled = gap(
                        parseFormatted(beforeHandled.start, dateFormat),
                        parseFormatted(beforeHandled.end, dateFormat)
                    );
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

                    
                    const peek = getPeek(handled.selected);
                    //找出全部选中的无效日期
                    const dates = handled.dates;
                    const datesList = [];
                    const notInDatesList = [];
                    for (let date of dates) {
                        if (inDates(date)) {
                            datesList.push(date)
                        } else {
                            notInDatesList.push(date)
                        }
                    }
                    if (notInDatesList.length > 0) {
                        if (handled.selected.length >= 2) {
                            inDates(peek) ? handled.selected.shift() : handled.selected.pop()
                        }

                    }
                    if (handled.selected.length <= 1) {
                        if (!inDates(peek)) {
                            handled.selected = subCache;
                            type = 'disabled'
                        }
                    }

                    selected = handled.selected;
                }
                Observer.$emit('select', {
                    type: type,
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

