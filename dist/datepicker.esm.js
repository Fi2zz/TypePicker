  /*
   *  TypePicker v1.7.4
   *  Fi2zz / wenjingbiao@outlook.com
   *  https://github.com/Fi2zz/datepicker
   *  (c) 2017-2018, wenjingbiao@outlook.com
   *  MIT License
  */
  
  
var attrSelector = function (attr, value) {
    return "[" + attr + "=\"" + value + "\"]";
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
function toString(val) {
    return val == null
        ? ""
        : typeof val === "object"
            ? JSON.stringify(val, null, 2)
            : String(val);
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
    if (!ele) {
        return false;
    }
    return new RegExp("(\\s|^)" + className + "(\\s|$)").test(ele.className);
}
function addClass(ele, className) {
    if (!ele || hasClass(ele, className))
        return;
    ele.className += (ele.className ? " " : "") + className;
}
function removeClass(ele, className) {
    if (!ele || !hasClass(ele, className))
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
function simpleListToMap(list) {
    var map = {};
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var it = list_1[_i];
        map[it] = it;
    }
    return map;
}
function css(el, styles) {
    if (typeof el === "string") {
        el = document.querySelector(el);
    }
    for (var key in styles) {
        var value = styles[key];
        var curr = getComputedStyle(el, null).getPropertyValue(key);
        if (!curr || (curr && curr !== value)) {
            el.style[key] = value;
        }
    }
    return el;
}

var HTML = (function () {
    function HTML(options) {
        var renderWeekOnTop = options.renderWeekOnTop, data = options.data, week = options.week;
        return [
            this.createActionBar(!renderWeekOnTop) + "  \n             " + this.createView(data, week, renderWeekOnTop) + "\n             <div class=\"extra-panel\" style=\"display: none;\">\n                        <div class=\"year-panel\"></div>\n                        <div class=\"month-panel\"></div>\n                </div>"
        ];
    }
    HTML.prototype.createActionBar = function (create) {
        if (!create) {
            return "";
        }
        return "<div class=\"calendar-action-bar\">\n            <button class='calendar-action calendar-action-prev'><span>prev</span></button>\n            <button class='calendar-action calendar-action-next'><span>next</span></button>\n         </div>\n    ";
    };
    HTML.prototype.createMonthDateTemplate = function (dates) {
        var _this = this;
        return Object.keys(dates).map(function (item) {
            var result = dates[item];
            var day = result.day;
            var date = result.date;
            var data = {
                key: day ? item : "",
                text: "<div class=\"date\">" + (date ? date : "") + "</div><div class=\"placeholder\"></div>",
                day: day ? day : ""
            };
            var classNames = ["calendar-cell", "calendar-date-cell"];
            if (!day) {
                classNames.push("disabled", "empty");
            }
            else {
                if (day === 0) {
                    classNames.push("calendar-cell-weekend");
                }
                if (day === 6) {
                    classNames.push("calendar-cell-weekday");
                }
            }
            return _this.createNode(classNames.join(" "), data.key, data.text, data.day);
        });
    };
    HTML.prototype.createView = function (data, week, renderWeekOnTop) {
        var _this = this;
        var template = data.map(function (item) { return "\n                <div class=\"calendar-main\">\n                <div class=\"calendar-head\">\n                    <div class=\"calendar-title\">" + item.heading + "\n                </div>\n                </div>\n                " + (!renderWeekOnTop ? _this.createMonthWeek(week) : "") + "\n                <div class=\"calendar-body\">" + _this.createMonthDateTemplate(item.dates).join(" ") + "</div>\n                </div>\n            "; });
        if (renderWeekOnTop) {
            template.unshift(this.createMonthWeek(week));
        }
        return template.join("").trim();
    };
    HTML.prototype.createMonthWeek = function (language) {
        var template = language
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
    HTML.prototype.createNode = function (className, key, text, day) {
        return "<div class=\"" + className + "\"  " + (day >= 0 ? "data-day=" + day : "") + " " + (key ? "data-date=" + key : "") + ">" + text + "</div>";
    };
    return HTML;
}());
function yearPanel(data) {
    return "\n                \n                <div class=\"year-title\">\n                    <span class=\"year-prev\">prev</span>\n                    " + data.title + "\n                    <span class=\"year-next\">next</span>\n                </div>\n                <div class=\"year-list\">\n                    " + data.years.map(function (item) { return '<div class="year-cell" data-year=' + item + ' ><span>' + item + '</span></div>'; }).join("") + "            </div>";
}
function monthPanel(year, months) {
    var tem = months.map(function (item, index) { return "<div class=\"month-cell\" data-year=\"" + year + "\" data-month=\"" + index + "\"><span>" + item + "</span></div>"; }).join("");
    var yearTitle = "<div class=\"year-title\"><span>back</span>" + year + "</div>";
    return yearTitle + "<div class=\"month-list\">" + tem + "</div>";
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
        var calcu = Math.ceil(startTime - endTime) / (1000 * 60 * 60 * 24);
        result = isAbsolute ? Math.abs(calcu) : calcu;
    }
    return result;
}
var getDisableDates = function (startDate, endDate, dateFormat, should) {
    var temp = {};
    if (should) {
        if (startDate instanceof Date) {
            var startDateIndex = startDate.getDate();
            for (var i = 1; i <= startDateIndex - 1; i++) {
                var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDateIndex - i);
                var formatted = format(date, dateFormat);
                temp[formatted] = formatted;
            }
        }
        if (endDate instanceof Date) {
            var endMonthDates = getDates(endDate.getFullYear(), endDate.getMonth());
            var endDateNextMonthDate = getDates(endDate.getFullYear(), endDate.getMonth() + 1);
            var diffs = endMonthDates - endDate.getDate() + endDateNextMonthDate;
            for (var i = 1; i <= diffs; i++) {
                var date = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + i);
                var formatted = format(date, dateFormat);
                temp[formatted] = formatted;
            }
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
        if (view > 2 || views <= 0) {
            return 1;
        }
        else {
            return views;
        }
    }
}
var getClassName = function (baseClassName, views) {
    return baseClassName + " calendar calendar-" + (views === 2
        ? "double-views"
        : views === 1 ? "single-view" : "flat-view");
};
function parseEl(el) {
    if (!el) {
        return null;
    }
    return typeof el === 'string' ? document.querySelector(el) : el;
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
    return format.replace(/(?:\b|%)([dDMyY]+)(?:\b|%)/g, function (match, $1) {
        return parts[$1] === undefined ? $1 : parts[$1];
    });
}
function parse(strDate, format) {
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
    var formatRegExpTester = createDateFormatVaildator(format);
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
function createDateFormatVaildator(formate) {
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
function getDisabledDays(start, end, days, dateFormat) {
    var map = {};
    if (start && end) {
        start = new Date(start.getFullYear(), start.getMonth(), 1);
        end = new Date(end.getFullYear(), end.getMonth() + 1, getDates(end.getFullYear(), end.getMonth()));
        var gap = diff(start, end, "days", true);
        for (var i = 0; i < gap; i++) {
            var date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            var day = date.getDay();
            if (~days.indexOf(day)) {
                var formatted = format(date, dateFormat);
                map[formatted] = formatted;
            }
        }
    }
    return map;
}
var setDate = function (date, size, who) {
    if (!who) {
        who = 'date';
    }
    if (!size) {
        size = 0;
    }
    var monthSize = 0;
    var yearSize = 0;
    var dateSize = size;
    if (who === 'year') {
        yearSize = size;
    }
    else if (who === 'month') {
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

var DatePicker = (function () {
    function DatePicker(option) {
        var _this = this;
        this.dateFormat = null;
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
        this.canSelectLength = 1;
        this.language = {
            title: function (year, month) {
                return year + "\u5E74 " + _this.language.months[month] + "\u6708";
            },
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
        this.format = format;
        this.parse = parse;
        var canInit = this.beforeInit(option);
        if (!canInit) {
            return;
        }
        this.bindListener();
        this.init();
    }
    DatePicker.prototype.on = function (ev, cb) {
        return Observer.$on(ev, cb);
    };
    DatePicker.prototype.emit = function (ev, arg) {
        return Observer.$emit(ev, arg);
    };
    DatePicker.prototype.setDates = function (dates) {
        if (!isArray(dates))
            return;
        var datesList = [];
        var start = "", end = "";
        if (this.doubleSelect) {
            if (dates.length > 2) {
                dates = dates.slice(0, 2);
            }
            start = dates[0];
            end = dates[dates.length - 1];
            var startDate = isDate(start)
                ? start
                : this.parse(start, this.dateFormat);
            var endDate = isDate(end) ? end : this.parse(end, this.dateFormat);
            datesList = [this.format(startDate, this.dateFormat)];
            if (start !== end) {
                datesList.push(this.format(endDate, this.dateFormat));
            }
        }
        else {
            var d = dates[dates.length - 1];
            datesList = [isDate(d) ? this.format(d, this.dateFormat) : d];
        }
        this.selected = datesList;
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
                    return _this.format(date, _this.dateFormat);
                }
                else {
                    var parsed = _this.parse(date, _this.dateFormat);
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
            fromDate = setDate(fromDate);
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
            toDate = setDate(toDate);
        }
        var dayList = isArray(param.days)
            ? param.days.filter(function (item) {
                var parsed = parseToInt(item);
                return !isNaN(parsed) && parsed >= 0 && parsed <= 6;
            })
            : [];
        Object.defineProperty(this, "disabledTemp", {
            configurable: true,
            writable: true,
            enumerable: true,
            value: {
                dayList: dayList,
                dateList: dateList,
                disableAfter: fromDate,
                disableBefore: toDate
            }
        });
    };
    DatePicker.prototype.setLanguage = function (pack) {
        if (isArray(pack.days) &&
            isArray(pack.months) &&
            typeof pack.title === "function") {
            this.language = {
                week: pack.days,
                months: pack.months,
                title: pack.title
            };
        }
    };
    DatePicker.prototype.setData = function (cb) {
        if (isFunction(cb) && this.canSelectLength <= 1) {
            var result = cb();
            if (isPlainObject(result) && Object.keys(result).length > 0) {
                var map = {};
                for (var key in result) {
                    var date = this.parse(key, this.dateFormat);
                    if (date instanceof Date) {
                        map[key] = result[key];
                    }
                }
                this.data = map;
            }
            else {
                var key = this.format(new Date(), this.dateFormat);
                warn("setData", "you are passing wrong type of data to DatePicker,data should be like :\n          \n                    {" + key + ":\"value\"}");
            }
        }
    };
    DatePicker.prototype.createMonths = function (date) {
        var _this = this;
        var monthSize = this.views == 2
            ? 1
            : this.views === "auto"
                ? diff(this.endDate, this.startDate)
                : 0;
        var template = [];
        for (var i = 0; i <= monthSize; i++) {
            var dat = new Date(date.getFullYear(), date.getMonth() + i, 1);
            var dates = getDates(dat.getFullYear(), dat.getMonth());
            template.push({
                dates: dates,
                year: dat.getFullYear(),
                month: dat.getMonth()
            });
        }
        return template.map(function (item) {
            var dates = {};
            var firstDay = new Date(item.year, item.month, 1);
            var lastMonthDates = new Date(item.year, item.month, 0).getDate();
            for (var i = 0; i < firstDay.getDay(); i++) {
                var lateMonthDate = new Date(item.year, item.month - 1, lastMonthDates - i);
                var formatted = _this.format(lateMonthDate, _this.dateFormat);
                dates[formatted] = { date: false, day: false };
            }
            for (var i = 0; i < item.dates; i++) {
                var date_1 = new Date(item.year, item.month, i + 1);
                var formatted = _this.format(date_1, _this.dateFormat);
                dates[formatted] = {
                    date: "" + date_1.getDate(),
                    day: "" + date_1.getDay()
                };
            }
            return {
                heading: _this.language.title(item.year, item.month),
                dates: dates
            };
        });
    };
    DatePicker.prototype.render = function (data, renderWeekOnTop) {
        var template = new HTML({
            renderWeekOnTop: renderWeekOnTop,
            data: data,
            week: this.language.week
        });
        this.element.innerHTML = template[0];
        var prev = this.element.querySelector(".calendar-action-prev");
        var next = this.element.querySelector(".calendar-action-next");
        if (prev && next) {
            var endGap = this.endDate ? diff(this.endDate, this.date) : 1;
            var startGap = this.endDate ? diff(this.date, this.startDate) : 2;
            if (startGap >= 1) {
                prev.addEventListener("click", function () {
                    Observer.$emit("render", { type: "switch", size: -1 });
                    removeClass(next, "disabled calendar-action-disabled");
                });
            }
            else {
                addClass(prev, "disabled calendar-action-disabled");
            }
            if (endGap >= 1) {
                next.addEventListener("click", function () {
                    Observer.$emit("render", { type: "switch", size: 1 });
                    removeClass(prev, "disabled calendar-action-disabled");
                });
            }
            else {
                addClass(next, "disabled calendar-action-disabled");
            }
        }
    };
    DatePicker.prototype.renderYearPanel = function (visible) {
        var _this = this;
        var createPanel = function (years) {
            var title = years[0] + " - " + years[years.length - 1];
            yearPanelNode.innerHTML = yearPanel({
                years: years,
                title: title
            });
            var yearPrevAction = _this.element.querySelector(".year-prev");
            var yearNextAction = _this.element.querySelector(".year-next");
            yearPrevAction.addEventListener("click", function () {
                var dateString = _this.date.toString();
                var startDate = years[0] - 11;
                var date = new Date(dateString);
                date.setFullYear(startDate);
                createPanel(createYearsList(date));
            });
            yearNextAction.addEventListener("click", function () {
                var dateString = _this.date.toString();
                var startDate = years[years.length - 1] + 11;
                var date = new Date(dateString);
                date.setFullYear(startDate);
                createPanel(createYearsList(date));
            });
            var yearCell = _this.element.querySelectorAll(".year-cell");
            var _loop_1 = function (i) {
                var cell = yearCell[i];
                cell.addEventListener("click", function () {
                    var year = parseInt(attr(cell, "data-year"));
                    _this.date.setFullYear(year);
                    css(".year-panel", { display: "none" });
                    css(".month-panel", { display: "block" });
                    _this.renderMonthPanel(true);
                });
            };
            for (var i = 0; i < yearCell.length; i++) {
                _loop_1(i);
            }
        };
        var createYearsList = function (date) {
            var year = date.getFullYear();
            var start = year - 11;
            var end = year;
            var years = [];
            for (var i = start; i <= end; i++) {
                years.push(i);
            }
            return years;
        };
        var years = createYearsList(this.date);
        var yearPanelNode = this.element.querySelector(".year-panel");
        css(".extra-panel", { display: visible ? "block" : "none" });
        css(".year-panel", { display: visible ? "block" : "none" });
        createPanel(years);
    };
    DatePicker.prototype.renderMonthPanel = function (visible) {
        var _this = this;
        var month = this.element.querySelector(".month-panel");
        css(".year-panel", { display: "none" });
        month.style.display = visible ? "block" : "none";
        month.innerHTML = monthPanel(this.date.getFullYear(), this.language.months);
        var monthNodes = month.querySelectorAll(".month-cell");
        var back = month.querySelector(".year-title span");
        back.addEventListener("click", function () {
            css(".year-panel", { display: "block" });
            css(".month-panel", { display: "none" });
        });
        var _loop_2 = function (i) {
            var cell = monthNodes[i];
            cell.addEventListener("click", function () {
                var month = parseInt(attr(cell, "data-month"));
                css(".extra-panel", { display: "none" });
                css(".month-panel", { display: "none" });
                css(".year-panel", { display: "none" });
                _this.date.setMonth(month);
                Observer.$emit("render", { type: "select-month" });
            });
        };
        for (var i = 0; i < monthNodes.length; i++) {
            _loop_2(i);
        }
    };
    DatePicker.prototype.getRange = function (data) {
        var startDate = getFront(data);
        var endDate = getPeek(data);
        var invalidDates = [];
        var validDates = [];
        var limit = this.limit;
        var outOfRange = false;
        if (startDate && endDate) {
            var start = void 0;
            var end = void 0;
            if (!isDate(startDate)) {
                start = this.parse(startDate, this.dateFormat);
            }
            else {
                start = startDate;
            }
            if (!isDate(endDate)) {
                end = this.parse(endDate, this.dateFormat);
            }
            else {
                end = endDate;
            }
            var gap = diff(end, start, "days");
            if (gap <= limit) {
                for (var i = 0; i < gap; i++) {
                    var date = setDate(start, i);
                    var formatted = this.format(date, this.dateFormat);
                    if (this.disables[formatted]) {
                        invalidDates.push(formatted);
                    }
                    else {
                        if (formatted !== startDate && formatted !== endDate) {
                            validDates.push(formatted);
                        }
                    }
                }
            }
            else {
                outOfRange = true;
            }
        }
        return {
            invalidDates: invalidDates,
            validDates: validDates,
            outOfRange: outOfRange
        };
    };
    DatePicker.prototype.initDisabled = function (bindData) {
        var disabledDays = [], disableDates = [];
        if (!isUndefined(this["disabledTemp"])) {
            var _a = this["disabledTemp"], dateList = _a.dateList, disableBefore = _a.disableBefore, disableAfter = _a.disableAfter, dayList = _a.dayList;
            if (disableBefore) {
                this.startDate = disableBefore;
            }
            if (disableAfter) {
                this.endDate = disableAfter;
            }
            disableDates = dateList;
            disabledDays = dayList;
        }
        this.disables = merge(getDisableDates(this.startDate, this.endDate, this.dateFormat, bindData), getDisabledDays(this.startDate, this.endDate, disabledDays, this.dateFormat), simpleListToMap(disableDates));
    };
    DatePicker.prototype.init = function () {
        var _this = this;
        nextTick(function () {
            var bindData = !isEmpty(_this.data) && _this.canSelectLength < 2;
            _this.date = isUndefined(_this.startDate) ? new Date() : _this.startDate;
            _this.initDisabled(bindData);
            if (bindData) {
                var data = _this.data;
                _this.endDate = _this.parse(getPeek(Object.keys(data)), _this.dateFormat);
                var gap = diff(_this.startDate, _this.endDate, "days", true);
                for (var i = 0; i < gap; i++) {
                    var date = setDate(_this.startDate, i);
                    var formatted = _this.format(date, _this.dateFormat);
                    if (isUndefined(data[formatted])) {
                        _this.disables[formatted] = formatted;
                    }
                    else if (!isUndefined(_this.disables[formatted])) {
                        delete data[formatted];
                    }
                }
                _this.data = data;
            }
            _this.element.className = _this.element.className + " " + (bindData ? "with-data" : "no-data");
            var front = getFront(_this.selected);
            var peek = getPeek(_this.selected);
            var initRange = _this.getRange(_this.selected);
            var canInitWithSelectedDatesWhenDataBinding = function (range, bindData) {
                return ((range.invalidDates.length > 0 ||
                    range.outOfRange ||
                    range.validDates.length <= 0) &&
                    bindData);
            };
            if (canInitWithSelectedDatesWhenDataBinding(initRange, bindData) ||
                initRange.outOfRange) {
                if (initRange.outOfRange) {
                    warn("setDates", "[" + _this.selected + "] out of limit:" + _this.limit);
                }
                else {
                    warn("setDates", "Illegal dates [" + _this.selected + "]");
                }
                _this.selected = [];
            }
            if (_this.views === "auto") {
                if (!isEmpty(_this.selected)) {
                    _this.date = _this.parse(getFront(_this.selected), _this.dateFormat);
                }
                if (isUndefined(_this.startDate)) {
                    _this.startDate = _this.date;
                }
                if (isUndefined(_this.endDate)) {
                    _this.endDate = setDate(_this.date, 6, "month");
                }
            }
            if (_this.views === 1) {
                if (_this.doubleSelect && _this.selected.length >= 2) {
                    if (front === peek) {
                        _this.selected.pop();
                    }
                }
            }
            Observer.$emit("render", { type: "init" });
            Observer.$emit("ready");
        });
    };
    DatePicker.prototype.beforeInit = function (option) {
        if (!option || !parseEl(option.el)) {
            return false;
        }
        this.element = parseEl(option.el);
        this.views = getViews(option.views);
        this.element.className = getClassName(this.element.className, this.views);
        this.doubleSelect =
            isBoolean(option.doubleSelect) && option.doubleSelect === true;
        var selection = parseToInt(option.selection);
        var isMultiSelect = false;
        if (option.selection && !isNaN(selection) && selection >= 2) {
            this.canSelectLength = selection;
            isMultiSelect = true;
        }
        if (this.canSelectLength >= 2) {
            this.doubleSelect = false;
        }
        this.dateFormat = option.format;
        if (!isUndefined(option.startDate) && isDate(option.startDate)) {
            this.startDate = option.startDate;
        }
        if (!isUndefined(option.endDate) && isDate(option.endDate)) {
            this.endDate = option.endDate;
        }
        this.limit = this.doubleSelect
            ? !isNaN(option.limit)
                ? option.limit
                : 2
            : 1;
        if (isMultiSelect) {
            this.limit = this.canSelectLength;
        }
        return true;
    };
    DatePicker.prototype.giveMeTheWheel = function (callback) {
        if (callback && typeof callback === "function") {
            Object.defineProperty(this, "driver", {
                configurable: true,
                enumerable: true,
                writable: true,
                value: callback
            });
        }
    };
    DatePicker.prototype.bindListener = function () {
        var _this = this;
        Observer.$on("select", function (result) {
            var type = result.type, value = result.value;
            if (type === "disabled") {
                return false;
            }
            if (type === "selected") {
                _this.selected = value;
            }
            if (type !== "switch") {
                Observer.$emit("update", result);
            }
            if (isUndefined(_this["driver"])) {
                var currRange = _this.getRange(value);
                setNodeRangeState(_this.element, currRange.validDates, _this.doubleSelect);
                setNodeActiveState(_this.element, value, _this.doubleSelect);
            }
        });
        Observer.$on("render", function (result) {
            var type = result.type;
            if (type !== "init") {
                _this.initDisabled(!isEmpty(_this.data));
            }
            if (type === "switch") {
                _this.date = setDate(_this.date, result.size, "month");
            }
            if (type === "custom" && result.value) {
                _this.date = setDate(result.value);
            }
            _this.render(_this.createMonths(_this.date), _this.views === "auto");
            Observer.$emit("select", {
                type: type,
                value: _this.selected
            });
            Observer.$emit("rendered");
        });
        Observer.$on("renderYearPanel", function (result) {
            return _this.renderYearPanel(result);
        });
        Observer.$on("renderMonthPanel", function (result) { return _this.renderMonthPanel(result); });
        Observer.$on("rendered", function () {
            var bindData = !isEmpty(_this.data) && _this.canSelectLength < 2;
            var isDoubleSelect = _this.doubleSelect;
            var cache = _this.selected;
            var isDisabled = function (date) { return !!_this.disables[date]; };
            var selected = _this.selected;
            var pickDate = function (date) {
                var type = "selected";
                if (!date) {
                    return {
                        type: "disabled",
                        value: []
                    };
                }
                var index = selected.indexOf(date);
                var isDisabledDate = isDisabled(date);
                var now = _this.parse(date, _this.dateFormat);
                var prevDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                var prevDateIsInValid = isDisabled(_this.format(prevDate, _this.dateFormat));
                if ((bindData && selected.length <= 0 && isDisabledDate) ||
                    (isDoubleSelect && prevDateIsInValid && isDisabledDate) ||
                    (index >= 0 && isDisabledDate)) {
                    return {
                        type: "disabled",
                        value: []
                    };
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
                        var diffed = diff(_this.parse(peek, _this.dateFormat), _this.parse(front, _this.dateFormat), "days", false);
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
                            var range = _this.getRange(selected);
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
                return {
                    type: type,
                    value: selected
                };
            };
            var multiPick = function (date) {
                var index = selected.indexOf(date);
                var isDisabledDate = isDisabled(date);
                if (!date || isDisabledDate) {
                    return {
                        type: "disabled",
                        value: selected
                    };
                }
                if (index >= 0) {
                    var temp = [];
                    for (var i = 0; i < selected.length; i++) {
                        if (selected[i] !== date) {
                            temp.push(selected[i]);
                        }
                    }
                    selected = temp;
                }
                else {
                    selected.push(date);
                }
                if (selected.length > _this.limit) {
                    selected = [date];
                }
                return {
                    type: "selected",
                    value: selected
                };
            };
            var nodeList = _this.element.querySelectorAll(".calendar-cell");
            if (!isEmpty(_this.disables)) {
                Observer.$emit("disabled", {
                    nodeList: nodeList,
                    dateList: _this.disables
                });
            }
            if (bindData) {
                Observer.$emit("data", {
                    data: _this.data,
                    nodeList: nodeList
                });
            }
            if (isUndefined(_this["driver"])) {
                var _loop_3 = function (i) {
                    var node = nodeList[i];
                    node.addEventListener("click", function () {
                        var date = attr(node, "data-date");
                        Observer.$emit("select", _this.canSelectLength > 2 ? multiPick(date) : pickDate(date));
                    });
                };
                for (var i = 0; i < nodeList.length; i++) {
                    _loop_3(i);
                }
            }
            else {
                var emitData = {
                    disables: _this.disables,
                    data: _this.data,
                    element: _this.element,
                    date: _this.date,
                    startDate: _this.startDate,
                    endDate: _this.endDate,
                    limit: _this.limit,
                    doubleSelect: _this.doubleSelect,
                    dateFormat: _this.dateFormat,
                    selected: _this.selected,
                    emit: _this.emit
                };
                _this["driver"](nodeList, emitData);
            }
            if (!_this.startDate && !_this.endDate) {
                _this.element
                    .querySelector(".calendar-title")
                    .addEventListener("click", function () {
                    return Observer.$emit("renderYearPanel", true);
                });
            }
        });
        Observer.$on("custom", function (result) {
            if (!result.value) {
                Observer.$remove("custom");
                return false;
            }
            Observer.$emit("render", result);
        });
    };
    return DatePicker;
}());

export default DatePicker;

  