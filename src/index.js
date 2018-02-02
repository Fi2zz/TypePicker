import Observer from './datepicker.observer';
import { diff, isObject, isDate, isArray, nextTick, clearNextTick, warn } from "./util";
import { init, currentRange, monthSwitch, bindMonthSwitch, createDatePicker } from './datepicker.init';
import handlePickDate from './datepicer.picker';
import { parseFormatted, format as formatter } from "./datepicker.formatter";
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
            option.from = params.from;
        if (isDate(params.to))
            option.to = params.to;
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
var DatePicker = (function () {
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
        this.format = function (date) { return formatter(date, _this.dateFormat, _this.zeroPadding); };
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
                            || !_this.inDates(_this.format(startDate).value) && !_this.inDates(_this.format(endDate).value)
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
            format: function (date, format) { return (date && format) ? formatter(date, format).value : null; },
            parse: function (string, format) { return (string && format) ? parseFormatted(string, format) : new Date(); },
            diff: function (d1, d2) { return diff(d1, d2, "days"); }
        };
        if (!option) {
            return {
                format: function (date, format) { return (date && format) ? formatter(date, format).value : null; },
                parse: function (string, format) { return (string && format) ? parseFormatted(string, format) : new Date(); },
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
