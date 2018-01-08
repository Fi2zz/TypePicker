import {
    diff, attr,
    removeClass,
    addClass,
    attrSelector,
    quickSort,
    inArray, hasClass
} from "./util"


import {ranged as setRange} from './datepicker.ranger'

export default function (element: any,
                         selected: Array<any>,
                         isDouble: boolean,
                         source: any,
                         parse: Function,
                         format: Function,
                         limit: number,
                         inDates: Function,
                         update: Function

) {
    const collection = element.querySelectorAll(".calendar-date-cell");
    let hoverRange = <Array<any>>[];
    let inHoverRange = <Array<any>>[];
    let newRange = <Array<any>>[];



    for (let i = 0; i < collection.length; i++) {
        const item = collection[i];
        item.addEventListener("click", (e: any) => {
            //缓存已选的日期
            const cache = selected;
            const date = attr(item, "data-date");
            const index = selected.indexOf(date);
            //不可选的日期
            //初始化时，selected的length为0，点击不可选日期
            if (!date ||
                index >= 0 ||
                selected.length <= 0 && !inDates(date)) {
                return false;
            }

            //双选，但选择的日期数量大于2，或单选
            if (isDouble && selected.length >= 2 || !isDouble) {
                selected = []
            }
            selected.push(date);
            //选择日期
            if (isDouble) {
                const handled = doubleSelectHandler(date, selected, cache, limit, source, format, parse);
                selected = handled.selected;
                const range = handled.range;
                const allValid = handled.allValid;
                const start = selected[0];
                const end = selected[selected.length - 1];
                const diff = gap(parse(start), parse(end));
                const isOutOfLimit = diff > limit;
                const isValid = doublePick(
                    element,
                    start,
                    end,
                    diff,
                    isOutOfLimit,
                    allValid
                );

                if (isValid) {
                    setRange([], element, true);
                }
                if (allValid && isValid) {
                    setRange(range, element, false)
                }


            } else {
                let selector = item;
                let shouldChange = true;
                if (!inDates(date)) {
                    selected = cache;
                    shouldChange = false;
                }

                singlePick(selector, element, shouldChange);
            }
            update({
                type:'selected',
                value:selected
            })
        });

        //     item.addEventListener("mouseenter", () => {
        //         const date = attr(item, "data-date");
        //         const prev = attr(item.previousElementSibling, "data-date");
        //         const next = attr(item.nextElementSibling, "data-date");
        //         const start = selected[0];
        //         const end = selected[selected.length - 1];
        //         const range = hoverHandler(
        //             hoverRange,
        //             date,
        //             start,
        //             end,
        //             prev,
        //             next,
        //             limit,
        //             inDates,
        //             parse,
        //             format);
        //         hoverRange = setRange(range, element, false, true);
        //     });
        //
        //     item.addEventListener("mouseleave", () => {
        //
        //         const ranges = Array.prototype.slice.call(element.querySelectorAll(".in-range"));
        //
        //         const date = attr(item, "data-date")
        //         let outOfRange = [];
        //         let index = -1
        //
        //         for (let i = 0; i < ranges.length; i++) {
        //
        //             let d = attr(ranges[i], "data-date");
        //
        //
        //             if (d === date) {
        //                 index = i
        //                 // outOfRange = ranges.slice(i, ranges.length - 1)
        //             }
        //
        //         }
        //
        //         console.log(ranges.slice(index))
        //
        //         // console.log(outOfRange)
        //
        //     });
        //
    }
}


function hoverHandler(range: Array<any>,
                      date: string,
                      start: string,
                      end: string,
                      prev: string,
                      next: string,
                      limit: number,
                      inDates: Function,
                      parse: Function,
                      format: Function) {
    const startDate = parse(start)
    const endDate = parse(end);
    const currDate = parse(date);
    const diffStart = gap(currDate, startDate) * -1;
    const diffEnd = gap(endDate, currDate);


    if (date === start
        || date === end
        || diffStart < 0
        || diffStart > limit
        || start !== end && diffEnd > 0
        || diffEnd > limit
        || ~range.indexOf(parse(date).getTime())
        || !inDates(date) && !inDates(next) && !inDates(prev)
        || inDates(date) && !inDates(prev)
        || !inDates(date) && inDates(next)

    ) {
        range = [];
    } else {
        range.push(parse(date).getTime());
        if (range.length < diffStart) {
            range = [];
            const year = startDate.getFullYear();
            const month = startDate.getMonth();
            const date = startDate.getDate();
            for (let i = 0; i <= diffStart; i++) {
                let d = new Date(year, month, date + i);
                range.push(d.getTime())
            }
            let inDatesDate = [];
            for (let i = 0; i < range.length; i++) {
                let d = new Date(range[i])
                let formatted = format(d).value;
                if (inDates(formatted)) {
                    inDatesDate.push(formatted);
                }
            }
            if (inDatesDate.length < range.length - 1) {
                range = []
            }
        }


        range = quickSort(range).reverse().map((time: number) => {
            return format(new Date(time)).value
        });
    }
    return range


}


function singlePick(selector: string, collector: HTMLElement, shouldChange: boolean) {
    if (shouldChange) {
        const actives = collector.querySelectorAll(".active");
        for (let i = 0; i < actives.length; i++) {
            removeClass(actives[i], "active")
        }
        if (!hasClass(selector, "disabled")) {
            addClass(selector, "active")
        }
    }

}
function doublePick(collector: HTMLElement,
                    start: string,
                    end: string,
                    diff: number,
                    outOfLimit: boolean,
                    valid: boolean) {
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

            return true
        }
        else {
            return false
        }

    } else {
        addClass(current.end, "active");
        if (diff > 0) {
            if (outOfLimit) {
                addClass(current.end, "start-date");
                removeClass(cache.start, "start-date");
                removeClass(cache.start, "active");
            } else {
                if (valid) {
                    addClass(current.end, "end-date");
                } else {
                    removeClass(current.start, "active");
                    removeClass(current.start, "start-date");
                    addClass(current.end, "start-date")
                }
            }
        } else if (diff < 0) {
            removeClass(current.start, "active");
            removeClass(current.start, "start-date");
            addClass(current.end, "start-date")
        }
    }


    return true


}
function gap(d1: Date, d2: Date) {
    let value = diff(d1, d2, "days");
    return value === 0 ? 0 : value * -1
}
function doubleSelectHandler(date: any,
                             selected: Array<any>,
                             cache: Array<any>,
                             limit: number,
                             source: any,
                             format: Function,
                             parse: Function) {
    function inDates(item?: any) {
        return inArray(source, item);
    }

    let range = <Array<any>>[];
    let inRange = <Array<any>>[];
    //获取已选的开始日期
    const start = selected[0];
    //获取已选的结束日期
    //结束日期和开始日期有可能重合，
    //此时为只选了开始日期，尚未选择结束日期
    const end = selected[selected.length - 1];
    //转换成日期对象
    const startDate = parse(start), endDate = parse(end);
    //对比开始日期和结束日期
    const diff = gap(startDate, endDate);
    const length = selected.length;
    //已有开始日期和结束日期
    //重新选择开始日期
    if (length >= 2) {
        //同一日
        if (diff <= 0) {
            if (inDates(date)) {
                selected.shift()
            }
            else {
                selected = [selected[0]]
            }
        } else {
            if (inDates(end)) {
                //得到选择范围
                const year = startDate.getFullYear(),
                    month = startDate.getMonth(),
                    date = startDate.getDate();
                for (let i = 1; i < diff; i++) {
                    const d = new Date(year, month, date + i);
                    const formatted = format(d).value;
                    if (inDates(formatted)) {
                        inRange.push(formatted)
                    }
                    range.push(formatted)
                }
            } else {
                if (inDates() && end) {
                    selected.shift();
                    range.push(end)
                }
            }

        }
    }
    //选择了开始日期，尚未选择结束日期
    else if (length === 1) {
        //开始日期为当前点击的元素
        const start = selected[selected.length - 1];
        //如果在data选项里有当前选择的日期
        //则选择的日期为当前当前点击的元素
        if (inDates(start)) {
            selected = [start];
        } else {
            //如果选择的日期不在data里，则读取缓存的数据
            selected = cache;
        }
    }
    //既没有开始日期也没有结束日期
    //选择缓存的作为被选的值
    else {
        selected = cache;
    }

    //重合
    let allValid = range.length === inRange.length;

    if (!allValid) {
        selected = [selected[selected.length - 1]]
    }
    //选完开始日期和结束日期
    if (selected.length === 2) {
        let lastValidDate = null;
        const end = selected[selected.length - 1];
        const endDate = parse(end);
        const startDate = parse(selected[0]);
        //计算开始日期和结束日期之间的间隔，
        // 得到日期范围
        const diff = gap(endDate, startDate) * -1;
        if (diff > 0) {
            const year = startDate.getFullYear(),
                month = startDate.getMonth(),
                date = startDate.getDate();
            range = [];
            inRange = [];
            //第一天为有效日期，最后一天为无效日期
            //判断最后一个有效日期与最后一天的区间
            //如果区间大于1或小于-1，则为无效区间，
            for (let i = 0; i < diff; i++) {
                let d = new Date(year, month, date + i)
                const string = format(d).value;
                if (inDates(string)) {
                    lastValidDate = d
                    inRange.push(string)
                }
                if (!~range.indexOf(string)) {
                    range.push(string);
                }
            }
            const newDiff = gap(lastValidDate, endDate);

            if (newDiff === 1 || newDiff === -1) {
                allValid = true;
            } else {
                range = [];
                selected = [selected[0]];
                allValid = false
            }
        }


        if (inRange.length === range.length) {
            allValid = true

        } else {
            allValid = false;
            selected = [selected[0]]
        }
        //超出限制范围
        //取最后一天
        if (range.length > limit) {
            allValid = false;
            const peek = selected[selected.length - 1];
            if (inDates(peek)) {
                selected = [peek]
            } else {
                selected = [cache[0]]
            }
        }
    }
    return {
        selected,
        allValid,
        range
    }
}

