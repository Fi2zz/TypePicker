import {initRangeOptions} from './datepicker.interfaces'
import {
    attr,
    diff,
    inArray,
    addClass,
    hasClass,
    removeClass,
    attrSelector,

} from "./util"

const date = new Date();
const currDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

function getRange(collection: HTMLCollection, start: string, end: string) {
    let temp = [];
    for (let i = 0; i < collection.length; i++) {
        let date = attr(collection[i], "data-date");
        if (date) {
            temp.push(date);
        }
    }
    let startIndex = -1;
    let endIndex = -1;
    for (let i = 0; i < temp.length; i++) {
        let data = temp[i];
        if (data === start) {
            startIndex = i
        }
        else if (data === end) {
            endIndex = i
        }
    }
    if (endIndex === startIndex || endIndex < 0) {
        return [];
    }

    return temp.slice(startIndex + 1, endIndex)
}

function setStartAndEnd(collection: HTMLCollection,
                        inDates: Function,
                        data: Array<any>,
                        parse: Function) {
    let temp = <Array<string>> [];
    const start = data[0];
    const end = data[data.length - 1];
    for (let i = 0; i < collection.length; i++) {
        let item = collection[i];
        let nextItem = collection[i + 1];
        if (data.length > 0) {

            const date = attr(collection[i], "data-date");

            if (date === start) {
                addClass(item, "start-date")
            }
            else if (date === end) {
                addClass(item, "end-date")
            }
        } else {
            if (item && nextItem) {
                let curr = attr(item, "data-date");
                let next = attr(nextItem, "data-date");
                if (curr && next) {
                    let start = parse(curr);
                    if (diff(start, currDate, "days") >= 0) {
                        let hasItem = inDates(next) && inDates(curr) || inDates(curr) && !inDates(next);
                        if (hasItem) {
                            if (temp.length < 2) {
                                addClass(item, "start-date");
                                addClass(nextItem, "end-date");
                                temp.push(curr, next)
                            }
                        }
                    }
                }
            }
        }
    }


    if (data.length > 0) {
        temp = data
    }
    return temp
}

export function ranged(data: Array<any>, collector: HTMLElement, remove: boolean, clearRange?: boolean) {
    if (remove) {
        let collection = collector.querySelectorAll(".in-range");
        for (let i = 0; i < collection.length; i++) {
            removeClass(collection[i], "in-range")
        }
    } else {
        for (let i = 0; i < data.length; i++) {
            let selector = <string> attrSelector("data-date", data[i]);
            let element = collector.querySelector(selector);
            if (!hasClass(element, "active")) {
                addClass(element, "in-range")

            }
        }
    }
    if (clearRange) {
        return <Array<any>>[]
    }
}

export function setInitRange(options: initRangeOptions) {

    // console.log(options)


    let {
        collector,
        collection,
        data,
        isDouble,
        parse,
        format,
        inDates,
        isInit
    } = options;


    let dates: Array<any> = [];
    if (!isDouble) {
        dates = data
    } else {



        if (data.length >= 2) {
            let start = data[0];
            let end = data[data.length - 1];
            //开始日期不能为无效日期
            if (!inDates(start)) {
                data = []
            }
            const startDate = parse(start);
            const endDate = parse(end);
            const year = startDate.getFullYear();
            const month = startDate.getMonth();
            const date = startDate.getDate();
            let inValidDates = [];
            const gap = diff(endDate, startDate, "days") + 1;
            for (let i = 0; i < gap; i++) {
                let d = new Date(year, month, date + i);
                let formatted = format(d).value;
                if (!inDates(formatted)) {
                    inValidDates.push(formatted);
                }
            }
            // 前提 无效日期可以作为endDate
            // 但不能做为startDate
            // 即选中的日期中只能包含[一个]无效日期
            // 例如 选中的日期为 ["2017-12-01","2017-12-06"]
            // 2017-12-04 为有效日期，2017-12-05为无效日期,2017-12-16为无效日期
            // 那么此时无效日期有两个，故此时会被重置

            if (inValidDates.length >= 2) {
                data = []
            }
        }

        if (data.length > 0 && isInit || !isInit) {
            dates = setStartAndEnd(collection, inDates, data, parse);
        }

        const start = dates[0];
        const end = dates[dates.length - 1];

        const startDate = parse(start);
        const endDate = parse(end);

        const range = getRange(collection, start, end);
        if (range.length > 0) {
            ranged(range, collector, false)
        }

    }


    //设置激活状态
    for (let i = 0; i < dates.length; i++) {
        let selector = <string>attrSelector("data-date", dates[i]);
        let element = collector.querySelector(selector);
        addClass(element, "active")
    }
    return dates
}
