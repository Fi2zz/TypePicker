(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.DatePicker = factory());
}(this, (function () { 'use strict';

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var datepicker_observer = createCommonjsModule(function (module, exports) {
"use strict";
exports.__esModule = true;
exports["default"] = (function () {
    var clientList = {};
    var $remove = function (key, fn) {
        var fns = clientList[key];
        // key对应的消息么有被人订阅
        if (!fns) {
            return false;
        }
        // 没有传入fn(具体的回调函数), 表示取消key对应的所有订阅
        if (!fn) {
            fns && (fns.length = 0);
        }
        else {
            // 反向遍历
            for (var i = fns.length - 1; i >= 0; i--) {
                var _fn = fns[i];
                if (_fn === fn) {
                    // 删除订阅回调函数
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
    var $emit = function (evt, value) {
        var arguments$1 = arguments;
        var this$1 = this;

        var key = [].shift.call(arguments);
        var fns = clientList[key];
        if (!fns || fns.length === 0) {
            return false;
        }
        for (var i = 0, fn = void 0; fn = fns[i++];) {
            fn.apply(this$1, arguments$1);
        }
    };
    return {
        $on: $on, $emit: $emit, $remove: $remove
    };
}());
});

unwrapExports(datepicker_observer);

var util = createCommonjsModule(function (module, exports) {
"use strict";
exports.__esModule = true;
function diff(start, end, type) {
    if (type === void 0) { type = "month"; }
    if (type == "month") {
        return Math.abs((start.getFullYear() * 12 + start.getMonth()) - (end.getFullYear() * 12 + end.getMonth()));
    }
    else if (type === "days") {
        var startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        var endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return Math.round((startTime - endTime)) / (1000 * 60 * 60 * 24);
    }
}
exports.diff = diff;
exports.attrSelector = function (attr, value) { return "[" + attr + "=\"" + value + "\"]"; };
exports.getDates = function (year, month) {
    var d = new Date(year, month, 1);
    var utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate();
};
exports.padding = function (n) { return "" + (n > 9 ? n : "0" + n); };
//获取每月的1号的周几
exports.getFirstDay = function (year, month) {
    return new Date(year, month, 1).getDay();
};
exports.getWeeksOfMonth = function (date) {
    var firstDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    var last = new Date(date.getFullYear(), date.getMonth(), 0);
    var used = firstDate.getDay() + last.getDate();
    return Math.ceil(used / 7);
};
//获取该月的最后一天的星期
exports.getLastDay = function (year, month) {
    return new Date(year, month + 1, 0).getDay();
};
//获取该月的最后几天
exports.getLastDates = function (date) {
    var days = exports.getLastDay(date.getFullYear(), date.getMonth());
    var start = date.getDate() - days;
    var temp = [];
    for (var i = 0; i <= days; i++) {
        if (start + i <= date.getDate()) {
            temp.push(start + i);
        }
    }
    return temp;
};
function inArray(array, item) {
    if (!isArray(array) || array.length <= 0 || !item) {
        return false;
    }
    return ~array.indexOf(item);
}
exports.inArray = inArray;
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
exports.attr = attr;
function remove(arr, item) {
    if (arr.length) {
        var index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}
exports.remove = remove;
var _toString = function (object) { return Object.prototype.toString.call(object); };
function isBoolean(object) {
    return _toString(object) === '[object Boolean]';
}
exports.isBoolean = isBoolean;
function isArray(object) {
    return _toString(object) === '[object Array]';
}
exports.isArray = isArray;
function isObject(object) {
    return _toString(object) === '[object Object]';
}
exports.isObject = isObject;
function isNumber(object) {
    return _toString(object) === '[object Number]';
}
exports.isNumber = isNumber;
function isString(object) {
    return _toString(object) === '[object String]';
}
exports.isString = isString;
function isDate(object) {
    return _toString(object) === '[object Date]';
}
exports.isDate = isDate;
function isNil(object) {
    return object === null || typeof object === "undefined" || object === undefined;
}
exports.isNil = isNil;
function isPrimitive(value) {
    return (typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean');
}
exports.isPrimitive = isPrimitive;
function hasClass(el, className) {
    if (!el) {
        return false;
    }
    return el.classList.contains(className);
}
exports.hasClass = hasClass;
function removeClass(el, className) {
    if (!el) {
        return;
    }
    return el.classList.remove(className);
}
exports.removeClass = removeClass;
function addClass(el, className) {
    if (!el || el && el.classList.contains(className))
        { return; }
    return el.classList.add(className);
}
exports.addClass = addClass;
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
        var preserve = [
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
            "table"
        ];
        if (~preserve.indexOf(el)) {
            console.error("[DatePicker Warn] do not mount datepicker to pure html tag, use class name or id instead ");
            return null;
        }
        else {
            return document.querySelector(el);
        }
    }
}
exports.parseEl = parseEl;
exports.defaultLanguage = {
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
exports.setLanguage = setLanguage;
function getLanguage(language, key) {
    var output = {};
    if (!key || !language[key]) {
        output = exports.defaultLanguage;
    }
    else {
        output = {
            locale: key,
            pack: language[key]
        };
    }
    return output;
}
exports.getLanguage = getLanguage;
function quickSort(arr, isAscending) {
    if (1 === arr.length)
        { return arr; }
    if (0 === arr.length)
        { return []; }
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
exports.quickSort = quickSort;
function nextTick(func) {
    window.setTimeout(func, 0);
}
exports.nextTick = nextTick;
function clearNextTick(id) {
    window.clearTimeout(id);
}
exports.clearNextTick = clearNextTick;
});

unwrapExports(util);

var datepicker_template = createCommonjsModule(function (module, exports) {
"use strict";
exports.__esModule = true;

var currDate = new Date();
function calendarDateCellClassName(options) {
    var date = options.date, infiniteMode = options.infiniteMode, endDate = options.endDate;
    var classStack = ["calendar-cell", "calendar-date-cell"];
    if (!date) {
        classStack.push("disabled", "empty");
    }
    else {
        // console.log({infiniteMode})
        if (!infiniteMode) {
            if (util.diff(date, currDate, "days") < 0) {
                classStack.push("disabled");
            }
            if (endDate && util.diff(date, endDate, "days") > 0) {
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
    var firstDay = util.getFirstDay(curr.year, curr.month);
    for (var i = 0; i < firstDay; i++) {
        template.push({
            date: "",
            className: calendarDateCellClassName({}),
            text: calendarSingleDateCellTemplate(),
            key: ""
        });
    }
    for (var i = 1; i <= util.getDates(curr.year, curr.month); i++) {
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
/**
 * 集合月历，把多个月份的何在一起，构成日历
 * **/
function calendarTemplateList(option) {
    var startDate = option.startDate, endDate = option.endDate, gap = option.gap, 
    // zeroPadding,
    infiniteMode = option.infiniteMode, formatter = option.formatter, parse = option.parse;
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
    var template = options.template, multiViews = options.multiViews, flatView = options.flatView, language = options.language;
    var weekDays = language.week.map(function (day, index) {
        var className = ["calendar-cell", "calendar-day-cell",
            index === 0 ? "calendar-cell-weekday" : index === 6 ? "calendar-cell-weekend" : ""];
        return "<div class=\"" + className.join(" ") + "\">" + day + "</div>";
    }).join("");
    var tpl = template.map(function (item, index) {
        var year = item.year, month = item.month;
        var title = "<div class=\"calendar-title\">" + language.title(year, month) + "</div>", body = item.template;
        var tpl = "";
        if (!multiViews && !flatView) {
            tpl += "<div class='calendar-main calendar-" + index + "'>\n                    <div class=\"calendar-head\">" + title + "</div>\n                    <div class=\"calendar-body\">" + body + "</div>\n              </div>";
        }
        else {
            tpl = "<div class=\"calendar-main\">\n                   <div class=\"calendar-head\">" + title + "</div>  \n                   <div class=\"calendar-day\"> " + weekDays + "</div>\n                    <div class=\"calendar-body\">" + body + "</div>\n            </div>";
        }
        return tpl;
    });
    if (!multiViews && !flatView) {
        tpl.unshift("<div class=\"calendar-day\">" + weekDays + "</div>");
    }
    return tpl.join("");
}
function calendarTemplateCompose(multiViews, flatView, singleView, template) {
    return "<div class=\"calendar calendar-" + (multiViews ? "double-views" : flatView ? "single-view" : "flat-view") + "\">" + calendarActionBar(multiViews || singleView) + template + "</div>";
}
function calendarActionBar(actionbar) {
    if (!actionbar) {
        return '';
    }
    return "<div class=\"calendar-action-bar\">\n            <button class='calendar-action calendar-action-prev'><span>prev</span></button>\n            <button class='calendar-action calendar-action-next'><span>next</span></button>\n         </div>\n    ";
}
/**
 * 生成完整日历
 *
 * **/
function compose(option) {
    var startDate = option.startDate, endDate = option.endDate, multiViews = option.multiViews, flatView = option.flatView, singleView = option.singleView, language = option.language, infiniteMode = option.infiniteMode, parse = option.parse, formatter = option.formatter;
    var gap = multiViews ? 1 : flatView ? util.diff(startDate, endDate) : 0;
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
        language: language
    };
    return calendarTemplateCompose(multiViews, flatView, singleView, calendarViewTemplate(templateConf));
}
exports["default"] = compose;
});

unwrapExports(datepicker_template);

var datepicker_ranger = createCommonjsModule(function (module, exports) {
"use strict";
exports.__esModule = true;

var date = new Date();
var currDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
function getRange(collection, start, end) {
    var temp = [];
    for (var i = 0; i < collection.length; i++) {
        var date_1 = util.attr(collection[i], "data-date");
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
            var date_2 = util.attr(collection[i], "data-date");
            if (date_2 === start) {
                util.addClass(item, "start-date");
            }
            else if (date_2 === end) {
                util.addClass(item, "end-date");
            }
        }
        else {
            if (item && nextItem) {
                var curr = util.attr(item, "data-date");
                var next = util.attr(nextItem, "data-date");
                if (curr && next) {
                    var start_1 = parse(curr);
                    if (util.diff(start_1, currDate, "days") >= 0) {
                        var hasItem = inDates(next) && inDates(curr) || inDates(curr) && !inDates(next);
                        if (hasItem) {
                            if (temp.length < 2) {
                                util.addClass(item, "start-date");
                                util.addClass(nextItem, "end-date");
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
function ranged(data, collector, remove, clearRange) {
    if (remove) {
        var collection = collector.querySelectorAll(".in-range");
        for (var i = 0; i < collection.length; i++) {
            util.removeClass(collection[i], "in-range");
        }
    }
    else {
        for (var i = 0; i < data.length; i++) {
            var selector = util.attrSelector("data-date", data[i]);
            var element = collector.querySelector(selector);
            if (!util.hasClass(element, "active")) {
                util.addClass(element, "in-range");
            }
        }
    }
    if (clearRange) {
        return [];
    }
}
exports.ranged = ranged;
function setInitRange(options) {
    // console.log(options)
    var collector = options.collector, collection = options.collection, data = options.data, isDouble = options.isDouble, parse = options.parse, format = options.format, inDates = options.inDates, isInit = options.isInit;
    var dates = [];
    if (!isDouble) {
        dates = data;
    }
    else {
        if (data.length >= 2) {
            var start_2 = data[0];
            var end_1 = data[data.length - 1];
            //开始日期不能为无效日期
            if (!inDates(start_2)) {
                data = [];
            }
            var startDate_1 = parse(start_2);
            var endDate_1 = parse(end_1);
            var year = startDate_1.getFullYear();
            var month = startDate_1.getMonth();
            var date_3 = startDate_1.getDate();
            var inValidDates = [];
            var gap = util.diff(endDate_1, startDate_1, "days") + 1;
            for (var i = 0; i < gap; i++) {
                var d = new Date(year, month, date_3 + i);
                var formatted = format(d).value;
                if (!inDates(formatted)) {
                    inValidDates.push(formatted);
                }
            }
            // 前提 无效日期可以作为endDate
            // 但不能做为startDate
            // 即选中的日期中只能包含[一个]无效日期
            // 例如 选中的日期为 ["2017-12-01","2017-12-06"]
            // 2017-12-04 为有效日期，2017-12-05为无效日期,2017-12-16为无效日期
            // 那么此时无效日期有两个，故此时会被重置
            if (inValidDates.length >= 2) {
                data = [];
            }
        }
        if (data.length > 0 && isInit || !isInit) {
            dates = setStartAndEnd(collection, inDates, data, parse);
        }
        var start = dates[0];
        var end = dates[dates.length - 1];
        var startDate = parse(start);
        var endDate = parse(end);
        var range = getRange(collection, start, end);
        if (range.length > 0) {
            ranged(range, collector, false);
        }
    }
    //设置激活状态
    for (var i = 0; i < dates.length; i++) {
        var selector = util.attrSelector("data-date", dates[i]);
        var element = collector.querySelector(selector);
        util.addClass(element, "active");
    }
    return dates;
}
exports.setInitRange = setInitRange;
});

unwrapExports(datepicker_ranger);

var datepicker_init = createCommonjsModule(function (module, exports) {
"use strict";
exports.__esModule = true;



/***
 * 月份切换
 * @param size 切换月份数量
 * @param language 语言包
 * ***/
function monthSwitch(size, language) {
    var curr = {
        year: this.date.getFullYear(),
        month: this.date.getMonth(),
        date: this.date.getDate()
    };
    var month = curr.month + size;
    //每次切换两个月份
    if (this.multiViews) {
        month += size > 0 ? 1 : -1;
    }
    if (this.defaultDates.length > 0) {
        this.selected = this.defaultDates;
    }
    this.date = new Date(curr.year, month, curr.date);
    this.createDatePicker(false);
    this.pickDate();
    this.dataRenderer(this.data);
}
exports.monthSwitch = monthSwitch;
/**
 * 生成日历
 *
 * **/
function createDatePicker(isInit) {
    this.element.innerHTML = datepicker_template["default"]({
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
    this.bindMonthSwitch(this.language);
    this.selected = this.currentRange(this.isInitRange);
    var updateEventData = {
        type: 'init',
        value: this.selected
    };
    //初始化的时候，需要获取初始化的日期
    if (isInit) {
        this.update(updateEventData);
    }
}
exports.createDatePicker = createDatePicker;
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
    return datepicker_ranger.setInitRange(rangeOption);
}
exports.currentRange = currentRange;
function bindMonthSwitch(lang) {
    var _this = this;
    var startTime = new Date(this.startDate).getTime();
    var currTime = new Date(this.date).getTime();
    //日期切换
    var prev = this.element.querySelector(".calendar-action-prev");
    var next = this.element.querySelector(".calendar-action-next");
    if (prev && next) {
        if (this.infiniteMode) {
            next.addEventListener("click", function () {
                _this.monthSwitch(1);
            });
            prev.addEventListener("click", function () {
                _this.monthSwitch(-1);
            });
        }
        else {
            var gap = util.diff(this.date, this.endDate);
            if (gap >= 2) {
                next.addEventListener("click", function () {
                    _this.monthSwitch(1);
                    util.removeClass(prev, "disabled");
                    util.removeClass(prev, "calendar-action-disabled");
                });
            }
            else {
                util.addClass(next, "disabled");
                util.addClass(next, "calendar-action-disabled");
            }
            if (currTime >= startTime) {
                prev.addEventListener("click", function () {
                    _this.monthSwitch(-1);
                    util.removeClass(next, "disabled");
                    util.removeClass(next, "calendar-action-disabled");
                });
            }
            else {
                util.addClass(prev, "disabled");
                util.addClass(prev, "calendar-action-disabled");
            }
        }
    }
}
exports.bindMonthSwitch = bindMonthSwitch;
function init(option, renderer) {
    var this$1 = this;

    var _this = this;
    if (option.initWithSelected) {
        this.initWithSelected = option.initWithSelected;
    }
    if (option.doubleSelect) {
        this.double = option.doubleSelect;
    }
    if (option.format) {
        this.dateFormat = option.format || "YYYY-MM-DD";
    }
    if (option.multiViews && (!option.flatView && !option.singleView)) {
        this.multiViews = true;
    }
    else if (option.flatView && (!option.singleView && !option.multiViews)) {
        this.flatView = true;
    }
    else if (option.singleView && (!option.multiViews && !option.flatView)) {
        this.singleView = true;
    }
    //开始日期
    this.startDate = util.isDate(option.from) ? option.from : new Date();
    this.date = this.startDate;
    //结束日期
    this.endDate = util.isDate(option.to) ? option.to : new Date(this.date.getFullYear(), this.date.getMonth() + 6, this.date.getDate());
    //選擇日期區間最大限制
    this.limit = this.double ? util.isNumber(option.limit) ? option.limit : 1 : 1;
    if (this.flatView) {
        var year = this.endDate.getFullYear();
        var month = this.endDate.getMonth();
        var date = this.endDate.getDate();
        // this.endDate = new Date(year, month + 1, date)
    }
    // console.log(this.flatView)
    if (option.zeroPadding) {
        this.zeroPadding = option.zeroPadding;
    }
    if (option.infiniteMode) {
        this.infiniteMode = option.infiniteMode;
    }
    if (!renderer.dates || renderer.dates && renderer.dates.length <= 0) {
        var currDate = new Date();
        var gap = util.diff(this.endDate, currDate, "days");
        var year = currDate.getFullYear();
        var month = currDate.getMonth();
        var date = currDate.getDate();
        var dates = [];
        for (var i = 0; i < gap; i++) {
            var item = new Date(year, month, date + i);
            var formatted = this$1.format(item).value;
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
    this.language = util.setLanguage(util.getLanguage(option.language, option.defaultLanguage));
    this.element = util.parseEl(option.el);
    if (!this.element) {
        console.error("[Calendar Warn] invalid selector,current selector " + this.element);
        return false;
    }
    var next = util.nextTick(function () {
        if (_this.defaultDates.length > 0) {
            var date = _this.defaultDates[0];
            _this.date = _this.parse(date);
        }
        _this.createDatePicker(true);
        _this.pickDate();
        util.clearNextTick(next);
    });
}
exports.init = init;
});

unwrapExports(datepicker_init);

var datepicer_picker = createCommonjsModule(function (module, exports) {
"use strict";
exports.__esModule = true;


function default_1(element, selected, isDouble, source, parse, format, limit, inDates, update) {
    var collection = element.querySelectorAll(".calendar-date-cell");
    var _loop_1 = function (i) {
        var item = collection[i];
        item.addEventListener("click", function (e) {
            //缓存已选的日期
            var cache = selected;
            var date = util.attr(item, "data-date");
            var index = selected.indexOf(date);
            //不可选的日期
            //初始化时，selected的length为0，点击不可选日期
            if (!date ||
                selected.length <= 0 && !inDates(date)) {
                return false;
            }
            //重复选择
            //如选择了 2018-02-04 ~ 2018-02-06
            //但是用户实际想选择的是 2018-02-04~2018-02-05，
            //此时 用户再次选择 2018-02-04，其他日期将被删除
            if (index >= 0) {
                selected = [selected[0]];
            }
            //双选，但选择的日期数量大于2，或单选
            if (isDouble && selected.length >= 2 || !isDouble) {
                selected = [];
            }
            selected.push(date);
            //选择日期
            if (isDouble) {
                var handled = doubleSelectHandler(date, selected, cache, limit, source, format, parse);
                selected = handled.selected;
                var range = handled.range;
                var allValid = handled.allValid;
                var start = selected[0];
                var end = selected[selected.length - 1];
                var diff_1 = gap(parse(start), parse(end));
                var isOutOfLimit = diff_1 > limit;
                var isValid = doublePick(element, start, end, diff_1, isOutOfLimit, allValid);
                if (isValid) {
                    datepicker_ranger.ranged([], element, true);
                }
                if (allValid && isValid) {
                    datepicker_ranger.ranged(range, element, false);
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
            update({
                type: 'selected',
                value: selected
            });
        });
    };
    for (var i = 0; i < collection.length; i++) {
        _loop_1(i);
    }
}
exports["default"] = default_1;
function singlePick(selector, collector, shouldChange) {
    if (shouldChange) {
        var actives = collector.querySelectorAll(".active");
        for (var i = 0; i < actives.length; i++) {
            util.removeClass(actives[i], "active");
        }
        if (!util.hasClass(selector, "disabled")) {
            util.addClass(selector, "active");
        }
    }
}
function doublePick(collector, start, end, diff, outOfLimit, valid) {
    //缓存已选的开始日期和结束日期
    var cache = {
        start: collector.querySelector(".start-date"),
        end: collector.querySelector(".end-date")
    };
    var current = {
        start: collector.querySelector(util.attrSelector("data-date", start)),
        end: collector.querySelector(util.attrSelector("data-date", end))
    };
    //选择了开始日期，尚未选择结束日期
    if (diff === 0) {
        if (!util.hasClass(current.start, "disabled")) {
            util.removeClass(cache.start, "start-date");
            util.removeClass(cache.start, "active");
            util.removeClass(cache.end, "end-date");
            util.removeClass(cache.end, "active");
            util.addClass(current.start, "active");
            util.addClass(current.start, "start-date");
            return true;
        }
        else {
            return false;
        }
    }
    else {
        util.addClass(current.end, "active");
        if (diff > 0) {
            if (outOfLimit) {
                util.addClass(current.end, "start-date");
                util.removeClass(cache.start, "start-date");
                util.removeClass(cache.start, "active");
            }
            else {
                if (valid) {
                    util.addClass(current.end, "end-date");
                }
                else {
                    util.removeClass(current.start, "active");
                    util.removeClass(current.start, "start-date");
                    util.addClass(current.end, "start-date");
                }
            }
        }
        else if (diff < 0) {
            util.removeClass(current.start, "active");
            util.removeClass(current.start, "start-date");
            util.addClass(current.end, "start-date");
        }
    }
    return true;
}
function gap(d1, d2) {
    var value = util.diff(d1, d2, "days");
    return value === 0 ? 0 : value * -1;
}
function doubleSelectHandler(date, selected, cache, limit, source, format, parse) {
    function inDates(item) {
        return util.inArray(source, item);
    }
    var range = [];
    var inRange = [];
    //获取已选的开始日期
    var start = selected[0];
    //获取已选的结束日期
    //结束日期和开始日期有可能重合，
    //此时为只选了开始日期，尚未选择结束日期
    var end = selected[selected.length - 1];
    //转换成日期对象
    var startDate = parse(start), endDate = parse(end);
    //对比开始日期和结束日期
    var diff = gap(startDate, endDate);
    var length = selected.length;
    //已有开始日期和结束日期
    //重新选择开始日期
    if (length >= 2) {
        //同一日
        if (diff <= 0) {
            if (inDates(date)) {
                selected.shift();
            }
            else {
                selected = [selected[0]];
            }
        }
        else {
            if (inDates(end)) {
                //得到选择范围
                var year = startDate.getFullYear(), month = startDate.getMonth(), date_1 = startDate.getDate();
                for (var i = 1; i < diff; i++) {
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
        //开始日期为当前点击的元素
        var start_1 = selected[selected.length - 1];
        //如果在data选项里有当前选择的日期
        //则选择的日期为当前当前点击的元素
        if (inDates(start_1)) {
            selected = [start_1];
        }
        else {
            //如果选择的日期不在data里，则读取缓存的数据
            selected = cache;
        }
    }
    else {
        selected = cache;
    }
    //重合
    var allValid = range.length === inRange.length;
    if (!allValid) {
        selected = [selected[selected.length - 1]];
    }
    //选完开始日期和结束日期
    if (selected.length === 2) {
        var lastValidDate = null;
        var end_1 = selected[selected.length - 1];
        var endDate_1 = parse(end_1);
        var startDate_1 = parse(selected[0]);
        //计算开始日期和结束日期之间的间隔，
        // 得到日期范围
        var diff_2 = gap(endDate_1, startDate_1) * -1;
        if (diff_2 > 0) {
            var year = startDate_1.getFullYear(), month = startDate_1.getMonth(), date_2 = startDate_1.getDate();
            range = [];
            inRange = [];
            //第一天为有效日期，最后一天为无效日期
            //判断最后一个有效日期与最后一天的区间
            //如果区间大于1或小于-1，则为无效区间，
            for (var i = 0; i < diff_2; i++) {
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
        //超出限制范围
        //取最后一天
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
    return {
        selected: selected,
        allValid: allValid,
        range: range
    };
}
});

unwrapExports(datepicer_picker);

var datepicker_formatter = createCommonjsModule(function (module, exports) {
"use strict";
exports.__esModule = true;

function parse(string) {
    if (!string)
        { return new Date(); }
    if (string instanceof Date)
        { return string; }
    var date = new Date(string);
    if (!date.getTime())
        { return null; }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function format(date, format, zeroPadding) {
    if (zeroPadding === void 0) { zeroPadding = true; }
    var shouldPadStart = true;
    if (!zeroPadding) {
        shouldPadStart = false;
    }
    var parts = {
        DD: shouldPadStart ? util.padding(date.getDate()) : date.getDate(),
        dd: shouldPadStart ? util.padding(date.getDate()) : date.getDate(),
        MM: shouldPadStart ? util.padding(date.getMonth() + 1) : date.getMonth() + 1,
        mm: shouldPadStart ? util.padding(date.getMonth() + 1) : date.getMonth() + 1,
        YYYY: date.getFullYear(),
        D: date.getDate(),
        d: date.getDate(),
        M: date.getMonth() + 1,
        m: date.getMonth() + 1
    };
    return {
        origin: date,
        date: parts["DD"],
        month: parts["MM"],
        year: parts["YYYY"],
        day: date.getDay(),
        value: format.replace(/(?:\b|%)([dDMyYHhaAmsz]+|ap|AP)(?:\b|%)/g, function (match, $1) {
            return parts[$1] === undefined ? $1 : parts[$1];
        })
    };
}
exports.format = format;
function parseFormatted(strDate, format) {
    //能直接解析成日期对象的，直接返回日期对象
    //如 YYYY/MM/DD YYYY-MM-DD
    var ret = parse(strDate);
    if (ret)
        { return ret; }
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
exports.parseFormatted = parseFormatted;
});

unwrapExports(datepicker_formatter);

var lib = createCommonjsModule(function (module, exports) {
"use strict";
exports.__esModule = true;





var DatePicker = /** @class */ (function () {
    function DatePicker(option) {
        var _this = this;
        this.init = datepicker_init.init;
        this.date = new Date();
        this.limit = 1;
        this.double = false;
        this.element = null;
        this.startDate = new Date();
        this.endDate = null;
        this.selected = [];
        this.flatView = false;
        this.multiViews = false;
        this.singleView = false;
        this.monthSwitch = datepicker_init.monthSwitch;
        this.createDatePicker = datepicker_init.createDatePicker;
        this.zeroPadding = true;
        this.initWithSelected = false;
        this.bindData = false;
        this.infiniteMode = false;
        this.currentRange = datepicker_init.currentRange;
        this.isInitRange = false;
        this.language = {};
        this.pickDate = function () { return datepicer_picker["default"](_this.element, _this.selected, _this.double, _this.dates, _this.parse, _this.format, _this.limit, _this.inDates, _this.update); };
        this.format = function (date, zeroPadding) { return datepicker_formatter.format(date, _this.dateFormat, _this.zeroPadding); };
        this.parse = function (string) { return datepicker_formatter.parseFormatted(string, _this.dateFormat); };
        this.inDates = function (date) { return _this.dates.indexOf(date) >= 0; };
        this.update = function (result) {
            if (result.type === 'selected') {
                _this.dateRanges(result.value, false);
            }
            datepicker_observer["default"].$emit("update", result);
        };
        this.dataRenderer = function (data) {
            if (Object.keys(data).length <= 0) {
                datepicker_observer["default"].$remove("data");
            }
            else {
                var next_1 = util.nextTick(function () {
                    datepicker_observer["default"].$emit("data", {
                        data: data,
                        nodeList: _this.element.querySelectorAll(".calendar-cell")
                    });
                    util.clearNextTick(next_1);
                });
            }
        };
        this.dateRanges = function (dates, isInit) {
            if (!util.isArray(dates)) {
                dates = [];
                console.error("[dateRanges error] no dates provided", dates);
                return;
            }
            _this.isInitRange = !(!isInit);
            var handler = function () {
                var datesList = [];
                var start = '', end = '';
                if (_this.double) {
                    if (dates.length > 2) {
                        dates = dates.slice(0, 2);
                    }
                    start = dates[0];
                    end = dates[dates.length - 1];
                    var startDate = _this.parse(start);
                    var endDate = _this.parse(end);
                    var diffed = util.diff(startDate, endDate, "days") * -1;
                    if (diffed < 0
                        || diffed > _this.limit
                        || !_this.inDates(start) && !_this.inDates(end) //开始日期和结束日期均为无效日期
                        || !_this.inDates(start)) {
                        console.error("[dateRanges Warn]Illegal dates,[" + dates + "]");
                        return false;
                    }
                    for (var i = 0; i <= diffed; i++) {
                        var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                        var formatted = _this.format(date).value;
                        if (i < diffed && !_this.inDates(formatted)) {
                            console.error("[dateRanges Warn]Illegal date,[" + formatted + "]");
                            return false;
                        }
                    }
                    datesList = [start, end];
                }
                else {
                    datesList = [dates[dates.length - 1]];
                }
                _this.defaultDates = datesList;
            };
            if (!_this.bindData) {
                handler();
            }
            else {
                var next_2 = util.nextTick(function () {
                    handler();
                    util.clearNextTick(next_2);
                });
            }
        };
        this.disableRange = function () {
        };
        this.bindMonthSwitch = datepicker_init.bindMonthSwitch;
        this.defaultDates = [];
        this.bindData = option.bindData;
        if (!option.bindData) {
            this.init(option, {});
        }
        return {
            on: datepicker_observer["default"].$on,
            data: function (cb) { return _this._bindDataInit(option, cb); },
            diff: function (d1, d2) { return util.diff(d1, d2, "days"); },
            parse: this.parse,
            format: this.format,
            dateRanges: this.dateRanges,
            setDefaultDates: this.dateRanges,
            disableRange: this.disableRange
        };
    }
    DatePicker.prototype._bindDataInit = function (option, cb) {
        var _this = this;
        function noData(data) {
            return !util.isObject(data)
                || (Object.keys(data.data).length <= 0
                    || data.dates.length <= 0);
        }
        if (option.bindData) {
            var params = {
                dates: [],
                data: {},
                from: Date,
                to: Date
            };
            var cbData = cb && cb(params);
            var result = cbData ? cbData : params;
            if (util.isDate(params.from))
                { option.from = params.from; }
            if (util.isDate(params.to))
                { option.to = params.to; }
            var config = {
                data: result.data,
                dates: result.dates.sort(function (a, b) { return _this.parse(a) - _this.parse(b); })
            };
            this.init(option, config);
            if (!noData(result)) {
                this.dataRenderer(result.data);
            }
        }
    };
    
    return DatePicker;
}());
exports["default"] = DatePicker;
});

var index = unwrapExports(lib);

return index;

})));
