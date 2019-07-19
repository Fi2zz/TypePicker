/*!
 * TypePicker v6.1.4
 * 2019/7/17
 * A Typescript Datepicker
 * (c) 2017-2019,Fi2zzz <wenjingbiao@outlook.com>
 * https://github.com/Fi2zz/datepicker
 * MIT License
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TypePicker"] = factory();
	else
		root["TypePicker"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
exports.isDef = function (v) { return v !== undefined && v !== null; };
exports.isBool = function (v) { return typeof v === "boolean"; };
exports.isEmpty = function (v) { return !exports.isDef(v) || v == ""; };
exports.isDate = function (object) { return object instanceof Date; };
exports.isPositiveInteger = function (input) {
    return /^[1-9]?[0-9]+$/.test(input);
};
exports.logger = function (log) {
    if (false) {}
};
function match(input) {
    return function (next) {
        var condition = input.condition, value = input.value, expected = input.expected;
        expected = expected || true;
        var output = (typeof condition === "function" ? condition(value) : condition) ===
            expected;
        if (typeof next === "function" && output) {
            return next(value);
        }
    };
}
exports.match = match;
exports.List = {
    slice: function (list, start, end) {
        return exports.List.isList(list) ? list.slice(start, end) : [];
    },
    reduce: function (list, reducer, initValue) { return list.reduce(reducer, initValue); },
    filter: function (list, filter) { return list.filter(filter); },
    map: function (input, map, filter) {
        if (!exports.List.isList(input)) {
            return [];
        }
        var list = input.map(function (item, index) { return map(item, index); });
        if (!filter) {
            return list;
        }
        return list.filter(filter);
    },
    create: function (size, filled) {
        filled = filled || undefined;
        var list = [];
        if (!size || size === 0) {
            return list;
        }
        for (var i = 0; i < size; i++) {
            list.push(typeof filled === "function" ? filled(i) : filled);
        }
        return list;
    },
    dedup: function (list, key) {
        var map = {};
        if (list.length <= 0) {
            return [];
        }
        return list.reduce(function (acc, currItem) {
            var curr = currItem;
            if (key) {
                if (typeof key === "function") {
                    curr = key(curr, map);
                }
                else {
                    curr = currItem[key];
                }
            }
            if (!map[curr]) {
                map[curr] = 1;
                acc.push(curr);
            }
            return acc;
        }, []);
    },
    string: function (list, split) {
        if (!split) {
            split = "";
        }
        if (!exports.List.isList(list)) {
            return split;
        }
        return list.join(split);
    },
    empty: function (list) {
        list = [];
    },
    isEmpty: function (list) { return exports.List.isList(list) && list.length <= 0; },
    loop: function (list, looper) {
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var item = list_1[_i];
            var index = list.indexOf(item);
            looper(item, index, list);
        }
    },
    every: function (list, handler) {
        if (!exports.List.isList(list) || list.length <= 0) {
            return false;
        }
        return list.every(handler);
    },
    inRange: function (list, value, handler) {
        if (!exports.List.isList(list) || list.length <= 0) {
            return false;
        }
        var index = list.indexOf(value);
        return handler(index, list);
    },
    isList: function (list) { return list instanceof Array; },
    includes: function (list, item) {
        var hasIncludes = typeof list.includes == "function";
        return hasIncludes ? list.includes(item) : list.indexOf(item) >= 0;
    },
    fetch: function (list, index) {
        if (index === void 0) { index = 0; }
        return list[index];
    },
    fetchEnd: function (list) {
        return exports.List.fetch(list, list.length - 1);
    },
    fetchTop: function (list) {
        return exports.List.fetch(list, 0);
    }
};
exports.Dat = {
    firstDate: function (date, index) {
        return new Date(date.getFullYear(), date.getMonth() + index, 1);
    },
    dates: function (date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)).getUTCDate();
    }
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
exports.DOMHelpers = {
    select: function (selector, selector$2) {
        if (typeof selector !== "string" && !selector$2) {
            return selector;
        }
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
    },
    attr: function (el, attr) { return el.getAttribute(attr); },
    "class": {
        cell: function (index) {
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
            return names.join(" ").trim();
        },
        container: function (viewType) {
            return ["calendar", "calendar-" + viewType].join("  ").trim();
        }
    }
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var util_1 = __webpack_require__(0);
exports.padding = function (n) { return "" + (n > 9 ? n : "0" + n); };
function classname(options) {
    var isActive = options.isActive, isStart = options.isStart, isEnd = options.isEnd, isDisabled = options.isDisabled, inRange = options.inRange, isEmpty = options.isEmpty;
    if (isEmpty) {
        return "empty disabled";
    }
    var className = "";
    if (isActive) {
        className = "active";
        if (isStart) {
            className = "active start-date";
        }
        else if (isEnd) {
            className = "active end-date";
        }
    }
    if (inRange) {
        return "in-range";
    }
    if (isDisabled && !isActive) {
        className = "disabled";
    }
    return className;
}
exports.classname = classname;
function timeDiff(start, end, type, isAbsolute) {
    if (type === void 0) { type = "month"; }
    var result;
    if (!util_1.isDate(start) || !util_1.isDate(end)) {
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
exports.timeDiff = timeDiff;
exports.diffDates = function (first, second, isAbsolute) {
    return timeDiff(first, second, "days", isAbsolute);
};
exports.diffMonths = function (first, second, isAbsolute) {
    return timeDiff(first, second, "month", isAbsolute);
};
function format(date, format) {
    if (!util_1.isDate(date)) {
        return null;
    }
    if (!format) {
        format = "YYYY-MM-DD";
    }
    format = format.toUpperCase();
    var parts = {
        YYYY: date.getFullYear(),
        DD: exports.padding(date.getDate()),
        MM: exports.padding(date.getMonth() + 1),
        D: date.getDate(),
        M: date.getMonth() + 1
    };
    return format.replace(/(?:\b|%)([dDMyY]+)(?:\b|%)/g, function ($1) {
        return parts[$1] === undefined ? $1 : parts[$1];
    });
}
exports.format = format;
function parse(strDate, format) {
    if (util_1.isDate(strDate)) {
        return strDate;
    }
    if (!strDate ||
        !createDateFormatRegExpression(format).test(strDate)) {
        return null;
    }
    function parse(string) {
        if (!string)
            return new Date();
        if (string instanceof Date)
            return string;
        var split = string.split(/\W/).map(function (item) { return parseInt(item, 10); });
        var date = new Date(split.join(" "));
        if (!date.getTime())
            return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
        YYYY: [/\d{4}/, function (d, v) { return (d.year = parseInt(v)); }]
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
exports.parse = parse;
function formatHeading(format, year, month) {
    return format
        .toLowerCase()
        .replace(/y{1,}/g, exports.padding(year))
        .replace(/m{1,}/g, month);
}
exports.formatHeading = formatHeading;
var ALPHABET_AND_NUMBER_RE = /[A-Za-z0-9]/g;
function createDateFormatRegExpression(format) {
    var separator = format.replace(ALPHABET_AND_NUMBER_RE, "").trim();
    var result = format
        .split(/\W/)
        .map(function (string, index) {
        var length = string.length;
        var sep = index - 1 === -1
            ? ""
            : separator[index - 1]
                ? separator[index - 1]
                : "";
        var partial = "";
        if (index === 0) {
            partial = "(^[0-9]{" + length + "})";
        }
        else if (index === 1) {
            var suffix = "[1-9]|1[0-2]";
            var prefix = "" + (length === 1 ? "" : "0");
            partial = "(" + prefix + suffix + ")";
        }
        else if (index === 2) {
            var group$1 = ((length === 2 ? 0 : "") + "[1-9]").trim();
            var group$2 = "(1|2)[0-9]";
            var group$3 = "30|31";
            partial = ("((" + group$1 + ")|(" + group$2 + ")|(" + group$3 + "))").trim();
        }
        return sep + partial;
    })
        .join("");
    return new RegExp(result + "$");
}
function createDates(date, size) {
    var result = [];
    if (!util_1.isDate(date)) {
        return result;
    }
    for (var i = 0; i <= size; i++) {
        var currYear = date.getFullYear();
        var currMonth = date.getMonth();
        var currDate = date.getDate();
        currDate = currDate + i;
        result.push(new Date(currYear, currMonth, currDate));
    }
    return result;
}
function i18nValidator(i18n, next) {
    if (util_1.isDef(i18n) &&
        util_1.List.isList(i18n.days) &&
        util_1.List.isList(i18n.months) &&
        typeof i18n.title === "string") {
        next(i18n);
    }
}
exports.i18nValidator = i18nValidator;
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
exports.publish = function (event, value) {
    return Observer.publish(event, value);
};
exports.subscribe = Observer.subscribe;
exports.useViewTypes = function (views) {
    var result = {
        type: viewTypes.singleView.toString(),
        size: 1
    };
    if (!views) {
        return result;
    }
    switch (views) {
        case 1:
            result.type = viewTypes.singleView.toString();
            result.size = 1;
            break;
        case 2:
            result.type = viewTypes.doubleViews.toString();
            result.size = 2;
            break;
        case "auto":
            result.type = viewTypes.flatView.toString();
            result.size = 3;
            break;
        default:
            break;
    }
    return result;
};
var viewTypes;
(function (viewTypes) {
    viewTypes["singleView"] = "single-view";
    viewTypes["doubleViews"] = "double-views";
    viewTypes["flatView"] = "flat-view";
})(viewTypes = exports.viewTypes || (exports.viewTypes = {}));
var events;
(function (events) {
    events["click"] = "click";
})(events = exports.events || (exports.events = {}));
var dataset;
(function (dataset) {
    dataset["date"] = "data-date";
    dataset["disabled"] = "data-disabled";
})(dataset = exports.dataset || (exports.dataset = {}));
var Selection = (function () {
    function Selection() {
        var _this = this;
        this.size = 1;
        this.list = [];
        this.useInvalidAsSelected = false;
        this.last = function () { return _this.list[_this.length() - 1]; };
        this.front = function () { return _this.list[0]; };
        this.length = function () { return _this.list.length; };
        this.push = function (date) { return function (afterPush) {
            _this.beforePush(date);
            _this.list.push(date);
            _this.afterPush();
            var id = setTimeout(function afterQueueReset() {
                afterPush();
                clearTimeout(id);
            }, 0);
        }; };
        this.clean = function () { return (_this.list = []); };
        this.shift = function () { return _this.list.shift(); };
        this.pop = function () { return _this.list.pop(); };
    }
    Selection.prototype.setSize = function (size) {
        this.size = size;
    };
    Selection.prototype.setCanPushInvalid = function (can) {
        this.useInvalidAsSelected = can;
    };
    Selection.prototype.isEmpty = function () {
        return this.length() <= 0;
    };
    Selection.prototype.isFilled = function () {
        return this.length() === this.size;
    };
    Selection.prototype.beforePush = function (date) {
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item && item.value === date.value) {
                if (this.size === 2) {
                    this.shift();
                }
                else {
                    this.list = [];
                }
            }
        }
    };
    Selection.prototype.afterPush = function () {
        var temp = {};
        var list = [];
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var item = _a[_i];
            if (!temp[item.value]) {
                temp[item.value] = 1;
                list.push(item);
            }
        }
        this.list = list;
    };
    Selection.prototype.has = function (value) {
        return this.list.filter(function (item) { return item && item.value === value; }).length > 0;
    };
    return Selection;
}());
exports.Selection = Selection;
var Disabled = (function () {
    function Disabled(getState, useFormatDate) {
        this.days = [];
        this.dates = [];
        this.getState = null;
        this.useFormatDate = null;
        this.getState = getState;
        this.useFormatDate = useFormatDate;
    }
    Disabled.prototype.set = function (partial) {
        for (var key in partial) {
            this[key] = partial[key];
        }
    };
    Disabled.prototype.find = function (date) {
        if (!util_1.isDate(date)) {
            return true;
        }
        var value = this.useFormatDate(date);
        var day = date.getDay();
        var _a = this.getState(), startDate = _a.startDate, endDate = _a.endDate;
        var outofRange = util_1.List.every([startDate, endDate], util_1.isDate) &&
            (date >= endDate || date < startDate);
        var result = util_1.List.includes(this.dates, value) ||
            util_1.List.includes(this.days, day) ||
            outofRange;
        return result;
    };
    return Disabled;
}());
exports.Disabled = Disabled;
function getRangeFromQueue(useRange, queue, useFormatDate, useParseDate) {
    var length = queue.length();
    if (length <= 0 || !useRange) {
        return [];
    }
    var first = queue.front();
    var last = queue.last();
    var start = useParseDate(first.value);
    var end = useParseDate(last.value);
    var size = exports.diffDates(end, start);
    return createDates(start, size).map(useFormatDate);
}
exports.useSwitchable = function (date, state) {
    var startDate = state.startDate, endDate = state.endDate, views = state.views;
    var diffEnd = exports.diffMonths(endDate, date);
    var diffStart = exports.diffMonths(date, startDate);
    return [
        diffStart <= 0 && diffEnd > 0,
        diffStart > 0 && diffEnd <= (views === 1 ? 0 : 1)
    ];
};
function useCalendarData(getState, _a) {
    var date = _a.date, queue = _a.queue, disables = _a.disables, useFormatDate = _a.useFormatDate, useParseDate = _a.useParseDate;
    var state = getState();
    var i18n = state.i18n;
    var usePanelTitle = function (year, month) {
        return formatHeading(i18n.title, year, i18n.months[month]);
    };
    var calendars = util_1.List.create(state.views, function (index) {
        var _date = util_1.Dat.firstDate(date, index);
        var day = _date.getDay();
        return {
            date: _date,
            dates: util_1.Dat.dates(date) + day,
            day: day,
            heading: usePanelTitle(_date.getFullYear(), _date.getMonth())
        };
    });
    return util_1.List.map(calendars, function (_a) {
        var date = _a.date, dates = _a.dates, day = _a.day, heading = _a.heading;
        return ({
            heading: heading,
            dates: util_1.List.create(dates, function (index) {
                var invalid = index < day;
                var target = index < day ? 1 - day + index : index - day + 1;
                var current = new Date(date.getFullYear(), date.getMonth(), target);
                var disabled = invalid || disables.find(current);
                var value = useFormatDate(current);
                var range = getRangeFromQueue(state.selection === 2, queue, useFormatDate, useParseDate);
                var className = classname({
                    isActive: queue.has(value),
                    isStart: util_1.List.inRange(range, value, function (index) { return index === 0; }),
                    isEnd: util_1.List.inRange(range, value, function (index, list) { return index === list.length - 1; }),
                    inRange: util_1.List.inRange(range, value, function (index, list) { return index > 0 && index < list.length - 1; }),
                    isDisabled: disabled,
                    isEmpty: invalid
                });
                return {
                    value: value,
                    disabled: disabled,
                    date: date,
                    className: className,
                    day: current.getDay(),
                    label: current.getDate(),
                    invalid: invalid
                };
            })
        });
    });
}
exports.useCalendarData = useCalendarData;
function useSelection(queue, item, unpushable, popable, shiftable, next) {
    var currentQueueLength = queue.length();
    var nextQueueLength = currentQueueLength + 1;
    var first = queue.front();
    var last = queue.last();
    if (item.disabled) {
        if (queue.size !== 2 ||
            (queue.size === 2 &&
                ((currentQueueLength === 1 && unpushable(first)) ||
                    queue.isEmpty() ||
                    queue.isFilled() ||
                    !queue.useInvalidAsSelected))) {
            return;
        }
    }
    else if (queue.size === 2) {
        if (currentQueueLength) {
            if (unpushable(first) || shiftable(last)) {
                queue.shift();
            }
            else if (popable(first)) {
                queue.pop();
            }
        }
    }
    if (nextQueueLength > queue.size) {
        queue.clean();
    }
    var dispatchValue = function () { return next(queue.list); };
    queue.push(item)(dispatchValue);
}
exports.useSelection = useSelection;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var core_1 = __webpack_require__(4);
var datepicker_helpers_1 = __webpack_require__(2);
exports.subscribe = datepicker_helpers_1.subscribe;
exports.publish = datepicker_helpers_1.publish;
function TypePicker(options) {
    var Core = core_1.core();
    var instance = new Core(options);
    for (var key in instance) {
        Object.defineProperty(this, key, {
            value: instance[key],
            writable: true,
            configurable: false,
            enumerable: false
        });
    }
}
exports["default"] = TypePicker;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
__webpack_require__(5);
var datepicker_dom_helper_1 = __webpack_require__(1);
var datepicker_helpers_1 = __webpack_require__(2);
var datepicker_template_1 = __webpack_require__(6);
var util_1 = __webpack_require__(0);
var baseState = {
    selection: 1,
    startDate: null,
    endDate: null,
    format: "YYYY-MM-DD",
    limit: 1,
    viewType: "single",
    i18n: {
        title: "YYYY年MM月",
        days: ["日", "一", "二", "三", "四", "五", "六"],
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
    },
    useInvalidAsSelected: false,
    selected: [],
    views: 1
};
function fetchState(state) {
    return state[state.length - 1];
}
function updateState(state, partial) {
    if (partial) {
        var old = fetchState(state);
        state = [__assign({}, old, partial)];
    }
    return state;
}
function core() {
    var updateTemp = [];
    var state = [baseState];
    var setState = function (partial) {
        return (state = updateState(state, partial));
    };
    var getState = function () { return fetchState(state); };
    var useFormatDate = function (date) { return datepicker_helpers_1.format(date, getState().format); };
    var useParseDate = function (date) { return datepicker_helpers_1.parse(date, getState().format); };
    var disables = new datepicker_helpers_1.Disabled(getState, useFormatDate);
    var queue = new datepicker_helpers_1.Selection();
    function useUpdate(data, next) {
        if (data) {
            updateTemp.push(data);
            if (data.value && data.isInitialValue) {
                if (disables.find(useParseDate(data.value))) {
                    updateTemp.pop();
                }
            }
        }
        var state = getState();
        util_1.List.loop(updateTemp, function (item) {
            var current = useParseDate(item.value);
            item.disabled = disables.find(current);
            item.selected = true;
            var unpushable = function (first) {
                var firstDate = useParseDate(first.value);
                var size = datepicker_helpers_1.diffDates(firstDate, current, true);
                var dates = util_1.List.create(size, function (index) {
                    var date = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + index);
                    var disable = disables.find(date);
                    return disable && useFormatDate(date) !== item.value;
                });
                var isTrue = function (v) { return v === true; };
                return util_1.List.filter(dates, isTrue).length > 0;
            };
            var popable = function (target) { return useParseDate(target.value) > current; };
            var shiftable = function (last) {
                return datepicker_helpers_1.diffDates(current, useParseDate(last.value)) > state.limit;
            };
            datepicker_helpers_1.useSelection(queue, item, unpushable, popable, shiftable, function (selected) {
                datepicker_helpers_1.publish("select", selected.map(function (item) { return item.value; }));
                console.log("selected", selected.map(function (item) { return item.value; }));
                next({ selected: selected });
            });
        });
        updateTemp = [];
    }
    return (function () {
        function Core(option) {
            this.date = new Date();
            this.element = null;
            var el = datepicker_dom_helper_1.DOMHelpers.select(option.el);
            if (!el || !option) {
                return;
            }
            var partial = {
                useInvalidAsSelected: false
            };
            util_1.match({ condition: util_1.isDef, value: option.format })(function (format) { return (partial.format = format); });
            util_1.match({ condition: util_1.isDef, value: option.views })(function (views) {
                var _a = datepicker_helpers_1.useViewTypes(views), type = _a.type, size = _a.size;
                partial.viewType = type;
                partial.views = size;
            });
            util_1.match({ condition: util_1.isPositiveInteger, value: option.selection })(function (size) { return (partial.selection = size); });
            util_1.match({ condition: util_1.isDate, value: useParseDate(option.startDate) })(function (date) { return (partial.startDate = date); });
            util_1.match({ condition: util_1.isDate, value: useParseDate(option.endDate) })(function (date) { return (partial.endDate = date); });
            util_1.match({
                condition: util_1.isPositiveInteger,
                value: option.limit
            })(function (limit) { return (partial.limit = limit); });
            util_1.match({
                condition: util_1.List.every([partial.startDate, partial.endDate], util_1.isDate) &&
                    partial.startDate > partial.endDate
            })(function () {
                partial.startDate = null;
                partial.endDate = null;
            });
            util_1.match({
                condition: partial.viewType === datepicker_helpers_1.viewTypes.flatView
            })(function () {
                if (!partial.startDate) {
                    partial.startDate = new Date();
                }
                var start = partial.startDate;
                if (!partial.endDate) {
                    partial.endDate = new Date(start.getFullYear(), start.getMonth() + 3, start.getDate());
                }
                partial.views = datepicker_helpers_1.diffMonths(partial.endDate, partial.startDate) + 1;
            });
            util_1.match({ condition: util_1.isBool, value: option.useInvalidAsSelected })(function (value) {
                partial.useInvalidAsSelected = value;
                if (value === true) {
                    partial.selection = 2;
                }
            });
            this.element = el;
            this.element.className = datepicker_dom_helper_1.DOMHelpers["class"].container(partial.viewType);
            queue.setSize(partial.selection);
            queue.setCanPushInvalid(partial.useInvalidAsSelected);
            this.update(partial, { date: new Date(), isInitialValue: true });
        }
        Core.prototype.update = function (partial, addtionalValue) {
            var _this = this;
            var initialValue = {
                value: null,
                isInitialValue: false
            };
            addtionalValue = addtionalValue || null;
            if (partial && Object.keys(partial).length <= 0) {
                return;
            }
            setState(partial);
            var state = getState();
            if (addtionalValue && addtionalValue.isInitialValue) {
                initialValue.value = useFormatDate(addtionalValue.date);
                initialValue.isInitialValue = addtionalValue.isInitialValue;
                if (util_1.isDate(addtionalValue.date)) {
                    this.date = addtionalValue.date;
                }
            }
            var calendarData = datepicker_helpers_1.useCalendarData(getState, {
                date: this.date,
                useFormatDate: useFormatDate,
                useParseDate: useParseDate,
                queue: queue,
                disables: disables
            });
            var startDate = state.startDate, endDate = state.endDate;
            this.startDate = startDate;
            this.endDate = endDate;
            if (state.viewType == datepicker_helpers_1.viewTypes.flatView) {
                this.date = startDate;
            }
            var _a = datepicker_helpers_1.useSwitchable(this.date, state), reachStart = _a[0], reachEnd = _a[1];
            this.element.innerHTML = datepicker_template_1.template({
                data: calendarData,
                days: state.i18n.days,
                reachStart: reachStart,
                reachEnd: reachEnd,
                switchable: state.viewType !== datepicker_helpers_1.viewTypes.flatView
            });
            var select = function (selector) {
                return datepicker_dom_helper_1.DOMHelpers.select(_this.element, selector);
            };
            var prevActionDOM = select(".calendar-action.prev");
            var nextActionDOM = select(".calendar-action.next");
            var nodeList = select(".calendar-cell");
            if (prevActionDOM && nextActionDOM) {
                var listener_1 = function (disabled, step) {
                    var now = new Date(_this.date.getFullYear(), _this.date.getMonth() + step * state.views, _this.date.getDate());
                    if (disabled) {
                        return;
                    }
                    _this.date = now;
                    _this.update(null, { date: null, isInitialValue: false });
                };
                prevActionDOM.addEventListener(datepicker_helpers_1.events.click, function () {
                    return listener_1(reachStart, -1);
                });
                nextActionDOM.addEventListener(datepicker_helpers_1.events.click, function () {
                    return listener_1(reachEnd, 1);
                });
            }
            util_1.List.loop(nodeList, function (node) {
                node.addEventListener(datepicker_helpers_1.events.click, function () {
                    var value = datepicker_dom_helper_1.DOMHelpers.attr(node, datepicker_helpers_1.dataset.date);
                    if (!value) {
                        return;
                    }
                    useUpdate({ value: value }, _this.update.bind(_this));
                });
            });
            useUpdate(initialValue, this.update.bind(this));
        };
        Core.prototype.setDates = function (dates) {
            var _this = this;
            var _a = getState(), selection = _a.selection, limit = _a.limit;
            dates = util_1.List.slice(dates, 0, selection);
            dates = util_1.List.map(dates, useParseDate, util_1.isDef);
            dates = util_1.List.dedup(dates, function (date, map) {
                if (!map[date.toDateString()]) {
                    return date;
                }
                return null;
            });
            util_1.match({
                condition: util_1.List.every(dates, util_1.isDate),
                value: dates
            })(function (dates) {
                dates = util_1.List.reduce(dates, function (prev, curr, index, list) {
                    if (selection == 2 && index > 0) {
                        prev = list[index - 1];
                        var gap = datepicker_helpers_1.diffDates(curr, prev);
                        if (gap <= 0) {
                            return [useFormatDate(curr)];
                        }
                        if (limit && gap > limit) {
                            return [];
                        }
                    }
                    dates = dates.sort(function (a, b) { return a.getTime() - b.getTime(); });
                    return util_1.List.map(dates, useFormatDate, util_1.isDef);
                });
                if (dates.length <= 0) {
                    return;
                }
                updateTemp = util_1.List.map(dates, function (value) { return ({
                    value: value,
                    selected: true,
                    disabled: disables.find(useParseDate(value))
                }); });
                var initDate;
                var lastItem = updateTemp[updateTemp.length - 1];
                if (lastItem) {
                    initDate = useParseDate(lastItem.value);
                }
                _this.update(null, { date: initDate, isInitialValue: true });
            });
        };
        Core.prototype.disable = function (options) {
            var to = options.to, from = options.from, days = options.days, dates = options.dates;
            if (!util_1.List.isList(dates)) {
                dates = [];
            }
            if (!util_1.List.isList(days)) {
                days = [];
            }
            var partial = null;
            util_1.match({ condition: util_1.isDate, value: useParseDate(from) })(function (from) {
                if (!partial) {
                    partial = {};
                }
                partial.endDate = from;
            });
            util_1.match({ condition: util_1.isDate, value: useParseDate(to) })(function (to) {
                if (!partial) {
                    partial = {};
                }
                partial.startDate = to;
            });
            util_1.match({
                condition: function (dates) { return util_1.List.every(dates, util_1.isDate); },
                value: partial && [(partial.startDate, partial.endDate)]
            })(function (_a) {
                var start = _a[0], end = _a[1];
                if (start >= end) {
                    partial = null;
                }
            });
            util_1.match({
                condition: function (v) { return v.length > 0; },
                value: days
            })(function (days) {
                var isValidDay = function (day) {
                    return util_1.isPositiveInteger(day) && day >= 0 && day <= 6;
                };
                days = util_1.List.map(days, function (day) { return parseInt(day, 10); }, isValidDay);
                disables.set({
                    days: days
                });
            });
            util_1.match({ condition: function (v) { return v.length > 0; }, value: dates })(function (dates) {
                dates = util_1.List.map(dates, useParseDate, util_1.isDate);
                dates = util_1.List.map(dates, useFormatDate, util_1.isDef);
                dates = util_1.List.dedup(dates);
                disables.set({
                    dates: dates
                });
            });
            this.update(partial, {
                date: partial && partial.startDate,
                isInitialValue: true
            });
        };
        Core.prototype.i18n = function (i18n) {
            var _this = this;
            datepicker_helpers_1.i18nValidator(i18n, function (i18n) { return _this.update({ i18n: i18n }); });
        };
        Core.prototype.onRender = function (next) {
            datepicker_helpers_1.subscribe("render", next);
        };
        Core.prototype.onSelect = function (next) {
            datepicker_helpers_1.subscribe("select", next);
        };
        return Core;
    }());
}
exports.core = core;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var util_1 = __webpack_require__(0);
var datepicker_dom_helper_1 = __webpack_require__(1);
function createTag(tag, props) {
    if (!tag) {
        tag = "div";
    }
    var children = "";
    var attributes = [];
    for (var key in props) {
        var value = props[key];
        if (util_1.isDef(value)) {
            if (key !== "children") {
                if (key === "className") {
                    key = "class";
                }
                attributes.push(key + "=\"" + value + "\"");
            }
            else {
                if (value !== false) {
                    if (Array.isArray(value)) {
                        children = value.filter(util_1.isDef).join("");
                    }
                    else {
                        children = value;
                    }
                }
            }
        }
    }
    return "<" + tag + " " + attributes.join("") + ">" + children + "</" + tag + ">";
}
function createActionView(reachStart, reachEnd) {
    var node = function (type, disabled) {
        var className = ["calendar-action", type];
        if (disabled) {
            className.push("disabled");
        }
        return createTag("div", {
            className: util_1.List.string(className, " "),
            disabled: disabled ? "disabled" : null
        });
    };
    return [node("prev", reachStart), node("next", reachEnd)].join("");
}
function createDateView(data) {
    var props = {
        className: datepicker_dom_helper_1.DOMHelpers["class"].cell(data.day, data.className),
        children: []
    };
    if (!data.invalid) {
        props.children.push(createTag("div", {
            className: "date",
            children: data.label
        }));
        if (data.value) {
            props.children.push(createTag("div", {
                className: "placeholder"
            }));
            props["data-date"] = data.value;
        }
    }
    props["data-disabled"] = data.disabled;
    return createTag("div", props);
}
var createDayView = function (week) {
    return createTag("div", {
        className: "calendar-day",
        children: week.map(function (day, index) {
            return createTag("div", {
                className: datepicker_dom_helper_1.DOMHelpers["class"].cell(index),
                children: day
            });
        })
    });
};
var createCalendarView = function (_a) {
    var data = _a.data, days = _a.days, switchable = _a.switchable, reachStart = _a.reachStart, reachEnd = _a.reachEnd;
    var dayView = createDayView(days);
    var mapped = data.map(function (item) {
        var calendarViewData = [
            createTag("div", {
                className: "calendar-head",
                children: item.heading
            }),
            switchable && dayView,
            createTag("div", {
                className: "calendar-body",
                children: item.dates.map(createDateView)
            })
        ].filter(Boolean);
        return createTag("div", {
            className: "calendar-item",
            children: calendarViewData
        });
    });
    if (!switchable) {
        return [dayView].concat(mapped);
    }
    return [createActionView(reachStart, reachEnd)].concat(mapped);
};
exports.template = function (_a) {
    var data = _a.data, days = _a.days, reachStart = _a.reachStart, reachEnd = _a.reachEnd, switchable = _a.switchable;
    return util_1.List.string(createCalendarView({
        data: data,
        days: days,
        switchable: switchable,
        reachStart: reachStart,
        reachEnd: reachEnd
    }));
};


/***/ })
/******/ ]);
});