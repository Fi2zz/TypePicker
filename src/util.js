export function diff(start, end, type) {
    if (type === void 0) { type = "month"; }
    if (!start) {
        start = new Date();
    }
    if (!end) {
        end = new Date();
    }
    if (type === "month") {
        return Math.abs((start.getFullYear() * 12 + start.getMonth()) - (end.getFullYear() * 12 + end.getMonth()));
    }
    else if (type === "days") {
        var startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        var endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return Math.round((startTime - endTime)) / (1000 * 60 * 60 * 24);
    }
}
export var attrSelector = function (attr, value) { return "[" + attr + "=\"" + value + "\"]"; };
export var getDates = function (year, month) {
    var d = new Date(year, month, 1);
    var utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate();
};
export var padding = function (n) { return "" + (n > 9 ? n : "0" + n); };
export var getFirstDay = function (year, month) {
    return new Date(year, month, 1).getDay();
};
export var getWeeksOfMonth = function (date) {
    var firstDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    var last = new Date(date.getFullYear(), date.getMonth(), 0);
    var used = firstDate.getDay() + last.getDate();
    return Math.ceil(used / 7);
};
export var getLastDay = function (year, month) {
    return new Date(year, month + 1, 0).getDay();
};
export var getLastDates = function (date) {
    var days = getLastDay(date.getFullYear(), date.getMonth());
    var start = date.getDate() - days;
    var temp = [];
    for (var i = 0; i <= days; i++) {
        if (start + i <= date.getDate()) {
            temp.push(start + i);
        }
    }
    return temp;
};
export function inArray(array, item) {
    if (!isArray(array) || array.length <= 0 || !item) {
        return false;
    }
    return ~array.indexOf(item);
}
export function attr(el, attr, attrvalue) {
    if (attrvalue === void 0) { attrvalue = undefined; }
    if (!el) {
        return null;
    }
    var value = el.getAttribute(attr);
    if (attrvalue === undefined) {
        attrvalue = "";
    }
    return value ? value : el.setAttribute(attr, attrvalue);
}
export function remove(arr, item) {
    if (arr.length) {
        var index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}
var _toString = function (object) { return Object.prototype.toString.call(object); };
export function isBoolean(object) {
    return _toString(object) === '[object Boolean]';
}
export function isArray(object) {
    return _toString(object) === '[object Array]';
}
export function isObject(object) {
    return _toString(object) === '[object Object]';
}
export function isNumber(object) {
    return _toString(object) === '[object Number]';
}
export function isString(object) {
    return _toString(object) === '[object String]';
}
export function isDate(object) {
    return _toString(object) === '[object Date]';
}
export function isNil(object) {
    return object === null || typeof object === "undefined" || object === undefined;
}
export function isPrimitive(value) {
    return (typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean');
}
export function hasClass(ele, className) {
    if (!ele || !className || !ele.className || ele.className.search(new RegExp("\\b" + className + "\\b")) == -1) {
        return false;
    }
    return true;
}
export function addClass(ele, className) {
    if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) != -1))
        return;
    ele.className += (ele.className ? " " : "") + className;
}
export function removeClass(ele, className) {
    if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) == -1))
        return;
    ele.className = ele.className.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), "");
}
export function parseEl(el) {
    if (!el) {
        return null;
    }
    if (el.indexOf('#') >= 0) {
        return document.querySelector(el);
    }
    else if (el.indexOf('.') >= 0) {
        return document.querySelectorAll(el)[0];
    }
    else {
        if (el.indexOf("#") <= -1 || el.indexOf(".") <= -1) {
            warn("ParseEl ", "do not mount DatePicker to a pure html tag," + el);
            return false;
        }
        return document.querySelector(el);
    }
}
export var defaultLanguage = {
    locale: "zh-cn",
    pack: {
        days: ['日', '一', '二', '三', '四', '五', '六'],
        months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
        year: "年"
    }
};
export function setLanguage(option) {
    var locale = option.locale.toLowerCase();
    var curr = option.pack;
    var monthName = curr.months;
    var week = curr.days;
    var title;
    if (locale === "en" || locale === "en-us" || locale === "en-gb") {
        title = function (year, month) { return monthName[month] + " " + year; };
    }
    else {
        title = function (year, month) { return "" + year + curr["year"] + monthName[month]; };
    }
    return { week: week, title: title };
}
export function getLanguage(language, key) {
    var output = {};
    if (!key || !language[key]) {
        output = defaultLanguage;
    }
    else {
        output = {
            locale: key,
            pack: language[key]
        };
    }
    return output;
}
export function quickSort(arr, isAscending) {
    if (1 === arr.length)
        return arr;
    if (0 === arr.length)
        return [];
    var small = [];
    var big = [];
    var equal = [];
    var key = arr[0];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < key) {
            small.push(arr[i]);
        }
        else if (arr[i] > key) {
            big.push(arr[i]);
        }
        else {
            equal.push(arr[i]);
        }
    }
    if (isAscending) {
        return [].concat(quickSort(small, isAscending), equal, quickSort(big, isAscending));
    }
    return [].concat(quickSort(big, isAscending), equal, quickSort(small, isAscending));
}
export function nextTick(func) {
    window.setTimeout(func, 0);
}
export function clearNextTick(id) {
    window.clearTimeout(id);
}
export function noop() {
}
export function warn(where, msg) {
    var message = msg;
    if (isObject(msg) || isArray(msg)) {
        message = JSON.stringify(msg);
    }
    console.error("[" + where + "] " + message + " ");
}
