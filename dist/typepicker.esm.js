/*
*  TypePicker v2.5
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

function isUndefined(v) {
    return v === undefined || v === null;
}
function isDef(v) {
    return !isUndefined(v);
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
            if (isUndefined(when)) {
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
var containerClassName = function (base, views) {
    return base + " calendar calendar-" + (views === 2 ? "double-views" : views === 1 ? "single-view" : "flat-view");
};
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
function getDates(year, month) {
    var d = new Date(year, month, 1);
    var utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
    return new Date(utc).getUTCDate();
}
function createNode(_a) {
    var tag = _a.tag, _b = _a.props, props = _b === void 0 ? {} : _b, _c = _a.children, children = _c === void 0 ? "" : _c, _d = _a.render, render = _d === void 0 ? true : _d;
    if (!tag || !render) {
        return "";
    }
    var attributes = [];
    for (var key in props) {
        var value = props[key];
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
function calendarCellClassName(type, index) {
    var name = "calendar-cell calendar-" + type + "-cell " + (index === 0 ? "calendar-cell-weekday" : "") + " " + (index === 6 ? "calendar-cell-weekend" : "") + "\n ";
    return name.replace(/\n/, "").trim();
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
var createNodeClassName = function (_a) {
    var date = _a.date, dates = _a.dates, _b = _a.onlyActive, onlyActive = _b === void 0 ? false : _b;
    if (dates.length <= 0) {
        return "";
    }
    if (onlyActive && dates.indexOf(date) >= 0) {
        return "active";
    }
    if (dates.indexOf(date) === 0) {
        return "active start-date";
    }
    else if (dates.indexOf(date) === dates.length - 1) {
        return "active end-date";
    }
    else if (dates.indexOf(date) > 0 &&
        dates.indexOf(date) < dates.length - 1) {
        return "in-range";
    }
    else {
        return "";
    }
};
var defaultLanguage = {
    title: function (year, month) { return year + "\u5E74 " + defaultLanguage.months[month] + "\u6708"; },
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
var findDisableInQueue = function (list, dateFormat, inDisable) {
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
};
var checkPickableDate = function (_a) {
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
};
var formatParse = function (parse) { return function (format) { return function (date) { return format(parse(date)); }; }; };
var monthSwitcher = function (date, start, end) {
    return function (setState) { return function (size) {
        var now = setDate(date, size, "month");
        var endGap = end ? diff(end, now) : 1;
        var startGap = end ? diff(now, start) : 2;
        var reachStart = startGap < 1 && endGap >= 0;
        var reachEnd = startGap > 1 && endGap <= 1;
        var states = {
            reachEnd: reachEnd,
            reachStart: reachStart,
            date: now
        };
        setState(states);
    }; };
};
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

function createActionBar(create, reachStart, reachEnd) {
    if (!create) {
        return [];
    }
    var actionNode = function (type, disabled) {
        var className = ["calendar-action", "calendar-action-" + type];
        if (disabled) {
            className.push("disabled", "calendar-action-disabled");
        }
        return createNode({
            tag: "button",
            props: {
                class: className.join(" ")
            },
            children: createNode({ tag: "span", children: type })
        });
    };
    return [actionNode("prev", reachStart), actionNode("next", reachEnd)];
}
function createDateNode(_a, item) {
    var date = _a.date, day = _a.day, className = _a.className;
    var placeholder = createNode({
        tag: "div",
        props: {
            class: "placeholder"
        }
    });
    var dateNode = createNode({
        tag: "div",
        props: {
            class: "date"
        },
        children: date
    });
    return createNode({
        tag: "div",
        props: {
            class: calendarCellClassName("date", day) + " " + className,
            "data-day": day,
            "data-date": "" + day ? item : ""
        },
        children: [dateNode, placeholder]
    });
}
function createView(data, week, renderWeekOnTop) {
    var head = function (title, year, month) {
        return createNode({
            tag: "div",
            props: { class: "calendar-head" },
            children: [
                createNode({
                    tag: "div",
                    props: {
                        class: "calendar-title"
                    },
                    children: createNode({
                        tag: "span",
                        props: {
                            "data-year": year,
                            "data-month": month
                        },
                        children: title
                    })
                })
            ]
        });
    };
    var weekMapper = function (day, index) {
        return createNode({
            tag: "div",
            props: { class: calendarCellClassName("day", index) },
            children: day
        });
    };
    var weeker = createNode({
        tag: "div",
        props: { class: "calendar-day" },
        children: week.map(weekMapper)
    });
    var mainNode = function (children) {
        return createNode({
            tag: "div",
            props: {
                class: "calendar-main"
            },
            children: children
        });
    };
    var dateNodes = function (dates) {
        return Object.keys(dates).map(function (item) { return createDateNode(dates[item], item); });
    };
    var template = data.map(function (item) {
        return mainNode([
            head(item.heading, item.year, item.month),
            !renderWeekOnTop ? weeker : "",
            createNode({
                tag: "div",
                props: {
                    class: "calendar-body"
                },
                children: dateNodes(item.dates)
            })
        ]);
    });
    if (renderWeekOnTop) {
        template.unshift(weeker);
    }
    template = template.filter(function (item) { return !!item; });
    return template.join("").trim();
}
function template(_a) {
    var renderWeekOnTop = _a.renderWeekOnTop, data = _a.data, week = _a.week, reachEnd = _a.reachEnd, reachStart = _a.reachStart;
    var nodes = createActionBar(!renderWeekOnTop, reachStart, reachEnd).concat([
        createView(data, week, renderWeekOnTop)
    ]);
    return join(nodes);
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

var emitter = function (event) { return function (value) { return Observer.$emit(event, value); }; };
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
            language: defaultLanguage
        };
        this.element = null;
        this.on = Observer.$on;
        this.format = function (date) { return format(date, _this.state.dateFormat); };
        this.parse = function (date, dateFormat) {
            return parse(date, dateFormat ? dateFormat : _this.state.dateFormat);
        };
        this.update = function () { return _this.render(); };
        if (!option || !parseEl(option.el)) {
            return;
        }
        this.element = parseEl(option.el);
        var states = __assign({}, this.state);
        byCondition(isDef)(option.views)(function () {
            states.views = getViews(option.views);
        });
        byCondition(isNaN, false)(option.selection)(function () {
            states.selection = option.selection;
        });
        byCondition(isDef)(option.format)(function () {
            states.dateFormat = option.format;
        });
        byCondition(isDate)(option.startDate)(function () {
            states.startDate = option.startDate;
            states.reachStart = true;
            states.date = option.startDate;
        });
        byCondition(isDate)(option.endDate)(function () {
            states.endDate = option.endDate;
        });
        byCondition(isNaN, false)(option.limit)(function () {
            states.limit = option.limit;
        });
        this.element.className = containerClassName(this.element.className, states.views);
        queue = new Queue({
            size: states.selection,
            limit: states.selection === 2 ? states.limit : false,
            dateFormat: states.dateFormat
        });
        this.setState(states);
    }
    TypePicker.prototype.setState = function (state, next) {
        var _this = this;
        if (typeof state === "function") {
            this.state = state(this.state);
        }
        else {
            this.state = __assign({}, this.state, state);
        }
        setTimeout(function () {
            _this.render(next);
        }, 0);
    };
    TypePicker.prototype.inDisable = function (date) {
        return this.state.disables.indexOf(date) >= 0;
    };
    TypePicker.prototype.createTemplate = function () {
        var _this = this;
        var _a = this.state, date = _a.date, dateFormat = _a.dateFormat, views = _a.views, endDate = _a.endDate, startDate = _a.startDate, selection = _a.selection;
        var format$$1 = this.format;
        var monthSize = views == 2 ? 1 : views === "auto" ? diff(endDate, startDate) : 0;
        var template$$1 = [];
        for (var i = 0; i <= monthSize; i++) {
            var dat = new Date(date.getFullYear(), date.getMonth() + i, 1);
            var dates = getDates(dat.getFullYear(), dat.getMonth());
            template$$1.push({
                dates: dates,
                year: dat.getFullYear(),
                month: dat.getMonth()
            });
        }
        var range = (function (queue, selection) {
            if (!queue || queue.length <= 0) {
                return [];
            }
            if (selection > 2) {
                return queue;
            }
            var start = _this.parse(queue[0]);
            var end = _this.parse(queue[queue.length - 1]);
            return createDate({
                date: start,
                days: diff(end, start, "days"),
                dateFormat: dateFormat
            });
        })(queue.list, selection);
        return template$$1.map(function (item) {
            var heading = _this.state.language.title(item.year, item.month);
            var dates = {};
            var firstDay = new Date(item.year, item.month, 1);
            var lastMonthDates = new Date(item.year, item.month, 0).getDate();
            for (var i = 0; i < firstDay.getDay(); i++) {
                var lateMonthDate = new Date(item.year, item.month - 1, lastMonthDates - i);
                dates[format$$1(lateMonthDate)] = {
                    date: false,
                    day: false,
                    className: "disabled empty"
                };
            }
            for (var i = 0; i < item.dates; i++) {
                var date_1 = new Date(item.year, item.month, i + 1);
                var formatted = format$$1(date_1);
                dates[formatted] = {
                    date: date_1.getDate(),
                    day: date_1.getDay(),
                    className: createNodeClassName({
                        date: formatted,
                        dates: range,
                        onlyActive: selection !== 2
                    })
                };
            }
            return { heading: heading, year: item.year, month: item.month, dates: dates };
        });
    };
    TypePicker.prototype.render = function (next) {
        var _a = this.state, views = _a.views, reachStart = _a.reachStart, reachEnd = _a.reachEnd, week = _a.language.week;
        this.element.innerHTML = template({
            data: this.createTemplate(),
            week: week,
            reachStart: reachStart,
            reachEnd: reachEnd,
            renderWeekOnTop: views === "auto"
        });
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
        var update = monthSwitcher(date, startDate, endDate)(this.setState.bind(this));
        if (prevActionDOM && nextActionDOM) {
            prevActionDOM.addEventListener("click", function () { return !reachStart && update(-1); });
            nextActionDOM.addEventListener("click", function () { return !reachEnd && update(1); });
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
            var includeDisabled = findDisableInQueue(queue.list, dateFormat, _this.inDisable.bind(_this));
            if (includeDisabled && selection === 2) {
                if (_this.inDisable(value)) {
                    queue.pop();
                }
                else {
                    queue.shift();
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
        var _a = this.state, selection = _a.selection, limit = _a.limit;
        if (selection !== 2) {
            for (var _i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
                var item = dates_1[_i];
                if (!this.inDisable(item)) {
                    datesList.push(item);
                }
            }
        }
        else {
            if (dates.length < selection) {
                return;
            }
            else if (dates.length > selection) {
                dates = dates.slice(0, selection);
            }
            var start = dates[0], end = dates[1];
            if (!isDate(start)) {
                start = this.parse(start);
            }
            if (!isDate(end)) {
                end = this.parse(end);
            }
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
        for (var _b = 0, datesList_1 = datesList; _b < datesList_1.length; _b++) {
            var item = datesList_1[_b];
            this.enqueue(item);
        }
    };
    TypePicker.prototype.disable = function (_a) {
        var _this = this;
        var to = _a.to, from = _a.from, days = _a.days, dates = _a.dates;
        var _b = this.state, endDate = _b.endDate, startDate = _b.startDate;
        var _c = this, parse$$1 = _c.parse, format$$1 = _c.format;
        var dateList = [];
        var state = { disables: [], startDate: startDate, endDate: endDate };
        parse$$1 = parse$$1.bind(this);
        format$$1 = format$$1.bind(this);
        var filterDay = function (day) {
            day = parseInt(day);
            return !isNaN(day) && day >= 0 && day <= 6;
        };
        var mapDateByDay = function (days) {
            return function (date) {
                if (days.indexOf(date.getDay()) >= 0) {
                    return _this.format(date);
                }
                return null;
            };
        };
        byCondition(isDate, true)(parse$$1(from))(function (date) { return (state.endDate = date); });
        byCondition(isDate, true)(parse$$1(to))(function (date) { return (state.startDate = date); });
        byCondition(isArray)(dates)(function (dates) { return (dateList = dates.map(formatParse(parse$$1)(format$$1)).filter(isDef)); });
        var unprocessable = byCondition(state.endDate < state.startDate)()();
        if (unprocessable) {
            return;
        }
        byCondition(isArray)(days)(function (days) {
            var startDateMonthFirstDate = new Date(state.startDate.getFullYear(), state.startDate.getMonth(), 1);
            var dates = createDate({
                date: startDateMonthFirstDate,
                days: diff(state.endDate, startDateMonthFirstDate, "days")
            });
            if (isArray(dates)) {
                dates = dates.map(mapDateByDay(days.filter(filterDay))).filter(isDef);
                dateList = dateList.concat(dates);
            }
        });
        state.disables = dedupList(dateList);
        if (state.startDate) {
            state.reachStart = true;
            state.date = state.startDate;
        }
        this.setState(state);
    };
    TypePicker.prototype.i18n = function (pack) {
        if (isArray(pack.days) &&
            isArray(pack.months) &&
            typeof pack.title === "function") {
            this.setState({
                language: {
                    week: pack.days,
                    months: pack.months,
                    title: pack.title
                }
            });
        }
    };
    TypePicker.between = between;
    return TypePicker;
}());

export default TypePicker;
