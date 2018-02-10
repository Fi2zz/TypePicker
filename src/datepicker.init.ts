import {
    addClass,
    diff,
    isDate,
    isNumber,
    removeClass,
    clearNextTick,
    nextTick,
    isString,
    warn
} from "./util";
import compose from "./datepicker.template";
import {setInitRange} from "./datepicker.ranger";
import {format} from './datepicker.formatter'

export function parseEl(el: string) {
    if (!el) {
        return null
    }
    if (!isString(el)) {
        return el
    }
    else {
        if (el.indexOf('#') >= 0) {
            return document.querySelector(el)
        } else if (el.indexOf('.') >= 0) {
            return document.querySelectorAll(el)[0]
        } else {
            if (el.indexOf("#") <= -1 || el.indexOf(".") <= -1) {
                warn(`ParseEl `, `do not mount DatePicker to a pure html tag,${el}`)
                return false;
            }
            return document.querySelector(el)
        }
    }
}

const defaultLanguage: any = {
    locale: "zh-cn",
    pack: {
        days: ['日', '一', '二', '三', '四', '五', '六'],
        months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
        year: "年"
    }
};

function setLanguage(option: any) {
    const locale = option.locale.toLowerCase();
    const curr = option.pack;
    const monthName = curr.months;
    const week = curr.days;
    let title;
    if (locale === "en" || locale === "en-us" || locale === "en-gb") {
        title = (year: any, month: any) => `${monthName[month]} ${year}`
    }
    else {
        title = (year: any, month: any) => `${year}${curr["year"]}${monthName[month]}`
    }
    return {week, title}
}

function getLanguage(language: any, key: string) {
    let output = {};
    if (!key || !language[key]) {
        output = defaultLanguage
    } else {
        output = {
            locale: key,
            pack: language[key]
        };
    }
    return output
}

/***
 * 月份切换
 * @param size 切换月份数量
 * ***/
export function doMonthSwitch(size: number) {
    const curr = {
        year: this.date.getFullYear(),
        month: this.date.getMonth(),
        date: this.date.getDate()
    };
    this.date = new Date(curr.year, curr.month + size, curr.date);
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
    this.bindMonthSwitch();
    this.selected = this.currentRange(this.isFromSetRange);
    if (this.singleView) {
        if (this.double && this.selected.length >= 2) {
            const start = this.selected[0];
            const end = this.selected[this.selected.length - 1];
            if (start === end) {
                this.selected.pop()
            }
        }
    }


    const updateEventData = {
        type: isInit ? 'init' : 'switch',
        value: this.selected
    };
    this.update(updateEventData);
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
    //日期切换
    const prev = this.element.querySelector(".calendar-action-prev");
    const next = this.element.querySelector(".calendar-action-next");
    if (prev && next) {
        if (this.infiniteMode) {
            next.addEventListener("click", () => {
                this.doMonthSwitch(1);
            });
            prev.addEventListener("click", () => {
                this.doMonthSwitch(-1);
            })
        } else {
            const endGap = diff(this.date, this.endDate);
            if (endGap >= 1) {
                next.addEventListener("click", () => {
                    this.doMonthSwitch(1);
                    removeClass(prev, "disabled");
                    removeClass(prev, "calendar-action-disabled")
                });
            }
            else {
                addClass(next, "disabled");
                addClass(next, "calendar-action-disabled")
            }

            const startGap = diff(this.date, this.startDate);
            if (startGap >= 1) {
                prev.addEventListener("click", () => {
                    this.doMonthSwitch(-1);
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
    if (option.doubleSelect) {
        this.double = option.doubleSelect
    }
    this.dateFormat = option.format //|| "YYYY-MM-DD";
    const parseToInt = parseInt(option.views);
    if ((option.views !== 'auto' && isNaN(parseToInt)) || parseToInt === 1 || parseToInt > 2 || parseToInt <= 0) {
        this.singleView = true;
    }
    else if (option.views === 'auto') {
        this.flatView = true;
        this.singleView = false;
    }
    else if (parseToInt === 2) {
        this.multiViews = true;
        this.singleView = false
    }
    //开始日期
    this.startDate = isDate(option.from) ? option.from : new Date();
    this.date = this.startDate;
    //结束日期
    this.endDate = isDate(option.to) ? option.to : new Date(this.date.getFullYear(), this.date.getMonth() + 6, 0);
    //選擇日期區間最大限制
    this.limit = this.double ? isNumber(option.limit) ? option.limit : 1 : 1;
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

    if (!isDate(option.from) || !isDate(option.to)) {
        this.infiniteMode = true;
        if (this.bindData) {
            warn('init', "infiniteMode is on, please provide [from] and [to] while binding data to datepicker  ")
        }
    }

    this.format = (date: Date) => format(date, this.dateFormat);
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




