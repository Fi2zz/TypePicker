import {datePickerOptions} from "./datepicker.interfaces";
import Observer from './datepicker.observer';
import merge from './merge'
import {
    diff,
    isObject,
    isDate,
    isArray,
    nextTick,
    clearNextTick,
    warn
} from "./util"
import {
    init,
    currentRange,
    doMonthSwitch,
    bindMonthSwitch,
    createDatePicker
} from './datepicker.init'
import handlePickDate from './datepicer.picker'
import {parseFormatted, format as formatter} from "./datepicker.formatter"

function noData(result: any) {
    return !isObject(result)
        || (Object.keys(result.data).length <= 0
        || result.dates.length <= 0)
}

function initWithDataBind(option: any, cb: Function) {
    if (option.bindData) {
        const params = {
            dates: <Array<string>>[],
            data: <any>{},
        };
        const cbData = cb && cb(params);
        const result = cbData ? cbData : params;
        const config = {
            data: result.data,
            dates: result.dates.sort((a: string, b: string) => this.parse(a) - this.parse(b))
        };

        this.init(option, config);
        if (!noData(result)) {
            this.dataRenderer(result.data);
        }
    }
}


export default class DatePicker {
    date: Date = new Date();
    startDate: Date = new Date();
    endDate: Date | any = null;
    dates: string[] = [];
    selected: any[] = [];
    currentSelection: string[] = [];
    limit: number = 1;
    dateFormat: string;
    language: any = {};
    element: any = null;
    double: boolean = false;
    flatView: boolean = false;
    multiViews: boolean = false;
    singleView: boolean = true;
    bindData: boolean = false;
    infiniteMode: boolean = false;
    isFromSetRange: boolean = false;
    init: Function = init;
    currentRange: Function = currentRange;
    doMonthSwitch: Function = doMonthSwitch;
    createDatePicker: Function = createDatePicker;
    bindMonthSwitch: Function = bindMonthSwitch;
    initWithDataBind: Function = initWithDataBind;
    pickDate: Function = () => {
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
    format: Function = (date: Date, format?: string) => formatter(date, format ? format : this.dateFormat);
    parse: Function = (string: string, format?: string) => parseFormatted(string, format ? format : this.dateFormat);
    inDates: Function = (date: string) => this.dates.indexOf(date) >= 0;
    update: Function = (result: any) => {
        const {type, value} = result;
        if (type === 'selected') {
            this.setDates(value, false)
        } else if (type === 'switch') {
            if (this.currentSelection.length > 0) {
                this.selected = this.currentSelection;
            }
        }

        if (type !== 'disabled' && type !== 'switch') {
            Observer.$emit("update", result);
        }
    };
    dataRenderer: Function = (data: any) => {
        if (Object.keys(data).length <= 0) {
            Observer.$remove("data")
        } else {
            const next = nextTick(() => {
                Observer.$emit("data", {
                    data: data,
                    nodeList: this.element.querySelectorAll(".calendar-cell")
                });
                clearNextTick(next)
            })

        }
    };
    setDates: Function = (dates: Array<any>, isFromInitedInstance?: boolean) => {
        if (!isArray(dates)) {
            dates = [];
            warn("setDates", `no dates provided,${dates}`);
            return
        }

        this.isFromSetRange = !(!isFromInitedInstance);

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

        const datesHandler = (cb?: Function) => {
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
                if (cb && typeof cb === 'function') {
                    const cbValue = cb && cb(startDate, endDate, diffed);
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
        if (!this.bindData) {
            datesHandler()
        } else {
            const next = nextTick(() => {
                datesHandler(bindDataHandler);
                clearNextTick(next);
            });
        }


    };

    constructor(option?: datePickerOptions) {
        let util = <any> {
            diff: <Function>(d1: Date, d2: Date) => diff(d1, d2, "days"),
            parse: <Function>(string: string, format: string) => this.parse(string, format),
            format: <Function>(date: Date, format: string) => this.format(date, format).value,
        };
        if (option) {
            this.bindData = option.bindData;
            if (!option.bindData && option.el) {
                this.init(option, {});
            }
            util = merge(util, {
                on: Observer.$on,
                data: <Function>(cb: Function) => this.initWithDataBind(option, cb),
                dateRanges: <Function>(dates: any, fromInstance: boolean) => {
                    warn("dateRanges", "this function has been deprecated, use [setDates] instead");
                    this.setDates(dates, fromInstance)
                },
                setDefaultDates: <Function>() => {
                    warn("setDefaultDates", "this method has been deprecated,use [setDates()] instead ")
                },
                setDates: <Function> this.setDates
            });
        }
        return util;
    }
}

