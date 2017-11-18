import Observer from './datepicker.observer';
import {diff, isObject, quickSort} from "./util"
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

    constructor(option: INTERFACES) {
        if (!option.bindData) {
            this.init(option, {})
        }
        return <any>{
            on: Observer.$on,
            data: (cb: Function) => {
                if (option.bindData) {
                    const result = cb && cb({dates: <Array<any>>[], data: <any>{}});
                    const noData = !isObject(result) || Object.keys(result.data).length <= 0 || result.dates.length <= 0
                    if (noData) {
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
        }
    }
}
