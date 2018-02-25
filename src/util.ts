export const attrSelector = (attr: string, value: string) => `[${attr}="${value}"]`;


export function parseToInt(string: any) {
    return parseInt(string, 10)
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

export function diff(start: Date, end: Date, type: string = "month") {
    if (!start) {
        start = new Date()
    }
    if (!end) {
        end = new Date()
    }
    if (type === "month") {
        return Math.abs((start.getFullYear() * 12 + start.getMonth()) - ( end.getFullYear() * 12 + end.getMonth()))
    } else if (type === "days") {
        const startTime = <any>new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endTime = <any>new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return Math.round((startTime - endTime)) / (1000 * 60 * 60 * 24);
    }
}

export const getFirstDay = (year: number, month: number): number => new Date(year, month, 1).getDay();

export const getDates = (year: number, month: number): number => {
    let d = new Date(year, month, 1);
    let utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate()
};
export const padding = (n: Number) => `${n > 9 ? n : "0" + n}`;

function _toString(object: any) {
    return Object.prototype.toString.call(object);
}

export function isString(object: any) {
    return _toString(object) === '[object String]';
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

export function isDate(object: any) {
    return _toString(object) === '[object Date]';
}

export function isFunction(object: any) {
    return _toString(object) === '[object Function]';
}


export function hasClass(ele: any, className: string) {
    if (!ele || !className || !ele.className || ele.className.search(new RegExp("\\b" + className + "\\b")) == -1) {
        return false;
    }
    return true;
}

export function addClass(ele: any, className: string) {
    if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) != -1))
        return;
    ele.className += (ele.className ? " " : "") + className;
}

export function removeClass(ele: any, className: string) {
    if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) == -1))
        return;
    ele.className = ele.className.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), "");

}

export function nextTick(func: Function) {
    window.setTimeout(func, 0);
}

export function clearNextTick(id: any) {
    window.clearTimeout(id)
}

export function noop() {
}

export function warn(where: string, msg: any) {
    let message = msg;
    if (isObject(msg) || isArray(msg)) {
        message = JSON.stringify(msg)
    }
    console.error(`[${where}] ${message} `)
}


export function log(msg: any) {
    let message = msg;
    if (isObject(msg) || isArray(msg)) {
        message = JSON.stringify(msg, null, 2)
    }

    console.log(message)
}

export function parseEl(el: string) {
    if (!el) {
        return null
    }
    if (!isString(el)) {
        return el
    }
    else {
        if (el.indexOf('#') >= 0) {
            return document.querySelector(el)
        } else if (el.indexOf('.') >= 0) {
            return document.querySelectorAll(el)[0]
        } else {
            if (el.indexOf("#") <= -1 || el.indexOf(".") <= -1) {
                warn(`ParseEl`, `Do not mount DatePicker to a pure html tag,${el}`);
                return false;
            }
            return document.querySelector(el)
        }
    }
}


export function removeDisableDates(disableList: Array<string>, dataList: any) {
    const temp = {};
    for (let key in dataList) {
        if (disableList.indexOf(key) >= 0) {
            temp[key] = key
        }
    }
    return temp;
}

export function getFront(list: Array<any>) {
    return list[0]
}

export function getPeek(list: Array<any>) {

    return list[list.length - 1];

}

export  function gap(d1: Date, d2: Date) {
    const value = diff(d1, d2, "days");
    return value === 0 ? 0 : value * -1
}

