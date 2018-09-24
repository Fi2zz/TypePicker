  
    /*
    *  TypePicker v2.0.7
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
var padding = function (n) { return "" + (n > 9 ? n : "0" + n); };
function _toString(object) {
    return Object.prototype.toString.call(object);
}

function isUndefined(v) {
    return v === undefined || v === null;
}

function isArray(object) {
    return _toString(object) === "[object Array]";
}
function isPlainObject(object) {
    return _toString(object) === "[object Object]";
}

function isDate(object) {
    return _toString(object) === "[object Date]";
}


function warn(where, msg) {
    var message = msg;
    if (isPlainObject(msg) || isArray(msg)) {
        message = JSON.stringify(msg);
    }
    console.error("[" + where + "] " + message + " ");
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
    var selected = _a.selected, selection = _a.selection, date = _a.date, inDisable = _a.inDisable, dateFormat = _a.dateFormat, queue = _a.queue, limit = _a.limit;
    if (!date) {
        return false;
    }
    if (inDisable(date)) {
        if (selection === 2) {
            var gap = diff(parse(date, dateFormat), parse(listTail(selected), dateFormat), "days");
            if (selected.length <= 0 || gap <= 0 || queue.length >= selection) {
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
    var renderWeekOnTop = _a.renderWeekOnTop, data = _a.data, week = _a.week, extraPanel = _a.extraPanel, reachEnd = _a.reachEnd, reachStart = _a.reachStart;
    var nodes = createActionBar(!renderWeekOnTop, reachStart, reachEnd).concat([
        createView(data, week, renderWeekOnTop)
    ]);
    if (extraPanel) {
        var heading = function (type) {
            if (type !== "month") {
                return "";
            }
            var item = extraPanel.list.filter(function (item) { return item.active; }).pop();
            return createNode({
                tag: "h3",
                children: item.year
            });
        };
        var extraPanelList = extraPanel.list.map(function (item) {
            return createNode({
                tag: "div",
                props: {
                    class: "extra-item" + (item.active ? " active" : "")
                },
                children: createNode({ tag: "span", children: item.displayName })
            });
        });
        nodes.push(createNode({
            tag: "div",
            props: {
                class: "extra-panel extra-panel-" + extraPanel.type
            },
            children: [
                heading(extraPanel.type),
                createNode({
                    tag: "div",
                    children: extraPanelList
                })
            ]
        }));
    }
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
        var l = this.list.slice(start, end);
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

var emitter = function (event) { return function (type, value) {
    return Observer.$emit(event, { type: type, value: value });
}; };
var queue = null;
var TypePicker = (function () {
    function TypePicker(option) {
        var _this = this;
        this.state = {
            bindData: false,
            selection: 1,
            views: 1,
            date: new Date(),
            startDate: null,
            endDate: null,
            data: {},
            selected: [],
            reachEnd: false,
            reachStart: false,
            dateFormat: null,
            limit: 1,
            disables: [],
            language: defaultLanguage
        };
        this.element = null;
        this.on = Observer.$on;
        this.format = function (date) { return format(date, _this.state.dateFormat); };
        this.parse = function (date) { return parse(date, _this.state.dateFormat); };
        if (!option || !parseEl(option.el)) {
            return;
        }
        this.element = parseEl(option.el);
        var states = {
            selection: option.selection || 1,
            dateFormat: option.format,
            views: getViews(option.views)
        };
        if (isDate(option.startDate)) {
            states.startDate = option.startDate;
        }
        if (isDate(option.endDate)) {
            states.endDate = option.endDate;
        }
        if (option.limit) {
            states.limit = option.limit ? option.limit : 1;
        }
        if (states.startDate) {
            states.reachStart = true;
        }
        this.element.className = containerClassName(this.element.className, states.views);
        this.state = __assign({}, this.state, states);
        queue = new Queue({
            size: this.state.selection,
            limit: this.state.selection === 2 ? this.state.limit : false,
            dateFormat: this.state.dateFormat
        });
        states.selected = queue.list;
        this.create();
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
    TypePicker.prototype.setDates = function (dates) {
        if (!isArray(dates))
            return;
        var datesList = [];
        var start = "", end = "";
        if (this.state.selection === 2) {
            if (dates.length > 2) {
                dates = dates.slice(0, 2);
            }
            start = dates[0];
            end = dates[dates.length - 1];
            var startDate = isDate(start) ? start : this.parse(start);
            var endDate = isDate(end) ? end : this.parse(end);
            datesList = [this.format(startDate)];
            if (start !== end) {
                datesList.push(this.format(endDate));
            }
            var d = new Date();
            var currDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            if (startDate < currDate ||
                endDate < currDate ||
                startDate > this.state.endDate ||
                endDate > this.state.endDate) {
                warn("setDates", "selected dates are illegal");
                datesList = [];
            }
        }
        else {
            var d = dates[dates.length - 1];
            datesList = [isDate(d) ? this.format(d) : d];
        }
        this.setState({
            selected: datesList
        });
    };
    TypePicker.prototype.createTemplate = function () {
        var _this = this;
        var _a = this.state, date = _a.date, selected = _a.selected, dateFormat = _a.dateFormat, views = _a.views, endDate = _a.endDate, startDate = _a.startDate, selection = _a.selection;
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
        var range = (function (selected, selection) {
            if (!selected || selected.length <= 0) {
                return [];
            }
            if (selection > 2) {
                return selected;
            }
            var start = _this.parse(selected[0]);
            var end = _this.parse(selected[selected.length - 1]);
            return createDate({
                date: start,
                days: diff(end, start, "days"),
                dateFormat: dateFormat
            });
        })(selected, selection);
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
            return {
                heading: heading,
                year: item.year,
                month: item.month,
                dates: dates
            };
        });
    };
    TypePicker.prototype.render = function (next) {
        var _a = this.state, views = _a.views, reachStart = _a.reachStart, reachEnd = _a.reachEnd, week = _a.language.week;
        this.element.innerHTML = template({
            data: this.createTemplate(),
            week: week,
            extraPanel: null,
            reachStart: reachStart,
            reachEnd: reachEnd,
            renderWeekOnTop: views === "auto"
        });
        this.afterRender(next);
    };
    TypePicker.prototype.inDisable = function (date) {
        return this.state.disables.indexOf(date) >= 0;
    };
    TypePicker.prototype.afterRender = function (after) {
        var _this = this;
        var _a = this.state, dateFormat = _a.dateFormat, selected = _a.selected, selection = _a.selection, date = _a.date, reachStart = _a.reachStart, reachEnd = _a.reachEnd, endDate = _a.endDate, disables = _a.disables, startDate = _a.startDate;
        typeof after === "function" && after(this.state);
        var dom = function (selector) { return $(_this.element, selector); };
        var nodeList = dom(".calendar-cell");
        var prev = dom(".calendar-action-prev");
        var next = dom(".calendar-action-next");
        var updater = function (size) {
            var now = setDate(date, size, "month");
            var endGap = endDate ? diff(endDate, now) : 1;
            var startGap = endDate ? diff(now, startDate) : 2;
            var reachStart = startGap < 1 && endGap >= 1;
            var reachEnd = startGap >= 1 && endGap < 1;
            _this.setState({
                reachEnd: reachEnd,
                reachStart: reachStart,
                date: now
            });
        };
        if (prev && next) {
            prev.addEventListener("click", function () {
                if (reachStart) {
                    return;
                }
                updater(-1);
            });
            next.addEventListener("click", function () {
                if (reachEnd) {
                    return;
                }
                updater(1);
            });
        }
        Observer.$emit("disabled", {
            nodeList: nodeList,
            dateList: disables
        });
        var inDisable = function (date) { return _this.inDisable(date); };
        var _loop_1 = function (i) {
            nodeList[i].addEventListener("click", function () {
                var date = attr(nodeList[i], "data-date");
                var pickable = checkPickableDate({
                    date: date,
                    queue: queue.list,
                    dateFormat: dateFormat,
                    selected: selected,
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
    TypePicker.prototype.setDisabled = function (_a) {
        var _this = this;
        var to = _a.to, from = _a.from, days = _a.days, dates = _a.dates;
        var state = {};
        var endDate = this.state.endDate;
        var dateList = [];
        if (isArray(dates)) {
            dateList = dates.map(function (date) {
                return _this.format(_this.parse(date));
            });
        }
        if (isArray(days)) {
            var dayList_1 = days.filter(function (item) {
                var parsed = parseToInt(item);
                return !isNaN(parsed) && parsed >= 0 && parsed <= 6;
            });
            var d = new Date();
            var startDate = new Date(d.getFullYear(), 0, 0);
            var dates_1 = createDate({
                date: startDate,
                days: diff(endDate, startDate, "days")
            });
            if (isArray(dates_1)) {
                dates_1 = dates_1.map(function (item) {
                    if (dayList_1.indexOf(item.getDay()) >= 0) {
                        dateList.push(_this.format(item));
                    }
                });
            }
        }
        if (isDate(from)) {
            state.endDate = from;
        }
        else {
            var parsed = this.parse(from);
            if (isDate(parsed)) {
                state.endDate = parsed;
            }
        }
        if (isDate(to)) {
            state.endDate = to;
        }
        else {
            var parsed = this.parse(to);
            if (isDate(parsed)) {
                state.endDate = setDate(parsed);
            }
        }
        this.setState(__assign({}, state, { disables: dateList }));
    };
    TypePicker.prototype.enqueue = function (value) {
        var _this = this;
        var _a = this.state, selection = _a.selection;
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
            var setSelected = function (prevState) { return (__assign({}, prevState, { selected: queue.list })); };
            var createEmitter = function (state) {
                return emitter("update")("selected", state.selected);
            };
            _this.setState(setSelected, createEmitter);
        };
        next(afterEnqueue);
    };
    TypePicker.prototype.create = function () {
        var _this = this;
        var states = {
            disables: {},
            selected: this.state.selected
        };
        var bindData = this.state.bindData;
        var validateData = function (_a) {
            var disables = _a.disables, data = _a.data, startDate = _a.startDate, endDate = _a.endDate;
            var output = {
                disables: disables,
                data: data,
                endDate: endDate
            };
            if (bindData) {
                var gap = diff(startDate, endDate, "days", true);
                for (var i = 0; i < gap; i++) {
                    var date = _this.format(setDate(startDate, i));
                    if (isUndefined(data[date])) {
                        disables[date] = date;
                    }
                    else {
                        delete data[date];
                    }
                }
                endDate = _this.parse(listTail(Object.keys(data)));
                output.data = data;
                output.endDate = endDate;
            }
            else {
                output.data = {};
            }
            return output;
        };
        var setViewDate = function () {
            if (_this.state.selected.length > 0) {
                return _this.parse(listHead(_this.state.selected));
            }
            else {
                return _this.state.startDate ? new Date() : _this.state.startDate;
            }
        };
        var _a = validateData(this.state), disables = _a.disables, data = _a.data, endDate = _a.endDate;
        if (endDate) {
            states.endDate = endDate;
        }
        this.setState(__assign({}, states, { date: setViewDate() }));
    };
    TypePicker.diff = diff;
    return TypePicker;
}());

export default TypePicker;

      