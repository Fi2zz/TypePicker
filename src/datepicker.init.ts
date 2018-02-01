import {
    addClass,
    diff,
    isDate,
    isNumber,
    parseEl,
    removeClass,
    getLanguage,
    setLanguage,
    clearNextTick,
    nextTick,
    warn
} from "./util";
import compose from "./datepicker.template";
import {setInitRange} from "./datepicker.ranger";

import {format} from './datepicker.formatter'

/***
 * 月份切换
 * @param size 切换月份数量
 * ***/
export function monthSwitch(size: number) {
    let curr = {
        year: this.date.getFullYear(),
        month: this.date.getMonth(),
        date: this.date.getDate()
    };
    let month = curr.month + size;
    //每次切换两个月份
    if (this.multiViews) {
        month += size > 0 ? 1 : -1
    }
    if (this.defaultDates.length > 0) {
        this.selected = this.defaultDates;
    }
    this.date = new Date(curr.year, month, curr.date);
    this.createDatePicker(false);
    this.pickDate();
    this.dataRenderer(this.data)
}

/**
 * 生成日历
 *
 * **/
export function createDatePicker(isInit?: Boolean) {
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
    const updateEventData = {
        type: 'init',
        value: this.selected
    };
    //初始化的时候，需要获取初始化的日期
    if (isInit) {
        this.update(updateEventData);
    }
}

export function currentRange(isInit: boolean) {
    const initSelected =
        this.defaultDates.length > 0
            ? this.defaultDates
            : this.double
            ? this.selected
            : [this.format(this.date).value];
    const rangeOption = {
        collector: this.element,
        collection: this.element.querySelectorAll(".calendar-date-cell:not(.empty)"),
        data: initSelected,
        isDouble: this.double,
        parse: this.parse,
        format: this.format,
        inDates: this.inDates,
        isInit
    };
    return setInitRange(rangeOption);
}

export function bindMonthSwitch() {
    const startTime = new Date(this.startDate).getTime();
    const currTime = new Date(this.date).getTime();
    //日期切换
    const prev = this.element.querySelector(".calendar-action-prev");
    const next = this.element.querySelector(".calendar-action-next");

    if (prev && next) {
        if (this.infiniteMode) {
            next.addEventListener("click", () => {
                this.monthSwitch(1);
            });
            prev.addEventListener("click", () => {
                this.monthSwitch(-1);
            })
        } else {
            let gap = diff(this.date, this.endDate);
            if (gap >= 2) {
                next.addEventListener("click", () => {
                    this.monthSwitch(1);
                    removeClass(prev, "disabled");
                    removeClass(prev, "calendar-action-disabled")
                });

            }
            else {
                addClass(next, "disabled");
                addClass(next, "calendar-action-disabled")
            }

            if (currTime > startTime) {
                prev.addEventListener("click", () => {
                    this.monthSwitch(-1);
                    removeClass(next, "disabled");
                    removeClass(next, "calendar-action-disabled")
                });
            } else {
                addClass(prev, "disabled");
                addClass(prev, "calendar-action-disabled")
            }
        }
    }
}

export function init(option: any, renderer: any) {

    if (option.initWithSelected) {
        this.initWithSelected = option.initWithSelected

    }

    if (option.doubleSelect) {
        this.double = option.doubleSelect
    }

    if (option.format) {
        this.dateFormat = option.format || "YYYY-MM-DD"
    }
    if (option.multiViews && ( !option.flatView && !option.singleView)) {
        this.multiViews = true
    }
    else if (option.flatView && (!option.singleView && !option.multiViews)) {
        this.flatView = true
    }
    else if (option.singleView && (!option.multiViews && !option.flatView)) {
        this.singleView = true
    }

    //开始日期
    this.startDate = isDate(option.from) ? option.from : new Date();
    this.date = this.startDate;
    //结束日期
    this.endDate = isDate(option.to) ? option.to : new Date(this.date.getFullYear(), this.date.getMonth() + 6, 0);
    //選擇日期區間最大限制
    this.limit = this.double ? isNumber(option.limit) ? option.limit : 1 : 1;
    if (option.zeroPadding) {
        this.zeroPadding = option.zeroPadding
    }

    if (option.infiniteMode) {
        this.infiniteMode = option.infiniteMode;
    }
    if (!renderer.dates || renderer.dates && renderer.dates.length <= 0) {
        const currDate = new Date();
        const gap = diff(this.endDate, currDate, "days");
        const year = currDate.getFullYear();
        const month = currDate.getMonth();
        const date = currDate.getDate();
        let dates = [];
        for (let i = 0; i < gap; i++) {
            let item = <Date>new Date(year, month, date + i);
            let formatted = this.format(item).value;
            dates.push(formatted)
        }
        this.data = {};
        this.dates = dates;
    } else {
        this.dates = renderer.dates;
        this.data = renderer.data;
        this.infiniteMode = false;
    }

    this.format = (date: Date) => format(date, this.dateFormat, this.zeroPadding);
    this.language = setLanguage(getLanguage(option.language, option.defaultLanguage));
    this.element = parseEl(option.el);
    if (!this.element) {
        warn('init', `invalid selector,current selector ${this.element}`);
        return false
    }
    this.element.className = `${this.element.className} calendar calendar-${this.multiViews ? "double-views" : this.singleView ? "single-view" : "flat-view"}`
    const next = nextTick(() => {
        if (this.defaultDates.length > 0) {
            let date = this.defaultDates[0];
            if (!this.flatView) {
                this.date = this.parse(date)
            }
        }
        this.createDatePicker(true);
        this.pickDate();
        clearNextTick(next)
    })
}
