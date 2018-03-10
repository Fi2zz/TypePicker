import {datePickerOptions, disable} from "./datepicker.interfaces";
import Observer from './datepicker.observer';
import {
    diff,
    warn,
    merge,
    isDate,
    isEmpty,
    isArray,
    isNumber,
    isObject,
    isFunction,
    parseEl,
    getPeek,
    getFront,
    getRange,
    getDates,
    hasClass,
    addClass,
    removeClass,
    parseToInt,
    nextTick,
    attrSelector,
    clearNextTick,
} from "./util"
import HTML from './datepicker.template'
import handlePickDate from './datepicker.picker'
import {parseFormatted, format as formatter} from "./datepicker.formatter"

const getDisableDates = (startDate: Date, endDate: Date, dateFormat: string, should: boolean) => {
    const startMonthDates = startDate.getDate();
    const temp: any = {};
    if (should) {
        //处理开始日期前的日期
        for (let i = 1; i <= startMonthDates - 1; i++) {
            let date = new Date(startDate.getFullYear(), startDate.getMonth(), startMonthDates - i);
            let formatted = formatter(date, dateFormat).value;
            temp[formatted] = formatted
        }
        //处理结束日期后的日期
        const endMonthDates = getDates(endDate.getFullYear(), endDate.getMonth());
        const diffs = endMonthDates - endDate.getDate();
        for (let i = 1; i <= diffs; i++) {
            let date = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + i);
            let formatted = formatter(date, dateFormat).value;
            temp[formatted] = formatted
        }
    }
    return temp

};

function getViews(view: number | string) {
    if (!view) {
        return 1
    }
    const views = parseToInt(view);
    if (isNaN(views)) {
        if (view !== 'auto') {
            return 1
        } else {
            return 'auto'
        }
    }
    else {
        if (views > 2 || views <= 0) {
            return 1
        }
        else {
            return views
        }
    }
}

function deprecatedWarn(key: string, instead?: string) {
    console.warn(`[deprecated]${key} is deprecated ${instead ? ',' + instead + ' instead' : ''}`)
}

export default class DatePicker {
    protected dates: string[] = [];
    private dateFormat: string;
    private limit: number = 1;
    private views: number | string = 1;
    private date: Date = new Date();
    private startDate: Date = null;
    private endDate: Date = null;
    private selected: string[] = [];
    private data: any = {};
    private disables: any = {};
    private language: any = {
        days: ['日', '一', '二', '三', '四', '五', '六'],
        months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
        year: "年"
    };
    private element: any = null;
    private double: boolean = false;
    private bindData: boolean = false;
    private inDates = (date: string) => {
        return this.endDate ? this.dates.indexOf(date) >= 0 : Object.keys(this.disables).indexOf(date) <= -1
    };
    public on(ev: string, cb: Function) {
        return Observer.$on(ev, cb)
    };

    public format: Function = (date: Date, format?: string) => formatter(date, format ? format : this.dateFormat);
    public parse: Function = (string: string, format?: string) => parseFormatted(string, format ? format : this.dateFormat);

    public setDates(dates: Array<any>) {
        if (!isArray(dates)) {
            dates = [];
            warn("setDates", `no dates provided,${dates}`);
            return
        }
        const bindDataHandler = (startDate: Date, endDate: Date, diffed: number) => {
            if (diffed < 0
                || diffed > this.limit
                || (!this.inDates(this.format(startDate).value) && !this.inDates(this.format(endDate).value))//开始日期和结束日期均为无效日期
                || !this.inDates(this.format(startDate).value)
            ) {
                warn(`setDates`, `Illegal dates,[${dates}]`);
                return false;
            }
            for (let i = 0; i <= diffed; i++) {
                const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                const formatted = this.format(date).value;
                if (i < diffed && !this.inDates(formatted)) {
                    warn("setDates", `Illegal date,{dates:[${formatted}]}`);
                    return false
                }
            }
            return true
        };
        let datesList: Array<any> = [];
        let start: string = '', end: string = '';
        if (this.double) {
            if (dates.length > 2) {
                dates = dates.slice(0, 2)
            }
            start = <any>dates[0];
            end = <any>dates[dates.length - 1];
            const startDate = isDate(start) ? start : this.parse(start);
            const endDate = isDate(end) ? end : this.parse(end);
            const diffed = diff(startDate, endDate, "days") * -1;
            if (this.bindData) {
                const cbValue = bindDataHandler(startDate, endDate, diffed);
                if (!cbValue) {
                    return false
                }
            }
            datesList = [this.format(startDate).value];
            if (start !== end) {
                datesList.push(this.format(endDate).value)
            }
        }
        else {
            const d = dates[dates.length - 1];
            datesList = [isDate(d) ? this.format(d).value : d]
        }
        this.selected = datesList;
    };

    public setLanguage(pack?: any) {
        if (isArray(pack.days) && isArray(pack.months)) {
            this.language = {
                days: pack.days,
                months: pack.months,
                year: pack.year
            }
        }
    };

    public setDisabled(param: disable) {
        if (!param || isObject(param) && Object.keys(param).length <= 0) {
            warn("setDisabled",
                `invalid params, \nparams should be {dates:<Array<any>>[], days:<Array<number>>[] }`);
            return false;
        }
        if (!isArray(param.dates) && !isArray(param.days)) {
            warn("setDisabled", `invalid params  { dates:<Array<any>>${param.dates}, days:<Array<number>>${param.days} }`);
            return false;
        }

        const dateList = isArray(param.dates) ? param.dates.map((date: any) => {
            if (date instanceof Date) {
                return this.format(date).value
            }
            else {
                let parsed = this.parse(date);
                if (parsed instanceof Date) {
                    return date
                }
            }
        }).filter((item: string) => !!item) : [];
        const dayList = isArray(param.days) ? param.days.filter((item: any) => {
            let parsed = parseToInt(item);
            return !isNaN(parsed) && parsed >= 0 && parsed <= 6
        }) : [];

        let fromDate: any;
        let toDate: any;
        const to = param.to;
        const from = param.from;
        if (from) {
            if (isDate(from)) {
                fromDate = from
            }
            else {
                const parsed = this.parse(from);
                if (isDate(parsed)) {
                    fromDate = parsed
                } else {
                    return false;
                }
            }
            this.endDate = fromDate
        }
        if (to) {
            if (isDate(to)) {
                toDate = to;
            }
            else {
                const parsed = this.parse(to);
                if (isDate(parsed)) {
                    toDate = parsed
                } else {
                    return false;
                }
            }
            this.date = toDate;
            this.startDate = toDate
        }
        Observer.$emit('setDisabled', {
            dayList,
            dateList
        })

    };

    public setData(cb: Function) {

        if (isFunction(cb)) {
            const result = cb();
            if (isObject(result) && Object.keys(result).length > 0) {

                for (let key in result) {
                    let date = this.parse(key);
                    if (date instanceof Date) {
                        this.data[key] = result[key]
                    }
                }
            } else {
                warn("setData", `you are passing wrong type of data to DatePicker,data should be like :
                    {
                        ${formatter(new Date, this.dateFormat).value}:"your value" ,
                     }`)
            }
        }
    };

    private createDatePicker() {

        this.element.innerHTML = new HTML({
            date: this.date,
            diff: diff(this.startDate, this.endDate),
            language: this.language,
            views: this.views,
            dateFormat: this.dateFormat
        }).template;
        //日期切换
        const prev = this.element.querySelector(".calendar-action-prev");
        const next = this.element.querySelector(".calendar-action-next");
        if (prev && next) {
            const endGap = this.endDate ? diff(this.endDate, this.date) : 1;
            const startGap = this.endDate ? diff(this.date, this.startDate) : 2;
            if (startGap > 1) {
                prev.addEventListener("click", () => {
                    Observer.$emit('create', {type: 'switch', size: -1});
                    removeClass(next, "disabled calendar-action-disabled")
                });
            } else {
                addClass(prev, "disabled calendar-action-disabled")
            }
            if (endGap >= 1) {
                next.addEventListener("click", () => {
                    Observer.$emit('create', {type: 'switch', size: 1});
                    removeClass(prev, "disabled calendar-action-disabled")
                });
            }
            else {
                addClass(next, "disabled calendar-action-disabled")
            }
        }
    };

    private init(option: datePickerOptions) {
        const currDate = new Date();
        if (option.doubleSelect) {
            this.double = option.doubleSelect
        }
        this.dateFormat = option.format;
        this.views = getViews(option.views);
        //开始日期
        this.startDate = isDate(option.startDate) ? option.startDate : new Date();
        //结束日期
        if (isDate(option.endDate)) {
            this.endDate = option.endDate
        }
        //初始视图所在日期
        this.date = this.startDate;
        //選擇日期區間最大限制
        this.limit = this.double ? (isNumber(option.limit) ? option.limit : 2) : 1;
        this.element = parseEl(option.el);
        if (!this.element) {
            warn('init', `invalid selector,current selector ${this.element}`);
            return false
        }
        let rawDisableMap: any = {
            dateList: [],
            dayList: []
        };
        Observer.$on('setDisabled', (result: any) => rawDisableMap = result);
        this.element.className = `${this.element.className} calendar calendar-${this.views === 2 ? "double-views" : this.views === 1 ? "single-view" : "flat-view"}`;
        const next = nextTick(() => {
            const dateMap = {};
            this.bindData = !isEmpty(this.data);
            if (!isDate(option.startDate) || !isDate(option.endDate)) {
                if (this.bindData) {
                    warn('init',
                        "please provide [startDate] and [endDate] while binding data to datepicker")
                }
            }
            if (!this.bindData) {
                if (isDate(option.startDate) && isDate(option.endDate)) {
                    const gap = diff(this.endDate, currDate, "days");
                    const year = currDate.getFullYear();
                    const month = currDate.getMonth();
                    const date = currDate.getDate();
                    for (let i = 0; i < gap; i++) {
                        let item: Date = new Date(year, month, date + i);
                        let formatted = this.format(item).value;
                        dateMap[formatted] = item.getDay()
                    }
                }
            }
            else {
                for (let key in this.data) {
                    dateMap[key] = this.parse(key).getDay()
                }
            }

            const disabledMap = {};
            const {dateList, dayList} = rawDisableMap;
            if (this.endDate) {
                for (let date in dateMap) {
                    let day = parseToInt(dateMap[date]);
                    if (dateList.indexOf(date) >= 0) {
                        delete  dateMap[date];
                        if (!disabledMap[date]) {
                            disabledMap[date] = date;
                        }
                    }
                    if (dayList.indexOf(day) >= 0) {
                        if (dateMap[date]) {
                            delete  dateMap[date];
                        }
                        if (!disabledMap[date]) {
                            disabledMap[date] = date;
                        }
                    }
                }
            }
            else {
                for (let date of dateList) {
                    disabledMap[date] = date;
                }
            }


            const disableBeforeStartDateAndAfterEndDate = getDisableDates(this.startDate, this.endDate, this.dateFormat, !!this.endDate);
            //无效日期
            this.disables = merge(disableBeforeStartDateAndAfterEndDate, disabledMap);
            //所有有效日期
            this.dates = Object.keys(dateMap).sort((prev: string, next: string) => this.parse(prev) - this.parse(next));

            const initRanges: any = getRange(this.selected, this.dateFormat, this.limit, this.inDates);
            const hasInvalidDate = initRanges.invalidDates.length > 0;

            if (hasInvalidDate || !this.inDates(getFront(this.selected)) && !this.double) {
                this.selected = [];
            }
            if (this.views === 'auto') {
                if (!isEmpty(this.selected)) {
                    this.date = this.parse(getFront(this.selected))
                } else if (!isEmpty(this.dates)) {
                    this.date = this.parse(getFront(this.dates))
                }
            }
            if (this.views === 1) {
                if (this.double && this.selected.length >= 2) {
                    if (getFront(this.selected) === getPeek(this.selected)) {
                        this.selected.pop()
                    }
                }
            }
            Observer.$emit('create', {type: 'init', size: 0});
            clearNextTick(next)
        })


    };

    constructor(option: datePickerOptions) {
        if (option.from) {
            deprecatedWarn('option.from', 'use option.startDate');
            delete option.from
        }
        if (option.to) {
            deprecatedWarn('option.to', 'use option.endDate');
            delete option.to
        }


        function setHTMLNodeRange(data: Array<any>, collector: HTMLElement) {
            let collection = collector.querySelectorAll(".in-range");
            for (let i = 0; i < collection.length; i++) {
                removeClass(collection[i], "in-range")
            }
            for (let i = 0; i < data.length; i++) {
                let selector = <string> attrSelector("data-date", data[i]);
                let element = collector.querySelector(selector);
                if (!hasClass(element, "active")) {
                    addClass(element, "in-range")
                }
            }
        }

        function setHTMLNodeState(el: HTMLElement, dates: Array<string>, isDouble) {
            const nodes = el.querySelectorAll(".calendar-date-cell");
            for (let i = 0; i < nodes.length; i++) {
                removeClass(nodes[i], "active");
                if (isDouble) {
                    removeClass(nodes[i], "start-date");
                    removeClass(nodes[i], "end-date");
                }
            }
            for (let i = 0; i < dates.length; i++) {
                let date = dates[i];
                let dateElement = el.querySelector(`[data-date="${date}"]`);
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


        Observer.$on("select", (result: any) => {
            let {type, value} = result;
            if (type !== 'disabled') {
                const currRange: any = getRange(value, this.dateFormat, this.limit, this.inDates);
                if (this.double) {
                    setHTMLNodeRange(currRange.validDates, this.element);
                }
                setHTMLNodeState(this.element, value, this.double);
                Observer.$emit("update", result);
            }
        });
        Observer.$on('create', (result: any) => {
            let {type, size} = result;


            if (type === 'switch') {
                const curr = {
                    year: this.date.getFullYear(),
                    month: this.date.getMonth(),
                    date: this.date.getDate()
                };
                this.date = new Date(curr.year, curr.month + size, curr.date);

            }

            this.createDatePicker();
            //初始化的时候的选中状态
            if (type === 'init') {
                Observer.$emit('select', {
                    type: 'init',
                    value: this.selected
                });
            }
            if (this.bindData) {
                Observer.$emit("data", {
                    data: this.data,
                    nodeList: this.element.querySelectorAll(".calendar-cell")
                });
            }
            if (!isEmpty(this.disables)) {
                Observer.$emit("disabled", {
                    nodeList: this.element.querySelectorAll(".calendar-cell"),
                    dateList: this.disables
                });
            }
            handlePickDate({
                dateFormat: this.dateFormat,
                element: this.element,
                selected: this.selected,
                isDouble: this.double,
                limit: this.limit,
                bindData: this.bindData,
                inDates: this.inDates,
                infiniteMode: !!this.endDate
            });
        });
        this.init(option);
    }
}

