import {
    addClass,
    attrSelector,
    getDates,
    hasClass,
    isDate,
    parseToInt,
    removeClass,
    padding,
    diff
} from "./util";

export const getDisableDates = (startDate: Date,
                                endDate: Date,
                                dateFormat: string,
                                should: boolean) => {
    const temp: any = {};
    if (should) {
        //处理开始日期前的日期
        if (startDate instanceof Date) {
            const startDateIndex = <number>startDate.getDate();
            for (let i = 1; i <= startDateIndex - 1; i++) {
                let date = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDateIndex - i
                );
                let formatted = format(date, dateFormat)
                temp[formatted] = formatted;
            }
        }

        if (endDate instanceof Date) {
            //处理结束日期后的日期
            const endMonthDates = getDates(endDate.getFullYear(), endDate.getMonth());
            //结束日期往后计算多一个月，避免在 views=2 的情况下出错
            const endDateNextMonthDate = getDates(
                endDate.getFullYear(),
                endDate.getMonth() + 1
            );
            const diffs = endMonthDates - endDate.getDate() + endDateNextMonthDate;

            for (let i = 1; i <= diffs; i++) {
                let date = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth(),
                    endDate.getDate() + i
                );
                let formatted = format(date, dateFormat);
                temp[formatted] = formatted;
            }
        }
    }
    return temp;
};

export function getViews(view: number | string) {
    if (!view) {
        return 1;
    }
    const views = parseToInt(view);
    if (isNaN(views)) {
        if (view !== "auto") {
            return 1;
        } else {
            return "auto";
        }
    } else {
        if (view > 2 || views <= 0) {
            return 1;
        } else {
            return views;
        }
    }
}


export const getClassName = (baseClassName: string, views: number | string) => {
    return `${baseClassName} calendar calendar-${
        views === 2
            ? "double-views"
            : views === 1 ? "single-view" : "flat-view"
        }`;
};


export function parseEl(el: any) {
    if (!el) {
        return null;
    }

    return typeof el === 'string' ? document.querySelector(el) : el;
}


export function setNodeRangeState(el: HTMLElement,
                                  data: Array<any>,
                                  should?: boolean) {
    if (!should) return;
    let collection = el.querySelectorAll(".in-range");
    for (let i = 0; i < collection.length; i++) {
        removeClass(collection[i], "in-range");
    }
    for (let i = 0; i < data.length; i++) {
        let selector = <string>attrSelector("data-date", data[i]);
        let element = el.querySelector(selector);
        if (!hasClass(element, "active")) {
            addClass(element, "in-range");
        }
    }
}

export function setNodeActiveState(el: HTMLElement, dates: Array<string>, isDouble) {
    const nodes = el.querySelectorAll(".calendar-date-cell");
    for (let i = 0; i < nodes.length; i++) {
        removeClass(nodes[i], "active");
        if (isDouble) {
            removeClass(nodes[i], "start-date");
            removeClass(nodes[i], "end-date");
        }
    }
    for (let i = 0; i < dates.length; i++) {
        let date = dates[i];
        let dateElement = el.querySelector(`[data-date="${date}"]`);
        addClass(dateElement, "active");
        if (isDouble) {
            if (i === 0) {
                addClass(dateElement, "start-date");
            }
            if (dates.length === 2 && i === dates.length - 1) {
                addClass(dateElement, "end-date");
            }
        }
    }
}


export const DEFAULT_LANGUAGE = {
    days: ["日", "一", "二", "三", "四", "五", "六"],
    months: [
        "01月",
        "02月",
        "03月",
        "04月",
        "05月",
        "06月",
        "07月",
        "08月",
        "09月",
        "10月",
        "11月",
        "12月"
    ],
    year: "年"
};
export const standardDate = (date?: Date, size?: number) => {
    if (!size) {
        size = 0;
    }
    const curr: Date = isDate(date) ? date : new Date();
    return new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + size);
};


function isZeroLeading(format: string) {
    const splitFormat: Array<string> = format.split(/\W/, 3);
    splitFormat.shift();

    const temp = [];
    for (let i = 0; i < splitFormat.length; i++) {
        let item = splitFormat[i];
        if (/\w\w/.test(item)) {
            temp.push(item);
        }
    }
    return splitFormat.length === temp.length;
}

export function format(date: Date, format?: string) {
    if (!format) {
        format = "YYYY-MM-DD";
    }
    format = format.toUpperCase();
    let parts = <any>{
        YYYY: date.getFullYear(),
        DD: padding(date.getDate()),
        MM: padding(date.getMonth() + 1),
        D: date.getDate(),
        M: date.getMonth() + 1
    };
    const zeroLeading = isZeroLeading(format);
    // return {
    //     origin: date,
    //     date: zeroLeading ? parts["DD"] : parts["D"],
    //     month: zeroLeading ? parts["MM"] : parts["M"],
    //     year: parts["YYYY"],
    //     day: date.getDay(),
    //     value:
    //         format.replace(/(?:\b|%)([dDMyY]+)(?:\b|%)/g, (match, $1) => {
    //         noop(match);
    //         return parts[$1] === undefined ? $1 : parts[$1];
    //     })
    // };

    return format.replace(/(?:\b|%)([dDMyY]+)(?:\b|%)/g, (match, $1) => {
        noop(match);
        return parts[$1] === undefined ? $1 : parts[$1];
    })
}

function noop(a: any) {
    return a;
}

export function parse(strDate: string, format: string) {

    //
    function parse(string: string | Date): any {
        if (!string) return new Date();

        if (string instanceof Date) return string;
        let split = string.split(/\W/).map(item => parseInt(item));
        let date = new Date(split.join(" "));
        if (!date.getTime()) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    //能直接解析成日期对象的，直接返回日期对象
    //如 YYYY/MM/DD YYYY-MM-DD
    if (!format) {
        format = "YYYY-MM-DD";
    }

    const formatRegExpTester = createDateFormatVaildator(format);
    if (!formatRegExpTester.test(strDate)) {
        return null;
    }
    let ret = parse(strDate);
    if (ret) return ret;
    const token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
    const parseFlags: any = {
        D: [/\d{1,2}/, (d: any, v: any) => (d.day = parseInt(v))],
        M: [/\d{1,2}/, (d: any, v: any) => (d.month = parseInt(v) - 1)],
        DD: [/\d{2}/, (d: any, v: any) => (d.day = parseInt(v))],
        MM: [/\d{2}/, (d: any, v: any) => (d.month = parseInt(v) - 1)],
        YY: [/\d{2,4}/, (d: any, v: any) => (d.year = parseInt(v))],
        YYYY: [/\d{2,4}/, (d: any, v: any) => (d.year = parseInt(v))]
    };
    ret = function (dateStr: string, format: string) {

        if (dateStr.length > 1000) {
            return null;
        }
        let isValid = true;
        const dateInfo = {
            year: 0,
            month: 0,
            day: 0
        };
        format.replace(token, function ($0) {
            if (parseFlags[$0]) {
                const info = parseFlags[$0];
                const regExp = info[0];
                const handler = info[info.length - 1];
                const index = dateStr.search(regExp);
                if (!~index) {
                    isValid = false;
                } else {
                    dateStr.replace(info[0], function (result) {
                        handler(dateInfo, result);
                        dateStr = dateStr.substr(index + result.length);
                        return result;
                    });
                }
            }
            return parseFlags[$0] ? "" : $0.slice(1, $0.length - 1);
        });
        if (!isValid) {
            return null;
        }
        const parsed = new Date(dateInfo.year, dateInfo.month, dateInfo.day);
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };

    return ret(strDate, format);
}

function createDateFormatVaildator(formate: string) {
    const sepreator = formate.split(/\w/).filter(item => !!item);
    let result: any = formate.split(/\W/).map((string, index) => {
        let {length} = string;
        if (index === 0) {
            return `\\d{${length}}`;
        } else if (index === 1) {
            if (length === 1) {
                return `\(?:[1-9]?[0-9])`;
            } else if (length === 2) {
                return `\([0-9][0-2])`;
            }
        } else if (index === 2) {
            if (length === 1) {
                return `\(?:[1-9]?[0-9])`;
            } else if (length === 2) {
                return `\[0-9][1-9]`;
            }
        }
    });
    let regexpString = result.join(`\\${sepreator.pop()}`);
    return new RegExp(regexpString);
}

export function getDisabledDays(start: Date, end: Date, days: Array<number>, dateFormat: string) {
    let map = {};
    if (start && end) {
        let gap = diff(start, end, "days", true);
        for (let i = 0; i < gap; i++) {
            let date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            let day = date.getDay()
            if (~days.indexOf(day)) {
                let formatted = format(date, dateFormat)
                map[formatted] = formatted
            }
        }
    }
    return map

}

export const setDate = (date: Date, size?: number, who?: string) => {


    if (!who) {
        who = 'date'
    }

    if (!size) {
        size = 0
    }

    let monthSize = 0;
    let yearSize = 0;
    let dateSize = size;


    if (who === 'year') {
        yearSize = size
    }
    else if (who === 'month') {
        monthSize = size;
    }
    return new Date(date.getFullYear() + yearSize, date.getMonth() + monthSize, date.getDate() + dateSize)
};

export const Observer = (function () {
    let clientList = <any>{};
    const $remove = function (key: string, fn?: any | undefined) {
        let fns = clientList[key];
        // key对应的消息么有被人订阅
        if (!fns) {
            return false;
        }
        // 没有传入fn(具体的回调函数), 表示取消key对应的所有订阅
        if (!fn) {
            fns && (fns.length = 0);
        } else {
            // 反向遍历
            for (let i = fns.length - 1; i >= 0; i--) {
                let _fn = fns[i];
                if (_fn === fn) {
                    // 删除订阅回调函数
                    fns.splice(i, 1);
                }
            }
        }
    };
    const $on = function (key: string, fn: Function) {
        if (!clientList[key]) {
            clientList[key] = [];
        }
        clientList[key].push(fn);
    };
    const $emit = function (...args: Array<any>) {
        let key = [].shift.call(args);
        let fns = clientList[key];
        if (!fns || fns.length === 0) {
            return false;
        }
        for (let i = 0, fn; (fn = fns[i++]);) {
            fn.apply(this, args);
        }
    };
    return {
        $on,
        $emit,
        $remove
    };
})();

