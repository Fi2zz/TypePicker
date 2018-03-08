(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.DatePicker = factory());
}(this, (function () { 'use strict';

var Observer = (function () {
    var clientList = {};
    var $remove = function (key, fn) {
        var fns = clientList[key];
        if (!fns) {
            return false;
        }
        if (!fn) {
            fns && (fns.length = 0);
        }
        else {
            for (var i = fns.length - 1; i >= 0; i--) {
                var _fn = fns[i];
                if (_fn === fn) {
                    fns.splice(i, 1);
                }
            }
        }
    };
    var $on = function (key, fn) {
        if (!clientList[key]) {
            clientList[key] = [];
        }
        clientList[key].push(fn);
    };
    var $emit = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var key = [].shift.call(args);
        var fns = clientList[key];
        if (!fns || fns.length === 0) {
            return false;
        }
        for (var i = 0, fn = void 0; fn = fns[i++];) {
            fn.apply(this, args);
        }
    };
    return {
        $on: $on, $emit: $emit, $remove: $remove,
    };
}());

function parse(string) {
    if (!string)
        return new Date();
    if (string instanceof Date)
        return string;
    var date = new Date(string);
    if (!date.getTime())
        return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function isZeroLeading(format) {
    var splitFormat = format.split(/\W/, 3);
    splitFormat.shift();
    var temp = [];
    for (var i = 0; i < splitFormat.length; i++) {
        var item = splitFormat[i];
        if (/\w\w/.test(item)) {
            temp.push(item);
        }
    }
    return splitFormat.length === temp.length;
}
function format(date, format) {
    if (!format) {
        format = 'YYYY-MM-DD';
    }
    format = format.toUpperCase();
    var parts = {
        YYYY: date.getFullYear(),
        DD: padding(date.getDate()),
        MM: padding(date.getMonth() + 1),
        D: date.getDate(),
        M: date.getMonth() + 1,
    };
    var zeroLeading = isZeroLeading(format);
    return {
        origin: date,
        date: zeroLeading ? parts["DD"] : parts["D"],
        month: zeroLeading ? parts["MM"] : parts["M"],
        year: parts["YYYY"],
        day: date.getDay(),
        value: format.replace(/(?:\b|%)([dDMyY]+)(?:\b|%)/g, function (match, $1) {
            return parts[$1] === undefined ? $1 : parts[$1];
        })
    };
}
function parseFormatted(strDate, format) {
    if (!format) {
        format = 'YYYY-MM-DD';
    }
    var ret = parse(strDate);
    if (ret)
        return ret;
    var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
    var parseFlags = {
        D: [/\d{1,2}/, function (d, v) { return d.day = parseInt(v); }],
        M: [/\d{1,2}/, function (d, v) { return (d.month = parseInt(v) - 1); }],
        DD: [/\d{2}/, function (d, v) { return d.day = parseInt(v); }],
        MM: [/\d{2}/, function (d, v) { return d.month = parseInt(v) - 1; }],
        YY: [/\d{2,4}/, function (d, v) { return d.year = parseInt(v); }],
        YYYY: [/\d{2,4}/, function (d, v) { return d.year = parseInt(v); }],
    };
    ret = function (dateStr, format) {
        if (dateStr.length > 1000) {
            return null;
        }
        var isValid = true;
        var dateInfo = {
            year: 0,
            month: 0,
            day: 0
        };
        format.replace(token, function ($0) {
            if (parseFlags[$0]) {
                var info = parseFlags[$0];
                var regExp = info[0];
                var handler_1 = info[info.length - 1];
                var index_1 = dateStr.search(regExp);
                if (!~index_1) {
                    isValid = false;
                }
                else {
                    dateStr.replace(info[0], function (result) {
                        handler_1(dateInfo, result);
                        dateStr = dateStr.substr(index_1 + result.length);
                        return result;
                    });
                }
            }
            return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
        });
        if (!isValid) {
            return null;
        }
        var parsed = new Date(dateInfo.year, dateInfo.month, dateInfo.day);
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };
    return ret(strDate, format);
}

var attrSelector = function (attr, value) { return "[" + attr + "=\"" + value + "\"]"; };
function parseToInt(string) {
    return parseInt(string, 10);
}
function attr(el, attr, attrvalue) {
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
function diff(start, end, type) {
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

var getDates = function (year, month) {
    var d = new Date(year, month, 1);
    var utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate();
};
var padding = function (n) { return "" + (n > 9 ? n : "0" + n); };
function _toString(object) {
    return Object.prototype.toString.call(object);
}
function isString(object) {
    return _toString(object) === '[object String]';
}
function isArray(object) {
    return _toString(object) === '[object Array]';
}
function isObject(object) {
    return _toString(object) === '[object Object]';
}
function isNumber(object) {
    return _toString(object) === '[object Number]';
}
function isDate(object) {
    return _toString(object) === '[object Date]';
}
function isFunction(object) {
    return _toString(object) === '[object Function]';
}
function hasClass(ele, className) {
    if (!ele || !className || !ele.className || ele.className.search(new RegExp("\\b" + className + "\\b")) == -1) {
        return false;
    }
    return true;
}
function addClass(ele, className) {
    if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) != -1))
        return;
    ele.className += (ele.className ? " " : "") + className;
}
function removeClass(ele, className) {
    if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) == -1))
        return;
    ele.className = ele.className.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), "");
}
function nextTick(func) {
    window.setTimeout(func, 0);
}
function clearNextTick(id) {
    window.clearTimeout(id);
}

function warn(where, msg) {
    var message = msg;
    if (isObject(msg) || isArray(msg)) {
        message = JSON.stringify(msg);
    }
    console.error("[" + where + "] " + message + " ");
}

function parseEl(el) {
    if (!el) {
        return null;
    }
    if (!isString(el)) {
        return el;
    }
    else {
        if (el.indexOf('#') >= 0) {
            return document.querySelector(el);
        }
        else if (el.indexOf('.') >= 0) {
            return document.querySelectorAll(el)[0];
        }
        else {
            if (el.indexOf("#") <= -1 || el.indexOf(".") <= -1) {
                warn("ParseEl", "Do not mount DatePicker to a pure html tag," + el);
                return false;
            }
            return document.querySelector(el);
        }
    }
}
function removeDisableDates(disableList, dataList) {
    var temp = {};
    for (var key in dataList) {
        if (disableList.indexOf(key) >= 0) {
            temp[key] = key;
        }
    }
    return temp;
}
function getFront(list) {
    return list[0];
}
function getPeek(list) {
    return list[list.length - 1];
}
function gap(d1, d2) {
    var value = diff(d1, d2, "days");
    return value === 0 ? 0 : value * -1;
}
function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var merged = {};
    function toString(object) {
        return Object.prototype.toString.call(object);
    }
    function whichType(object, type) {
        return toString(object) === "[object " + type + "]";
    }
    function generateObject(target, object) {
        if (target === void 0) { target = {}; }
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                target[key] = object[key];
            }
        }
        return target;
    }
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg) {
            if (whichType(arg, "Array")) {
                for (var i_1 = 0; i_1 < arg.length; i_1++) {
                    var argItem = arg[i_1];
                    if (whichType(argItem, "Object")) {
                        merged = generateObject(merged, argItem);
                    }
                    else if (!whichType(argItem, "Date")) {
                        merged[argItem] = argItem;
                    }
                }
            }
            else if (whichType(arg, "Object")) {
                merged = generateObject(merged, arg);
            }
            else if (whichType(arg, "String") || whichType(arg, "Number")) {
                merged[arg] = arg;
            }
        }
    }
    return merged;
}
function isEmpty(listOrObject) {
    if (!isArray(listOrObject) && !isObject(listOrObject)) {
        warn("isEmpty", "Expect an Object or an Array,but got " + _toString(listOrObject));
        return false;
    }
    if (isArray(listOrObject)) {
        return listOrObject.length <= 0;
    }
    else if (isObject(listOrObject)) {
        for (var key in listOrObject) {
            if (key) {
                return false;
            }
        }
        return true;
    }
}

function getRange(data, dateFormat, limit, inDates) {
    var startDate = getFront(data);
    var endDate = getPeek(data);
    var start;
    var end;
    var invalidDates = [];
    var validDates = [];
    if (startDate && endDate) {
        if (!isDate(startDate)) {
            start = parseFormatted(startDate, dateFormat);
        }
        else {
            start = startDate;
        }
        if (!isDate(endDate)) {
            end = parseFormatted(endDate, dateFormat);
        }
        else {
            end = endDate;
        }
        var gap_1 = diff(start, end, "days");
        if (+start - +end < 0) {
            gap_1 = diff(end, start, "days");
        }
        if (gap_1 > 0 && gap_1 <= limit) {
            for (var i = 0; i < gap_1; i++) {
                var date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
                var formatted = format(date, dateFormat).value;
                if (!inDates(formatted) && i < gap_1 - 1) {
                    invalidDates.push(formatted);
                }
                else {
                    validDates.push(formatted);
                }
            }
        }
    }
    return {
        invalidDates: invalidDates,
        validDates: validDates
    };
}
function setHTMLNodeRange(data, collector) {
    var collection = collector.querySelectorAll(".in-range");
    for (var i = 0; i < collection.length; i++) {
        removeClass(collection[i], "in-range");
    }
    for (var i = 0; i < data.length; i++) {
        var selector = attrSelector("data-date", data[i]);
        var element = collector.querySelector(selector);
        if (!hasClass(element, "active")) {
            addClass(element, "in-range");
        }
    }
}
function setHTMLNodeState(el, dates, isDouble) {
    var nodes = el.querySelectorAll(".calendar-date-cell");
    for (var i = 0; i < nodes.length; i++) {
        removeClass(nodes[i], "active");
        if (isDouble) {
            removeClass(nodes[i], "start-date");
            removeClass(nodes[i], "end-date");
        }
    }
    for (var i = 0; i < dates.length; i++) {
        var date = dates[i];
        var dateElement = el.querySelector("[data-date=\"" + date + "\"]");
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

var currDate = new Date();
var HTML = (function () {
    function HTML(options) {
        this.startDate = null;
        this.endDate = null;
        this.formatter = null;
        this.infiniteMode = false;
        this.language = {};
        this.views = 1;
        var startDate = options.startDate, endDate = options.endDate, views = options.views, language = options.language, infiniteMode = options.infiniteMode, dateFormatter = options.dateFormatter;
        var gap$$1 = views === 2 ? 1 : views === 'auto' ? diff(startDate, endDate) : 0;
        this.language = language;
        this.formatter = dateFormatter;
        this.startDate = startDate;
        this.endDate = endDate;
        this.views = views;
        this.infiniteMode = infiniteMode;
        this.template = "" + this.createActionBar(this.views !== 'auto') + this.createView(this.createBody(gap$$1));
    }
    HTML.prototype.createActionBar = function (create) {
        if (!create) {
            return '';
        }
        return "<div class=\"calendar-action-bar\">\n            <button class='calendar-action calendar-action-prev'><span>prev</span></button>\n            <button class='calendar-action calendar-action-next'><span>next</span></button>\n         </div>\n    ";
    };
    HTML.prototype.createBody = function (gap$$1) {
        var template = [];
        for (var i = 0; i <= gap$$1; i++) {
            var date = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + i, 1);
            var paint = this.createMonthDateTemplate(date.getFullYear(), date.getMonth());
            template.push({ template: paint.template, year: paint.year, month: paint.month });
        }
        return template;
    };
    HTML.prototype.createMonthDateTemplate = function (year, month) {
        var _this = this;
        var d = new Date(year, month, 1);
        var curr = {
            year: d.getFullYear(),
            month: d.getMonth(),
            date: d.getDate(),
            index: d.getMonth()
        };
        var firstDay = new Date(curr.year, curr.month, 1).getDay();
        var template = [];
        for (var i = 0; i < firstDay; i++) {
            template.push({
                date: "",
                className: this.setNodeClassName(),
                text: this.createPlaceholder(),
                key: ""
            });
        }
        for (var i = 1; i <= getDates(curr.year, curr.month); i++) {
            var date = new Date(curr.year, curr.month, i);
            var formatted = this.formatter(date);
            var key = formatted.value;
            var text = this.createPlaceholder(formatted.date);
            var className = this.setNodeClassName(date);
            var day = formatted.day;
            template.push({ className: className, text: text, key: key, day: day });
        }
        var tpl = template.map(function (item) {
            return _this.createNode(item.className, item.key, item.text, item.day);
        }).join(" ");
        return {
            template: tpl,
            year: curr.year,
            month: curr.index
        };
    };
    HTML.prototype.createView = function (template) {
        var _this = this;
        var week = this.createMonthWeek();
        var tpl = template.map(function (item) {
            var year = item.year, month = item.month;
            var head = _this.createMonthHeader(year, month);
            var body = _this.createMonthBody(item.template);
            var tpl = "";
            if (_this.views !== 'auto') {
                tpl += _this.createMonthWrap(head, body, week);
            }
            else {
                tpl = _this.createMonthWrap(head, body);
            }
            return tpl;
        });
        if (this.views === 'auto') {
            tpl.unshift(week);
        }
        return tpl.join("");
    };
    HTML.prototype.createMonthWrap = function (head, body, week) {
        return "<div class=\"calendar-main\">" + head + " " + (week ? week : '') + " " + body + "</div>";
    };
    HTML.prototype.createMonthWeek = function () {
        var template = this.language.days.map(function (day, index) {
            var className = [
                "calendar-cell",
                "calendar-day-cell",
                index === 0 ?
                    "calendar-cell-weekday"
                    : index === 6 ?
                        "calendar-cell-weekend" : ""
            ];
            return "<div class=\"" + className.join(" ") + "\">" + day + "</div>";
        }).join("");
        return "  <div class=\"calendar-day\">" + template + "</div>";
    };
    HTML.prototype.createMonthBody = function (content) {
        return "<div class=\"calendar-body\">" + content + "</div>";
    };
    HTML.prototype.createMonthHeader = function (year, month) {
        var heading = function (pack, year, month) {
            if (pack.year) {
                return "" + year + pack.year + pack.months[month];
            }
            else {
                return pack.months[month] + " " + year;
            }
        };
        return "<div class=\"calendar-head\"><div class=\"calendar-title\">" + heading(this.language, year, month) + "</div></div>";
    };
    
    HTML.prototype.createNode = function (className, key, text, day) {
        return "<div class=\"" + className + "\" " + (day >= 0 ? "data-day=" + day : "") + " " + (key ? "data-date=" + key : "") + ">" + text + "</div>";
    };
    HTML.prototype.createPlaceholder = function (date) {
        return "<div class=\"date\">" + (date ? date : '') + "</div><div class=\"placeholder\"></div>";
    };
    HTML.prototype.setNodeClassName = function (date) {
        var endDate = this.endDate;
        var classStack = ["calendar-cell", "calendar-date-cell"];
        if (!date) {
            classStack.push("disabled", "empty");
        }
        else {
            if (!this.infiniteMode) {
                if (diff(date, currDate, "days") < 0) {
                    classStack.push("disabled");
                }
                if (endDate && diff(date, endDate, "days") > 0) {
                    classStack.push("disabled");
                }
            }
            if (date.getDay() === 0) {
                classStack.push("calendar-cell-weekend");
            }
            if (date.getDay() === 6) {
                classStack.push("calendar-cell-weekday");
            }
        }
        return classStack.join(" ");
    };
    return HTML;
}());

var handlePickDate = function (options) {
    var element = options.element, selected = options.selected, isDouble = options.isDouble, limit = options.limit, inDates = options.inDates, bindData = options.bindData, dateFormat = options.dateFormat, infiniteMode = options.infiniteMode;
    var collection = element.querySelectorAll(".calendar-date-cell");
    var cache = selected;
    var _loop_1 = function (i) {
        var item = collection[i];
        item.addEventListener("click", function () {
            var subCache = selected;
            var type = 'selected';
            var date = attr(item, "data-date");
            var index = selected.indexOf(date);
            var now = parseFormatted(date, dateFormat);
            var prevDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            var prevDateString = format(prevDate, dateFormat).value;
            var prevDateIsValid = inDates(prevDateString);
            if (!date
                || (selected.length <= 0 && !inDates(date) && bindData && !infiniteMode)
                || (isDouble && !prevDateIsValid && !inDates(date) && !infiniteMode)
                || index >= 0 && !inDates(date) && !infiniteMode) {
                return false;
            }
            if (index >= 0) {
                selected = inDates(getPeek(selected)) ? [getPeek(selected)] : [getFront(selected)];
            }
            if (isDouble && selected.length >= 2 || !isDouble) {
                selected = [];
            }
            selected.push(date);
            if (!isDouble) {
                selected = inDates(date) ? selected : cache;
            }
            else {
                var beforeHandled = {
                    start: getFront(selected),
                    end: getPeek(selected)
                };
                var diffBeforeHandled = gap(parseFormatted(beforeHandled.start, dateFormat), parseFormatted(beforeHandled.end, dateFormat));
                if (diffBeforeHandled < 0) {
                    if (!inDates(beforeHandled.end)) {
                        selected.pop();
                    }
                    else {
                        selected = [date];
                    }
                }
                else {
                    if (!inDates(beforeHandled.end) && !prevDateIsValid) {
                        selected = [beforeHandled.start];
                    }
                }
                var handled = handleDoubleSelect({
                    date: date,
                    dateFormat: dateFormat,
                    selected: selected,
                    limit: limit,
                }, inDates);
                var afterHandled = {
                    start: getFront(handled.selected),
                    end: getPeek(handled.selected)
                };
                var peek = getPeek(handled.selected);
                var diffAfterHandled = gap(parseFormatted(afterHandled.start, dateFormat), parseFormatted(afterHandled.end, dateFormat));
                var dates = handled.dates;
                var datesList = [];
                var notInDatesList = [];
                for (var _i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
                    var date_1 = dates_1[_i];
                    if (inDates(date_1)) {
                        datesList.push(date_1);
                    }
                    else {
                        notInDatesList.push(date_1);
                    }
                }
                if (notInDatesList.length > 0) {
                    if (handled.selected.length >= 2) {
                        inDates(peek) ? handled.selected.shift() : handled.selected.pop();
                    }
                    if (inDates(afterHandled.end)) {
                        afterHandled.start = afterHandled.end;
                    }
                    afterHandled.end = null;
                }
                if (handled.selected.length <= 1) {
                    if (!inDates(peek)) {
                        handled.selected = subCache;
                        type = 'disabled';
                    }
                }
                selected = handled.selected;
            }
            Observer.$emit('select', {
                type: type,
                value: selected
            });
        });
    };
    for (var i = 0; i < collection.length; i++) {
        _loop_1(i);
    }
};
function handleDoubleSelect(options, inDates) {
    var selected = options.selected;
    var start = getFront(selected);
    var end = getPeek(selected);
    var startDate = parseFormatted(start, options.dateFormat);
    var endDate = parseFormatted(end, options.dateFormat);
    var dates = [];
    if (start === end && selected.length >= 2) {
        selected.pop();
    }
    var diffs = gap(startDate, endDate);
    if (diffs > 0) {
        if (diffs <= options.limit) {
            for (var i = 1; i < diffs; i++) {
                var date = format(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i), options.dateFormat).value;
                dates.push(date);
            }
        }
        else {
            if (!inDates(end)) {
                selected.pop();
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
        dates: dates,
        selected: selected
    };
}

var getDisableDates = function (startDate, endDate, dateFormat, should) {
    var startMonthDates = startDate.getDate();
    var temp = {};
    if (should) {
        for (var i = 1; i <= startMonthDates - 1; i++) {
            var date = new Date(startDate.getFullYear(), startDate.getMonth(), startMonthDates - i);
            var formatted = format(date, dateFormat).value;
            temp[formatted] = formatted;
        }
        var endMonthDates = getDates(endDate.getFullYear(), endDate.getMonth());
        var diffs = endMonthDates - endDate.getDate();
        for (var i = 1; i <= diffs; i++) {
            var date = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + i);
            var formatted = format(date, dateFormat).value;
            temp[formatted] = formatted;
        }
    }
    return temp;
};
function getViews(view) {
    if (!view) {
        return 1;
    }
    var views = parseToInt(view);
    if (isNaN(views)) {
        if (view !== 'auto') {
            return 1;
        }
        else {
            return 'auto';
        }
    }
    else {
        if (views > 2 || views <= 0) {
            return 1;
        }
        else {
            return views;
        }
    }
}
function deprecatedWarn(key, instead) {
    console.warn("[deprecated]" + key + " is deprecated " + (instead ? ',' + instead + ' instead' : ''));
}
var DatePicker = (function () {
    function DatePicker(option) {
        var _this = this;
        this.dates = [];
        this.limit = 1;
        this.views = 1;
        this.date = new Date();
        this.startDate = null;
        this.endDate = null;
        this.selected = [];
        this.data = {};
        this.disables = {};
        this.language = {
            days: ['日', '一', '二', '三', '四', '五', '六'],
            months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
            year: "年"
        };
        this.element = null;
        this.double = false;
        this.bindData = false;
        this.infiniteMode = false;
        this.isInit = false;
        this.inDates = function (date) {
            return !isEmpty(_this.dates) && _this.dates.indexOf(date) >= 0;
        };
        this.format = function (date, format$$1) { return format(date, format$$1 ? format$$1 : _this.dateFormat); };
        this.parse = function (string, format$$1) { return parseFormatted(string, format$$1 ? format$$1 : _this.dateFormat); };
        if (option.from) {
            deprecatedWarn('option.from', 'use option.startDate');
            delete option.from;
        }
        if (option.to) {
            deprecatedWarn('option.to', 'use option.endDate');
            delete option.to;
        }
        Observer.$on("select", function (result) {
            var type = result.type, value = result.value;
            if (type === 'selected') {
                _this.setDates(value);
            }
            if (type !== 'disabled') {
                Observer.$emit("update", result);
                if (_this.double) {
                    var currRange = getRange(value, _this.dateFormat, _this.limit, _this.inDates);
                    setHTMLNodeRange(currRange.validDates, _this.element);
                }
                setHTMLNodeState(_this.element, value, _this.double);
            }
        });
        Observer.$on('create', function (result) {
            var type = result.type, size = result.size;
            if (type === 'switch') {
                var curr = {
                    year: _this.date.getFullYear(),
                    month: _this.date.getMonth(),
                    date: _this.date.getDate()
                };
                _this.date = new Date(curr.year, curr.month + size, curr.date);
                _this.isInit = false;
            }
            _this.createDatePicker();
            if (type == 'init') {
                Observer.$emit('select', {
                    type: 'init',
                    value: _this.selected
                });
            }
            if (_this.bindData) {
                Observer.$emit("data", {
                    data: _this.data,
                    nodeList: _this.element.querySelectorAll(".calendar-cell")
                });
            }
            if (!isEmpty(_this.disables)) {
                Observer.$emit("disabled", {
                    nodeList: _this.element.querySelectorAll(".calendar-cell"),
                    dateList: _this.disables
                });
            }
            handlePickDate({
                dateFormat: _this.dateFormat,
                element: _this.element,
                selected: _this.selected,
                isDouble: _this.double,
                limit: _this.limit,
                bindData: _this.bindData,
                inDates: _this.inDates,
                infiniteMode: _this.infiniteMode
            });
        });
        this.init(option);
    }
    DatePicker.prototype.on = function (ev, cb) {
        return Observer.$on(ev, cb);
    };
    
    DatePicker.prototype.setDates = function (dates) {
        var _this = this;
        if (!isArray(dates)) {
            dates = [];
            warn("setDates", "no dates provided," + dates);
            return;
        }
        var bindDataHandler = function (startDate, endDate, diffed) {
            if (diffed < 0
                || diffed > _this.limit
                || (!_this.inDates(_this.format(startDate).value) && !_this.inDates(_this.format(endDate).value))
                || !_this.inDates(_this.format(startDate).value)) {
                warn("setDates", "Illegal dates,[" + dates + "]");
                return false;
            }
            for (var i = 0; i <= diffed; i++) {
                var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                var formatted = _this.format(date).value;
                if (i < diffed && !_this.inDates(formatted)) {
                    warn("setDates", "Illegal date,{dates:[" + formatted + "]}");
                    return false;
                }
            }
            return true;
        };
        var datesList = [];
        var start = '', end = '';
        if (this.double) {
            if (dates.length > 2) {
                dates = dates.slice(0, 2);
            }
            start = dates[0];
            end = dates[dates.length - 1];
            var startDate = isDate(start) ? start : this.parse(start);
            var endDate = isDate(end) ? end : this.parse(end);
            var diffed = diff(startDate, endDate, "days") * -1;
            if (this.bindData) {
                var cbValue = bindDataHandler(startDate, endDate, diffed);
                if (!cbValue) {
                    return false;
                }
            }
            datesList = [this.format(startDate).value];
            if (start !== end) {
                datesList.push(this.format(endDate).value);
            }
        }
        else {
            var d = dates[dates.length - 1];
            datesList = [isDate(d) ? this.format(d).value : d];
        }
        this.selected = datesList;
    };
    
    DatePicker.prototype.setLanguage = function (pack) {
        if (isArray(pack.days) && isArray(pack.months)) {
            this.language = {
                days: pack.days,
                months: pack.months,
                year: pack.year
            };
        }
    };
    
    DatePicker.prototype.setDisabled = function (param) {
        if (!param || isObject(param) && Object.keys(param).length <= 0) {
            warn("setDisabled", "invalid params, \nparams should be {dates:<Array<any>>[], days:<Array<number>>[] }");
            return false;
        }
        if (!isArray(param.dates) && !isArray(param.days)) {
            warn("setDisabled", "invalid params  { dates:<Array<any>>" + param.dates + ", days:<Array<number>>" + param.days + " }");
            return false;
        }
        var dateMap = {};
        var dateList = [];
        if (isArray(param.dates)) {
            for (var _i = 0, _a = param.dates; _i < _a.length; _i++) {
                var date = _a[_i];
                if (isDate(date)) {
                    dateList.push(this.format(date).value);
                }
                else {
                    dateList.push(date);
                }
            }
        }
        if (isArray(param.days)) {
            for (var _b = 0, _c = param.days; _b < _c.length; _b++) {
                var day = _c[_b];
                var dey = this.element.querySelectorAll("[data-day=\"" + day + "\"");
                if (dey) {
                    for (var _d = 0, dey_1 = dey; _d < dey_1.length; _d++) {
                        var d = dey_1[_d];
                        var date = d.getAttribute("data-date");
                        if (date) {
                            dateList.push(date);
                        }
                    }
                }
            }
        }
        var fromDate;
        var toDate;
        var to = param.to;
        var from = param.from;
        if (from) {
            if (isDate(from)) {
                fromDate = from;
            }
            else {
                var parsed = this.parse(from);
                if (isDate(parsed)) {
                    fromDate = parsed;
                }
                else {
                    return false;
                }
            }
            this.endDate = fromDate;
        }
        if (to) {
            if (isDate(to)) {
                toDate = to;
            }
            else {
                var parsed = this.parse(to);
                if (isDate(parsed)) {
                    toDate = parsed;
                }
                else {
                    return false;
                }
            }
            this.date = toDate;
            this.startDate = toDate;
        }
        if (fromDate || toDate) {
            this.infiniteMode = false;
        }
        for (var _e = 0, dateList_1 = dateList; _e < dateList_1.length; _e++) {
            var date = dateList_1[_e];
            dateMap[date] = date;
        }
        this.disables = dateMap;
    };
    
    DatePicker.prototype.setData = function (cb) {
        var _this = this;
        if (isFunction(cb)) {
            var result = cb();
            if (isObject(result) && Object.keys(result).length > 0) {
                this.data = result;
                this.dates = Object.keys(result).sort(function (a, b) { return +_this.parse(a) - _this.parse(b); });
                this.bindData = true;
            }
            else {
                warn("setData", "you are passing wrong type of data to DatePicker,data should be like :\n                    {\n                        " + format(new Date, this.dateFormat).value + ":\"your value\" ,\n                     }");
            }
        }
    };
    
    DatePicker.prototype.diff = function (d1, d2) {
        return diff(d1, d2, "days");
    };
    DatePicker.prototype.createDatePicker = function () {
        var initRanges = getRange(this.selected, this.dateFormat, this.limit, this.inDates);
        var hasInvalidDate = initRanges.invalidDates.length > 0;
        if (hasInvalidDate) {
            this.selected = [];
        }
        if (this.views === 'auto') {
            if (!isEmpty(this.selected)) {
                this.date = this.parse(getFront(this.selected));
            }
            else {
                if (!isEmpty(this.dates)) {
                    this.date = this.parse(getFront(this.dates));
                }
            }
        }
        this.element.innerHTML = new HTML({
            startDate: this.date,
            endDate: this.endDate,
            language: this.language,
            infiniteMode: this.infiniteMode,
            dateFormatter: this.format,
            views: this.views
        }).template;
        if (this.views === 1) {
            if (this.double && this.selected.length >= 2) {
                var start = getFront(this.selected);
                var end = getPeek(this.selected);
                if (start === end) {
                    this.selected.pop();
                }
            }
        }
        var prev = this.element.querySelector(".calendar-action-prev");
        var next = this.element.querySelector(".calendar-action-next");
        if (prev && next) {
            if (this.infiniteMode) {
                next.addEventListener("click", function () { return Observer.$emit('create', { type: 'switch', size: 1 }); });
                prev.addEventListener("click", function () { return Observer.$emit('create', { type: 'switch', size: -1 }); });
            }
            else {
                var endGap = diff(this.date, this.endDate);
                if (endGap >= 1) {
                    next.addEventListener("click", function () {
                        Observer.$emit('create', { type: 'switch', size: 1 });
                        removeClass(prev, "disabled calendar-action-disabled");
                    });
                }
                else {
                    addClass(next, "disabled calendar-action-disabled");
                }
                var startGap = diff(this.date, this.startDate);
                if (startGap >= 1) {
                    prev.addEventListener("click", function () {
                        Observer.$emit('create', { type: 'switch', size: -1 });
                        removeClass(next, "disabled calendar-action-disabled");
                    });
                }
                else {
                    addClass(prev, "disabled calendar-action-disabled");
                }
            }
        }
    };
    
    DatePicker.prototype.init = function (option) {
        var _this = this;
        var currDate = new Date();
        if (option.doubleSelect) {
            this.double = option.doubleSelect;
        }
        this.dateFormat = option.format;
        this.views = getViews(option.views);
        this.startDate = isDate(option.startDate) ? option.startDate : new Date();
        this.endDate = isDate(option.endDate) ? option.endDate : new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 6, 0);
        this.date = this.startDate;
        this.limit = this.double ? (isNumber(option.limit) ? option.limit : 2) : 1;
        this.element = parseEl(option.el);
        if (!this.element) {
            warn('init', "invalid selector,current selector " + this.element);
            return false;
        }
        this.element.className = this.element.className + " calendar calendar-" + (this.views === 2 ? "double-views" : this.views === 1 ? "single-view" : "flat-view");
        var next = nextTick(function () {
            _this.isInit = _this.selected.length > 0;
            _this.bindData = !isEmpty(_this.data);
            if (!isDate(option.startDate) || !isDate(option.endDate)) {
                _this.infiniteMode = true;
                if (_this.bindData) {
                    warn('init', "infiniteMode is on, please provide [startDate] and [endDate] while binding data to datepicker  ");
                }
            }
            if (!_this.bindData) {
                if (isDate(option.startDate) && isDate(option.endDate)) {
                    var gap$$1 = diff(_this.endDate, currDate, "days");
                    var year = currDate.getFullYear();
                    var month = currDate.getMonth();
                    var date = currDate.getDate();
                    var dates = [];
                    for (var i = 0; i < gap$$1; i++) {
                        var item = new Date(year, month, date + i);
                        var formatted = _this.format(item).value;
                        dates.push(formatted);
                    }
                    _this.dates = dates;
                }
            }
            var disableBeforeStartDateAndAfterEndDate = getDisableDates(_this.startDate, _this.endDate, _this.dateFormat, !_this.infiniteMode);
            var disables = merge(disableBeforeStartDateAndAfterEndDate, _this.disables);
            if (!isEmpty(disables)) {
                var datesList = _this.dates;
                var newDateList = [];
                var removed = removeDisableDates(Object.keys(_this.disables), _this.data);
                for (var _i = 0, datesList_1 = datesList; _i < datesList_1.length; _i++) {
                    var date = datesList_1[_i];
                    if (_this.bindData) {
                        if (!removed[date]) {
                            newDateList.push(date);
                        }
                        else {
                            delete _this.data[date];
                        }
                    }
                    else {
                        if (!disables[date]) {
                            newDateList.push(date);
                        }
                    }
                }
                _this.dates = newDateList;
            }
            Observer.$emit('create', { type: 'init', size: 0 });
            clearNextTick(next);
        });
    };
    
    return DatePicker;
}());

return DatePicker;

})));
