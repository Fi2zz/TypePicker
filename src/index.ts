import Observer from './datepicker.observer';
import {
    diff,
    isObject,
    isDate,
} from "./util"
import {
    init,
    monthSwitch,
    createDatePicker
} from './datepicker.init'
import handlePickDate from './datepicer.picker'
import {
    parseFormatted,
    format as formatter
} from "./datepicker.formatter"


interface INTERFACES {
    el: string,
    to: Date | any,
    from: Date | any,
    limit: number,
    format: string,
    language: any,
    flatView: boolean,
    multiViews: boolean,
    doubleSelect: boolean,
    defaultLanguage: string,
    bindData: boolean,
    zeroPadding: boolean
}


export default class DatePicker {
    init = init;

    date: Date = new Date();
    dates: Array<any>;
    limit: number = 1;
    double: boolean = false;
    dateFormat: string;//= "YYYY-MM-DD";
    element: any = null;
    startDate: Date = new Date();
    endDate: Date | any = null;
    selected: Array<any> = [];
    flatView: boolean = false;
    multiViews: boolean = false;
    monthSwitch = monthSwitch;
    createDatePicker = createDatePicker;
    zeroPadding: boolean = true;
    pickDate = () => {
        handlePickDate(
            this.element,
            this.selected,
            this.double,
            this.dates,
            this.parse,
            this.format,
            this.limit,
            this.inDates,
            this.update
        )
    };
    defaultDates: Array<string>[];
    defaults: Array<any>[];
    format = (date: Date, zeroPadding?: boolean) => formatter(date, this.dateFormat, this.zeroPadding);
    parse = (string: string) => parseFormatted(string, this.dateFormat);
    inDates = (date: string) => !!~this.dates.indexOf(date);
    update = (value: Array<any>) => Observer.$emit("update", value);
    dataRenderer = (data: any) => {
        if (Object.keys(data).length <= 0) {
            Observer.$remove("data")
        } else {
            Observer.$emit("data", {
                data: data,
                nodeList: this.element.querySelectorAll(".calendar-date-cell")
            })
        }
    };


    constructor(option: INTERFACES) {


        this.dateFormat = option.format || "YYYY-MM-DD";
        this.defaultDates = [];
        if (!option.bindData) {
            this.init(option, {});
        }
        const output: any = {
            on: Observer.$on,
            get: this.update,
            data: (cb: Function) => {
                function noData(data: any) {
                    return !isObject(data)
                        || (Object.keys(data.data).length <= 0
                            || data.dates.length <= 0)
                }

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

                    // const
                    const config = {
                        data: result.data,
                        dates: result.dates.sort((a: string, b: string) => this.parse(a) - this.parse(b))
                    }
                    this.init(option, config);
                    if (!noData(result)) {
                        this.dataRenderer(result.data);
                    }
                }
            },
            diff: (d1: Date, d2: Date) => diff(d1, d2, "days"),
            parse: this.parse,
            format: this.format,
            dateRanges: (dates: Array<any>) => {

                const tempDatesArray = <Array<any>>[];
                if (!dates) {
                    dates = [];
                    return
                }
                if (dates && dates instanceof Array) {
                    if (dates.length <= 0) {
                        console.error("[dateRanges error] no dates provided", dates);
                        return
                    }
                    if (option.doubleSelect) {
                        if (dates.length === 1) {
                            console.error("[dateRanges] please provide end date")
                        } else if (dates.length > 2) {
                            dates = dates.slice(0, 2)
                        }
                        const start = <any>dates[0];
                        const end = <any>dates[dates.length - 1];
                        const startDate = isDate(start) ? start : this.parse(start);
                        const endDate = isDate(end) ? end : this.parse(end);
                        if (!isDate(startDate) || !isDate(endDate)) {
                            console.error("[dateRanges error] illegal dates,", dates);
                            return
                        }
                        const gap = diff(startDate, endDate, "days");
                        const endGap = diff(endDate, startDate, "days");
                        if (!option.limit) {
                            option.limit = 2
                        }
                        //计算日期范围
                        if (gap > 0
                            || endGap > option.limit
                            || endGap < option.limit * -1
                        ) {
                            console.error(`[dateRanges error] illegal start date or end date or out of limit,your selected dates:[${dates}],limit:[${option.limit}]`);
                            return
                        }
                    }
                    else {
                        dates = [dates[dates.length - 1]];
                    }
                    for (let i = 0; i < dates.length; i++) {
                        let date = dates[i];
                        tempDatesArray.push(isDate(date) ? this.format(date).value : date)
                    }
                    this.defaultDates = tempDatesArray;
                }
            },
            setDefaultDates: (dates: Array<any>) => output.dateRanges(dates),
        };
        return output
    }
}
