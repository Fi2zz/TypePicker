import { addClass, diff, isDate, isNumber, parseEl, removeClass, getLanguage, setLanguage, clearNextTick, nextTick, warn } from "./util";
import compose from "./datepicker.template";
import { setInitRange } from "./datepicker.ranger";
import { format } from './datepicker.formatter';
export function monthSwitch(size) {
    var curr = {
        year: this.date.getFullYear(),
        month: this.date.getMonth(),
        date: this.date.getDate()
    };
    var month = curr.month + size;
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
export function createDatePicker(isInit) {
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
    if (isInit) {
        this.update(updateEventData);
    }
}
export function currentRange(isInit) {
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
export function bindMonthSwitch() {
    var _this = this;
    var startTime = new Date(this.startDate).getTime();
    var currTime = new Date(this.date).getTime();
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
export function init(option, renderer) {
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
    this.startDate = isDate(option.from) ? option.from : new Date();
    this.date = this.startDate;
    this.endDate = isDate(option.to) ? option.to : new Date(this.date.getFullYear(), this.date.getMonth() + 6, 0);
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
            var formatted = this.format(item).value;
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
