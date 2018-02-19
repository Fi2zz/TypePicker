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
function noData(result) {
    return !isObject(result)
        || (Object.keys(result.data).length <= 0
            || result.dates.length <= 0);
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

var currDate = new Date();
var HTML = (function () {
    function HTML(options) {
        var startDate = options.startDate, endDate = options.endDate, multiViews = options.multiViews, flatView = options.flatView, singleView = options.singleView, language = options.language, infiniteMode = options.infiniteMode, dateParser = options.dateParser, dateFormatter = options.dateFormatter;
        var parse = dateParser;
        var formatter = dateFormatter;
        var gap = multiViews ? 1 : flatView ? diff(startDate, endDate) : 0;
        var bodyOption = {
            startDate: startDate,
            endDate: endDate,
            gap: gap,
            infiniteMode: infiniteMode,
            formatter: formatter,
            parse: parse
        };
        var viewOption = {
            template: this.createBody(bodyOption),
            multiViews: multiViews,
            flatView: flatView,
            language: language,
            singleView: singleView
        };
        this.template = "" + this.createActionBar(multiViews || singleView) + this.createView(viewOption);
    }
    HTML.prototype.createActionBar = function (create) {
        if (!create) {
            return '';
        }
        return "<div class=\"calendar-action-bar\">\n            <button class='calendar-action calendar-action-prev'><span>prev</span></button>\n            <button class='calendar-action calendar-action-next'><span>next</span></button>\n         </div>\n    ";
    };
    HTML.prototype.createBody = function (option) {
        var startDate = option.startDate, endDate = option.endDate, gap = option.gap, infiniteMode = option.infiniteMode, formatter = option.formatter, parse = option.parse;
        var template = [];
        for (var i = 0; i <= gap; i++) {
            var date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            var paint = this.createNodeList({
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
    };
    HTML.prototype.createNodeList = function (options) {
        var _this = this;
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
                className: this.setCellClassList({}),
                text: this.createPlaceholder(),
                key: ""
            });
        }
        for (var i = 1; i <= getDates(curr.year, curr.month); i++) {
            var date = new Date(curr.year, curr.month, i);
            var formatted = formatter(date);
            var key = formatted.value;
            var text = this.createPlaceholder(formatted.date);
            var className = this.setCellClassList({ date: date, infiniteMode: infiniteMode, endDate: endDate });
            var day = formatted.day;
            template.push({ className: className, text: text, key: key, day: day });
        }
        var tpl = template.map(function (item) { return _this.createNode(item.className, item.key, item.text, item.day); }).join(" ");
        return {
            template: tpl,
            year: curr.year,
            month: curr.index
        };
    };
    HTML.prototype.createView = function (options) {
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
    };
    HTML.prototype.createNode = function (className, key, text, day) {
        return "<div class=\"" + className + "\" " + (day ? "data-day=" + day : "") + " " + (key ? "data-date=" + key : "") + ">" + text + "</div>";
    };
    HTML.prototype.createPlaceholder = function (date) {
        return "<div class=\"date\">" + (date ? date : '') + "</div><div class=\"placeholder\"></div>";
    };
    HTML.prototype.setCellClassList = function (options) {
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
    };
    return HTML;
}());

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
            if (isDouble && bindData) {
                if (selected.length <= 1) {
                    var front = selected[0];
                    if (!inDates(front)) {
                        type = 'disabled';
                    }
                }
                else if (selected.length >= 2) {
                    var prevEl = item.previousElementSibling;
                    var front = selected[0];
                    var startDate = parse(front);
                    var prevDate = attr(prevEl, "data-date") || front;
                    var inSelected = function (s) {
                        return selected.indexOf(s) >= 0;
                    };
                    var diffed = diff(startDate, parse(date), "days") * -1;
                    if (!inDates(date) && !inDates(prevDate)
                        || !inDates(date) && !inSelected(date)
                        || diffed > limit
                        || diffed < 0) {
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

var DatePicker = (function () {
    function DatePicker(option) {
        var _this = this;
        this.date = new Date();
        this.startDate = new Date();
        this.endDate = null;
        this.dates = [];
        this.selected = [];
        this.currentSelection = [];
        this.data = {};
        this.disables = {};
        this.limit = 1;
        this.language = {};
        this.element = null;
        this.double = false;
        this.flatView = false;
        this.multiViews = false;
        this.singleView = true;
        this.bindData = false;
        this.infiniteMode = false;
        this.isInit = false;
        this.on = Observer.$on;
        this.format = function (date, format$$1) { return format(date, format$$1 ? format$$1 : _this.dateFormat); };
        this.parse = function (string, format$$1) { return parseFormatted(string, format$$1 ? format$$1 : _this.dateFormat); };
        this.inDates = function (date) {
            return _this.dates.indexOf(date) >= 0;
        };
        this.update = function (result) {
            var type = result.type, value = result.value;
            if (type === 'selected') {
                _this.setDates(value, false);
            }
            else if (type === 'switch') {
                if (_this.currentSelection.length > 0) {
                    _this.selected = _this.currentSelection;
                }
            }
            if (type !== 'disabled' && type !== 'switch') {
                _this.emit("update", result);
            }
        };
        this.setDates = function (dates) {
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
            if (_this.double) {
                if (dates.length > 2) {
                    dates = dates.slice(0, 2);
                }
                start = dates[0];
                end = dates[dates.length - 1];
                var startDate = isDate(start) ? start : _this.parse(start);
                var endDate = isDate(end) ? end : _this.parse(end);
                var diffed = diff(startDate, endDate, "days") * -1;
                if (_this.bindData) {
                    var cbValue = bindDataHandler(startDate, endDate, diffed);
                    if (!cbValue) {
                        return false;
                    }
                }
                datesList = [_this.format(startDate).value, _this.format(endDate).value];
            }
            else {
                var d = dates[dates.length - 1];
                datesList = [isDate(d) ? _this.format(d).value : d];
            }
            _this.currentSelection = datesList;
        };
        this.setDisabled = function (param) {
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
                        dateList.push(_this.format(date).value);
                    }
                    else {
                        dateList.push(date);
                    }
                }
            }
            if (isArray(param.days)) {
                for (var _b = 0, _c = param.days; _b < _c.length; _b++) {
                    var day = _c[_b];
                    var dey = _this.element.querySelectorAll("[data-day=\"" + day + "\"");
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
            for (var _e = 0, dateList_1 = dateList; _e < dateList_1.length; _e++) {
                var date = dateList_1[_e];
                dateMap[date] = date;
            }
            _this.disables = dateMap;
        };
        if (option) {
            this.init(option);
        }
        else {
            return {
                diff: this.diff,
                parse: this.parse,
                format: function (date, format$$1) { return _this.format(date, format$$1).value; }
            };
        }
    }
    DatePicker.prototype.emit = function (evt, data) {
        return Observer.$emit(evt, data);
    };
    
    DatePicker.prototype.currentRange = function (isInit) {
        var initSelected = this.currentSelection.length > 0
            ? this.currentSelection
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
            disables: this.disables,
            isInit: isInit
        };
        return setInitRange(rangeOption);
    };
    
    DatePicker.prototype.doMonthSwitch = function (size) {
        var curr = {
            year: this.date.getFullYear(),
            month: this.date.getMonth(),
            date: this.date.getDate()
        };
        this.date = new Date(curr.year, curr.month + size, curr.date);
        this.isInit = false;
        this.createDatePicker(false);
    };
    DatePicker.prototype.bindMonthSwitch = function () {
        var _this = this;
        var prev = this.element.querySelector(".calendar-action-prev");
        var next = this.element.querySelector(".calendar-action-next");
        if (prev && next) {
            if (this.infiniteMode) {
                next.addEventListener("click", function () { return _this.doMonthSwitch(1); });
                prev.addEventListener("click", function () { return _this.doMonthSwitch(-1); });
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
    };
    
    DatePicker.prototype.pickDate = function () {
        handlePickDate({
            element: this.element,
            selected: this.selected,
            isDouble: this.double,
            source: this.dates,
            parse: this.parse,
            format: this.format,
            limit: this.limit,
            inDates: this.inDates,
            update: this.update,
            infiniteMode: this.infiniteMode,
            bindData: this.bindData
        });
    };
    
    DatePicker.prototype.dataRenderer = function () {
        var _this = this;
        if (Object.keys(this.data).length > 0) {
            var next_1 = nextTick(function () {
                _this.emit("data", {
                    data: _this.data,
                    nodeList: _this.element.querySelectorAll(".calendar-cell")
                });
                clearNextTick(next_1);
            });
        }
    };
    
    DatePicker.prototype.setLanguage = function (pack) {
        if (isArray(pack.days) && isArray(pack.months)) {
            this.language = {
                week: pack.days,
                title: function (year, month) {
                    if (pack.year) {
                        return "" + year + pack.year + pack.months[month];
                    }
                    else {
                        return pack.months[month] + " " + year;
                    }
                }
            };
        }
        return false;
    };
    
    DatePicker.prototype.disable = function () {
        var _this = this;
        if (Object.keys(this.disables).length > 0) {
            var next_2 = nextTick(function () {
                _this.emit("disabled", {
                    nodeList: _this.element.querySelectorAll(".calendar-cell"),
                    dateList: _this.disables
                });
                clearNextTick(next_2);
            });
        }
    };
    DatePicker.prototype.setData = function (cb) {
        var _this = this;
        var param = {
            data: {},
            dates: []
        };
        if (isFunction(cb)) {
            var result = cb(param);
            if (!noData(result)) {
                this.data = result.data;
                this.dates = result.dates.sort(function (a, b) { return _this.parse(a) - _this.parse(b); });
            }
        }
    };
    
    DatePicker.prototype.diff = function (d1, d2) {
        return diff(d1, d2, "days");
    };
    DatePicker.prototype.createDatePicker = function (isInit) {
        this.element.innerHTML = new HTML({
            startDate: this.date,
            endDate: this.endDate,
            multiViews: this.multiViews,
            flatView: this.flatView,
            singleView: this.singleView,
            language: this.language,
            infiniteMode: this.infiniteMode,
            dateFormatter: this.format,
            dateParser: this.parse
        }).template;
        this.selected = this.currentRange(this.isInit);
        if (this.singleView) {
            if (this.double && this.selected.length >= 2) {
                var start = this.selected[0];
                var end = this.selected[this.selected.length - 1];
                if (start === end) {
                    this.selected.pop();
                }
            }
        }
        var updateEventData = {
            type: isInit ? 'init' : 'switch',
            value: this.selected
        };
        this.bindMonthSwitch();
        this.disable();
        this.pickDate();
        this.dataRenderer();
        this.update(updateEventData);
    };
    
    DatePicker.prototype.init = function (option) {
        var _this = this;
        var currDate = new Date();
        if (option.doubleSelect) {
            this.double = option.doubleSelect;
        }
        this.dateFormat = option.format;
        var views = parseToInt(option.views);
        if ((option.views !== 'auto' && isNaN(views)) || views === 1 || views > 2 || views <= 0) {
            this.singleView = true;
        }
        else if (option.views === 'auto') {
            this.flatView = true;
            this.singleView = false;
        }
        else if (views === 2) {
            this.multiViews = true;
            this.singleView = false;
        }
        this.startDate = isDate(option.from) ? option.from : new Date();
        this.endDate = isDate(option.to) ? option.to : new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 6, 0);
        this.date = this.startDate;
        this.limit = this.double ? (isNumber(option.limit) ? option.limit : 2) : 1;
        if (Object.keys(this.language).length <= 0) {
            var defaultLanguage_1 = {
                days: ['日', '一', '二', '三', '四', '五', '六'],
                months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
                year: "年"
            };
            this.language = {
                week: defaultLanguage_1.days,
                title: function (year, month) {
                    if (defaultLanguage_1.year) {
                        return "" + year + defaultLanguage_1.year + defaultLanguage_1.months[month];
                    }
                    else {
                        return defaultLanguage_1.months[month] + " " + year;
                    }
                }
            };
        }
        this.element = parseEl(option.el);
        if (!this.element) {
            warn('init', "invalid selector,current selector " + this.element);
            return false;
        }
        this.element.className = this.element.className + " calendar calendar-" + (this.multiViews ? "double-views" : this.singleView ? "single-view" : "flat-view");
        var next = nextTick(function () {
            _this.isInit = _this.currentSelection.length > 0;
            _this.bindData = Object.keys(_this.data).length > 0;
            if (!isDate(option.from) || !isDate(option.to)) {
                _this.infiniteMode = true;
                _this.flatView = false;
                if (_this.bindData) {
                    warn('init', "infiniteMode is on, please provide [from] and [to] while binding data to datepicker  ");
                }
            }
            if (!_this.bindData) {
                var gap = diff(_this.endDate, currDate, "days");
                var year = currDate.getFullYear();
                var month = currDate.getMonth();
                var date = currDate.getDate();
                var dates = [];
                for (var i = 0; i < gap; i++) {
                    var item = new Date(year, month, date + i);
                    var formatted = _this.format(item).value;
                    dates.push(formatted);
                }
                _this.dates = dates;
            }
            var endMonthDates = getDates(_this.endDate.getFullYear(), _this.endDate.getMonth());
            var endDate = _this.endDate.getDate();
            var diffs = endMonthDates - endDate;
            for (var i = 0; i < diffs; i++) {
                var date = new Date(_this.endDate.getFullYear(), _this.endDate.getMonth(), endDate + i);
                var formatted = _this.format(date).value;
                _this.disables[formatted] = formatted;
            }
            var disableList = Object.keys(_this.disables);
            if (disableList.length > 0) {
                var datesList = _this.dates;
                var newDateList = [];
                var removed = removeDisableDates(Object.keys(_this.disables), _this.data);
                for (var key in removed) {
                    delete _this.data[key];
                }
                for (var _i = 0, datesList_1 = datesList; _i < datesList_1.length; _i++) {
                    var date = datesList_1[_i];
                    if (!removed[date]) {
                        newDateList.push(date);
                    }
                }
                _this.dates = newDateList;
            }
            if (!_this.flatView) {
                if (_this.currentSelection.length > 0) {
                    _this.date = _this.parse(_this.currentSelection[0]);
                }
                else {
                    if (_this.dates.length > 0) {
                        _this.date = _this.parse(_this.dates[0]);
                    }
                }
            }
            _this.createDatePicker(true);
            clearNextTick(next);
        });
    };
    
    return DatePicker;
}());

return DatePicker;

})));
