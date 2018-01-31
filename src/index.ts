import {datePickerOptions} from "./datepicker.interfaces";
import Observer from './datepicker.observer';
import {
    diff,
    isObject,
    isDate,
    isArray,
    isBoolean,
    nextTick,
    clearNextTick

} from "./util"
import {
    init,
    currentRange,
    monthSwitch,
    bindMonthSwitch,
    createDatePicker
} from './datepicker.init'
import handlePickDate from './datepicer.picker'
import {
    parseFormatted,
    format as formatter
} from "./datepicker.formatter"

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
    monthSwitch = monthSwitch;
    createDatePicker = createDatePicker;
    zeroPadding: boolean = false;
    initWithSelected: boolean = false;
    bindData: boolean = false;
    infiniteMode: boolean = false;
    currentRange: Function = currentRange;
    isInitRange: boolean = false;
    language: any = {};
    pickDate = () => handlePickDate(
        this.element,
        this.selected,
        this.double,
        this.dates,
        this.parse,
        this.format,
        this.limit,
        this.inDates,
        this.update
    );
    defaultDates: Array<string>[];
    format = (date: Date, zeroPadding?: boolean) => formatter(date, this.dateFormat, this.zeroPadding);
    parse = (string: string) => parseFormatted(string, this.dateFormat);
    inDates = (date: string | any) => this.dates.indexOf(date) >= 0;
    update = (result: any) => {
        if (result.type === 'selected') {
            this.dateRanges(result.value, false)
        }
        Observer.$emit("update", result);
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
    dateRanges = (dates: Array<any>, isInit?: boolean) => {


        if (!isArray(dates)) {
            dates = [];
            console.error("[dateRanges error] no dates provided", dates);
            return
        }
        this.isInitRange = !(!isInit);
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
                if (diffed < 0
                    || diffed > this.limit
                    || !this.inDates(this.format(startDate).value) && !this.inDates(this.format(endDate).value) //开始日期和结束日期均为无效日期
                    || !this.inDates(this.format(startDate).value)
                ) {
                    console.error(`[dateRanges Warn]Illegal dates,[${dates}]`);
                    return false;
                }

                for (let i = 0; i <= diffed; i++) {
                    const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                    const formatted = this.format(date).value;
                    if (i < diffed && !this.inDates(formatted)) {
                        console.error(`[dateRanges Warn]Illegal date,[${formatted}]`);
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
    };
    disableRange = () => {


    };
    bindMonthSwitch: Function = bindMonthSwitch;

    _bindDataInit(option: any, cb: Function) {
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
            const config = {
                data: result.data,
                dates: result.dates.sort((a: string, b: string) => this.parse(a) - this.parse(b))
            };
            this.init(option, config);

            if (!noData(result)) {
                this.dataRenderer(result.data);
            }
        }
    };

    constructor(option: datePickerOptions) {
        this.defaultDates = [];
        this.bindData = option.bindData;
        if (!option.bindData) {
            this.init(option, {});
        }
        return <any> {
            on: Observer.$on,
            data: (cb: Function) => this._bindDataInit(option, cb),
            diff: (d1: Date, d2: Date) => diff(d1, d2, "days"),
            parse: this.parse,
            format: this.format,
            dateRanges: this.dateRanges,
            setDefaultDates: this.dateRanges,
            disableRange: this.disableRange
        };
    }
}
