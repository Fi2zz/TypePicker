export const attrSelector = (attr: string, value: string) => `[${attr}="${value}"]`;

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
        const startTime = <any>new Date(start.getFullYear(), start.getMonth(), start.getDate())
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

