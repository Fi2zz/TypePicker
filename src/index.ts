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
    monthSwitch = monthSwitch;
    createDatePicker = createDatePicker;
    zeroPadding: boolean = true;
    initWithSelected: boolean = false;
    bindData: boolean = false;
    infiniteMode: boolean = false;
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
    inDates = (date: string | any) => !!~this.dates.indexOf(date);
    update = (result: any) => {
        if (result.type === 'selected') {
            this.dateRanges(result.value)
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
    dateRanges = (dates: Array<any>) => {
        const datesList = <Array<any>>[];
        if (!isArray(dates)) {
            dates = [];
            console.error("[dateRanges error] no dates provided", dates);
            return
        }


        const handler = () => {


            if (this.double) {
                if (dates.length > 2) {
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
                let gap = diff(startDate, endDate, "days");
                gap = gap !== 0 ? gap * -1 : gap;
                let endGap = diff(endDate, startDate, "days");
                endGap = endGap !== 0 ? endGap * -1 : gap;
                if (!this.limit) {
                    this.limit = 2
                }
                //计算日期范围
                if (gap < 0 || endGap > this.limit || endGap < this.limit * -1) {
                    console.error(`[dateRanges error] illegal start date or end date or out of limit,your selected dates:[${dates}],limit:[${this.limit}]`);
                    return
                }
            }
            else {
                dates = [dates[dates.length - 1]];
            }
            for (let i = 0; i < dates.length; i++) {
                let date = dates[i];
                datesList.push(isDate(date) ? this.format(date).value : date)
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
        };
    }
}
