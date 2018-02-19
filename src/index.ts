import {datePickerOptions, disable} from "./datepicker.interfaces";
import Observer from './datepicker.observer';
import {
    diff,
    isObject,
    isDate,
    isArray,
    nextTick,
    clearNextTick,
    warn,
    addClass,
    isNumber,
    removeClass,
    parseToInt,
    parseEl,
    noData,
    removeDisableDates,
    isFunction,
    getDates
} from "./util"

import HTML from './datepicker.template'
import handlePickDate from './datepicer.picker'
import {parseFormatted, format as formatter} from "./datepicker.formatter"
import {setInitRange} from "./datepicker.ranger";


export default class DatePicker {
    private date: Date = new Date();
    private startDate: Date = new Date();
    private endDate: Date | any = null;
    private dates: string[] = [];
    private selected: any[] = [];
    private currentSelection: string[] = [];
    private data: any = {};
    private disables: any = {};
    private limit: number = 1;
    private dateFormat: string;
    private language: any = {};
    private element: any = null;
    private double: boolean = false;
    private flatView: boolean = false;
    private multiViews: boolean = false;
    private singleView: boolean = true;
    private bindData: boolean = false;
    private infiniteMode: boolean = false;
    private isInit: boolean = false;
    public on: Function = Observer.$on;
    public format: Function = (date: Date, format?: string) => formatter(date, format ? format : this.dateFormat);
    public parse: Function = (string: string, format?: string) => parseFormatted(string, format ? format : this.dateFormat);
    private inDates = (date: string) => {
        return this.dates.indexOf(date) >= 0
    };

    private emit(evt: string, data: any) {
        return Observer.$emit(evt, data)
    };

    private currentRange(isInit: boolean) {
        const initSelected =
            this.currentSelection.length > 0
                ? this.currentSelection
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
            disables: this.disables,
            isInit,
        };
        return setInitRange(rangeOption)
    };

    private doMonthSwitch(size: number) {
        const curr = {
            year: this.date.getFullYear(),
            month: this.date.getMonth(),
            date: this.date.getDate()
        };
        this.date = new Date(curr.year, curr.month + size, curr.date);
        this.isInit = false;
        this.createDatePicker(false);

    }

    private bindMonthSwitch() {
        //日期切换
        const prev = this.element.querySelector(".calendar-action-prev");
        const next = this.element.querySelector(".calendar-action-next");
        if (prev && next) {
            if (this.infiniteMode) {
                next.addEventListener("click", () => this.doMonthSwitch(1));
                prev.addEventListener("click", () => this.doMonthSwitch(-1))
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
    };

    private pickDate() {
        handlePickDate({
            element: this.element,
            selected: this.selected,
            isDouble: this.double,
            source: this.dates,
            parse: this.parse,
            format: this.format,
            limit: this.limit,
            inDates: this.inDates,
            update: this.update,
            infiniteMode: this.infiniteMode,
            bindData: this.bindData
        })
    };

    private update = (result: any) => {
        const {type, value} = result;
        if (type === 'selected') {
            this.setDates(value, false)
        } else if (type === 'switch') {
            if (this.currentSelection.length > 0) {
                this.selected = this.currentSelection;
            }
        }
        if (type !== 'disabled' && type !== 'switch') {
            this.emit("update", result);
        }
    };

    private dataRenderer() {
        if (Object.keys(this.data).length > 0) {
            const next = nextTick(() => {
                this.emit("data", {
                    data: this.data,
                    nodeList: this.element.querySelectorAll(".calendar-cell")
                });
                clearNextTick(next)
            })
        }
    };

    public setDates: Function = (dates: Array<any>) => {
        if (!isArray(dates)) {
            dates = [];
            warn("setDates", `no dates provided,${dates}`);
            return
        }
        const bindDataHandler = (startDate: Date, endDate: Date, diffed: number) => {
            if (diffed < 0
                || diffed > this.limit
                || (!this.inDates(this.format(startDate).value) && !this.inDates(this.format(endDate).value) )//开始日期和结束日期均为无效日期
                || !this.inDates(this.format(startDate).value)
            ) {
                warn(`setDates`, `Illegal dates,[${dates}]`);
                return false;
            }
            for (let i = 0; i <= diffed; i++) {
                const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                const formatted = this.format(date).value;
                if (i < diffed && !this.inDates(formatted)) {
                    warn("setDates", `Illegal date,{dates:[${formatted}]}`)
                    return false
                }
            }

            return true
        };

        let datesList: Array<any> = [];
        let start: string = '', end: string = ''
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
            datesList = [this.format(startDate).value, this.format(endDate).value]
        }
        else {
            const d = dates[dates.length - 1];
            datesList = [isDate(d) ? this.format(d).value : d]
        }
        this.currentSelection = datesList;
    };

    public setLanguage(pack?: any) {
        if (isArray(pack.days) && isArray(pack.months)) {
            this.language = {
                week: pack.days,
                title: (year: any, month: any) => {
                    if (pack.year) {
                        return `${year}${pack.year}${pack.months[month]}`
                    } else {
                        return `${pack.months[month]} ${year}`
                    }
                }
            };
        }
        return false;
    };

    private disable() {
        if (Object.keys(this.disables).length > 0) {
            const next = nextTick(() => {
                this.emit("disabled", {
                    nodeList: this.element.querySelectorAll(".calendar-cell"),
                    dateList: this.disables
                });
                clearNextTick(next)
            })
        }
    }

    public setDisabled = (param: disable) => {
        if (!param || isObject(param) && Object.keys(param).length <= 0) {
            warn("setDisabled",
                `invalid params, \nparams should be {dates:<Array<any>>[], days:<Array<number>>[] }`)
            return false;
        }
        if (!isArray(param.dates) && !isArray(param.days)) {
            warn("setDisabled", `invalid params  { dates:<Array<any>>${param.dates}, days:<Array<number>>${param.days} }`);
            return false;
        }
        const dateMap = {};
        const dateList = [];
        if (isArray(param.dates)) {
            for (let date of param.dates) {
                if (isDate(date)) {
                    dateList.push(this.format(date).value)
                } else {
                    dateList.push(date);
                }
            }
        }
        if (isArray(param.days)) {
            for (let day of param.days) {
                let dey = this.element.querySelectorAll(`[data-day="${day}"`);
                if (dey) {
                    for (let d of dey) {
                        let date = d.getAttribute("data-date");
                        if (date) {
                            dateList.push(date);
                        }
                    }
                }
            }
        }
        for (let date of dateList) {
            dateMap[date] = date;
        }
        this.disables = dateMap;
    };

    public setData(cb: Function) {
        const param = {
            data: {},
            dates: []
        };
        if (isFunction(cb)) {
            const result = cb(param);
            if (!noData(result)) {
                this.data = result.data;
                this.dates = result.dates.sort((a: string, b: string) => this.parse(a) - this.parse(b));
            }
        }

    };

    public diff(d1: Date, d2: Date) {
        return diff(d1, d2, "days")
    }

    private  createDatePicker(isInit?: Boolean) {
        this.element.innerHTML = new HTML({
            startDate: this.date,
            endDate: this.endDate,
            multiViews: this.multiViews,
            flatView: this.flatView,
            singleView: this.singleView,
            language: this.language,
            infiniteMode: this.infiniteMode,
            dateFormatter: this.format,
            dateParser: this.parse
        }).template;

        this.selected = this.currentRange(this.isInit);
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
        this.bindMonthSwitch();
        this.disable();
        this.pickDate();
        this.dataRenderer();
        this.update(updateEventData);
    };


    private init(option: any) {
        const currDate = new Date();

        if (option.doubleSelect) {
            this.double = option.doubleSelect
        }
        this.dateFormat = option.format;
        const views = parseToInt(option.views);
        if ((option.views !== 'auto' && isNaN(views)) || views === 1 || views > 2 || views <= 0) {
            this.singleView = true;
        }
        else if (option.views === 'auto') {
            this.flatView = true;
            this.singleView = false;
        }
        else if (views === 2) {
            this.multiViews = true;
            this.singleView = false
        }
        //开始日期
        this.startDate = isDate(option.from) ? option.from : new Date();
        //结束日期
        this.endDate = isDate(option.to) ? option.to : new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 6, 0);
        //初始视图所在日期
        this.date = this.startDate;
        //選擇日期區間最大限制
        this.limit = this.double ? (isNumber(option.limit) ? option.limit : 2) : 1;
        if (Object.keys(this.language).length <= 0) {
            const defaultLanguage: any = {
                days: ['日', '一', '二', '三', '四', '五', '六'],
                months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
                year: "年"
            };
            this.language = {
                week: defaultLanguage.days,
                title: (year: any, month: any) => {
                    if (defaultLanguage.year) {
                        return `${year}${defaultLanguage.year}${defaultLanguage.months[month]}`
                    } else {
                        return `${defaultLanguage.months[month]} ${year}`
                    }
                }
            }
        }
        this.element = parseEl(option.el);
        if (!this.element) {
            warn('init', `invalid selector,current selector ${this.element}`);
            return false
        }
        this.element.className = `${this.element.className} calendar calendar-${this.multiViews ? "double-views" : this.singleView ? "single-view" : "flat-view"}`
        const next = nextTick(() => {
            this.isInit = this.currentSelection.length > 0;
            this.bindData = Object.keys(this.data).length > 0;
            if (!isDate(option.from) || !isDate(option.to)) {
                this.infiniteMode = true;
                this.flatView = false;
                if (this.bindData) {
                    warn('init', "infiniteMode is on, please provide [from] and [to] while binding data to datepicker  ")
                }
            }
            if (!this.bindData) {
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
                this.dates = dates;
            }
            //处理结束日期后的日期
            const endMonthDates = getDates(this.endDate.getFullYear(), this.endDate.getMonth());
            const endDate = this.endDate.getDate();
            const diffs = endMonthDates - endDate;
            for (let i = 0; i < diffs; i++) {
                let date = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), endDate + i);
                let formatted = this.format(date).value;
                this.disables[formatted] = formatted
            }
            const disableList = Object.keys(this.disables);
            if (disableList.length > 0) {
                const datesList = this.dates;
                const newDateList = [];
                const removed = removeDisableDates(Object.keys(this.disables), this.data);
                for (let key in removed) {
                    delete this.data[key]
                }
                for (let date of datesList) {
                    if (!removed[date]) {
                        newDateList.push(date)
                    }
                }
                this.dates = newDateList
            }

            if (!this.flatView) {
                if (this.currentSelection.length > 0) {
                    this.date = this.parse(this.currentSelection[0])
                } else {
                    if (this.dates.length > 0) {
                        this.date = this.parse(this.dates[0])
                    }
                }
            }
            this.createDatePicker(true);
            clearNextTick(next)
        })
    };
    constructor(option?: datePickerOptions) {
        if (option) {
            this.init(option);
        }
        else {
            return <any> {
                diff: this.diff,
                parse: this.parse,
                format: <Function>(date: Date, format: string) => this.format(date, format).value,
            }
        }
    }
}

