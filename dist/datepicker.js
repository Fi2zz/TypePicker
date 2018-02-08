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
        $on: $on, $emit: $emit, $remove: $remove
    };
}());

var attrSelector = function (attr, value) { return "[" + attr + "=\"" + value + "\"]"; };
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
var getFirstDay = function (year, month) { return new Date(year, month, 1).getDay(); };
var getDates = function (year, month) {
    var d = new Date(year, month, 1);
    var utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate();
};
var padding = function (n) { return "" + (n > 9 ? n : "0" + n); };
function _toString(object) {
    return Object.prototype.toString.call(object);
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

var currDate = new Date();
function calendarDateCellClassName(options) {
    var date = options.date, infiniteMode = options.infiniteMode, endDate = options.endDate;
    var classStack = ["calendar-cell", "calendar-date-cell"];
    if (!date) {
        classStack.push("disabled", "empty");
    }
    else {
        if (!infiniteMode) {
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
}
function calendarDateCellTemplate(options) {
    var year = options.year, month = options.month, infiniteMode = options.infiniteMode, formatter = options.formatter, endDate = options.endDate;
    var template = [];
    var d = new Date(year, month, 1);
    var curr = {
        year: d.getFullYear(),
        month: d.getMonth(),
        date: d.getDate(),
        index: d.getMonth()
    };
    var firstDay = getFirstDay(curr.year, curr.month);
    for (var i = 0; i < firstDay; i++) {
        template.push({
            date: "",
            className: calendarDateCellClassName({}),
            text: calendarSingleDateCellTemplate(),
            key: ""
        });
    }
    for (var i = 1; i <= getDates(curr.year, curr.month); i++) {
        var date = new Date(curr.year, curr.month, i);
        var formatted = formatter(date);
        var key = formatted.value;
        var text = calendarSingleDateCellTemplate(formatted.date);
        var className = calendarDateCellClassName({ date: date, infiniteMode: infiniteMode, endDate: endDate });
        template.push({ className: className, text: text, key: key });
    }
    var tpl = template.map(function (item) { return calendarCellGenerate(item.className, item.key, item.text); }).join(" ");
    return {
        template: tpl,
        year: curr.year,
        month: curr.index
    };
}
function calendarSingleDateCellTemplate(date) {
    return "<div class=\"date\">" + (date ? date : '') + "</div><div class=\"placeholder\"></div>";
}
function calendarCellGenerate(className, key, text) {
    return "<div class=\"" + className + "\"" + (key ? "data-date=" + key : "") + ">" + text + "</div>";
}
function calendarTemplateList(option) {
    var startDate = option.startDate, endDate = option.endDate, gap = option.gap, infiniteMode = option.infiniteMode, formatter = option.formatter, parse = option.parse;
    var template = [];
    for (var i = 0; i <= gap; i++) {
        var date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        var paint = calendarDateCellTemplate({
            year: date.getFullYear(),
            month: date.getMonth(),
            formatter: formatter,
            parse: parse,
            infiniteMode: infiniteMode,
            endDate: endDate
        });
        template.push({ template: paint.template, year: paint.year, month: paint.month });
    }
    return template;
}
function calendarViewTemplate(options) {
    var template = options.template, multiViews = options.multiViews, flatView = options.flatView, singleView = options.singleView, language = options.language;
    var weekDays = language.week.map(function (day, index) {
        var className = ["calendar-cell", "calendar-day-cell",
            index === 0 ? "calendar-cell-weekday" : index === 6 ? "calendar-cell-weekend" : ""];
        return "<div class=\"" + className.join(" ") + "\">" + day + "</div>";
    }).join("");
    var tpl = template.map(function (item) {
        var year = item.year, month = item.month;
        var title = "<div class=\"calendar-title\">" + language.title(year, month) + "</div>", body = item.template;
        var tpl = "";
        if (multiViews || singleView) {
            tpl += "<div class='calendar-main'>\n                    <div class=\"calendar-head\">" + title + "</div>\n                   <div class=\"calendar-day\"> " + weekDays + "</div>\n                    <div class=\"calendar-body\">" + body + "</div>\n              </div>";
        }
        else {
            tpl = "<div class=\"calendar-main\">\n                   <div class=\"calendar-head\">" + title + "</div>  \n                    <div class=\"calendar-body\">" + body + "</div>\n            </div>";
        }
        return tpl;
    });
    if (flatView) {
        tpl.unshift("<div class=\"calendar-day\">" + weekDays + "</div>");
    }
    return tpl.join("");
}
function calendarActionBar(actionbar) {
    if (!actionbar) {
        return '';
    }
    return "<div class=\"calendar-action-bar\">\n            <button class='calendar-action calendar-action-prev'><span>prev</span></button>\n            <button class='calendar-action calendar-action-next'><span>next</span></button>\n         </div>\n    ";
}
function compose(option) {
    var startDate = option.startDate, endDate = option.endDate, multiViews = option.multiViews, flatView = option.flatView, singleView = option.singleView, language = option.language, infiniteMode = option.infiniteMode, parse = option.parse, formatter = option.formatter;
    var gap = multiViews ? 1 : flatView ? diff(startDate, endDate) : 0;
    var mapConf = {
        startDate: startDate,
        endDate: endDate,
        gap: gap,
        infiniteMode: infiniteMode,
        formatter: formatter,
        parse: parse
    };
    var templateConf = {
        template: calendarTemplateList(mapConf),
        multiViews: multiViews,
        flatView: flatView,
        language: language,
        singleView: singleView
    };
    return "" + calendarActionBar(multiViews || singleView) + calendarViewTemplate(templateConf);
}

var date = new Date();
var currDate$1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
function getRange(collection, start, end) {
    var temp = [];
    for (var i = 0; i < collection.length; i++) {
        var date_1 = attr(collection[i], "data-date");
        if (date_1) {
            temp.push(date_1);
        }
    }
    var startIndex = -1;
    var endIndex = -1;
    for (var i = 0; i < temp.length; i++) {
        var data = temp[i];
        if (data === start) {
            startIndex = i;
        }
        else if (data === end) {
            endIndex = i;
        }
    }
    if (endIndex === startIndex || endIndex < 0) {
        return [];
    }
    return temp.slice(startIndex + 1, endIndex);
}
function setStartAndEnd(collection, inDates, data, parse) {
    var temp = [];
    var start = data[0];
    var end = data[data.length - 1];
    for (var i = 0; i < collection.length; i++) {
        var item = collection[i];
        var nextItem = collection[i + 1];
        if (data.length > 0) {
            var date_2 = attr(collection[i], "data-date");
            if (date_2 === start) {
                addClass(item, "start-date");
            }
            else if (date_2 === end) {
                addClass(item, "end-date");
            }
        }
        else {
            if (item && nextItem) {
                var curr = attr(item, "data-date");
                var next = attr(nextItem, "data-date");
                if (curr && next) {
                    var start_1 = parse(curr);
                    if (diff(start_1, currDate$1, "days") >= 0) {
                        var hasItem = inDates(next) && inDates(curr) || inDates(curr) && !inDates(next);
                        if (hasItem) {
                            if (temp.length < 2) {
                                addClass(item, "start-date");
                                addClass(nextItem, "end-date");
                                temp.push(curr, next);
                            }
                        }
                    }
                }
            }
        }
    }
    if (data.length > 0) {
        temp = data;
    }
    return temp;
}
function setRange(data, collector, remove, clearRange) {
    if (remove) {
        var collection = collector.querySelectorAll(".in-range");
        for (var i = 0; i < collection.length; i++) {
            removeClass(collection[i], "in-range");
        }
    }
    else {
        for (var i = 0; i < data.length; i++) {
            var selector = attrSelector("data-date", data[i]);
            var element = collector.querySelector(selector);
            if (!hasClass(element, "active")) {
                addClass(element, "in-range");
            }
        }
    }
    if (clearRange) {
        return [];
    }
}
function setInitRange(options) {
    var collector = options.collector, collection = options.collection, data = options.data, isDouble = options.isDouble, parse = options.parse, format = options.format, inDates = options.inDates, isInit = options.isInit;
    var dates = [];
    if (!isDouble) {
        dates = data;
    }
    else {
        if (data.length >= 2) {
            var start_2 = data[0];
            var end_1 = data[data.length - 1];
            if (!inDates(start_2)) {
                data = [];
            }
            var startDate = parse(start_2);
            var endDate = parse(end_1);
            var year = startDate.getFullYear();
            var month = startDate.getMonth();
            var date_3 = startDate.getDate();
            var inValidDates = [];
            var gap = diff(endDate, startDate, "days") + 1;
            for (var i = 0; i < gap; i++) {
                var d = new Date(year, month, date_3 + i);
                var formatted = format(d).value;
                if (!inDates(formatted)) {
                    inValidDates.push(formatted);
                }
            }
            if (inValidDates.length >= 2) {
                data = [];
            }
        }
        if (data.length > 0 && isInit || !isInit) {
            dates = setStartAndEnd(collection, inDates, data, parse);
        }
        var start = dates[0];
        var end = dates[dates.length - 1];
        var range = getRange(collection, start, end);
        if (range.length > 0) {
            setRange(range, collector, false);
        }
    }
    for (var i = 0; i < dates.length; i++) {
        var selector = attrSelector("data-date", dates[i]);
        var element = collector.querySelector(selector);
        addClass(element, "active");
    }
    return dates;
}

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
function format(date, format, zeroPadding) {
    if (zeroPadding === void 0) { zeroPadding = true; }
    var shouldPadStart = zeroPadding;
    if (!format) {
        format = 'YYYY-MM-DD';
    }
    var parts = {
        DD: shouldPadStart ? padding(date.getDate()) : date.getDate(),
        dd: shouldPadStart ? padding(date.getDate()) : date.getDate(),
        MM: shouldPadStart ? padding(date.getMonth() + 1) : date.getMonth() + 1,
        mm: shouldPadStart ? padding(date.getMonth() + 1) : date.getMonth() + 1,
        YYYY: date.getFullYear(),
        D: date.getDate(),
        d: date.getDate(),
        M: date.getMonth() + 1,
        m: date.getMonth() + 1
    };
    return {
        origin: date,
        date: shouldPadStart ? parts["DD"] : parts["D"],
        month: shouldPadStart ? parts["MM"] : parts["M"],
        year: parts["YYYY"],
        day: date.getDay(),
        value: format.replace(/(?:\b|%)([dDMyYHhaAmsz]+|ap|AP)(?:\b|%)/g, function (match, $1) {
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
        YYYY: [/\d{2,4}/, function (d, v) { return d.year = parseInt(v); }]
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

function parseEl(el) {
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
var defaultLanguage = {
    locale: "zh-cn",
    pack: {
        days: ['日', '一', '二', '三', '四', '五', '六'],
        months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
        year: "年"
    }
};
function setLanguage(option) {
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
function getLanguage(language, key) {
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
function doMonthSwitch(size) {
    var curr = {
        year: this.date.getFullYear(),
        month: this.date.getMonth(),
        date: this.date.getDate()
    };
    this.date = new Date(curr.year, curr.month + size, curr.date);
    this.createDatePicker(false);
    this.pickDate();
    this.dataRenderer(this.data);
}
function createDatePicker(isInit) {
    this.element.innerHTML = compose({
        startDate: this.date,
        endDate: this.endDate,
        multiViews: this.multiViews,
        flatView: this.flatView,
        singleView: this.singleView,
        language: this.language,
        infiniteMode: this.infiniteMode,
        formatter: this.format,
        parse: this.parse
    });
    this.bindMonthSwitch();
    this.selected = this.currentRange(this.isFromSetRange);
    var updateEventData = {
        type: isInit ? 'init' : 'switch',
        value: this.selected
    };
    this.update(updateEventData);
}
function currentRange(isInit) {
    var initSelected = this.defaultDates.length > 0
        ? this.defaultDates
        : this.double
            ? this.selected
            : [this.format(this.date).value];
    var rangeOption = {
        collector: this.element,
        collection: this.element.querySelectorAll(".calendar-date-cell:not(.empty)"),
        data: initSelected,
        isDouble: this.double,
        parse: this.parse,
        format: this.format,
        inDates: this.inDates,
        isInit: isInit
    };
    return setInitRange(rangeOption);
}
function bindMonthSwitch() {
    var _this = this;
    var prev = this.element.querySelector(".calendar-action-prev");
    var next = this.element.querySelector(".calendar-action-next");
    if (prev && next) {
        if (this.infiniteMode) {
            next.addEventListener("click", function () {
                _this.doMonthSwitch(1);
            });
            prev.addEventListener("click", function () {
                _this.doMonthSwitch(-1);
            });
        }
        else {
            var endGap = diff(this.date, this.endDate);
            if (endGap >= 1) {
                next.addEventListener("click", function () {
                    _this.doMonthSwitch(1);
                    removeClass(prev, "disabled");
                    removeClass(prev, "calendar-action-disabled");
                });
            }
            else {
                addClass(next, "disabled");
                addClass(next, "calendar-action-disabled");
            }
            var startGap = diff(this.date, this.startDate);
            if (startGap >= 1) {
                prev.addEventListener("click", function () {
                    _this.doMonthSwitch(-1);
                    removeClass(next, "disabled");
                    removeClass(next, "calendar-action-disabled");
                });
            }
            else {
                addClass(prev, "disabled");
                addClass(prev, "calendar-action-disabled");
            }
        }
    }
}
function init(option, renderer) {
    var _this = this;
    if (option.doubleSelect) {
        this.double = option.doubleSelect;
    }
    this.dateFormat = option.format || "YYYY-MM-DD";
    var parseToInt = parseInt(option.views);
    if ((option.views !== 'auto' && isNaN(parseToInt)) || (parseToInt <= 0 || parseToInt === 1)) {
        this.singleView = true;
    }
    else if (option.views === 'auto' || parseToInt > 2) {
        this.flatView = true;
        this.singleView = false;
    }
    else if (parseToInt === 2) {
        this.multiViews = true;
        this.singleView = false;
    }
    this.startDate = isDate(option.from) ? option.from : new Date();
    this.date = this.startDate;
    this.endDate = isDate(option.to) ? option.to : new Date(this.date.getFullYear(), this.date.getMonth() + 6, 0);
    this.limit = this.double ? isNumber(option.limit) ? option.limit : 1 : 1;
    this.zeroPadding = checkIfZeroPadding(this.dateFormat);
    if (!renderer.dates || renderer.dates && renderer.dates.length <= 0) {
        var currDate = new Date();
        var gap = diff(this.endDate, currDate, "days");
        var year = currDate.getFullYear();
        var month = currDate.getMonth();
        var date = currDate.getDate();
        var dates = [];
        for (var i = 0; i < gap; i++) {
            var item = new Date(year, month, date + i);
            var formatted = this.format(item).value;
            dates.push(formatted);
        }
        this.data = {};
        this.dates = dates;
    }
    else {
        this.dates = renderer.dates;
        this.data = renderer.data;
        this.infiniteMode = false;
    }
    if (!isDate(option.from) || !isDate(option.to)) {
        this.infiniteMode = true;
        if (this.bindData) {
            warn('init', "infiniteMode is on, please provide [from] and [to] while binding data to datepicker  ");
        }
    }
    this.format = function (date) { return format(date, _this.dateFormat, _this.zeroPadding); };
    this.language = setLanguage(getLanguage(option.language, option.defaultLanguage));
    this.element = parseEl(option.el);
    if (!this.element) {
        warn('init', "invalid selector,current selector " + this.element);
        return false;
    }
    this.element.className = this.element.className + " calendar calendar-" + (this.multiViews ? "double-views" : this.singleView ? "single-view" : "flat-view");
    var next = nextTick(function () {
        if (_this.defaultDates.length > 0) {
            var date = _this.defaultDates[0];
            if (!_this.flatView) {
                _this.date = _this.parse(date);
            }
        }
        _this.createDatePicker(true);
        _this.pickDate();
        clearNextTick(next);
    });
}
function checkIfZeroPadding(dateFormat) {
    if (!dateFormat) {
        return true;
    }
    dateFormat = dateFormat.toUpperCase();
    var regExp = /[Y|YY|YYYY|YYY]([-|/])MM[-|/]DD/;
    return regExp.test(dateFormat);
}

var handlePickDate = function (options) {
    var element = options.element, selected = options.selected, isDouble = options.isDouble, parse = options.parse, format = options.format, limit = options.limit, inDates = options.inDates, update = options.update, infiniteMode = options.infiniteMode, bindData = options.bindData;
    var collection = element.querySelectorAll(".calendar-date-cell");
    var _loop_1 = function (i) {
        var item = collection[i];
        item.addEventListener("click", function () {
            var cache = selected;
            var date = attr(item, "data-date");
            var index = selected.indexOf(date);
            if (!date || (selected.length <= 0 && !inDates(date)) && bindData) {
                return false;
            }
            if (index >= 0) {
                selected = [selected[selected.length - 1]];
            }
            if (isDouble && selected.length >= 2 || !isDouble) {
                selected = [];
            }
            selected.push(date);
            if (isDouble) {
                var handlerOptions = {
                    date: date, selected: selected, cache: cache, limit: limit, format: format, parse: parse,
                    inDates: inDates,
                    infiniteMode: infiniteMode,
                    bindData: bindData
                };
                var handled = doubleSelectHandler(handlerOptions);
                selected = handled.selected;
                var range = handled.range;
                var allValid = handled.allValid;
                var start = selected[0];
                var end = selected[selected.length - 1];
                var diff_1 = gap(parse(start), parse(end));
                var isOutOfLimit = diff_1 > limit;
                var isValid = doublePick(element, start, end, diff_1, isOutOfLimit, allValid);
                if (isValid) {
                    setRange([], element, true);
                }
                if (allValid && isValid) {
                    setRange(range, element, false);
                }
            }
            else {
                var selector = item;
                var shouldChange = true;
                if (!inDates(date)) {
                    selected = cache;
                    shouldChange = false;
                }
                singlePick(selector, element, shouldChange);
            }
            var type = "selected";
            if (isDouble) {
                if (selected.length <= 1) {
                    var front = selected[0];
                    if (!inDates(front)) {
                        type = 'disabled';
                    }
                }
                else if (selected.length >= 2) {
                    var prevEl = item.previousElementSibling;
                    var prevDate = attr(prevEl, "data-date");
                    if (!inDates(date) && !inDates(prevDate)) {
                        type = 'disabled';
                    }
                }
            }
            update({
                type: type,
                value: selected
            });
        });
    };
    for (var i = 0; i < collection.length; i++) {
        _loop_1(i);
    }
};
function singlePick(selector, collector, shouldChange) {
    if (shouldChange) {
        var actives = collector.querySelectorAll(".active");
        for (var i = 0; i < actives.length; i++) {
            removeClass(actives[i], "active");
        }
        if (!hasClass(selector, "disabled")) {
            addClass(selector, "active");
        }
    }
}
function doublePick(collector, start, end, diff$$1, outOfLimit, valid) {
    var cache = {
        start: collector.querySelector(".start-date"),
        end: collector.querySelector(".end-date")
    };
    var current = {
        start: collector.querySelector(attrSelector("data-date", start)),
        end: collector.querySelector(attrSelector("data-date", end))
    };
    if (diff$$1 === 0) {
        if (!hasClass(current.start, "disabled")) {
            removeClass(cache.start, "start-date");
            removeClass(cache.start, "active");
            removeClass(cache.end, "end-date");
            removeClass(cache.end, "active");
            addClass(current.start, "active");
            addClass(current.start, "start-date");
            return true;
        }
        else {
            return false;
        }
    }
    else {
        addClass(current.end, "active");
        if (diff$$1 > 0) {
            if (outOfLimit) {
                addClass(current.end, "start-date");
                removeClass(cache.start, "start-date");
                removeClass(cache.start, "active");
            }
            else {
                if (valid) {
                    addClass(current.end, "end-date");
                }
                else {
                    removeClass(current.start, "active");
                    removeClass(current.start, "start-date");
                    addClass(current.end, "start-date");
                }
            }
        }
        else if (diff$$1 < 0) {
            removeClass(current.start, "active");
            removeClass(current.start, "start-date");
            addClass(current.end, "start-date");
        }
    }
    return true;
}
function gap(d1, d2) {
    var value = diff(d1, d2, "days");
    return value === 0 ? 0 : value * -1;
}
function doubleSelectHandler(options) {
    var selected = options.selected, date = options.date, cache = options.cache, limit = options.limit, format = options.format, parse = options.parse, inDates = options.inDates, bindData = options.bindData;
    var range = [];
    var inRange = [];
    var allValid = false;
    var start = selected[0];
    var end = selected[selected.length - 1];
    var startDate = parse(start), endDate = parse(end);
    if (bindData) {
        var diff_2 = gap(startDate, endDate);
        var length = selected.length;
        if (length >= 2) {
            if (diff_2 <= 0) {
                if (inDates(date)) {
                    selected.shift();
                }
                else {
                    selected = [selected[0]];
                }
            }
            else {
                if (inDates(end)) {
                    var year = startDate.getFullYear(), month = startDate.getMonth(), date_1 = startDate.getDate();
                    for (var i = 1; i < diff_2; i++) {
                        var d = new Date(year, month, date_1 + i);
                        var formatted = format(d).value;
                        if (inDates(formatted)) {
                            inRange.push(formatted);
                        }
                        range.push(formatted);
                    }
                }
                else {
                    if (inDates() && end) {
                        selected.shift();
                        range.push(end);
                    }
                }
            }
        }
        else if (length === 1) {
            var start_1 = selected[selected.length - 1];
            if (inDates(start_1)) {
                selected = [start_1];
            }
            else {
                if (cache.length >= 2) {
                    var validDates = [];
                    for (var i = 0; i < cache.length; i++) {
                        if (inDates(cache[i])) {
                            validDates.push(cache[i]);
                        }
                    }
                    if (validDates.length === cache.length) {
                        var front = cache[0];
                        var last = cache[cache.length - 1];
                        if (front !== last) {
                            selected = cache;
                        }
                        else {
                            selected = [front];
                        }
                    }
                    else {
                        selected = [];
                    }
                }
                else {
                    selected = [cache[0]];
                }
            }
        }
        else {
            selected = cache;
        }
        if (selected.length <= 0) {
            selected = cache;
        }
        allValid = range.length === inRange.length;
        if (!allValid) {
            selected = [selected[selected.length - 1]];
        }
        if (selected.length === 2) {
            var lastValidDate = null;
            var end_1 = selected[selected.length - 1];
            var endDate_1 = parse(end_1);
            var startDate_1 = parse(selected[0]);
            var diff_3 = gap(endDate_1, startDate_1) * -1;
            if (diff_3 > 0) {
                var year = startDate_1.getFullYear(), month = startDate_1.getMonth(), date_2 = startDate_1.getDate();
                range = [];
                inRange = [];
                for (var i = 0; i < diff_3; i++) {
                    var d = new Date(year, month, date_2 + i);
                    var string = format(d).value;
                    if (inDates(string)) {
                        lastValidDate = d;
                        inRange.push(string);
                    }
                    if (!~range.indexOf(string)) {
                        range.push(string);
                    }
                }
                var newDiff = gap(lastValidDate, endDate_1);
                if (newDiff === 1 || newDiff === -1) {
                    allValid = true;
                }
                else {
                    range = [];
                    selected = [selected[0]];
                    allValid = false;
                }
            }
            if (inRange.length === range.length) {
                allValid = true;
            }
            else {
                allValid = false;
                selected = [selected[0]];
            }
            if (range.length > limit) {
                allValid = false;
                var peek = selected[selected.length - 1];
                if (inDates(peek)) {
                    selected = [peek];
                }
                else {
                    selected = [cache[0]];
                }
            }
        }
    }
    else {
        if (selected.length >= 2) {
            if (start === end) {
                selected.pop();
            }
        }
        var diff_4 = gap(startDate, endDate);
        if (diff_4 > 0 && diff_4 <= limit) {
            for (var i = 1; i < diff_4; i++) {
                var date_3 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                range.push(format(date_3).value);
            }
            allValid = true;
        }
        else if (diff_4 > limit || diff_4 < 0) {
            selected.shift();
        }
    }
    return {
        selected: selected,
        allValid: allValid,
        range: range
    };
}

function noData(result) {
    return !isObject(result)
        || (Object.keys(result.data).length <= 0
            || result.dates.length <= 0);
}
function initWithDataBind(option, cb) {
    var _this = this;
    if (option.bindData) {
        var params = {
            dates: [],
            data: {}
        };
        var cbData = cb && cb(params);
        var result = cbData ? cbData : params;
        var config = {
            data: result.data,
            dates: result.dates.sort(function (a, b) { return _this.parse(a) - _this.parse(b); })
        };
        this.init(option, config);
        if (!noData(result)) {
            this.dataRenderer(result.data);
        }
    }
}
function instanceUtils() {
    return {
        format: function (date, format$$1) { return (date && format$$1) ? format(date, format$$1).value : null; },
        parse: function (string, format$$1) { return (string && format$$1) ? parseFormatted(string, format$$1) : new Date(); },
        diff: function (d1, d2) { return diff(d1, d2, "days"); }
    };
}
var DatePicker = (function () {
    function DatePicker(option) {
        var _this = this;
        this.init = init;
        this.date = new Date();
        this.limit = 1;
        this.double = false;
        this.element = null;
        this.startDate = new Date();
        this.endDate = null;
        this.selected = [];
        this.flatView = false;
        this.multiViews = false;
        this.singleView = true;
        this.doMonthSwitch = doMonthSwitch;
        this.createDatePicker = createDatePicker;
        this.zeroPadding = false;
        this.bindData = false;
        this.infiniteMode = false;
        this.currentRange = currentRange;
        this.isFromSetRange = false;
        this.language = {};
        this.disableds = [];
        this.pickDate = function () {
            handlePickDate({
                element: _this.element,
                selected: _this.selected,
                isDouble: _this.double,
                source: _this.dates,
                parse: _this.parse,
                format: _this.format,
                limit: _this.limit,
                inDates: _this.inDates,
                update: _this.update,
                infiniteMode: _this.infiniteMode,
                bindData: _this.bindData
            });
        };
        this.format = function (date) { return format(date, _this.dateFormat, _this.zeroPadding); };
        this.parse = function (string) { return parseFormatted(string, _this.dateFormat); };
        this.inDates = function (date) { return _this.dates.indexOf(date) >= 0; };
        this.update = function (result) {
            var type = result.type, value = result.value;
            if (type === 'selected') {
                _this.dateRanges(value, false);
            }
            else if (type === 'switch') {
                if (_this.defaultDates.length > 0) {
                    _this.selected = _this.defaultDates;
                }
            }
            if (type !== 'disabled' && type !== 'switch') {
                Observer.$emit("update", result);
            }
        };
        this.dataRenderer = function (data) {
            if (Object.keys(data).length <= 0) {
                Observer.$remove("data");
            }
            else {
                var next_1 = nextTick(function () {
                    Observer.$emit("data", {
                        data: data,
                        nodeList: _this.element.querySelectorAll(".calendar-cell")
                    });
                    clearNextTick(next_1);
                });
            }
        };
        this.dateRanges = function (dates, isFromInitedInstanceDateRangeFunction) {
            if (!isArray(dates)) {
                dates = [];
                warn("dateRanges", "no dates provided," + dates);
                return;
            }
            _this.isFromSetRange = !(!isFromInitedInstanceDateRangeFunction);
            var bindDataHandler = function (startDate, endDate, diffed) {
                if (diffed < 0
                    || diffed > _this.limit
                    || (!_this.inDates(_this.format(startDate).value) && !_this.inDates(_this.format(endDate).value))
                    || !_this.inDates(_this.format(startDate).value)) {
                    warn("dateRanges", "Illegal dates,[" + dates + "]");
                    return false;
                }
                for (var i = 0; i <= diffed; i++) {
                    var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                    var formatted = _this.format(date).value;
                    if (i < diffed && !_this.inDates(formatted)) {
                        warn("dateRanges", "Illegal date,{dates:[" + formatted + "]}");
                        return false;
                    }
                }
            };
            var datesHandler = function (cb) {
                var datesList = [];
                var start = '', end = '';
                if (_this.double) {
                    if (dates.length > 2) {
                        dates = dates.slice(0, 2);
                    }
                    start = dates[0];
                    end = dates[dates.length - 1];
                    var startDate = isDate(start) ? start : _this.parse(start);
                    var endDate = isDate(end) ? end : _this.parse(end);
                    var diffed = diff(startDate, endDate, "days") * -1;
                    if (cb && typeof cb === 'function') {
                        cb && cb(startDate, endDate, diffed);
                    }
                    datesList = [_this.format(startDate).value, _this.format(endDate).value];
                }
                else {
                    var d = dates[dates.length - 1];
                    datesList = [isDate(d) ? _this.format(d).value : d];
                }
                _this.defaultDates = datesList;
            };
            if (!_this.bindData) {
                datesHandler();
            }
            else {
                var next_2 = nextTick(function () {
                    datesHandler(bindDataHandler);
                    clearNextTick(next_2);
                });
            }
        };
        this.bindMonthSwitch = bindMonthSwitch;
        this.initWithDataBind = initWithDataBind;
        if (!option) {
            return instanceUtils();
        }
        this.defaultDates = [];
        this.bindData = option.bindData;
        if (!option.bindData && option.el) {
            this.init(option, {});
        }
        return {
            on: Observer.$on,
            data: function (cb) { return _this.initWithDataBind(option, cb); },
            diff: function (d1, d2) { return diff(d1, d2, "days"); },
            parse: this.parse,
            format: this.format,
            dateRanges: this.dateRanges,
            disable: this.disable,
            setDefaultDates: function () {
                warn("setDefaultDates", "this method has been deprecated,use [dateRanges()] instead ");
            }
        };
    }
    DatePicker.prototype.disable = function () {
    };
    return DatePicker;
}());

return DatePicker;

})));
