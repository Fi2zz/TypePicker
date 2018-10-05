export const attr = (el: HTMLElement, attr: string) => el.getAttribute(attr);

export const padding = (n: Number) => `${n > 9 ? n : "0" + n}`;
const isUndef = v => v === undefined || v === null;
export const isDef = v => !isUndef(v);
export const isArray = list => list instanceof Array;
export const isDate = object => object instanceof Date;

export function $(selector: string | any, selector$2?: string): any {
    const selectAll = (who, selector) => {
        let ArrayNodes = Array.prototype.slice.call(who.querySelectorAll(selector));
        if (ArrayNodes.length <= 0) {
            return null;
        } else if (ArrayNodes.length === 1) {
            return ArrayNodes[0];
        } else {
            return ArrayNodes;
        }
    };

    if (typeof selector === "string") {
        if (selector.indexOf("#") === 0) {
            selector = selector.substr(1);
            return document.getElementById(selector);
        } else if (selector.indexOf(".") == 0) {
            return selectAll(document, selector);
        }
    } else {
        return selectAll(selector, selector$2);
    }

    return null;
}

export const dedupList = (list: any[], condition?) => {
    let map = {};

    let result = [];

    if (list.length <= 0) {
        return [];
    }

    for (let item of list) {
        if (!condition) {
            map[item] = item;
        } else {
            map[condition] = item;
        }
    }
    for (let key in map) {
        let item = map[key];
        result.push(item);
    }

    return result;
};

export function byCondition(condition: any, when?: Boolean) {
    return (value?: any) => {
        return (next?: Function) => {
            if (!isDef(when)) {
                when = true;
            }
            let result;
            if (typeof condition === "function") {
                result = condition(value) === when;
            } else {
                result = condition === when;
            }

            if (next && typeof next === "function" && result) {
                return next(value);
            }
            return result;
        };
    };
}
