var Observer = (function () {
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

function diff(start, end, type) {
    if (type === void 0) { type = "month"; }
    if (!start) {
        start = new Date();
    }
    if (!end) {
        end = new Date();
    }
    if (type == "month") {
        return Math.abs((start.getFullYear() * 12 + start.getMonth()) - (end.getFullYear() * 12 + end.getMonth()));
    }
    else if (type === "days") {
        var startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        var endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return Math.round((startTime - endTime)) / (1000 * 60 * 60 * 24);
    }
}
var attrSelector = function (attr, value) { return "[" + attr + "=\"" + value + "\"]"; };
var getDates = function (year, month) {
    var d = new Date(year, month, 1);
    var utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate();
};
var padding = function (n) { return "" + (n > 9 ? n : "0" + n); };
//获取每月的1号的周几
var getFirstDay = function (year, month) {
    return new Date(year, month, 1).getDay();
};

//获取该月的最后一天的星期

//获取该月的最后几天


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

var _toString = function (object) { return Object.prototype.toString.call(object); };

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
        { return; }
    ele.className += (ele.className ? " " : "") + className;
}
function removeClass(ele, className) {
    if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) == -1))
        { return; }
    ele.className = ele.className.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), "");
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
    var template = options.template, multiViews = options.multiViews, flatView = options.flatView, singleView = options.singleView, language = options.language;
    var weekDays = language.week.map(function (day, index) {
        var className = ["calendar-cell", "calendar-day-cell",
            index === 0 ? "calendar-cell-weekday" : index === 6 ? "calendar-cell-weekend" : ""];
        return "<div class=\"" + className.join(" ") + "\">" + day + "</div>";
    }).join("");
    var tpl = template.map(function (item, index) {
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
/**
 * 生成完整日历
 *
 * **/
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
function setRange(data, collector, remove$$1, clearRange) {
    if (remove$$1) {
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
            var gap = diff(endDate_1, startDate_1, "days") + 1;
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
            setRange(range, collector, false);
        }
    }
    //设置激活状态
    for (var i = 0; i < dates.length; i++) {
        var selector = attrSelector("data-date", dates[i]);
        var element = collector.querySelector(selector);
        addClass(element, "active");
    }
    return dates;
}

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
    //能直接解析成日期对象的，直接返回日期对象
    //如 YYYY/MM/DD YYYY-MM-DD
    if (!format) {
        format = 'YYYY-MM-DD';
    }
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
/**
 * 生成日历
 *
 * **/
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
            var gap = diff(this.date, this.endDate);
            if (gap >= 2) {
                next.addEventListener("click", function () {
                    _this.monthSwitch(1);
                    removeClass(prev, "disabled");
                    removeClass(prev, "calendar-action-disabled");
                });
            }
            else {
                addClass(next, "disabled");
                addClass(next, "calendar-action-disabled");
            }
            if (currTime > startTime) {
                prev.addEventListener("click", function () {
                    _this.monthSwitch(-1);
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
    this.startDate = isDate(option.from) ? option.from : new Date();
    this.date = this.startDate;
    //结束日期
    this.endDate = isDate(option.to) ? option.to : new Date(this.date.getFullYear(), this.date.getMonth() + 6, 0);
    //選擇日期區間最大限制
    this.limit = this.double ? isNumber(option.limit) ? option.limit : 1 : 1;
    if (option.zeroPadding) {
        this.zeroPadding = option.zeroPadding;
    }
    if (option.infiniteMode) {
        this.infiniteMode = option.infiniteMode;
    }
    if (!renderer.dates || renderer.dates && renderer.dates.length <= 0) {
        var currDate = new Date();
        var gap = diff(this.endDate, currDate, "days");
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

var handlePickDate = function (options) {
    var element = options.element, selected = options.selected, isDouble = options.isDouble, source = options.source, parse = options.parse, format = options.format, limit = options.limit, inDates = options.inDates, update = options.update, infiniteMode = options.infiniteMode, bindData = options.bindData;
    var collection = element.querySelectorAll(".calendar-date-cell");
    var _loop_1 = function (i) {
        var item = collection[i];
        item.addEventListener("click", function (e) {
            //缓存已选的日期
            var cache = selected;
            var date = attr(item, "data-date");
            var index = selected.indexOf(date);
            //不可选的日期
            //初始化时，selected的length为0，点击不可选日期
            if (!date || (selected.length <= 0 && !inDates(date)) && bindData) {
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
            update({
                type: 'selected',
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
    //缓存已选的开始日期和结束日期
    var cache = {
        start: collector.querySelector(".start-date"),
        end: collector.querySelector(".end-date")
    };
    var current = {
        start: collector.querySelector(attrSelector("data-date", start)),
        end: collector.querySelector(attrSelector("data-date", end))
    };
    //选择了开始日期，尚未选择结束日期
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
    var selected = options.selected, date = options.date, cache = options.cache, limit = options.limit, format = options.format, parse = options.parse, inDates = options.inDates, infiniteMode = options.infiniteMode, bindData = options.bindData;
    var range = [];
    var inRange = [];
    var allValid = false;
    //获取已选的开始日期
    var start = selected[0];
    //获取已选的结束日期
    //结束日期和开始日期有可能重合，
    //此时为只选了开始日期，尚未选择结束日期
    var end = selected[selected.length - 1];
    //转换成日期对象
    var startDate = parse(start), endDate = parse(end);
    if (bindData) {
        //对比开始日期和结束日期
        var diff_2 = gap(startDate, endDate);
        var length_1 = selected.length;
        //已有开始日期和结束日期
        //重新选择开始日期
        if (length_1 >= 2) {
            //同一日
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
                    //得到选择范围
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
        else if (length_1 === 1) {
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
        allValid = range.length === inRange.length;
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
            var diff_3 = gap(endDate_1, startDate_1) * -1;
            if (diff_3 > 0) {
                var year = startDate_1.getFullYear(), month = startDate_1.getMonth(), date_2 = startDate_1.getDate();
                range = [];
                inRange = [];
                //第一天为有效日期，最后一天为无效日期
                //判断最后一个有效日期与最后一天的区间
                //如果区间大于1或小于-1，则为无效区间，
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
    }
    else {
        if (selected.length >= 2 && start === end) {
            selected.pop();
        }
        var diff_4 = gap(startDate, endDate);
        if (diff_4 > 0 && diff_4 < limit) {
            for (var i = 1; i < diff_4; i++) {
                var date_3 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                range.push(format(date_3).value);
            }
            allValid = true;
        }
    }
    return {
        selected: selected,
        allValid: allValid,
        range: range
    };
}

function initWithDataBind(option, cb) {
    var _this = this;
    function noData(data) {
        return !isObject(data)
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
        if (isDate(params.from))
            { option.from = params.from; }
        if (isDate(params.to))
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
}
var DatePicker = /** @class */ (function () {
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
        this.singleView = false;
        this.monthSwitch = monthSwitch;
        this.createDatePicker = createDatePicker;
        this.zeroPadding = false;
        this.initWithSelected = false;
        this.bindData = false;
        this.infiniteMode = false;
        this.currentRange = currentRange;
        this.isInitRange = false;
        this.language = {};
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
        this.format = function (date, zeroPadding) { return format(date, _this.dateFormat, _this.zeroPadding); };
        this.parse = function (string) { return parseFormatted(string, _this.dateFormat); };
        this.inDates = function (date) { return _this.dates.indexOf(date) >= 0; };
        this.update = function (result) {
            if (result.type === 'selected') {
                _this.dateRanges(result.value, false);
            }
            Observer.$emit("update", result);
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
        this.dateRanges = function (dates, isInit) {
            if (!isArray(dates)) {
                dates = [];
                warn("dateRanges", "no dates provided," + dates);
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
                    var startDate = isDate(start) ? start : _this.parse(start);
                    var endDate = isDate(end) ? end : _this.parse(end);
                    var diffed = diff(startDate, endDate, "days") * -1;
                    if (_this.bindData) {
                        if (diffed < 0
                            || diffed > _this.limit
                            || !_this.inDates(_this.format(startDate).value) && !_this.inDates(_this.format(endDate).value) //开始日期和结束日期均为无效日期
                            || !_this.inDates(_this.format(startDate).value)) {
                            warn("dateRanges", "Illegal dates,[" + dates + "]");
                            return false;
                        }
                    }
                    for (var i = 0; i <= diffed; i++) {
                        var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                        var formatted = _this.format(date).value;
                        if (i < diffed && !_this.inDates(formatted)) {
                            warn("dateRanges", "Illegal date,{dates:[" + formatted + "]}");
                            return false;
                        }
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
                handler();
            }
            else {
                var next_2 = nextTick(function () {
                    handler();
                    clearNextTick(next_2);
                });
            }
        };
        this.bindMonthSwitch = bindMonthSwitch;
        this.initWithDataBind = initWithDataBind;
        this.utils = {
            format: function (date, format$$1) { return (date && format$$1) ? format(date, format$$1).value : null; },
            parse: function (string, format$$1) { return (string && format$$1) ? parseFormatted(string, format$$1) : new Date(); },
            diff: function (d1, d2) { return diff(d1, d2, "days"); }
        };
        if (!option) {
            return {
                format: function (date, format$$1) { return (date && format$$1) ? format(date, format$$1).value : null; },
                parse: function (string, format$$1) { return (string && format$$1) ? parseFormatted(string, format$$1) : new Date(); },
                diff: function (d1, d2) { return diff(d1, d2, "days"); }
            };
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
            setDefaultDates: this.dateRanges
        };
    }
    return DatePicker;
}());

export default DatePicker;
