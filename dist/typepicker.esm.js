/*
*  TypePicker v4.1.0
*  Fi2zz / wenjingbiao@outlook.com
*  https://github.com/Fi2zz/datepicker
*  (c) 2017-2018, wenjingbiao@outlook.com
*  MIT License
*/
const __assign = Object.assign || function (target) {
    for (var source, i = 1; i < arguments.length; i++) {
        source = arguments[i];
        for (var prop in source) {
            if (Object.prototype.hasOwnProperty.call(source, prop)) {
                target[prop] = source[prop];
            }
        }
    }
    return target;
};

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
var padding = function (n) { return "" + (n > 9 ? n : "0" + n); };

function isDef(v) {
    var isUndef = function (v) { return v === undefined || v === null; };
    return !isUndef(v);
}
function isArray(object) {
    return Object.prototype.toString.call(object) === "[object Array]";
}
function isDate(object) {
    return Object.prototype.toString.call(object) === "[object Date]";
}
function $(selector, selector$2) {
    var selectAll = function (who, selector) {
        var nodes = who.querySelectorAll(selector);
        var ArrayNodes = Array.prototype.slice.call(nodes);
        if (ArrayNodes.length <= 0) {
            return null;
        }
        else if (ArrayNodes.length === 1) {
            return nodes[0];
        }
        else {
            return nodes;
        }
    };
    if (typeof selector === "string") {
        if (selector.indexOf("#") === 0) {
            selector = selector.substr(1);
            return document.getElementById(selector);
        }
        else if (selector.indexOf(".") == 0) {
            return selectAll(document, selector);
        }
    }
    else {
        return selectAll(selector, selector$2);
    }
    return null;
}
var listHead = function (list) { return list[0]; };
var listTail = function (list) { return list[list.length - 1]; };
var dedupList = function (list, condition) {
    var map = {};
    var result = [];
    if (list.length <= 0) {
        return [];
    }
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var item = list_1[_i];
        if (!condition) {
            map[item] = item;
        }
        else {
            map[condition] = item;
        }
    }
    for (var key in map) {
        var item = map[key];
        result.push(item);
    }
    return result;
};
function byCondition(condition, when) {
    return function (value) {
        return function (next) {
            if (!isDef(when)) {
                when = true;
            }
            var result;
            if (typeof condition === "function") {
                result = condition(value) === when;
            }
            else {
                result = condition === when;
            }
            if (next && typeof next === "function" && result) {
                return next(value);
            }
            return result;
        };
    };
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
        var startTime = (new Date(start.getFullYear(), start.getMonth(), start.getDate()));
        var endTime = (new Date(end.getFullYear(), end.getMonth(), end.getDate()));
        var calcu = Math.ceil(startTime - endTime) / (1000 * 60 * 60 * 24);
        result = isAbsolute ? Math.abs(calcu) : calcu;
    }
    return result;
}
function getViews(view) {
    if (!view) {
        return 1;
    }
    var views = parseInt(view, 10);
    if (isNaN(views)) {
        if (view !== "auto") {
            return 1;
        }
        else {
            return "auto";
        }
    }
    else {
        if (view > 2 || views <= 0) {
            return 1;
        }
        else {
            return views;
        }
    }
}
function cellElementClassName(type) {
    return function (index) {
        var other = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            other[_i - 1] = arguments[_i];
        }
        var names = ["calendar-cell"];
        names.push("calendar-" + type + "-cell");
        if (index === 0) {
            names.push("calendar-cell-weekday");
        }
        else if (index === 6) {
            names.push("calendar-cell-weekend");
        }
        if (other) {
            names.push.apply(names, other);
        }
        return names.join(" ");
    };
}
function elementClassName(views) {
    var classes = ["calendar"];
    if (views === 1) {
        classes.push("calendar-single-view");
    }
    else if (views === 2) {
        classes.push("calendar-double-views");
    }
    else {
        classes.push("calendar-flat-view");
    }
    return classes.join("  ");
}
function parseEl(el) {
    if (!el) {
        return null;
    }
    return typeof el === "string" ? document.querySelector(el) : el;
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
    return format.replace(/(?:\b|%)([dDMyY]+)(?:\b|%)/g, function ($1) { return (parts[$1] === undefined ? $1 : parts[$1]); });
}
function parse(strDate, format) {
    if (isDate(strDate)) {
        return strDate;
    }
    function parse(string) {
        if (!string)
            return new Date();
        if (string instanceof Date)
            return string;
        var split = string.split(/\W/).map(function (item) { return parseInt(item); });
        var date = new Date(split.join(" "));
        if (!date.getTime())
            return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    if (!format) {
        format = "YYYY-MM-DD";
    }
    var formatRegExpTester = createDateFormatValidator(format);
    if (!formatRegExpTester.test(strDate)) {
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
function createDateFormatValidator(formate) {
    var sepreator = formate.split(/\w/).filter(function (item) { return !!item; });
    var result = formate.split(/\W/).map(function (string, index) {
        var length = string.length;
        if (index === 0) {
            return "\\d{" + length + "}";
        }
        else if (index === 1) {
            if (length === 1) {
                return "(?:[1-9]?[0-9])";
            }
            else if (length === 2) {
                return "([0-9][0-2])";
            }
        }
        else if (index === 2) {
            if (length === 1) {
                return "(?:[1-9]?[0-9])";
            }
            else if (length === 2) {
                return "[0-9][1-9]";
            }
        }
    });
    var regexpString = result.join("\\" + sepreator.pop());
    return new RegExp(regexpString);
}
var setDate = function (date, day) {
    return new Date(date.getFullYear(), date.getMonth(), day >= 0 ? day : date.getDate());
};
function getDates(year, month) {
    var d = new Date(year, month, 1);
    var utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate();
}
function tag(_a) {
    var tag = _a.tag, _b = _a.props, props = _b === void 0 ? {} : _b, _c = _a.render, render = _c === void 0 ? true : _c;
    if (!tag || !render) {
        return "";
    }
    var children = "";
    var attributes = [];
    for (var key in props) {
        var value = props[key];
        if (key === "className") {
            key = "class";
        }
        if (key !== "children") {
            if (value) {
                attributes.push(key + "=\"" + value + "\"");
            }
        }
        else {
            if (children === false || children === undefined || children === null) {
                children = "";
            }
            else if (Array.isArray(value)) {
                children = value.filter(isDef).join("");
            }
            else {
                children = value;
            }
        }
    }
    var attrs = attributes.join("");
    return "<" + tag + " " + attrs + ">" + children + "</" + tag + ">";
}
function join(list, split) {
    if (!split) {
        split = "";
    }
    return list.join(split);
}
function createDate(_a) {
    var date = _a.date, size = _a.size, dateFormat = _a.dateFormat, _b = _a.direction, direction = _b === void 0 ? 1 : _b, _c = _a.position, position = _c === void 0 ? "date" : _c, index = _a.index;
    var dir = function (v, size, dir) {
        return dir > 0 ? v + size : v - size;
    };
    var result = [];
    for (var i = 0; i <= size; i++) {
        var currYear = date.getFullYear();
        var currMonth = date.getMonth();
        var currDate = date.getDate();
        if (position === "year") {
            currYear = dir(index ? index : currYear, i, direction);
        }
        else if (position === "month") {
            currMonth = dir(index ? index : currMonth, i, direction);
        }
        else {
            currDate = dir(index ? index : currDate, i, direction);
        }
        result.push(new Date(currYear, currMonth, currDate));
    }
    return result;
}
function createFormatDate(dates) {
    return function (dateFormat) {
        var fmt = function (dateFormat) { return function (date) { return format(date, dateFormat); }; };
        if (isArray(dates)) {
            return dates.map(fmt(dateFormat));
        }
        else {
            return [fmt(dateFormat)(dates)];
        }
    };
}
function tagClassName(index, isEnd, isStart) {
    var name = "";
    if (index >= 0) {
        name = "active";
    }
    if (isStart) {
        name = name + " start-date";
    }
    else if (isEnd) {
        name = name + " end-date";
    }
    else if (index > 0) {
        name = "in-range";
    }
    return name;
}
function defaultI18n() {
    return {
        title: "YYYY年MM月",
        week: ["日", "一", "二", "三", "四", "五", "六"],
        months: [
            "01",
            "02",
            "03",
            "04",
            "05",
            "06",
            "07",
            "08",
            "09",
            "10",
            "11",
            "12"
        ]
    };
}
function tagData(value, item, index, isEnd, isStart, isDisabled) {
    var day = "";
    var date = "";
    var className = "empty disabled";
    if (item) {
        day = item.getDay();
        date = item.getDate();
        className = tagClassName(index, isEnd, isStart);
        if (isDisabled) {
            className = "disabled " + className.trim();
        }
    }
    return {
        date: date,
        day: day,
        className: className,
        value: value
    };
}
function findDisableInQueue(list, dateFormat, inDisable) {
    if (list.length <= 0) {
        return [];
    }
    var head = listHead(list);
    var tail = listTail(list);
    var date = parse(head, dateFormat);
    var end = parse(tail, dateFormat);
    var size = diff(end, date, "days");
    var disables = createFormatDate(createDate({ date: date, size: size }))(dateFormat).filter(inDisable);
    if (disables.length === 1) {
        var disable = disables[0];
        if (tail === disable) {
            return false;
        }
        else {
            return true;
        }
    }
    else if (disables.length > 1) {
        return true;
    }
    else {
        return false;
    }
}
function checkPickableDate(_a) {
    var selection = _a.selection, date = _a.date, inDisable = _a.inDisable, dateFormat = _a.dateFormat, queue = _a.queue, limit = _a.limit;
    if (!date) {
        return false;
    }
    if (inDisable(date)) {
        if (selection === 2) {
            var gap = diff(parse(date, dateFormat), parse(listTail(queue), dateFormat), "days");
            if (queue.length <= 0 || gap <= 0 || queue.length >= selection) {
                return false;
            }
            if (queue.length === 1) {
                var item = queue[0];
                var d = parse(item, dateFormat);
                var now = parse(date, dateFormat);
                var gap_1 = diff(now, d, "days");
                if (gap_1 > limit) {
                    return false;
                }
            }
        }
        else {
            return false;
        }
    }
    return true;
}
var formatParse = function (dateFormat) { return function (date) {
    return format(parse(date, dateFormat), dateFormat);
}; };

var monthSwitcher = function (date, start, end) { return function (size) { return function (next) {
    var now = new Date(date.getFullYear(), date.getMonth() + size, date.getDate());
    var endGap = end ? diff(end, now) : 1;
    var startGap = end ? diff(now, start) : 2;
    var reachStart = startGap < 1 && endGap >= 0;
    var reachEnd = startGap > 1 && endGap <= 1;
    if (!start || !end) {
        reachEnd = false;
        reachStart = false;
    }
    next({
        reachEnd: reachEnd,
        reachStart: reachStart,
        date: now
    });
}; }; };
var between = function (start, end, dateFormat) {
    start = parse(start, dateFormat);
    end = parse(end, dateFormat);
    if (!start || !end) {
        return [];
    }
    var dates = createDate({
        date: start,
        size: diff(end, start, "days", true),
        direction: end > start ? 1 : -1
    });
    return dateFormat ? createFormatDate(dates)(dateFormat) : dates;
};
var TemplateData = (function () {
    function TemplateData(_a) {
        var date = _a.date, size = _a.size, queue = _a.queue, dateFormat = _a.dateFormat, withRange = _a.withRange, disableDays = _a.disableDays;
        var mapMonths = TemplateData.mapMonths, mapItem = TemplateData.mapItem;
        var itemMap = mapItem(queue, withRange, dateFormat, disableDays);
        return mapMonths(date, size).map(itemMap);
    }
    TemplateData.mapRangeFromQueue = function (queue, dateFormat) {
        if (queue.length <= 0) {
            return [];
        }
        var start = parse(queue[0], dateFormat);
        var end = parse(queue[queue.length - 1], dateFormat);
        return createFormatDate(createDate({
            date: start,
            size: diff(end, start, "days")
        }))(dateFormat);
    };
    TemplateData.mapMonths = function (date, size) {
        var template = [];
        for (var i = 0; i <= size; i++) {
            var dat = new Date(date.getFullYear(), date.getMonth() + i, 1);
            var dates = getDates(dat.getFullYear(), dat.getMonth());
            template.push({
                size: dates,
                year: dat.getFullYear(),
                month: dat.getMonth()
            });
        }
        return template;
    };
    TemplateData.mapItem = function (queue, withRange, dateFormat, disableDays) { return function (item) {
        return TemplateData.mapDates(item, TemplateData.mapRangeFromQueue(queue, dateFormat), withRange, dateFormat, disableDays);
    }; };
    TemplateData.mapDates = function (_a, range, withRange, dateFormat, disableDays) {
        var year = _a.year, month = _a.month, size = _a.size;
        var dates = [];
        var firstDateOfMonth = new Date(year, month, 1);
        for (var i = 0; i < firstDateOfMonth.getDay(); i++) {
            dates.push(__assign({}, tagData(), { disabled: true }));
        }
        for (var i = 0; i < size; i++) {
            var date = new Date(year, month, i + 1);
            var index = range.indexOf(format(date, dateFormat));
            var isEnd = withRange && index === range.length - 1;
            var isStart = withRange && index === 0;
            if (range.length <= 0) {
                isEnd = false;
                isStart = false;
            }
            var disabled = disableDays.indexOf(date.getDay()) >= 0;
            var data = tagData(format(date, dateFormat), date, index, isEnd, isStart, disabled);
            dates.push(__assign({}, data, { disabled: disabled }));
        }
        return { year: year, month: month, dates: dates };
    };
    return TemplateData;
}());
function formatMonthHeading(format, months) {
    return function (_a) {
        var year = _a.year, month = _a.month;
        return format
            .toLowerCase()
            .replace(/y{1,}/g, padding(year))
            .replace(/m{1,}/g, months[month]);
    };
}

function createActionView(reachStart, reachEnd) {
    var node = function (type, disabled) {
        var className = ["calendar-action", "calendar-action-" + type];
        if (disabled) {
            className.push("disabled", "calendar-action-disabled");
        }
        return tag({
            tag: "a",
            props: {
                className: className.join(" "),
                href: "javascripts:;",
                children: tag({ tag: "span", props: { children: type } })
            }
        });
    };
    return [node("prev", reachStart), node("next", reachEnd)];
}
function createDateTag(data) {
    var dateTag = tag({
        tag: "div",
        props: {
            className: "date",
            children: data.date
        }
    });
    var nodeChildren = [dateTag];
    if (data.value) {
        var placeholderTag = tag({
            tag: "div",
            props: {
                className: "placeholder"
            }
        });
        nodeChildren.push(placeholderTag);
    }
    return tag({
        tag: "div",
        props: {
            className: "" + cellElementClassName("date")(data.day, data.className),
            "data-day": data.day,
            "data-date": data.value ? data.value : "",
            children: nodeChildren
        }
    });
}
var mapHeadView = function (year, month, title) { return ({
    year: year,
    month: month,
    title: title({ year: year, month: month })
}); };
var headView = function (_a) {
    var year = _a.year, month = _a.month, title = _a.title;
    return tag({
        tag: "div",
        props: {
            className: "calendar-head",
            children: [
                tag({
                    tag: "div",
                    props: {
                        className: "calendar-title",
                        children: tag({
                            tag: "span",
                            props: {
                                "data-year": year,
                                "data-month": month,
                                children: title
                            }
                        })
                    }
                })
            ]
        }
    });
};
var mainView = function (children) {
    return tag({
        tag: "div",
        props: {
            className: "calendar-item",
            children: children
        }
    });
};
var bodyView = function (dates) {
    return tag({
        tag: "div",
        props: {
            className: "calendar-body",
            children: dates.map(function (item) { return createDateTag(item); })
        }
    });
};
var mapView = function (weekView, title) { return function (item) {
    return mainView([
        headView(mapHeadView(item.year, item.month, title)),
        weekView(),
        bodyView(item.dates)
    ]);
}; };
var createView = function (data, title) { return function (weekView) {
    return data.map(mapView(weekView, title)).filter(isDef);
}; };
var createWeekViewMapper = function (day, index) {
    return tag({
        tag: "div",
        props: {
            className: cellElementClassName("day")(index),
            children: day
        }
    });
};
var createWeekView = function (week) {
    return tag({
        tag: "div",
        props: {
            className: "calendar-day",
            children: week.map(createWeekViewMapper)
        }
    });
};
function template(data, i18n) {
    return function (reachStart, reachEnd, notRenderAction) {
        var createdWeekView = createWeekView(i18n.week);
        var createdView = createView(data, i18n.heading);
        var mainView = createdView(function () { return (notRenderAction ? "" : createdWeekView); });
        var createdActionView = createActionView(reachStart, reachEnd);
        if (notRenderAction) {
            mainView.unshift(createdWeekView);
            createdActionView = [];
        }
        return join(createdActionView.concat(mainView));
    };
}

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
var emitter = function (event) { return function (value) { return Observer.$emit(event, value); }; };
var on = Observer.$on;

var Queue = (function () {
    function Queue(_a) {
        var size = _a.size, limit = _a.limit, dateFormat = _a.dateFormat;
        var _this = this;
        this.size = 1;
        this.limit = 1;
        this.format = "";
        this.enqueue = function (date) { return function (next) {
            var front = _this.front();
            var now = parse(date, _this.format);
            var prev = parse(front, _this.format);
            if (_this.limit) {
                if (prev >= now || diff(now, prev, "days", true) > _this.limit) {
                    _this.empty();
                }
            }
            if (_this.list.indexOf(date) >= 0 && _this.list.length > 1) {
                _this.empty();
            }
            _this.list.push(date);
            _this.reset(next);
        }; };
        this.list = [];
        this.size = size;
        this.limit = limit;
        this.format = dateFormat;
    }
    Queue.prototype.reset = function (next) {
        if (this.list.length > this.size) {
            this.list = [this.list.pop()];
        }
        if (typeof next === "function") {
            setTimeout(function () { return next(); }, 0);
        }
    };
    Queue.prototype.shift = function () {
        this.list.shift();
    };
    Queue.prototype.slice = function (start, end) {
        this.list.slice(start, end);
    };
    Queue.prototype.dequeue = function () {
        this.list.shift();
    };
    Queue.prototype.pop = function () {
        this.list.pop();
    };
    Queue.prototype.empty = function () {
        this.list = [];
    };
    Queue.prototype.front = function () {
        return this.list[0];
    };
    return Queue;
}());

var queue = null;
var TypePicker = (function () {
    function TypePicker(option) {
        var _this = this;
        this.state = {
            selection: 1,
            views: 1,
            date: new Date(),
            startDate: null,
            endDate: null,
            reachEnd: false,
            reachStart: false,
            dateFormat: "YYYY-MM-DD",
            limit: 1,
            disables: [],
            i18n: defaultI18n(),
            disableDays: []
        };
        this.element = null;
        this.on = on;
        this.forceUpdate = function () { return _this.render(); };
        var el = parseEl(option.el);
        if (!option || !el) {
            return;
        }
        var state = __assign({}, this.state);
        byCondition(isDef)(getViews(option.views))(function (views) { return (state.views = views); });
        byCondition(function (v) { return !isNaN(v); })(option.selection)(function (size) { return (state.selection = size); });
        byCondition(isDef)(option.format)(function (format$$1) { return (state.dateFormat = format$$1); });
        byCondition(isDate)(option.startDate)(function (startDate) {
            state.startDate = startDate;
            state.reachStart = true;
            state.date = startDate;
        });
        byCondition(isDate)(option.endDate)(function (endDate) { return (state.endDate = endDate); });
        byCondition(isNaN, false)(option.limit)(function () {
            state.limit = option.limit;
        });
        byCondition(function (view) { return isDef(view) && view === "auto"; })(option.views)(function () {
            if (!state.startDate) {
                state.startDate = new Date();
            }
            if (!state.endDate) {
                var start = state.startDate;
                state.endDate = new Date(start.getFullYear(), start.getMonth() + 6, start.getDate());
            }
        });
        if (state.startDate && state.endDate) {
            var date = state.startDate;
            var firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
            var dates = between(firstDate, date, state.dateFormat);
            dates.pop();
            state.disables = dates;
        }
        this.element = el;
        this.element.className = elementClassName(state.views);
        queue = new Queue({
            size: state.selection,
            limit: state.selection === 2 ? state.limit : false,
            dateFormat: state.dateFormat
        });
        this.setState(state);
    }
    TypePicker.prototype.setState = function (state, next) {
        var _this = this;
        if (typeof state === "function") {
            this.state = state(this.state);
        }
        else {
            this.state = __assign({}, this.state, state);
        }
        var id = setTimeout(function () {
            clearTimeout(id);
            _this.render(next);
        }, 0);
    };
    TypePicker.prototype.render = function (next) {
        var _this = this;
        var _a = this.state, reachStart = _a.reachStart, reachEnd = _a.reachEnd, views = _a.views, startDate = _a.startDate, endDate = _a.endDate, date = _a.date, dateFormat = _a.dateFormat, selection = _a.selection, i18n = _a.i18n, disables = _a.disables, disableDays = _a.disableDays;
        var size = views == 2 ? 1 : views === "auto" ? diff(endDate, startDate) : 0;
        var withRange = selection === 2;
        var data = new TemplateData({
            date: date,
            size: size,
            queue: queue.list,
            dateFormat: dateFormat,
            withRange: withRange,
            disableDays: disableDays
        });
        var findDisables = function (_a) {
            var dates = _a.dates;
            return dates
                .filter(function (item) { return !!item.value && item.disabled; })
                .map(function (item) { return item.value; });
        };
        for (var _i = 0, _b = data.map(findDisables); _i < _b.length; _i++) {
            var item = _b[_i];
            disables.push.apply(disables, item);
        }
        disables = disables.filter(function (item) { return !item; });
        disables = dedupList(disables);
        i18n.heading = formatMonthHeading(i18n.title, i18n.months);
        this.element.innerHTML = template(data, i18n)(reachStart, reachEnd, views === "auto");
        typeof next === "function" && next(this.state);
        var inDisable = function (date) { return _this.state.disables.lastIndexOf(date) >= 0; };
        var dom = function (selector) { return $(_this.element, selector); };
        var nodeList = dom(".calendar-cell");
        var prevActionDOM = dom(".calendar-action-prev");
        var nextActionDOM = dom(".calendar-action-next");
        var update = monthSwitcher(date, startDate, endDate);
        if (prevActionDOM && nextActionDOM) {
            prevActionDOM.addEventListener("click", function (e) {
                e.preventDefault();
                !reachStart && update(-1)(_this.setState.bind(_this));
            });
            nextActionDOM.addEventListener("click", function (e) {
                e.preventDefault();
                !reachEnd && update(1)(_this.setState.bind(_this));
            });
        }
        var createRenderEmitter = function () {
            return emitter("render")({
                nodeList: nodeList,
                disables: disables
            });
        };
        createRenderEmitter();
        var _loop_1 = function (i) {
            nodeList[i].addEventListener("click", function () {
                var date = attr(nodeList[i], "data-date");
                var pickable = checkPickableDate({
                    date: date,
                    queue: queue.list,
                    dateFormat: dateFormat,
                    selection: selection,
                    inDisable: inDisable,
                    limit: _this.state.limit
                });
                if (pickable)
                    _this.enqueue(date);
            });
        };
        for (var i = 0; i < nodeList.length; i++) {
            _loop_1(i);
        }
    };
    TypePicker.prototype.enqueue = function (value) {
        var _this = this;
        var _a = this.state, selection = _a.selection, disables = _a.disables;
        var next = queue.enqueue(value);
        var inDisable = function (date) { return disables.indexOf(date) >= 0; };
        var afterEnqueue = function () {
            var dateFormat = _this.state.dateFormat;
            if (selection === 2) {
                var includeDisabled = findDisableInQueue(queue.list, dateFormat, inDisable);
                if (includeDisabled) {
                    if (inDisable(value)) {
                        queue.pop();
                    }
                    else {
                        queue.shift();
                    }
                }
            }
            var createEmitter = function () { return emitter("select")(queue.list); };
            _this.render(createEmitter);
        };
        next(afterEnqueue);
    };
    TypePicker.prototype.setDates = function (dates) {
        if (!isArray(dates))
            return;
        var datesList = [];
        var _a = this.state, selection = _a.selection, limit = _a.limit, startDate = _a.startDate, dateFormat = _a.dateFormat, disables = _a.disables;
        var parser = function (dateFormat) { return function (date) { return parse(date, dateFormat); }; };
        var formater = function (dateFormat) { return function (date) { return format(date, dateFormat); }; };
        var parseWithFormat = parser(dateFormat);
        var formatDate = formater(dateFormat);
        var inDisable = function (date) { return disables.indexOf(date) >= 0; };
        if (selection !== 2) {
            datesList = dates
                .filter(function (date) { return !inDisable(date); })
                .map(parseWithFormat)
                .filter(isDef);
        }
        else {
            var today_1 = new Date();
            if (dates.length < selection) {
                return;
            }
            else if (dates.length > selection) {
                dates = dates.slice(0, selection);
            }
            var start = dates[0], end = dates[1];
            start = byCondition(function (date) { return !isDate(date); })(start)(parseWithFormat);
            end = byCondition(function (date) { return !isDate(date); })(end)(parseWithFormat);
            var gap = diff(end, start, "days", true);
            if (gap > limit || end < start) {
                return;
            }
            start = formatDate(start);
            end = formatDate(end);
            if (inDisable(start)) {
                return;
            }
            var check = function (item) { return parseWithFormat(item) >= today_1; };
            var uncheck = function (item) { return parseWithFormat(item) < today_1; };
            var list = [start, end];
            datesList = list.filter(isDef).filter(check);
            if (disables.length > 0) {
                this.setState({
                    disables: dedupList(this.state.disables.concat(list.filter(uncheck)))
                });
            }
        }
        if (datesList.length > 0) {
            var date = byCondition(function (date) { return !isDate(date); })(datesList[0])(parseWithFormat);
            if (isDate(date)) {
                var reachStart = startDate && date <= startDate;
                this.setState({ date: date, reachStart: reachStart });
            }
        }
        for (var _i = 0, datesList_1 = datesList; _i < datesList_1.length; _i++) {
            var item = datesList_1[_i];
            this.enqueue(item);
        }
    };
    TypePicker.prototype.disable = function (_a) {
        var to = _a.to, from = _a.from, days = _a.days, dates = _a.dates;
        var _b = this.state, endDate = _b.endDate, startDate = _b.startDate, dateFormat = _b.dateFormat, disables = _b.disables, disableDays = _b.disableDays;
        var parser = function (dateFormat) { return function (date) { return parse(date, dateFormat); }; };
        var formater = function (dateFormat) { return function (date) { return format(date, dateFormat); }; };
        var parseWithFormat = parser(dateFormat);
        var formatDate = formater(dateFormat);
        var state = { disables: [], startDate: startDate, endDate: endDate, disableDays: disableDays };
        var parseToInt = function (item) { return parseInt(item, 10); };
        var dayFilter = function (days) {
            return isArray(days)
                ? days.map(parseToInt).filter(function (day) { return day >= 0 && day <= 6; })
                : [];
        };
        var isNotEmpty = function (v) { return isDef(v) && v !== ""; };
        var include = function (days) { return function (day) { return isArray(days) && days.indexOf(day) >= 0; }; };
        byCondition(isDate)(parseWithFormat(from))(function (date) {
            state.endDate = date;
        });
        byCondition(isDate)(parseWithFormat(to))(function (date) {
            state.startDate = date;
            state.reachStart = true;
            state.date = date;
        });
        var mapDateToDay = function (days) { return function (date) {
            return include(days)(date.getDay()) ? formatDate(date) : "";
        }; };
        var mapFormattedDate = function (dates) {
            return dates.map(formatParse(dateFormat)).filter(isNotEmpty);
        };
        var mapDateListFromProps = function (dates) {
            return byCondition(isArray)(dates)(mapFormattedDate) || [];
        };
        var mapDateByDay = function (dates) { return function (days) {
            return dates.map(mapDateToDay(dayFilter(days))).filter(isNotEmpty);
        }; };
        state.disables = disables.concat(mapDateListFromProps(dates));
        if (isDate(state.startDate) && isDate(state.endDate)) {
            var start = state.startDate;
            var end = state.endDate;
            if (start < end) {
                start = setDate(start, 1);
                end = new Date(end.getFullYear(), end.getMonth() + 1, 1);
                state.disables = state.disables.concat(mapDateByDay(between(start, end))(days));
            }
        }
        else {
            state.reachEnd = false;
            state.reachStart = false;
        }
        state.disableDays = disableDays.concat(days).filter(isDef);
        state.disables = dedupList(state.disables).filter(function (item) { return !!item; });
        this.setState(state);
    };
    TypePicker.prototype.i18n = function (pack) {
        if (isArray(pack.days) && isArray(pack.months)) {
            this.setState({
                i18n: {
                    week: pack.days,
                    months: pack.months,
                    title: pack.title
                }
            });
        }
    };
    return TypePicker;
}());

export default TypePicker;
