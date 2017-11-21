import Observer from './datepicker.observer';
import {diff, inArray, isObject, quickSort} from "./util"
import {init, monthSwitch, buildCalendar} from './datepicker.init'
import handlePickDate from './datepicer.picker'
import {parseFormatted, format as formatter} from "./datepicker.formatter"

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
    bindData: boolean
}


export default class DatePicker {
    init = init;

    date: Date = new Date();
    dates: Array<any>;
    limit: number = 1;
    double: boolean = false;
    dateFormat: string = "YYYY-MM-DD";
    element: any = null;
    startDate: Date = new Date();
    endDate: Date | any = null;
    selected: Array<any> = [];
    flatView: boolean = false;
    multiViews: boolean = false;
    monthSwitch = monthSwitch;
    buildCalendar = buildCalendar;
    handlePickDate = handlePickDate;
    defaultDates: Array<any>[];
    defaults: Array<any>[];
    format = (date: Date) => formatter(date, this.dateFormat);
    parse = (string: string) => parseFormatted(string, this.dateFormat);
    update = (value: Array<any>) => {
        Observer.$emit("update", value);
        this.selected = value;
    };
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

    inDates(date: string) {
        console.error(this.dates)
        return ~this.dates.indexOf(date)
    }


    constructor(option: INTERFACES) {

        this.defaultDates = []
        if (!option.bindData) {
            this.init(option, {})
        }

        function noData(data: any) {
            return !isObject(data) || Object.keys(data.data).length <= 0 || data.dates.length <= 0
        }

        return <any>{
            on: Observer.$on,
            data: (cb: Function) => {
                if (option.bindData) {
                    const result = cb && cb({dates: <Array<any>>[], data: <any>{}});

                    // const noData = !isObject(result) || Object.keys(result.data).length <= 0 || result.dates.length <= 0
                    if (noData(result)) {
                        this.init(option, {})
                    } else {
                        const temp = result.dates;
                        let dates = [];
                        let times = [];
                        for (let i = 0; i < temp.length; i++) {
                            times.push(this.parse(temp[i]).getTime())
                        }
                        times = quickSort(times).reverse();
                        for (let i = 0; i < times.length; i++) {
                            dates.push(this.format(new Date(times[i])).value)
                        }


                        this.init(option, {data: result.data, dates: dates});
                        this.dataRenderer(result.data);
                    }
                    this.update(this.selected)
                }
            },
            diff: (d1: Date, d2: Date) => diff(d1, d2, "days"),
            parse: this.parse,
            format: this.format,
            setDefaultDates: (dates: Array<any>) => {


                if (!dates) {
                    console.error("[setDefaultDates error] no dates provided", dates);
                    this.defaultDates = [];
                    return
                }


                if (dates && dates instanceof Array) {
                    if (dates.length <= 0) {
                        console.error("[setDefaultDates error] no dates provided", dates);
                        return
                    }


                    if (option.doubleSelect) {
                        if (dates.length === 1) {
                            console.error("[setDefaultDates] please provide end date")
                        } else if (dates.length > 2) {
                            dates = dates.slice(0, 2)
                        }


                        const start = dates[0];
                        const end = dates[dates.length - 1];


                        const startDate = this.parse(start)
                        const endDate = this.parse(end);

                        if (!startDate || !endDate) {
                            console.error("[setDefaultDates error] illegal dates,", dates);
                            this.defaultDates = [];
                            return
                        }

                        const gap = diff(startDate, endDate, "days");
                        const endGap = diff(endDate, startDate, "days");


                        if (!option.limit) {
                            option.limit = 1
                        }
                        //计算日期范围
                        if (gap > 0
                            || endGap > option.limit
                            || endGap < option.limit * -1
                        ) {
                            console.error(`[setDefaultDates error] illegal start date or end date or out of limit,your selected dates:[${dates}],limit:[${option.limit}]`);
                            this.defaultDates = [];
                            return false
                        }

                    }
                    else {
                        dates = [dates[0]];
                    }
                    this.defaultDates = dates
                    this.update(dates)
                }
            }
        }
    }
}
