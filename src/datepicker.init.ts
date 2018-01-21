import {addClass, diff, getLanguage, isBoolean, isDate, isNumber, parseEl, removeClass, setLanguage} from "./util";
import compose from "./datepicker.template";
import {setDefaultRange} from "./datepicker.ranger";

/***
 * 月份切换
 * @param size 切换月份数量
 * @param language 语言包
 * ***/
export function monthSwitch(size: number, language: any) {
    let curr = {
        year: this.date.getFullYear(),
        month: this.date.getMonth(),
        date: this.date.getDate()
    };
    let month = curr.month + size;
    //每次切换两个月份
    if (this.multiViews) {
        // month += size > 0 ? 1 : -1
    }
    if (this.defaultDates.length > 0) {
        this.selected = this.defaultDates;
    }

    this.date = new Date(curr.year, month, curr.date);
    this.createDatePicker(language, false);
    this.pickDate();
    this.dataRenderer(this.data)
}


/**
 * 生成日历
 * @param lang 语言包
 *
 * **/
export function createDatePicker(lang: any, isInit: boolean) {
    if (!this.element) {
        console.error(`[Calendar Warn] invalid selector,current selector ${this.element}`);
        return false
    }

    this.element.innerHTML = compose(
        this.date,
        this.endDate,
        this.dateFormat,
        this.multiViews,
        this.flatView,
        setLanguage(lang),
        this.zeroPadding
    );
    this.bindMonthSwitch(lang);
    //加个定时器，保证初始化时，可以得到选中的日期
    const timer = setTimeout(() => {
        const initSelected =
            this.defaultDates.length > 0
                ? this.defaultDates
                : this.double
                ? this.selected
                : [this.format(this.date).value];
        this.selected = setDefaultRange(
            this.element,
            this.element.querySelectorAll(".calendar-date-cell:not(.empty)"),
            initSelected,
            this.dates,
            this.double,
            this.parse,
            this.format);
        const updateEventData = {
            type: 'init',
            value: this.selected
        };
        //初始化的时候，需要获取初始化的日期
        if (isInit) {
            this.update(updateEventData);
        }
        clearTimeout(timer)
    }, 0);
}
export function bindMonthSwitch(lang: any) {
    const startTime = this.startDate.getTime();
    const currTime = this.date.getTime();
    //日期切换
    const prev = this.element.querySelector(".calendar-action-prev");
    const next = this.element.querySelector(".calendar-action-next");
    if (prev && next) {
        let gap = diff(this.date, this.endDate);
        if (gap >= 2) {
            next.addEventListener("click", () => {
                this.monthSwitch(1, lang);
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
                this.monthSwitch(-1, lang);
                removeClass(next, "disabled");
                removeClass(next, "calendar-action-disabled")
            });
        } else {
            addClass(prev, "disabled");
            addClass(prev, "calendar-action-disabled")
        }
    }

}


export function init(option: any, renderer: any) {
    if (option.format) {
        this.dateFormat = option.format || "YYYY-MM-DD"
    }
    //單視圖，即單個日曆視圖
    if (!option.multiViews && option.flatView) {
        this.multiViews = false;
        this.flatView = true;
    }
    //雙視圖，即雙月份橫向展示
    if (option.flatView && option.multiViews || !option.flatView && option.multiViews) {
        this.flatView = false;
        this.multiViews = true
    }
    //扁平視圖，即多月份垂直展示
    if (!option.flatView && !option.multiViews) {
        this.flatView = false;
        this.multiViews = false
    }
    //雙選
    this.double = isBoolean(option.doubleSelect) ? option.doubleSelect : false;
    //开始日期
    this.startDate = isDate(option.from) ? option.from : new Date();
    this.date = this.startDate;
    //结束日期
    this.endDate = isDate(option.to) ? option.to : new Date(this.date.getFullYear(), this.date.getMonth() + 6, this.date.getDate());
    //選擇日期區間最大限制
    this.limit = this.double ? isNumber(option.limit) ? option.limit : 1 : 1;
    if (this.flatView) {
        const year = this.endDate.getFullYear();
        const month = this.endDate.getMonth();
        const date = this.endDate.getDate();
        this.endDate = new Date(year, month + 1, date)
    }

    this.zeroPadding = !(!option.zeroPadding);
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
    }

    const lang = getLanguage(option.language, option.defaultLanguage);
    this.element = parseEl(option.el);
    this.createDatePicker(lang, true);
    this.pickDate();

}
