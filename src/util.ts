export function diff(start: Date, end: Date, type: string = "month") {
    if (type == "month") {
        return Math.abs((start.getFullYear() * 12 + start.getMonth()) - ( end.getFullYear() * 12 + end.getMonth()))
    } else if (type === "days") {
        const startTime = <any>new Date(start.getFullYear(), start.getMonth(), start.getDate())
        const endTime = <any>new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return Math.round((startTime - endTime)) / (1000 * 60 * 60 * 24);
    }
}

export const attrSelector = (attr: string, value: string) => `[${attr}="${value}"]`;
export const getDates = (year: number, month: number): number => {
    let d = new Date(year, month, 1)
    let utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate()
};
export const padding = (n: Number) => `${n > 9 ? n : "0" + n}`
//获取每月的1号的周几
export const getFirstDay = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay()
};
export const getWeeksOfMonth = (date: Date): number => {
    let firstDate = new Date(date.getFullYear(), date.getMonth() - 1, 1)
    let last = new Date(date.getFullYear(), date.getMonth(), 0);
    let used = firstDate.getDay() + last.getDate()
    return Math.ceil(used / 7)
};
//获取该月的最后一天的星期
export const getLastDay = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDay()
};
//获取该月的最后几天
export const getLastDates = (date: Date) => {
    let days = getLastDay(date.getFullYear(), date.getMonth());
    let start = date.getDate() - days;
    let temp = <Array<number>>[]
    for (let i = 0; i <= days; i++) {
        if (start + i <= date.getDate()) {
            temp.push(start + i)
        }
    }
    return temp
};

export function inArray(array: Array<any>, item?: any) {
    if (!isArray(array) || array.length <= 0 || !item) {
        return false
    }

    return ~array.indexOf(item) //>= 0
}

export function attr(el: any, attr: any, attrvalue: any | undefined = undefined) {
    if (!el) {
        return null
    }
    let value = el.getAttribute(attr);
    if (attrvalue === undefined) {
        attrvalue = ""
    }
    return value ? value : el.setAttribute(attr, attrvalue)
}

export function remove (arr: Array<any>, item: any): Array<any> | void {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}

const _toString = (object: any) => Object.prototype.toString.call(object);

export function isBoolean(object: any) {
    return _toString(object) === '[object Boolean]';
}

export function isArray(object: any) {
    return _toString(object) === '[object Array]';
}

export function isObject(object: any) {
    return _toString(object) === '[object Object]';
}

export function isNumber(object: any) {
    return _toString(object) === '[object Number]';
}

export function isString(object: any) {
    return _toString(object) === '[object String]';
}

export function isDate(object: any) {
    return _toString(object) === '[object Date]';
}

export function isNil(object: any) {
    return object === null || typeof object === "undefined" || object === undefined
}

export function isPrimitive(value: any): boolean {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    )
}


export function hasClass(el: any, className: string) {
    if (!el) {
        return false
    }
    return el.classList.contains(className)
}

export function removeClass(el: any, className: string) {
    if (!el) {
        return
    }
    return el.classList.remove(className)
}

export function addClass(el: any, className: string) {
    if (!el) {
        return
    }
    if (el.classList.contains(className)) {
        return
    }
    return el.classList.add(className)
}


export function parseEl(el: string) {
    if (!el) {
        return null
    }
    if (el.indexOf('#') >= 0) {
        return document.querySelector(el)
    } else if (el.indexOf('.') >= 0) {
        return document.querySelectorAll(el)[0]
    }
    else {
        let preserve = [
            "a",
            "p",
            "div",
            "section",
            "span",
            "article",
            "header",
            "footer",
            "main",
            "aside",
            "i",
            "strong",
            "small",
            "tr",
            "table"];
        if (~preserve.indexOf(el)) {
            console.error("[DatePicker Warn] do not mount datepicker to pure html tag, use class name or id instead ")
            return null
        } else {
            return document.querySelector(el)
        }
    }
}

export const defaultLanguage: any = {
    locale: "zh-cn",
    pack: {
        days: ['日', '一', '二', '三', '四', '五', '六'],
        months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
        year: "年"
    }
};

export function setLanguage(option: any) {
    const locale = option.locale.toLowerCase();
    const curr = option.pack;
    const monthName = curr.months;
    const week = curr.days
    let title;
    if (locale === "en" || locale === "en-us" || locale === "en-gb") {
        title = (year: any, month: any) => `${monthName[month]} ${year}`
    }
    else {
        title = (year: any, month: any) => `${year}${curr["year"]}${monthName[month]}`
    }
    return {week, title}
}


export function getLanguage(language: any, key: string) {

    let output = {};
    if (!key || !language[key]) {
        output = defaultLanguage
    } else {
        output = {
            locale: key,
            pack: language[key]
        };
    }
    return output
}

export function quickSort(arr: number[], isAscending?: boolean): number[] {

    if (1 === arr.length) return arr;
    if (0 === arr.length) return [];

    let small: number[] = [];
    let big: number[] = [];
    let equal: number[] = [];
    let key = arr[0];

    for (let i: number = 0; i < arr.length; i++) {
        if (arr[i] < key) {
            small.push(arr[i]);
        } else if (arr[i] > key) {
            big.push(arr[i]);
        } else {
            equal.push(arr[i]);
        }
    }

    if (isAscending) {
        return [].concat(quickSort(small, isAscending), equal, quickSort(big, isAscending));
    }
    return [].concat(quickSort(big, isAscending), equal, quickSort(small, isAscending));
}


