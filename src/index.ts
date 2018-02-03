import {datePickerOptions} from "./datepicker.interfaces";
import Observer from './datepicker.observer';
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
            from: Date,
            to: Date
        };
        const cbData = cb && cb(params);
        const result = cbData ? cbData : params;
        if (isDate(params.from)) option.from = params.from;
        if (isDate(params.to)) option.to = params.to;
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
function createDateRanges(dates: Array<any>, isFromSetRange?: boolean) {
    if (!isArray(dates)) {
        dates = [];

        warn("dateRanges", `no dates provided,${dates}`);
        return
    }
    this.isFromSetRange = !(!isFromSetRange);
    const handler = () => {
        let datesList: Array<any> = []
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
                if (diffed < 0
                    || diffed > this.limit
                    || !this.inDates(this.format(startDate).value) && !this.inDates(this.format(endDate).value) //开始日期和结束日期均为无效日期
                    || !this.inDates(this.format(startDate).value)
                ) {
                    warn(`dateRanges`, `Illegal dates,[${dates}]`);
                    return false;
                }
            }
            for (let i = 0; i <= diffed; i++) {
                const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                const formatted = this.format(date).value;
                if (i < diffed && !this.inDates(formatted)) {
                    warn("dateRanges", `Illegal date,{dates:[${formatted}]}`)
                    return false
                }
            }
            datesList = [this.format(startDate).value, this.format(endDate).value]
        }
        else {
            const d = dates[dates.length - 1];
            datesList = [isDate(d) ? this.format(d).value : d]
        }
        this.defaultDates = datesList;
    };
    if (!this.bindData) {
        handler()
    } else {
        const next = nextTick(() => {
            handler();
            clearNextTick(next);
        });
    }
}
function instanceUtils() {
    return <Object> {
        format: (date: Date, format: string) => (date && format) ? formatter(date, format).value : null,
        parse: (string: string, format: string) => (string && format) ? parseFormatted(string, format) : new Date(),
        diff: (d1: Date, d2: Date) => diff(d1, d2, "days")
    };
}
export default class DatePicker {
    init = init;
    date: Date = new Date();
    dates: Array<any>;
    limit: number = 1;
    double: boolean = false;
    dateFormat: string;
    element: any = null;
    startDate: Date = new Date();
    endDate: Date | any = null;
    selected: Array<any> = [];
    flatView: boolean = false;
    multiViews: boolean = false;
    singleView: boolean = false;
    doMonthSwitch = doMonthSwitch;
    createDatePicker = createDatePicker;
    zeroPadding: boolean = false;
    bindData: boolean = false;
    infiniteMode: boolean = false;
    currentRange: Function = currentRange;
    isFromSetRange: boolean = false;
    language: any = {};

    pickDate = () => {
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
    defaultDates: Array<string>[];
    format = (date: Date) => formatter(date, this.dateFormat, this.zeroPadding);
    parse = (string: string) => parseFormatted(string, this.dateFormat);
    inDates = (date: string | any) => this.dates.indexOf(date) >= 0;
    update = (result: any) => {
        const {type, value} = result;
        if (type === 'selected') {
            this.dateRanges(value, false)
        } else if (type === 'switch') {
            if (this.defaultDates.length > 0) {
                this.selected = this.defaultDates;
            }
        }
        if (type !== 'disabled' && type !== 'switch') {
            Observer.$emit("update", result);
        }
    };
    dataRenderer = (data: any) => {
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
    dateRanges = createDateRanges;
    bindMonthSwitch: Function = bindMonthSwitch;
    initWithDataBind: Function = initWithDataBind;

    constructor(option?: datePickerOptions) {
        if (!option) {
            return <any>instanceUtils()
        }
        this.defaultDates = [];
        this.bindData = option.bindData;
        if (!option.bindData && option.el) {
            this.init(option, {});
        }
        return <any> {
            on: Observer.$on,
            data: (cb: Function) => this.initWithDataBind(option, cb),
            diff: (d1: Date, d2: Date) => diff(d1, d2, "days"),
            parse: this.parse,
            format: this.format,
            dateRanges: this.dateRanges,
            setDefaultDates: () => {
                warn("setDefaultDates", "this method has been deprecated,use [dateRanges()] instead ")
            }
        };
    }
}
