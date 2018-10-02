/*
*  TypePicker v3.6.0
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
var or = function (v1) { return function (v2) { return (v1 ? v1 : v2); }; };

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
var setDate = function (date, size, who) {
    if (!who) {
        who = "date";
    }
    if (!size) {
        size = 0;
    }
    var monthSize = 0;
    var yearSize = 0;
    var dateSize = size;
    if (who === "year") {
        yearSize = size;
    }
    else if (who === "month") {
        monthSize = size;
    }
    return new Date(date.getFullYear() + yearSize, date.getMonth() + monthSize, date.getDate() + dateSize);
};
var setSepecifiedDate = function (date, day) {
    return new Date(date.getFullYear(), date.getMonth(), day >= 0 ? day : date.getDate());
};
function getDates(year, month) {
    var d = new Date(year, month, 1);
    var utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate();
}
function tag(_a) {
    var tag = _a.tag, _b = _a.props, props = _b === void 0 ? {} : _b, _c = _a.children, children = _c === void 0 ? "" : _c, _d = _a.render, render = _d === void 0 ? true : _d;
    if (!tag || !render) {
        return "";
    }
    var attributes = [];
    for (var key in props) {
        var value = props[key];
        if (key === "className") {
            key = "class";
        }
        if (value) {
            attributes.push(key + "=\"" + value + "\"");
        }
    }
    if (children === false || children === undefined || children === null) {
        children = "";
    }
    else if (Array.isArray(children)) {
        children = children.filter(function (item) { return !!item; }).join("");
    }
    return "<" + tag + " " + attributes.join("") + ">" + children + "</" + tag + ">";
}
function join(list, spliter) {
    if (!spliter) {
        spliter = "";
    }
    return list.join(spliter);
}
function createDate(_a) {
    var date = _a.date, days = _a.days, dateFormat = _a.dateFormat, _b = _a.direction, direction = _b === void 0 ? 1 : _b, _c = _a.position, position = _c === void 0 ? "date" : _c, index = _a.index;
    var dir = function (v, size, dir) {
        return dir > 0 ? v + size : v - size;
    };
    var result = [];
    for (var i = 0; i <= days; i++) {
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
        var dat = new Date(currYear, currMonth, currDate);
        if (dateFormat) {
            result.push(format(dat, dateFormat));
        }
        else {
            result.push(dat);
        }
    }
    return result;
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
    else if (!isEnd && !isStart && index > 0) {
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
function tagData(item, index, isEnd, isStart, className) {
    var day = "";
    var date = "";
    className = "empty disabled";
    if (item) {
        day = item.getDay();
        date = item.getDate();
        className = tagClassName(index, isEnd, isStart);
    }
    return {
        date: date,
        day: day,
        className: className
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
    var dates = createDate({ date: date, days: size, dateFormat: dateFormat });
    var disables = dates.filter(inDisable);
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
    var now = setDate(date, size, "month");
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
var between = function (start) { return function (end) { return function (dateFormat) {
    start = parse(start, dateFormat);
    end = parse(end, dateFormat);
    if (!start || !end) {
        return [];
    }
    var dates = createDate({
        date: start,
        days: diff(end, start, "days", true),
        dateFormat: dateFormat,
        direction: end > start ? 1 : -1
    });
    if (!isArray(dates)) {
        return [dates];
    }
    return dates;
}; }; };
var TemplateData = (function () {
    function TemplateData(date, size, queue, dateFormat, withRange) {
        return (TemplateData.mapMonths(date, size).map(TemplateData.mapItem(queue, withRange, dateFormat)));
    }
    TemplateData.mapRangeFromQueue = function (queue, dateFormat) {
        return function (useDefault) {
            if (queue.length <= 0) {
                return [];
            }
            if (useDefault) {
                return queue;
            }
            var start = parse(queue[0], dateFormat);
            var end = parse(queue[queue.length - 1], dateFormat);
            return createDate({
                date: start,
                days: diff(end, start, "days"),
                dateFormat: dateFormat
            });
        };
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
    TemplateData.mapItem = function (queue, withRange, dateFormat) { return function (item) {
        return TemplateData.mapDates(item, TemplateData.mapRangeFromQueue(queue, dateFormat)(withRange), withRange, dateFormat);
    }; };
    TemplateData.mapDates = function (_a, range, withRange, dateFormat) {
        var year = _a.year, month = _a.month, size = _a.size;
        var put = function (target) { return function (item) { return function (data) {
            return (target[format(item, dateFormat)] = data);
        }; }; };
        var dates = {};
        var firstDateOfMonth = new Date(year, month, 1);
        var lastMonthDates = new Date(year, month, 0).getDate();
        var set = put(dates);
        for (var i = 0; i < firstDateOfMonth.getDay(); i++) {
            set(new Date(year, month - 1, lastMonthDates - i))(tagData());
        }
        for (var i = 0; i < size; i++) {
            var date = new Date(year, month, i + 1);
            var index = range.indexOf(format(date, dateFormat));
            var isEnd = withRange && index === range.length - 1;
            var isStart = withRange && index === 0;
            set(date)(tagData(date, index, isEnd, isStart));
        }
        return { year: year, month: month, dates: dates };
    };
    return TemplateData;
}());

function formatMonthHeading(format$$1, year, month) {
    return format$$1
        .toLowerCase()
        .replace(/y{1,}/g, padding(year))
        .replace(/m{1,}/g, padding(month + 1));
}
function cellClassName(type, index) {
    var name = "calendar-cell calendar-" + type + "-cell " + (index === 0 ? "calendar-cell-weekday" : "") + " " + (index === 6 ? "calendar-cell-weekend" : "") + "\n ";
    return name.replace(/\n/, "").trim();
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
                href: "javascripts:;"
            },
            children: tag({ tag: "span", children: type })
        });
    };
    return [node("prev", reachStart), node("next", reachEnd)];
}
function createDateTag(_a, item) {
    var date = _a.date, day = _a.day, className = _a.className;
    var dateTag = tag({
        tag: "div",
        props: {
            className: "date"
        },
        children: date
    });
    var nodeChildren = [dateTag];
    if (date) {
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
            className: cellClassName("date", day) + " " + className,
            "data-day": day,
            "data-date": item ? item : ""
        },
        children: nodeChildren
    });
}
var headView = function (year, month, format$$1) {
    return tag({
        tag: "div",
        props: { className: "calendar-head" },
        children: [
            tag({
                tag: "div",
                props: {
                    className: "calendar-title"
                },
                children: tag({
                    tag: "span",
                    props: {
                        "data-year": year,
                        "data-month": month
                    },
                    children: formatMonthHeading(format$$1, year, month)
                })
            })
        ]
    });
};
var dateListView = function (list, dates) {
    return list.map(function (item) { return createDateTag(dates[item], item); });
};
var mainView = function (children) {
    return tag({
        tag: "div",
        props: {
            className: "calendar-main"
        },
        children: children
    });
};
var bodyView = function (list, dates) {
    return tag({
        tag: "div",
        props: {
            className: "calendar-body"
        },
        children: dateListView(list, dates)
    });
};
function createView(data, format$$1) {
    return function (week) {
        return data
            .map(function (item) {
            return mainView([
                headView(item.year, item.month, format$$1),
                week,
                tag({
                    tag: "div",
                    props: {
                        className: "calendar-body"
                    },
                    children: bodyView(Object.keys(item.dates), item.dates)
                })
            ]);
        })
            .filter(isDef);
    };
}
var createWeekViewMapper = function (day, index) {
    return tag({
        tag: "div",
        props: { className: cellClassName("day", index) },
        children: day
    });
};
var createWeekView = function (week) {
    return tag({
        tag: "div",
        props: { className: "calendar-day" },
        children: week.map(createWeekViewMapper)
    });
};
function template(data, i18n) {
    return function (reachStart, reachEnd, notRenderAction) {
        var createdWeekView = createWeekView(i18n.week);
        var createdView = createView(data, i18n.title);
        var mainView = createdView(notRenderAction ? "" : createdWeekView);
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
            i18n: defaultI18n()
        };
        this.element = null;
        this.on = on;
        this.format = function (date) { return format(date, _this.state.dateFormat); };
        this.parse = function (date, dateFormat) {
            return parse(date, dateFormat ? dateFormat : _this.state.dateFormat);
        };
        this.update = function () { return _this.render(); };
        var el = parseEl(option.el);
        if (!option || !el) {
            return;
        }
        var state = __assign({}, this.state);
        byCondition(isDef)(option.views)(function (views) { return (state.views = views); });
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
    TypePicker.prototype.inDisable = function (date) {
        return this.state.disables.indexOf(date) >= 0;
    };
    TypePicker.prototype.render = function (next) {
        var _a = this.state, reachStart = _a.reachStart, reachEnd = _a.reachEnd, views = _a.views, startDate = _a.startDate, endDate = _a.endDate, date = _a.date, dateFormat = _a.dateFormat, selection = _a.selection, i18n = _a.i18n;
        var size = views == 2 ? 1 : views === "auto" ? diff(endDate, startDate) : 0;
        var withRange = selection === 2;
        var data = (new TemplateData(date, size, queue.list, dateFormat, withRange));
        this.element.innerHTML = template(data, i18n)(reachStart, reachEnd, views === "auto");
        this.afterRender(next);
    };
    TypePicker.prototype.afterRender = function (after) {
        var _this = this;
        var _a = this.state, dateFormat = _a.dateFormat, selection = _a.selection, date = _a.date, reachStart = _a.reachStart, reachEnd = _a.reachEnd, endDate = _a.endDate, disables = _a.disables, startDate = _a.startDate;
        typeof after === "function" && after(this.state);
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
        var inDisable = function (date) { return _this.inDisable(date); };
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
        var selection = this.state.selection;
        var next = queue.enqueue(value);
        var afterEnqueue = function () {
            var dateFormat = _this.state.dateFormat;
            if (selection === 2) {
                var includeDisabled = findDisableInQueue(queue.list, dateFormat, _this.inDisable.bind(_this));
                if (includeDisabled) {
                    if (_this.inDisable(value)) {
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
        var _this = this;
        if (!isArray(dates))
            return;
        var datesList = [];
        var _a = this.state, selection = _a.selection, limit = _a.limit, startDate = _a.startDate;
        if (selection !== 2) {
            var parse_1 = this.parse.bind(this);
            datesList = dates
                .filter(function (date) { return !_this.inDisable(date); })
                .map(parse_1)
                .filter(isDef);
        }
        else {
            if (dates.length < selection) {
                return;
            }
            else if (dates.length > selection) {
                dates = dates.slice(0, selection);
            }
            var start = dates[0], end = dates[1];
            start = byCondition(function (date) { return !isDate(date); })(start)(this.parse);
            end = byCondition(function (date) { return !isDate(date); })(end)(this.parse);
            var gap = diff(end, start, "days", true);
            if (gap > limit || end < start) {
                return;
            }
            start = this.format(start);
            end = this.format(end);
            if (this.inDisable(start)) {
                return;
            }
            datesList = [start, end].filter(isDef);
        }
        if (datesList.length > 0) {
            var date = byCondition(function (date) { return !isDate(date); })(datesList[0])(this.parse);
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
        var _this = this;
        var to = _a.to, from = _a.from, days = _a.days, dates = _a.dates;
        var _b = this.state, endDate = _b.endDate, startDate = _b.startDate, dateFormat = _b.dateFormat;
        var _c = this, parse$$1 = _c.parse, format$$1 = _c.format;
        var state = { disables: [], startDate: startDate, endDate: endDate };
        parse$$1 = parse$$1.bind(this);
        format$$1 = format$$1.bind(this);
        var filterDay = function (day) {
            day = parseInt(day);
            return !isNaN(day) && day >= 0 && day <= 6;
        };
        var dayFilter = function (days) { return days.filter(filterDay); };
        var value = function (v) { return v; };
        var filterDateByDay = function (days) {
            return function (date) {
                if (days.indexOf(date.getDay()) >= 0) {
                    return _this.format(date);
                }
                return null;
            };
        };
        state.endDate = or(byCondition(isDate)(parse$$1(from))(value))(endDate);
        state.startDate = or(byCondition(isDate)(parse$$1(to))(value))(startDate);
        if (state.startDate) {
            state.reachStart = true;
            state.date = state.startDate;
        }
        var mapFormattedDate = function (dates) {
            return dates.map(formatParse(dateFormat)).filter(isDef);
        };
        var mapDateListFromProps = function (dates) {
            return byCondition(isArray)(dates)(mapFormattedDate);
        };
        var checkStartDateAndEndDate = function (start) { return function (end) { return function (next) {
            var isDates = isDate(start) && isDate(end);
            if (isDates && start < end) {
                next(start, end);
            }
            else {
                _this.setState({
                    reachEnd: false,
                    reachStart: false,
                    disables: mapDateListFromProps(dates)
                });
            }
        }; }; };
        checkStartDateAndEndDate(state.startDate)(state.endDate)(function (start, end) {
            start = setSepecifiedDate(start, 1);
            var filteredDays = or(byCondition(isArray)(days)(dayFilter))([]);
            var mapDateByDay = function (dates, days) {
                return dates.map(filterDateByDay(days)).filter(isDef);
            };
            var disables = or(mapDateListFromProps(dates))([]).concat(or(mapDateByDay(between(start)(end)(), filteredDays))([]));
            state.disables = dedupList(disables);
            _this.setState(state);
        });
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
    TypePicker.between = between;
    TypePicker.diff = diff;
    return TypePicker;
}());

export default TypePicker;
