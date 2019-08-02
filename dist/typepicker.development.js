/*!
 * TypePicker v6.1.5
 * 2019/8/2
 * A date picker use in web and react-native
 * (c) 2017-2019,Fi2zzz <wenjingbiao@outlook.com>
 * https://github.com/Fi2zz/TypePicker
 * MIT License
 */
module.exports =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
var List = {
  map: function map(input, _map) {
    if (!List.isList(input)) {
      return [];
    }

    return input.map(function (item, index) {
      return _map(item, index);
    });
  },
  create: function create(size, filled) {
    filled = filled || undefined;
    var list = [];

    if (!size || size === 0) {
      return list;
    }

    for (var i = 0; i < size; i++) {
      list.push(filled ? typeof filled === "function" ? filled(i) : filled : i);
    }

    return list;
  },
  dedup: function dedup(list, key) {
    var map = {};

    if (list.length <= 0) {
      return [];
    }

    return list.reduce(function (acc, currItem) {
      var curr = currItem;

      if (key) {
        if (typeof key === "function") {
          curr = key(curr, map);
        } else {
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
  loop: function loop(list, looper) {
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
      var item = list_1[_i];
      var index = list.indexOf(item);
      looper(item, index, list);
    }
  },
  every: function every(list, handler) {
    if (!List.isList(list) || list.length <= 0) {
      return false;
    }

    return list.every(handler);
  },
  findIndex: function findIndex(list, value) {
    return list.indexOf(value);
  },
  isTop: function isTop(list, value) {
    return List.findIndex(list, value) === 0;
  },
  isTail: function isTail(list, value) {
    return List.findIndex(list, value) === List.length(list) - 1;
  },
  isList: function isList(list) {
    return list instanceof Array;
  },
  includes: function includes(list, item) {
    return List.findIndex(list, item) >= 0;
  },
  length: function length(list) {
    return list.length;
  }
};

var pipe = function pipe(first) {
  var more = [];

  for (var _i = 1; _i < arguments.length; _i++) {
    more[_i - 1] = arguments[_i];
  }

  return more.reduce(function (acc, curr) {
    return function () {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      return curr(acc.apply(void 0, args));
    };
  }, first);
};

var isPositiveInteger = function isPositiveInteger(input) {
  return /^[1-9]?[0-9]+$/.test("" + input);
};

var isInterger = function isInterger(input) {
  return /^(-)?[1-9]?[0-9]+$/.test("" + input);
};

var isBool = function isBool(v) {
  return typeof v === "boolean";
};

var genRandomNumber = function genRandomNumber() {
  return ("" + Math.random() * 0x100000000).replace(".", "-");
};

var PubSub = function () {
  function PubSub(name) {
    var _this = this;

    this.name = "observe";
    this.clientList = {};

    this.subscribe = function (key, fn) {
      var typeName = _this.getType(key);

      if (!_this.clientList[typeName]) {
        _this.clientList[typeName] = [];
      }

      _this.clientList[typeName].push(fn);
    };

    this.publish = function (type, args) {
      Timex.delay(function () {
        var fns = _this.clientList[_this.getType(type)];

        if (!fns || fns.length === 0) {
          return false;
        }

        for (var _i = 0, fns_1 = fns; _i < fns_1.length; _i++) {
          var fn = fns_1[_i];
          fn(args);
        }
      }, 1);
    };

    this.name = name;
  }

  PubSub.prototype.getType = function (type) {
    return "" + this.name + type;
  };

  return PubSub;
}();

var Selection = function () {
  function Selection(value) {
    this.value = value;
  }

  Selection.prototype.toString = function () {
    return "" + +this.value + this.disabled;
  };

  return Selection;
}();

var Queue = function () {
  function Queue(size, canPushInvalid) {
    var _this = this;

    this.size = 1;
    this.list = [];
    this.canPushInvalid = false;

    this.last = function () {
      return _this.list[_this.length() - 1];
    };

    this.front = function () {
      return _this.fetch(0);
    };

    this.length = function () {
      return _this.list.length;
    };

    this.fetch = function (index) {
      return index >= 0 ? _this.list[index] : _this.list;
    };

    this.isEmpty = function () {
      return _this.length() <= 0;
    };

    this.isFullFilled = function () {
      return _this.length() === _this.size;
    };

    this.clean = function () {
      return _this.list = [];
    };

    this.shift = function () {
      return _this.list.shift();
    };

    this.pop = function () {
      return _this.list.pop();
    };

    this.push = function (data) {
      return function (afterPush) {
        var before = _this.list.filter(function (item) {
          return item.toString() === data.toString();
        });

        if (before.length > 0) {
          if (_this.length() === 1) {
            return;
          }

          if (_this.size === 2) {
            _this.shift();
          } else {
            _this.clean();
          }
        }

        _this.list.push(data);

        Timex.delay(afterPush);
      };
    };

    this.size = size;
    this.canPushInvalid = canPushInvalid;
  }

  return Queue;
}();

var TimeX = function () {
  function TimeX() {
    this.millisecondsOfDate = 1000 * 60 * 60 * 24;

    this.isDate = function (object) {
      return object instanceof Date;
    };
  }

  TimeX.prototype.diff = function (first, second, type, isAbsolute) {
    if (type === void 0) {
      type = "days";
    }

    var result;

    if (!Timex.isDate(first) || !Timex.isDate(second)) {
      return 0;
    }

    var that = this;
    var components = {
      start: that.dateComponents(first),
      end: that.dateComponents(second)
    };

    if (type === "month") {
      result = Math.abs(components.start.year * 12 + components.start.month) - (components.end.year * 12 + components.end.month);
    } else if (type === "days") {
      result = Math.ceil(components.start.time - components.end.time) / Timex.millisecondsOfDate;
    }

    return isAbsolute ? Math.abs(result) : result;
  };

  TimeX.prototype.delay = function (handler, duration) {
    if (duration === void 0) {
      duration = 0;
    }

    var delayed = setTimeout(function () {
      handler();
      clearTimeout(delayed);
    }, duration);
  };

  TimeX.prototype.dateComponents = function (input) {
    var month = input.getMonth();
    var year = input.getFullYear();
    var date = input.getDate();
    var day = input.getDay();
    var hours = input.getHours();
    var minutes = input.getMinutes();
    var seconds = input.getSeconds();
    var ms = input.getMilliseconds();
    var dateString = input.toDateString();
    var isoString = input.toISOString();
    var time = input.getTime();
    var timezoneOffset = input.getTimezoneOffset();
    return {
      year: year,
      date: date,
      month: month,
      day: day,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      ms: ms,
      milliseconds: ms,
      dateString: dateString,
      isoString: isoString,
      time: time,
      timezoneOffset: timezoneOffset
    };
  };

  TimeX.prototype.createDate = function (options) {
    var year = options.year,
        month = options.month,
        date = options.date,
        _a = options.minutes,
        minutes = _a === void 0 ? 0 : _a,
        _b = options.hours,
        hours = _b === void 0 ? 0 : _b,
        _c = options.seconds,
        seconds = _c === void 0 ? 0 : _c,
        _d = options.milliseconds,
        milliseconds = _d === void 0 ? 0 : _d;
    return new Date(year, month, date, hours, minutes, seconds, milliseconds);
  };

  TimeX.prototype.today = function () {
    var date = new Date();
    var components = this.dateComponents(date);
    return this.createDate({
      year: components.year,
      month: components.month,
      date: components.date
    });
  };

  return TimeX;
}();

var Timex = new TimeX();

function genTypePickerData(mapRange, mapDisables) {
  return function (size, date) {
    var genCalendar = function genCalendar(_a) {
      var size = _a.size,
          date = _a.date;
      return List.create(size, function (index) {
        var components = Timex.dateComponents(date);
        components.month += index;
        var firstDate = Timex.createDate(__assign({}, components, {
          date: 1
        }));
        var endDate = Timex.createDate(__assign({}, components, {
          month: components.month + 1,
          date: 0
        }));
        return __assign({}, Timex.dateComponents(firstDate), {
          dates: Timex.dateComponents(endDate).date,
          endDate: endDate,
          firstDate: firstDate
        });
      });
    };

    var genDates = function genDates(calendars) {
      return List.map(calendars, function (_a) {
        var day = _a.day,
            year = _a.year,
            month = _a.month,
            endDate = _a.endDate,
            firstDate = _a.firstDate;
        return {
          year: year,
          month: month,
          dates: List.create(42, function (index) {
            var date = Timex.createDate({
              year: year,
              month: month,
              date: index - day + 1
            });
            var components = Timex.dateComponents(date);
            var invalid = date > endDate || date < firstDate;
            return {
              date: date,
              invalid: invalid,
              disabled: invalid || mapDisables(date),
              status: mapRange(components.dateString)
            };
          })
        };
      });
    };

    var genSize = function genSize(_a) {
      var size = _a.size,
          date = _a.date;
      return {
        size: size >= 0 ? size : size * -1,
        date: date
      };
    };

    return pipe(genSize, genCalendar, genDates)({
      size: size,
      date: date
    });
  };
}

function checkQueue(queue, disabled, unpushable, popable) {
  var currentQueueLength = queue.length();
  var nextQueueLength = currentQueueLength + 1;

  if (disabled) {
    if (queue.size !== 2 || queue.size === 2 && (currentQueueLength === 1 && unpushable() || queue.isEmpty() || queue.isFullFilled() || !queue.canPushInvalid)) {
      return false;
    }
  } else if (queue.size === 2) {
    if (currentQueueLength) {
      if (unpushable()) {
        queue.shift();
      } else if (popable()) {
        queue.pop();
      }
    }
  }

  if (nextQueueLength > queue.size) {
    queue.clean();
  }

  return true;
}

function setDatesDedupe(date, map) {
  if (!map[date.toDateString()]) {
    return date;
  }

  return null;
}

function getOptions(option) {
  option = option || {};
  var partial = {};

  if (isInterger(option.size)) {
    partial.size = option.size;
  }

  if (isPositiveInteger(option.selection)) {
    partial.selection = option.selection;
  }

  if (isBool(option.useInvalidAsSelected)) {
    partial.useInvalidAsSelected = option.useInvalidAsSelected;

    if (option.useInvalidAsSelected === true) {
      partial.selection = 2;
    }
  }

  return partial;
}

var mapStatusOfDate = function mapStatusOfDate(range, useRange) {
  return function (dateString) {
    var length = range.length();
    var status = {
      isActive: false,
      isEnd: false,
      isStart: false,
      inRange: false
    };

    if (length <= 0) {
      return status;
    }

    var dateToString = function dateToString(date) {
      return Timex.dateComponents(date).dateString;
    };

    if (!useRange) {
      status.isActive = pipe(function (data) {
        return List.map(data, function (item) {
          return item.value;
        });
      }, function (data) {
        return List.map(data, dateToString);
      }, function (data) {
        return List.includes(data, dateString);
      })(range.fetch());
    } else {
      var first_1 = range.fetch(0);
      var last = range.fetch(range.length() - 1);
      var getRange = pipe(function ($1, $2) {
        return Timex.diff($1, $2, "days", true);
      }, function (size) {
        return List.create(size + 1);
      }, function (range) {
        return List.map(range, function (item) {
          var components = Timex.dateComponents(first_1.value);
          components.date += item;
          var date = Timex.createDate(components);
          return dateToString(date);
        });
      });
      var data = getRange(last.value, first_1.value);
      status.isActive = List.isTop(data, dateString) || List.isTail(data, dateString);
      status.inRange = List.includes(data, dateString);
      status.isStart = List.isTop(data, dateString);
      status.isEnd = List.isTail(data, dateString);

      if (status.isStart || status.isEnd) {
        status.inRange = false;
      }
    }

    return status;
  };
};

var Updater = function () {
  function Updater(config) {
    var _this = this;

    this.pubsub = new PubSub(genRandomNumber());

    this.update = function (date, selectedValue) {
      if (date) {
        _this.config.date = date;
      }

      var createData = pipe(genTypePickerData(mapStatusOfDate(_this.queue, _this.config.selection === 2), _this.disables.find));

      _this.pubsub.publish(TypePickerListenerTypes.update, createData(_this.config.size, _this.config.date));

      if (List.isList(selectedValue)) {
        _this.pubsub.publish(TypePickerListenerTypes.select, List.map(selectedValue, function (item) {
          return item.value;
        }));
      }
    };

    this.queue = null;
    this.data = [];
    this.disables = {
      find: function find(date) {
        return false;
      }
    };
    this.config = config;
    this.queue = new Queue(config.selection, config.useInvalidAsSelected);
  }

  Updater.prototype.checkQueue = function (item) {
    var queue = this.queue;
    var disables = this.disables;
    var current = item.value;
    var last = queue.last();
    var first = queue.front();

    var unpushable = function unpushable() {
      if (item.disabled && current < last.value) {
        return true;
      }

      var getSize = function getSize(_a) {
        var current = _a[0],
            first = _a[1];
        return [Timex.diff(current, first, "days", true), first];
      };

      var create = function create(date) {
        return function (index) {
          var components = Timex.dateComponents(date);
          components.date += index;
          return Timex.createDate(components);
        };
      };

      var findDates = function findDates(_a) {
        var size = _a[0],
            date = _a[1];
        return List.create(size, create(date));
      };

      var findDisables = function findDisables(dates) {
        return List.map(dates, function (date) {
          return disables.find(date) && Timex.dateComponents(date).time !== Timex.dateComponents(current).time;
        });
      };

      var filterTrue = function filterTrue(data) {
        return data.filter(function (item) {
          return item === true;
        });
      };

      var has = function has(data) {
        return List.length(data) > 0;
      };

      return pipe(getSize, findDates, findDisables, filterTrue, has)([item.value, first.value]);
    };

    var popable = function popable() {
      return first.value > current;
    };

    return checkQueue(queue, item.disabled, unpushable, popable);
  };

  Updater.prototype.push = function (date, cleanQueue) {
    var _this = this;

    if (cleanQueue === void 0) {
      cleanQueue = false;
    }

    var createItem = function createItem(value) {
      if (!Timex.isDate(value)) {
        console.error("Error: expected Date object, but got " + value + " ");
        return;
      }

      var components = Timex.dateComponents(value);
      var date = Timex.createDate(components);
      var select = new Selection(date);
      select.disabled = _this.disables.find(date);
      return select;
    };

    var data = List.isList(date) ? date : [date];

    if (cleanQueue) {
      this.queue.clean();
      this.data = [];
    }

    this.data = List.map(data, createItem);

    if (List.length(this.data) <= 0) {
      this.update(null, []);
    }

    List.loop(this.data, function (item) {
      Timex.delay(function () {
        item.disabled = _this.disables.find(item.value);
      }, 0);

      var canPush = _this.checkQueue(item);

      var callUpdate = function callUpdate() {
        return _this.update(null, _this.queue.fetch());
      };

      if (canPush) {
        _this.queue.push(item)(callUpdate);
      }
    });
  };

  return Updater;
}();

var TypePickerListenerTypes = {
  update: "update",
  select: "select"
};

function TypePicker(option) {
  var _this = this;

  var updater = new Updater(__assign({
    selection: 1,
    date: Timex.today(),
    useInvalidAsSelected: false,
    size: 1
  }, getOptions(option)));

  var applyDates = function applyDates(dates) {
    var setDates = pipe(function (dates) {
      return dates.slice(0, updater.config.selection);
    }, function (dates) {
      return dates.filter(Timex.isDate);
    }, function (dates) {
      return List.dedup(dates, setDatesDedupe);
    }, function (dates) {
      return List.every(dates, Timex.isDate) ? dates : [];
    }, function (dates) {
      return dates.sort(function (t1, t2) {
        return +t1 - +t2;
      });
    });
    Timex.delay(function () {
      updater.push(setDates(dates), true);
    });
  };

  this.listen = function (next) {
    updater.pubsub.subscribe(TypePickerListenerTypes.update, function (payload) {
      return next({
        type: TypePickerListenerTypes.update,
        payload: payload,
        types: TypePickerListenerTypes
      });
    });
    updater.pubsub.subscribe(TypePickerListenerTypes.select, function (payload) {
      return next({
        type: TypePickerListenerTypes.select,
        payload: payload,
        types: TypePickerListenerTypes
      });
    });
  };

  var select = function select(date) {
    if (List.isList(date)) {
      date = date.pop();
    }

    updater.push(date);
  };

  this.apply = {
    dates: applyDates,
    disableDate: function disableDate(handler) {
      return updater.disables.find = handler;
    },
    date: function date(_date) {
      return updater.update(_date, null);
    },
    update: function update() {
      return updater.update(null, null);
    },
    select: select
  };
  Timex.delay(function () {
    _this.apply.select(updater.config.date, true);
  });
}

exports["default"] = TypePicker;

/***/ })
/******/ ]);