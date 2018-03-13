  /*
   *  TypePicker v1.5.8
   *  Fi2zz / wenjingbiao@outlook.com
   *  https://github.com/Fi2zz/datepicker
   *  (c) 2017-2018, wenjingbiao@outlook.com
   *  MIT License
  */
  
  
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
        for (var i = 0, fn = void 0; (fn = fns[i++]);) {
            fn.apply(this, args);
        }
    };
    return {
        $on: $on,
        $emit: $emit,
        $remove: $remove
    };
})();

var attrSelector = function (attr, value) {
    return "[" + attr + "=\"" + value + "\"]";
};
function parseToInt(string) {
    return parseInt(string, 10);
}
function getDates(year, month) {
    var d = new Date(year, month, 1);
    var utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate();
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
function diff(start, end, type, isAbsolute) {
    if (type === void 0) { type = "month"; }
    var result;
    if (!isDate(start) || !isDate(end)) {
        return 0;
    }
    if (type === "month") {
        result =
            Math.abs(start.getFullYear() * 12 + start.getMonth()) -
                (end.getFullYear() * 12 + end.getMonth());
    }
    else if (type === "days") {
        var startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        var endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        var calcu = Math.round(startTime - endTime) / (1000 * 60 * 60 * 24);
        result = isAbsolute ? Math.abs(calcu) : calcu;
    }
    return result;
}
var padding = function (n) { return "" + (n > 9 ? n : "0" + n); };
function _toString(object) {
    return Object.prototype.toString.call(object);
}
function toString(val) {
    return val == null
        ? ""
        : typeof val === "object" ? JSON.stringify(val, null, 2) : String(val);
}
function isUndefined(v) {
    return v === undefined || v === null;
}
function isString(object) {
    return _toString(object) === "[object String]";
}

function isArray(object) {
    return _toString(object) === "[object Array]";
}
function isBoolean(object) {
    return _toString(object) === "[object Boolean]";
}
function isPlainObject(object) {
    return _toString(object) === "[object Object]";
}
function isNumber(object) {
    return _toString(object) === "[object Number]";
}
function isDate(object) {
    return _toString(object) === "[object Date]";
}
function isFunction(object) {
    return _toString(object) === "[object Function]";
}
function hasClass(ele, className) {
    if (!ele ||
        !className ||
        !ele.className ||
        ele.className.search(new RegExp("\\b" + className + "\\b")) == -1) {
        return false;
    }
    return true;
}
function addClass(ele, className) {
    if (!ele ||
        !className ||
        (ele.className &&
            ele.className.search(new RegExp("\\b" + className + "\\b")) != -1))
        return;
    ele.className += (ele.className ? " " : "") + className;
}
function removeClass(ele, className) {
    if (!ele ||
        !className ||
        (ele.className &&
            ele.className.search(new RegExp("\\b" + className + "\\b")) == -1))
        return;
    ele.className = ele.className.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), "");
}
function nextTick(fn, autoReset) {
    if (autoReset === void 0) { autoReset = true; }
    var timer = window.setTimeout(function () {
        if (!isFunction(fn)) {
            warn("nextTick", "Except a function,but got " + _toString(fn));
            clearTimeout(timer);
        }
        else {
            fn();
            if (autoReset) {
                clearTimeout(timer);
            }
        }
    }, 0);
}
function warn(where, msg) {
    var message = msg;
    if (isPlainObject(msg) || isArray(msg)) {
        message = JSON.stringify(msg);
    }
    console.error("[" + where + "] " + message + " ");
}
function getFront(list) {
    return list[0];
}
function getPeek(list) {
    return list[list.length - 1];
}
function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var merged = {};
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
            if (isArray(arg)) {
                for (var i_1 = 0; i_1 < arg.length; i_1++) {
                    var argItem = arg[i_1];
                    if (isPlainObject(argItem)) {
                        merged = generateObject(merged, argItem);
                    }
                    else if (!isDate(argItem)) {
                        merged[argItem] = argItem;
                    }
                }
            }
            else if (isPlainObject(arg)) {
                merged = generateObject(merged, arg);
            }
            else if (isString(arg) || isNumber(arg)) {
                merged[arg] = arg;
            }
        }
    }
    return merged;
}
function isEmpty(listOrObject) {
    if (!isArray(listOrObject) && !isPlainObject(listOrObject)) {
        warn("isEmpty", "Expect an Object or an Array,but got " + _toString(listOrObject));
        return false;
    }
    if (isArray(listOrObject)) {
        return listOrObject.length <= 0;
    }
    else if (isPlainObject(listOrObject)) {
        return Object.keys(listOrObject).length <= 0;
    }
}

var formatReg = /\d{2,4}(\W{1})\d{1,2}(\W{1})\d{1,2}/;
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
        format = "YYYY-MM-DD";
    }
    format = format.toUpperCase();
    var parts = {
        YYYY: date.getFullYear(),
        DD: padding(date.getDate()),
        MM: padding(date.getMonth() + 1),
        D: date.getDate(),
        M: date.getMonth() + 1
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
        format = "YYYY-MM-DD";
    }
    var formatRegExpTester = createDateFormatVaildator(format);
    if (!formatReg.test(strDate) || !formatRegExpTester.test(strDate)) {
        return null;
    }
    var ret = parse(strDate);
    if (ret)
        return ret;
    var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
    var parseFlags = {
        D: [/\d{1,2}/, function (d, v) { return (d.day = parseInt(v)); }],
        M: [/\d{1,2}/, function (d, v) { return (d.month = parseInt(v) - 1); }],
        DD: [/\d{2}/, function (d, v) { return (d.day = parseInt(v)); }],
        MM: [/\d{2}/, function (d, v) { return (d.month = parseInt(v) - 1); }],
        YY: [/\d{2,4}/, function (d, v) { return (d.year = parseInt(v)); }],
        YYYY: [/\d{2,4}/, function (d, v) { return (d.year = parseInt(v)); }]
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
            return parseFlags[$0] ? "" : $0.slice(1, $0.length - 1);
        });
        if (!isValid) {
            return null;
        }
        var parsed = new Date(dateInfo.year, dateInfo.month, dateInfo.day);
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };
    return ret(strDate, format);
}
function createDateFormatVaildator(formate) {
    var sepreator = formate.split(/\w/).filter(function (item) { return item; });
    var result = formate
        .split(/\W/)
        .map(function (string) { return "\\d{1," + (string.length + 1) + "}"; })
        .join("^");
    for (var i = 0; i < sepreator.length; i++) {
        var item = sepreator[i];
        result = result.replace(/\^/, item);
    }
    return new RegExp(result);
}

var HTML = (function () {
    function HTML(options) {
        this.language = {};
        var date = options.date, language = options.language, dateFormat = options.dateFormat, size = options.size, renderWeekOnTop = options.renderWeekOnTop;
        this.dateFormat = dateFormat;
        this.language = language;
        return [
            this.createActionBar(!renderWeekOnTop) + "  \n       " + this.createView(size, date, renderWeekOnTop)
        ];
    }
    HTML.prototype.createActionBar = function (create) {
        if (!create) {
            return "";
        }
        return "<div class=\"calendar-action-bar\">\n            <button class='calendar-action calendar-action-prev'><span>prev</span></button>\n            <button class='calendar-action calendar-action-next'><span>next</span></button>\n         </div>\n    ";
    };
    HTML.prototype.createBody = function (size, date) {
        var template = [];
        for (var i = 0; i <= size; i++) {
            var dat = new Date(date.getFullYear(), date.getMonth() + i, 1);
            var paint = this.createMonthDateTemplate(dat.getFullYear(), dat.getMonth());
            template.push({
                template: paint.template,
                year: paint.year,
                month: paint.month
            });
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
            var formatted = format(date, this.dateFormat);
            var key = formatted.value;
            var text = this.createPlaceholder(formatted.date);
            var className = this.setNodeClassName(date);
            var day = formatted.day;
            template.push({ className: className, text: text, key: key, day: day });
        }
        var tpl = template
            .map(function (item) {
            return _this.createNode(item.className, item.key, item.text, item.day);
        })
            .join("");
        return {
            template: tpl,
            year: curr.year,
            month: curr.index
        };
    };
    HTML.prototype.createView = function (size, date, renderWeekOnTop) {
        var _this = this;
        var week = this.createMonthWeek();
        var template = this.createBody(size, date).map(function (item) {
            var head = _this.createMonthHeader(item.year, item.month);
            return "<div class='calendar-main'> \n        " + head + "   \n        " + (!renderWeekOnTop ? week : "") + " \n        <div class=\"calendar-body\">" + item.template + "</div>\n      </div> ";
        });
        if (renderWeekOnTop) {
            template.unshift(week);
        }
        return template.join("").trim();
    };
    HTML.prototype.createMonthWeek = function () {
        var template = this.language.days
            .map(function (day, index) {
            var className = [
                "calendar-cell",
                "calendar-day-cell",
                index === 0
                    ? "calendar-cell-weekday"
                    : index === 6 ? "calendar-cell-weekend" : ""
            ];
            return "<div class=\"" + className.join(" ") + "\">" + day + "</div>";
        })
            .join("");
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
        return "<div class=\"date\">" + (date ? date : "") + "</div><div class=\"placeholder\"></div>";
    };
    HTML.prototype.setNodeClassName = function (date) {
        var classStack = ["calendar-cell", "calendar-date-cell"];
        if (!date) {
            classStack.push("disabled", "empty");
        }
        else {
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

var standardDate = function (date, size) {
    if (!size) {
        size = 0;
    }
    var curr = isDate(date) ? date : new Date();
    return new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + size);
};
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
        if (view !== "auto") {
            return 1;
        }
        else {
            return "auto";
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
function parseEl(el) {
    if (!el) {
        return null;
    }
    if (!isString(el)) {
        return el;
    }
    else {
        if (el.indexOf("#") >= 0) {
            return document.querySelector(el);
        }
        else if (el.indexOf(".") >= 0) {
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
function setNodeRangeState(el, data, should) {
    if (!should)
        return;
    var collection = el.querySelectorAll(".in-range");
    for (var i = 0; i < collection.length; i++) {
        removeClass(collection[i], "in-range");
    }
    for (var i = 0; i < data.length; i++) {
        var selector = attrSelector("data-date", data[i]);
        var element = el.querySelector(selector);
        if (!hasClass(element, "active")) {
            addClass(element, "in-range");
        }
    }
}
function setNodeActiveState(el, dates, isDouble) {
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
var DatePicker = (function () {
    function DatePicker(option) {
        var _this = this;
        this.limit = 1;
        this.views = 1;
        this.date = new Date();
        this.startDate = null;
        this.endDate = null;
        this.selected = [];
        this.data = {};
        this.disables = {};
        this.element = null;
        this.doubleSelect = false;
        this.disableDays = [];
        this.language = {
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
        this.format = function (date, format$$1) {
            return format(date, format$$1 ? format$$1 : _this.dateFormat);
        };
        this.parse = function (string, format$$1) {
            return parseFormatted(string, format$$1 ? format$$1 : _this.dateFormat);
        };
        if (!option) {
            warn("init", "No instance option provided");
            return;
        }
        this.element = parseEl(option.el);
        if (!this.element) {
            warn("init", "invalid selector,current selector " + this.element);
            return;
        }
        var getRange = function (data) {
            var startDate = getFront(data);
            var endDate = getPeek(data);
            var invalidDates = [];
            var validDates = [];
            if (startDate && endDate) {
                var start = void 0;
                var end = void 0;
                if (!isDate(startDate)) {
                    start = _this.parse(startDate);
                }
                else {
                    start = startDate;
                }
                if (!isDate(endDate)) {
                    end = _this.parse(endDate);
                }
                else {
                    end = endDate;
                }
                var gap = diff(start, end, "days", true);
                if (gap <= _this.limit) {
                    for (var i = 0; i < gap; i++) {
                        var date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
                        var formatted = _this.format(date).value;
                        if (_this.disables[formatted]) {
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
        };
        Observer.$on("select", function (result) {
            var type = result.type, value = result.value;
            if (type === "disabled") {
                return false;
            }
            if (type === "selected") {
                _this.setDates(value);
            }
            if (type !== "switch") {
                Observer.$emit("update", result);
            }
            var currRange = getRange(value);
            setNodeRangeState(_this.element, currRange.validDates, _this.doubleSelect);
            setNodeActiveState(_this.element, value, _this.doubleSelect);
        });
        Observer.$on("create", function (result) {
            var bindData = !isEmpty(_this.data);
            var type = result.type;
            if (type === "switch") {
                var curr = {
                    year: _this.date.getFullYear(),
                    month: _this.date.getMonth(),
                    date: _this.date.getDate()
                };
                _this.date = new Date(curr.year, curr.month + result.size, curr.date);
            }
            _this.createDatePicker();
            var nodeList = _this.element.querySelectorAll(".calendar-cell");
            if (!isEmpty(_this.disableDays) && isUndefined(_this.endDate)) {
                var days = _this.disableDays;
                for (var i = 0; i < nodeList.length; i++) {
                    var node = nodeList[i];
                    var day = parseToInt(attr(node, "data-day"));
                    var date = attr(node, "data-date");
                    if (!isNaN(day) && days.indexOf(day) >= 0) {
                        _this.disables[date] = date;
                    }
                }
            }
            Observer.$emit("select", {
                type: type,
                value: _this.selected
            });
            if (bindData) {
                Observer.$emit("data", {
                    data: _this.data,
                    nodeList: nodeList
                });
            }
            if (!isEmpty(_this.disables)) {
                Observer.$emit("disabled", {
                    nodeList: nodeList,
                    dateList: _this.disables
                });
            }
            var isDoubleSelect = _this.doubleSelect;
            var cache = _this.selected;
            var isDisabled = function (date) { return !!_this.disables[date]; };
            var selected = _this.selected;
            var loop = function (node) {
                var type = "selected";
                var date = attr(node, "data-date");
                if (!date) {
                    return false;
                }
                var index = selected.indexOf(date);
                var isDisabledDate = isDisabled(date);
                var now = _this.parse(date);
                var prevDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                var prevDateIsInValid = isDisabled(_this.format(prevDate).value);
                if ((bindData && selected.length <= 0 && isDisabledDate) ||
                    (isDoubleSelect && prevDateIsInValid && isDisabledDate) ||
                    (index >= 0 && isDisabledDate)) {
                    return false;
                }
                if (index >= 0) {
                    var peek = getPeek(selected);
                    var front = getFront(selected);
                    selected = isUndefined(_this.disables[peek]) ? [peek] : [front];
                }
                if ((isDoubleSelect && selected.length >= 2) || !isDoubleSelect) {
                    selected = [];
                }
                selected.push(date);
                if (!isDoubleSelect) {
                    selected = isDisabledDate ? cache : selected;
                    type = isDisabledDate ? "disabled" : "selected";
                }
                else {
                    if (selected.length >= 2) {
                        var front = getFront(selected);
                        var peek = getPeek(selected);
                        var diffed = diff(_this.parse(peek), _this.parse(front), "days", false);
                        if (diffed === 0) {
                            selected = [front];
                        }
                        else if (diffed < 0) {
                            peek = getPeek(selected);
                            if (isDisabled(peek)) {
                                selected.pop();
                            }
                            else {
                                selected.shift();
                            }
                        }
                        else {
                            var range = getRange(selected);
                            if (range.invalidDates.length > 0 || diffed > _this.limit) {
                                selected.shift();
                            }
                        }
                    }
                    if (selected.length <= 1) {
                        if (isDisabled(getFront(selected))) {
                            type = "disabled";
                            selected = cache;
                        }
                    }
                }
                Observer.$emit("select", {
                    type: type,
                    value: selected
                });
            };
            var _loop_1 = function (i) {
                var node = nodeList[i];
                node.addEventListener("click", function () { return loop(node); });
            };
            for (var i = 0; i < nodeList.length; i++) {
                _loop_1(i);
            }
        });
        this.init(option);
    }
    DatePicker.prototype.on = function (ev, cb) {
        return Observer.$on(ev, cb);
    };
    DatePicker.prototype.setDates = function (dates) {
        if (!isArray(dates)) {
            dates = [];
            warn("setDates", "no dates provided," + dates);
            return;
        }
        var datesList = [];
        var start = "", end = "";
        if (this.doubleSelect) {
            if (dates.length > 2) {
                dates = dates.slice(0, 2);
            }
            start = dates[0];
            end = dates[dates.length - 1];
            var startDate = isDate(start) ? start : this.parse(start);
            var endDate = isDate(end) ? end : this.parse(end);
            datesList = [this.format(startDate).value];
            if (start !== end) {
                datesList.push(this.format(endDate).value);
            }
        }
        else {
            var d = dates[dates.length - 1];
            datesList = [isDate(d) ? this.format(d).value : d];
        }
        Observer.$emit("setDates", datesList);
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
        var _this = this;
        var result = toString({
            dates: "[optional]Expect an array of string or Date got " + toString(param.dates) + " ",
            days: "[optional]Expect an array of number,got " + toString(param.days),
            from: "[optional]Expect a string or Date ,got " + toString(param.to),
            to: "[optional]Expect a string or Date ,got " + toString(param.to)
        });
        if (!param || (isPlainObject(param) && Object.keys(param).length <= 0)) {
            warn("setDisabled", result);
            return false;
        }
        if ((param.dates && !isArray(param.dates)) ||
            (param.days && !isArray(param.days))) {
            warn("setDisabled", result);
            return false;
        }
        var dateList = isArray(param.dates)
            ? param.dates
                .map(function (date) {
                if (date instanceof Date) {
                    return _this.format(date).value;
                }
                else {
                    var parsed = _this.parse(date);
                    if (parsed instanceof Date) {
                        return date;
                    }
                }
            })
                .filter(function (item) { return !!item; })
            : [];
        var fromDate;
        var toDate;
        var to = param.to;
        var from = param.from;
        if (from) {
            if (isDate(from)) {
                fromDate = from;
            }
            else {
                var parsed = this.parse(from, this.dateFormat);
                if (isDate(parsed)) {
                    fromDate = parsed;
                }
                else {
                    warn("setDisabled", "invalid param," + toString({ from: from }));
                    return false;
                }
            }
            fromDate = standardDate(fromDate);
        }
        if (to) {
            if (isDate(to)) {
                toDate = to;
            }
            else {
                var parsed = this.parse(to, this.dateFormat);
                if (isDate(parsed)) {
                    toDate = parsed;
                }
                else {
                    warn("setDisabled", "invalid param," + toString({ to: to }));
                    return false;
                }
            }
            toDate = standardDate(toDate);
        }
        var dayList = isArray(param.days)
            ? param.days.filter(function (item) {
                var parsed = parseToInt(item);
                return !isNaN(parsed) && parsed >= 0 && parsed <= 6;
            })
            : [];
        Observer.$emit("setDisabled", {
            dayList: dayList,
            dateList: dateList,
            disableAfter: fromDate,
            disableBefore: toDate
        });
    };
    DatePicker.prototype.setData = function (cb) {
        if (isFunction(cb)) {
            var result = cb();
            if (isPlainObject(result) && Object.keys(result).length > 0) {
                var map = {};
                for (var key in result) {
                    var date = this.parse(key);
                    if (date instanceof Date) {
                        map[key] = result[key];
                    }
                }
                Observer.$emit("setData", map);
            }
            else {
                var key = this.format(new Date(), this.dateFormat).value;
                warn("setData", "you are passing wrong type of data to DatePicker,data should be like :\n          \n                    {" + key + ":\"value\"}");
            }
        }
    };
    DatePicker.prototype.createDatePicker = function () {
        this.element.className = this.element.className + " calendar calendar-" + (this.views === 2
            ? "double-views"
            : this.views === 1 ? "single-view" : "flat-view");
        var monthSize = this.views === 2
            ? 1
            : this.views === "auto" ? diff(this.endDate, this.startDate) : 0;
        var template = new HTML({
            date: this.date,
            size: monthSize,
            language: this.language,
            dateFormat: this.dateFormat,
            renderWeekOnTop: this.views === "auto"
        });
        this.element.innerHTML = template[0];
        var prev = this.element.querySelector(".calendar-action-prev");
        var next = this.element.querySelector(".calendar-action-next");
        if (prev && next) {
            var endGap = this.endDate ? diff(this.endDate, this.date) : 1;
            var startGap = this.endDate ? diff(this.date, this.startDate) : 2;
            if (startGap >= 1) {
                prev.addEventListener("click", function () {
                    Observer.$emit("create", { type: "switch", size: -1 });
                    removeClass(next, "disabled calendar-action-disabled");
                });
            }
            else {
                addClass(prev, "disabled calendar-action-disabled");
            }
            if (endGap >= 1) {
                next.addEventListener("click", function () {
                    Observer.$emit("create", { type: "switch", size: 1 });
                    removeClass(prev, "disabled calendar-action-disabled");
                });
            }
            else {
                addClass(next, "disabled calendar-action-disabled");
            }
        }
    };
    DatePicker.prototype.init = function (option) {
        var _this = this;
        this.doubleSelect = isBoolean(option.doubleSelect);
        this.dateFormat = option.format;
        this.views = getViews(option.views);
        if (!isUndefined(option.startDate) && isDate(option.startDate)) {
            this.startDate = option.startDate;
        }
        if (!isUndefined(option.endDate) && isDate(option.endDate)) {
            this.endDate = option.endDate;
        }
        this.limit = this.doubleSelect
            ? isNumber(option.limit) ? option.limit : 2
            : 1;
        var rawDisableMap = {
            dateList: [],
            dayList: [],
            disableBefore: null,
            disableAfter: null
        };
        Observer.$on("setDates", function (result) { return (_this.selected = result); });
        Observer.$on("setData", function (result) { return (_this.data = result); });
        Observer.$on("setDisabled", function (result) { return (rawDisableMap = result); });
        nextTick(function () {
            var bindData = !isEmpty(_this.data);
            if (!isDate(option.startDate) || !isDate(option.endDate)) {
                if (bindData) {
                    warn("init", "please provide [startDate] and [endDate] while binding data to datepicker");
                }
            }
            var disabledMap = {};
            var dateList = rawDisableMap.dateList, dayList = rawDisableMap.dayList;
            _this.disableDays = dayList;
            if (rawDisableMap.disableBefore) {
                _this.startDate = rawDisableMap.disableBefore;
            }
            if (rawDisableMap.disableAfter) {
                _this.endDate = rawDisableMap.disableAfter;
            }
            var isInfinite = isUndefined(_this.endDate);
            if (!isInfinite) {
                var days = diff(_this.startDate, _this.endDate, "days", true);
                for (var i = 0; i <= days; i++) {
                    var date = standardDate(_this.startDate, parseToInt(i));
                    var formatted = _this.format(date).value;
                    var day = date.getDay();
                    if (dateList.indexOf(date) >= 0) {
                        if (!disabledMap[formatted]) {
                            disabledMap[formatted] = formatted;
                        }
                    }
                    if (dayList.indexOf(day) >= 0) {
                        if (!disabledMap[formatted]) {
                            disabledMap[formatted] = formatted;
                        }
                    }
                    if (!_this.data[formatted] && bindData) {
                        disabledMap[formatted] = formatted;
                    }
                }
            }
            else {
                for (var _i = 0, dateList_1 = dateList; _i < dateList_1.length; _i++) {
                    var date = dateList_1[_i];
                    disabledMap[date] = date;
                }
            }
            _this.disables = merge(getDisableDates(_this.startDate, _this.endDate, _this.dateFormat, !!_this.endDate || bindData), disabledMap);
            if (bindData) {
                for (var key in _this.disables) {
                    if (_this.data[key]) {
                        delete _this.data[key];
                    }
                }
            }
            _this.date = isUndefined(_this.startDate) ? new Date() : _this.startDate;
            var front = getFront(_this.selected);
            var peek = getPeek(_this.selected);
            if (_this.disables[front] ||
                _this.disables[peek] ||
                (_this.doubleSelect && front && front === peek && peek)) {
                warn("setDates", "Illegal dates" + _this.selected);
                _this.selected = [];
            }
            if (_this.views === "auto") {
                if (!isEmpty(_this.selected)) {
                    _this.date = _this.parse(getFront(_this.selected));
                }
                if (isUndefined(_this.startDate)) {
                    _this.startDate = _this.date;
                }
                if (isUndefined(_this.endDate)) {
                    _this.endDate = new Date(_this.date.getFullYear(), _this.date.getMonth() + 6, _this.date.getDate());
                }
            }
            if (_this.views === 1) {
                if (_this.doubleSelect && _this.selected.length >= 2) {
                    if (front === peek) {
                        _this.selected.pop();
                    }
                }
            }
            Observer.$emit("create", { type: "init" });
        });
    };
    return DatePicker;
}());

return DatePicker;

})));

  