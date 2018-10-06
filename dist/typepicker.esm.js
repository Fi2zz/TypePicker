/*
*  TypePicker v5.1.0
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

var isUndef = function (v) { return v === undefined || v === null; };
var isEmpty = function (v) { return isUndef(v) || v == ""; };
var attr = function (el, attr) { return el.getAttribute(attr); };
var padding = function (n) { return "" + (n > 9 ? n : "0" + n); };
var isNotEmpty = function (v) { return !isEmpty(v); };
var isDef = function (v) { return !isUndef(v); };
var isArray = function (list) { return list instanceof Array; };
var isDate = function (object) { return object instanceof Date; };
function $(selector, selector$2) {
    var selectAll = function (who, selector) {
        var ArrayNodes = Array.prototype.slice.call(who.querySelectorAll(selector));
        if (ArrayNodes.length <= 0) {
            return null;
        }
        else if (ArrayNodes.length === 1) {
            return ArrayNodes[0];
        }
        else {
            return ArrayNodes;
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
function dedupList(list, condition) {
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
}
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
function parseEl(el) {
    if (!el) {
        return null;
    }
    return typeof el === "string" ? $(el) : el;
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
function cellElementClassName(index) {
    var other = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        other[_i - 1] = arguments[_i];
    }
    var names = ["calendar-cell"];
    if (index === 0) {
        names.push("is-weekday");
    }
    else if (index === 6) {
        names.push("is-weekend");
    }
    if (other) {
        names.push.apply(names, other);
    }
    return names.join(" ");
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
            if (isDef(value)) {
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
function createDate(options) {
    var date = options.date, size = options.size, _a = options.direction, direction = _a === void 0 ? 1 : _a, _b = options.position, position = _b === void 0 ? "date" : _b, index = options.index;
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
function tagData(options) {
    if (options === void 0) { options = {}; }
    var value = options.value, item = options.item, index = options.index, isEnd = options.isEnd, isStart = options.isStart, isDisabled = options.isDisabled, withRange = options.withRange;
    function tagClassName(index, isEnd, isStart, withRange) {
        var name = "";
        if (index >= 0) {
            name = "active";
        }
        if (withRange) {
            if (isStart) {
                name = name + " start-date";
            }
            else if (isEnd) {
                name = name + " end-date";
            }
            else if (index > 0) {
                name = "in-range";
            }
        }
        return name;
    }
    var day = "";
    var date = "";
    var className = "empty disabled";
    if (item) {
        day = item.getDay();
        date = item.getDate();
        className = tagClassName(index, isEnd, isStart, withRange);
        if (isDisabled) {
            className = "disabled " + className.trim();
        }
    }
    return {
        date: date,
        day: day,
        className: className,
        value: value,
        disabled: isDisabled
    };
}
var formatParse = function (dateFormat) { return function (date) {
    return format(parse(date, dateFormat), dateFormat);
}; };
var changeMonth = function (date, start, end) { return function (size) {
    var now = new Date(date.getFullYear(), date.getMonth() + size, date.getDate());
    var endGap = end ? diff(end, now) : 1;
    var startGap = end ? diff(now, start) : 2;
    var reachStart = startGap < 1 && endGap >= 0;
    var reachEnd = startGap > 1 && endGap <= 1;
    if (!start || !end) {
        reachEnd = false;
        reachStart = false;
    }
    return {
        reachEnd: reachEnd,
        reachStart: reachStart,
        date: now
    };
}; };
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
        var date = _a.date, size = _a.size, queue = _a.queue, format = _a.format, parse = _a.parse, withRange = _a.withRange, disables = _a.disables, heading = _a.heading;
        var mapMonths = TemplateData.mapMonths, mapDates = TemplateData.mapDates, mapQueue = TemplateData.mapQueue;
        if (withRange) {
            queue = mapQueue(queue, format, parse);
        }
        return (mapMonths(date, size, heading).map(mapDates({ queue: queue, withRange: withRange, format: format, disables: disables })));
    }
    TemplateData.mapQueue = function (queue, format, parse) {
        if (queue.length <= 0) {
            return [];
        }
        var start = parse(queue[0]);
        var end = parse(queue[queue.length - 1]);
        return createDate({
            date: start,
            size: diff(end, start, "days")
        }).map(format);
    };
    TemplateData.mapMonths = function (date, size, heading) {
        var template = [];
        function getDates(date) {
            return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)).getUTCDate();
        }
        for (var i = 0; i <= size; i++) {
            var now = new Date(date.getFullYear(), date.getMonth() + i, 1);
            template.push({
                size: getDates(now),
                date: now,
                heading: heading(now)
            });
        }
        return template;
    };
    TemplateData.formatMonthHeading = function (format, months) {
        return function (date) {
            return format
                .toLowerCase()
                .replace(/y{1,}/g, padding(date.getFullYear()))
                .replace(/m{1,}/g, months[date.getMonth()]);
        };
    };
    TemplateData.mapDates = function (options) { return function (monthItem) {
        var date = monthItem.date, size = monthItem.size, heading = monthItem.heading;
        var queue = options.queue, withRange = options.withRange, format = options.format, disables = options.disables;
        var year = date.getFullYear();
        var month = date.getMonth();
        var dates = [];
        var createEmptyItem = function (size, list) {
            for (var i = 0; i < size; i++) {
                list.push(tagData({ isDisabled: true }));
            }
            return list;
        };
        createEmptyItem(new Date(year, month, 1).getDay(), dates);
        for (var i = 0; i < size; i++) {
            var date_1 = new Date(year, month, i + 1);
            var index = queue.indexOf(format(date_1));
            var isEnd = withRange && index === queue.length - 1;
            var isStart = withRange && index === 0;
            if (queue.length <= 0) {
                isEnd = false;
                isStart = false;
            }
            var withFormat = format(date_1);
            var disabled = disables.days.indexOf(date_1.getDay()) >= 0 ||
                disables.dates.indexOf(withFormat) >= 0;
            dates.push(tagData({
                value: withFormat,
                item: date_1,
                index: index,
                isEnd: isEnd,
                isStart: isStart,
                isDisabled: disabled,
                withRange: withRange
            }));
        }
        return { year: year, month: month, heading: heading, dates: dates };
    }; };
    return TemplateData;
}());

var Observer = (function () {
    var clientList = {};
    var subscribe = function (key, fn) {
        if (!clientList[key]) {
            clientList[key] = [];
        }
        clientList[key].push(fn);
    };
    var publish = function () {
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
        subscribe: subscribe,
        publish: publish
    };
})();
var publish = function (event, value) {
    return Observer.publish(event, value);
};
var subscribe = Observer.subscribe;

function copy(v) {
    return JSON.parse(JSON.stringify(v));
}
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
            if (_this.list.indexOf(date) >= 0) {
                return;
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
    Queue.prototype.resetWithValue = function (value) {
        this.empty();
        this.list.push(value);
    };
    Queue.prototype.shift = function () {
        this.list.shift();
    };
    Queue.prototype.cache = function () {
        return copy(this.list);
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
    Queue.prototype.length = function () {
        return this.list.length;
    };
    Queue.prototype.replace = function (v) {
        this.list = v;
    };
    return Queue;
}());

function createActionView(reachStart, reachEnd) {
    var node = function (type, disabled) {
        var className = ["calendar-action", type];
        if (disabled) {
            className.push("disabled");
        }
        return tag({
            tag: "div",
            props: {
                className: join(className, " "),
                children: [type]
            }
        });
    };
    return [node("prev", reachStart), node("next", reachEnd)];
}
function createDateTag(data) {
    var nodeChildren = [];
    if (isNotEmpty(data.date)) {
        nodeChildren.push(tag({
            tag: "div",
            props: {
                className: "date",
                children: data.date
            }
        }));
    }
    if (data.value) {
        nodeChildren.push(tag({
            tag: "div",
            props: {
                className: "placeholder"
            }
        }));
    }
    var props = {
        className: cellElementClassName(data.day, data.className),
        "data-disabled": data.disabled,
        children: nodeChildren
    };
    if (isNotEmpty(data.value)) {
        props["data-date"] = data.value;
    }
    if (isNotEmpty(data.day)) {
        props["data-day"] = data.day;
    }
    return tag({
        tag: "div",
        props: props
    });
}
var headView = function (year, month, title) {
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
var mapView = function (weekView) { return function (item) {
    return mainView([
        headView(item.year, item.month, item.heading),
        weekView,
        bodyView(item.dates)
    ]);
}; };
var createView = function (data, weekView) {
    return data.map(mapView(weekView)).filter(isNotEmpty);
};
var createWeekViewMapper = function (day, index) {
    return tag({
        tag: "div",
        props: {
            className: cellElementClassName(index),
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
function template(data, week) {
    return function (reachStart, reachEnd, notRenderAction) {
        var createdWeekView = createWeekView(week);
        var mainView = createView(data, notRenderAction ? "" : createdWeekView);
        var createdActionView = createActionView(reachStart, reachEnd);
        if (notRenderAction) {
            mainView.unshift(createdWeekView);
            createdActionView = [];
        }
        return join(createdActionView.concat(mainView));
    };
}

var queue = null;
var initSelectedDates = [];
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
            i18n: defaultI18n(),
            disableDays: [],
            lastSelectedItemCanBeInvalid: false,
            disableDates: []
        };
        this.element = null;
        this.forceUpdate = function () { return _this.render(); };
        this.onRender = function (next) { return subscribe("render", next); };
        this.onSelect = function (next) { return subscribe("select", next); };
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
        byCondition(function (v) { return isDef(v) && (!isNaN(v) || v === false); })(option.limit)(function (limit) { return (state.limit = limit); });
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
            state.disableDates = dates;
        }
        else {
        }
        byCondition(function (v) { return isDef(v) && typeof v === "boolean"; })(option.lastSelectedItemCanBeInvalid)(function (value) {
            state.lastSelectedItemCanBeInvalid = value;
            if (value === true) {
                state.selection = 2;
            }
        });
        this.element = el;
        this.element.className = elementClassName(state.views);
        queue = new Queue({
            size: state.selection,
            limit: state.selection === 2 ? state.limit : false,
            dateFormat: state.dateFormat
        });
        this.setState(state);
    }
    TypePicker.prototype.setState = function (state) {
        var _this = this;
        this.state = __assign({}, this.state, state);
        var id = setTimeout(function () {
            clearTimeout(id);
            _this.render();
        }, 0);
    };
    TypePicker.prototype.render = function (next) {
        var _this = this;
        var _a = this.state, reachStart = _a.reachStart, reachEnd = _a.reachEnd, views = _a.views, startDate = _a.startDate, endDate = _a.endDate, date = _a.date, dateFormat = _a.dateFormat, selection = _a.selection, i18n = _a.i18n, disableDays = _a.disableDays, disableDates = _a.disableDates, lastSelectedItemCanBeInvalid = _a.lastSelectedItemCanBeInvalid;
        var size = function () {
            return views == 2 ? 1 : views === "auto" ? diff(endDate, startDate) : 0;
        };
        var withRange = selection === 2;
        var withFormat = function (date) { return format(date, dateFormat); };
        var withParse = function (date) { return parse(date, dateFormat); };
        var data = new TemplateData({
            date: date,
            size: size(),
            queue: queue.list,
            format: withFormat,
            parse: withParse,
            withRange: withRange,
            heading: TemplateData.formatMonthHeading(i18n.title, i18n.months),
            disables: {
                days: disableDays,
                dates: disableDates
            }
        });
        var findDisabledFromTemplateData = function (data) {
            var result = [];
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                var dates = item.dates;
                for (var _a = 0, dates_1 = dates; _a < dates_1.length; _a++) {
                    var dateItem = dates_1[_a];
                    if (dateItem.disabled && dateItem.date) {
                        result.push(dateItem.value);
                    }
                }
            }
            return result;
        };
        var disables = findDisabledFromTemplateData(data);
        this.element.innerHTML = template(data, i18n.week)(reachStart, reachEnd, views === "auto");
        var setInitDatesToQueue = function () {
            if (initSelectedDates.length > 0) {
                var initDisables = [];
                for (var _i = 0, initSelectedDates_1 = initSelectedDates; _i < initSelectedDates_1.length; _i++) {
                    var item = initSelectedDates_1[_i];
                    var isDisable = disables.indexOf(item) >= 0;
                    if (isDisable) {
                        initDisables.push(item);
                    }
                }
                var f1 = initSelectedDates[0];
                if (initSelectedDates.length !== initDisables.length &&
                    disables.indexOf(f1) <= -1) {
                    for (var _a = 0, initSelectedDates_2 = initSelectedDates; _a < initSelectedDates_2.length; _a++) {
                        var item = initSelectedDates_2[_a];
                        var isDisable = disables.indexOf(item) >= 0;
                        _this.enqueue(item, disables, isDisable);
                    }
                }
                initSelectedDates = [];
            }
        };
        setInitDatesToQueue();
        typeof next === "function" && next(this.state);
        var dom = function (selector) { return $(_this.element, selector); };
        var nodeList = dom(".calendar-cell");
        var prevActionDOM = dom(".calendar-action-prev");
        var nextActionDOM = dom(".calendar-action-next");
        var update = changeMonth(date, startDate, endDate);
        if (prevActionDOM && nextActionDOM) {
            prevActionDOM.addEventListener("click", function (e) {
                e.preventDefault();
                !reachStart && _this.setState(update(-1));
            });
            nextActionDOM.addEventListener("click", function (e) {
                e.preventDefault();
                !reachEnd && _this.setState(update(1));
            });
        }
        publish("render", nodeList);
        var _loop_1 = function (i) {
            nodeList[i].addEventListener("click", function () {
                var date = attr(nodeList[i], "data-date");
                var disable = attr(nodeList[i], "data-disabled");
                var isDisabled = false;
                if (isDef(disable)) {
                    isDisabled = JSON.parse(disable);
                }
                if ((!lastSelectedItemCanBeInvalid || queue.length() <= 0) &&
                    isDisabled) {
                    return;
                }
                _this.enqueue(date, disables, isDisabled);
            });
        };
        for (var i = 0; i < nodeList.length; i++) {
            _loop_1(i);
        }
    };
    TypePicker.prototype.enqueue = function (value, disables, valueIsDisabled) {
        var _this = this;
        var cache = queue.cache();
        var _a = this.state, dateFormat = _a.dateFormat, lastSelectedItemCanBeInvalid = _a.lastSelectedItemCanBeInvalid, limit = _a.limit, selection = _a.selection;
        var withParse = function (date) { return parse(date, dateFormat); };
        var afterEnqueue = function () {
            var date$1 = withParse(queue.list[0]);
            var date$2 = withParse(queue.list[queue.list.length - 1]);
            var findDisabled = function (queue, disables, dateFormat) { return function (parse$$1) {
                var date$1 = queue[0];
                var date$2 = queue[queue.length - 1];
                if (date$1 === date$2) {
                    return 0;
                }
                date$1 = parse$$1(date$1);
                date$2 = parse$$1(date$2);
                var dates = between(date$1, date$2, dateFormat)
                    .map(function (_, index) { return (disables.indexOf(_) >= 0 ? index : -1); })
                    .filter(function (v) { return isDef(v) && v >= 0; });
                return isArray(dates) ? dates : [dates];
            }; };
            var space = diff(date$2, date$1, "days");
            if (limit !== false) {
                if (space < 0 ||
                    queue.list.length > selection ||
                    (selection === 2 && space > limit)) {
                    queue.shift();
                }
            }
            var disablesInQueue = findDisabled(queue.list, disables, dateFormat)(withParse);
            if (lastSelectedItemCanBeInvalid) {
                if (disablesInQueue.length >= selection) {
                    if (valueIsDisabled) {
                        queue.pop();
                    }
                    else {
                        queue.shift();
                    }
                }
                else if (queue.length() === 1 && valueIsDisabled) {
                    queue.replace(cache);
                }
            }
            else {
                if (limit !== false) {
                    if (disablesInQueue.length > 0) {
                        queue.resetWithValue(value);
                    }
                }
            }
            _this.render(function () { return publish("select", queue.list); });
        };
        queue.enqueue(value)(afterEnqueue);
    };
    TypePicker.prototype.setDates = function (dates) {
        if (!isArray(dates))
            return;
        var _a = this.state, selection = _a.selection, limit = _a.limit, dateFormat = _a.dateFormat;
        var withParse = function (date) { return parse(date, dateFormat); };
        var withFormat = function (date) { return format(date, dateFormat); };
        var datesList = dates.map(withParse).filter(isDef);
        if (selection === 2) {
            if (datesList.length > selection) {
                datesList = datesList.slice(0, selection);
            }
            var _b = datesList
                .map(function (item) { return (isDate(item) ? item : withParse(item)); })
                .filter(isDef), start = _b[0], end = _b[1];
            var gap = diff(end, start, "days", true);
            if ((gap > limit && selection === 2) || end < start) {
                return;
            }
            datesList = [start, end];
        }
        initSelectedDates = datesList
            .map(function (date) { return (isDate(date) ? withFormat(date) : date); })
            .filter(isDef);
    };
    TypePicker.prototype.disable = function (options) {
        var to = options.to, from = options.from, days = options.days, dates = options.dates;
        var _a = this.state, endDate = _a.endDate, startDate = _a.startDate, dateFormat = _a.dateFormat, disableDates = _a.disableDates, disableDays = _a.disableDays;
        var parser = function (dateFormat) { return function (date) { return parse(date, dateFormat); }; };
        var parseWithFormat = parser(dateFormat);
        var state = { disableDates: [], startDate: startDate, endDate: endDate, disableDays: disableDays };
        var parseToInt = function (item) { return parseInt(item, 10); };
        var mapDay = function (days) {
            return isArray(days)
                ? days.map(parseToInt).filter(function (day) { return day >= 0 && day <= 6; })
                : [];
        };
        byCondition(isDate)(parseWithFormat(from))(function (date) {
            state.endDate = date;
        });
        byCondition(isDate)(parseWithFormat(to))(function (date) {
            state.startDate = date;
            state.reachStart = true;
            state.date = date;
        });
        var mapDatesFromProps = function (dates) {
            return isArray(dates)
                ? dates.map(formatParse(dateFormat)).filter(isNotEmpty)
                : [];
        };
        if (!isDate(state.startDate) || !isDate(state.endDate)) {
            state.reachEnd = false;
            state.reachStart = false;
        }
        else {
            var start = state.startDate;
            var end = state.endDate;
            if (start > end) {
                state.startDate = end;
                state.endDate = start;
                state.date = end;
                state.reachStart = true;
            }
        }
        state.disableDates = dedupList(disableDates.concat(mapDatesFromProps(dates))).filter(isNotEmpty);
        state.disableDays = disableDays.concat(mapDay(days)).filter(isNotEmpty);
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
