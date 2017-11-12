import {attr, addClass, hasClass, removeClass, attrSelector, diff} from "./util"

const date = new Date();

const currDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
function getDefaultRange(collection: HTMLCollection, start: string, end: string) {
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
function setStartAndEnd(collection: HTMLCollection, source: any, data: Array<any>, parse: Function) {
    let temp = <Array<string>> [];
    const start = data[0];
    const end = data[data.length - 1];
    for (let i = 0; i < collection.length; i++) {
        let item = collection[i];
        let nextItem = collection[i + 1];
        if (data.length > 0) {
            let date = attr(collection[i], "data-date");
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
                        if (source[next] && source[curr] || source[curr] && !source[next]) {
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
function setActive(collection: HTMLCollection, date: string) {
    for (let i = 0; i < collection.length; i++) {
        let item = collection[i];
        let value = attr(item, "data-date");
        if (value === date) {
            addClass(item, "active")
        }
    }

}
export function ranged(data: Array<any>, collector: HTMLElement, remove: boolean) {
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
}

export function setDefaultRange(collector: HTMLElement,
                                collection: HTMLCollection,
                                data: Array<string>,
                                initDate: any,
                                source: any,
                                isDouble: boolean,
                                parse: Function) {
    let dates = [];
    if (!isDouble) {
        dates = data.length > 0 ? data : [initDate];
    } else {
        dates = setStartAndEnd(collection, source, data, parse);
        const start = dates[0];
        const end = dates[dates.length - 1];
        const range = getDefaultRange(collection, start, end);
        if (range.length > 0) {
            ranged(range, collector, false)
        }
    }
    for (let i = 0; i < dates.length; i++) {
        setActive(collection, dates[i]);
    }
    return dates
}