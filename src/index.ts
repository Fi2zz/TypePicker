import {datepicker, disable} from "./datepicker.interface";
import {
    attr,
    isDate,
    isArray,
    byCondition,
    $,
    dedupList,
    isDef,
    or
} from "./util";
import template from "./datepicker.template";
import {
    getViews,
    parseEl,
    parse,
    format,
    diff,
    findDisableInQueue,
    checkPickableDate,
    formatParse,
    monthSwitcher,
    between,
    setDate,
    TemplateData,
    elementClassName,
    defaultI18n,
    formatMonthHeading
} from "./datepicker.helpers";
import {emitter, on} from "./datepicker.observer";
import {Queue} from "./datepicker.queue";

let queue = null;

export default class TypePicker {
    constructor(option: datepicker) {
        let el = parseEl(option.el);

        if (!option || !el) {
            return;
        }
        const state: any = {...this.state};

        byCondition(isDef)(getViews(option.views))(views => (state.views = views));

        byCondition(v => !isNaN(v))(option.selection)(
            size => (state.selection = size)
        );

        byCondition(isDef)(option.format)(format => (state.dateFormat = format));
        byCondition(isDate)(option.startDate)(startDate => {
            state.startDate = startDate;
            state.reachStart = true;
            state.date = startDate;
        });
        byCondition(isDate)(option.endDate)(endDate => (state.endDate = endDate));
        byCondition(isNaN, false)(option.limit)(() => {
            state.limit = option.limit;
        });
        byCondition(view => isDef(view) && view === "auto")(option.views)(() => {
            if (!state.startDate) {
                state.startDate = new Date();
            }

            if (!state.endDate) {
                let start = state.startDate;
                state.endDate = new Date(
                    start.getFullYear(),
                    start.getMonth() + 6,
                    start.getDate()
                );
            }
        });

        this.element = el;
        this.element.className = elementClassName(state.views);

        queue = new Queue({
            size: state.selection,
            limit: state.selection === 2 ? state.limit : false,
            dateFormat: state.dateFormat
        });

        this.setState(state);
    }

    private state: any = {
        selection: <number>1,
        views: <number | string>1,
        date: <Date>new Date(),
        startDate: <Date>null,
        endDate: <Date>null,
        reachEnd: <boolean>false,
        reachStart: <boolean>false,
        dateFormat: <string>"YYYY-MM-DD",
        limit: <number>1,
        disables: <any[]>[],
        i18n: <any>defaultI18n()
    };

    protected setState<Function>(state: any | Function, next?: Function | any) {
        if (typeof state === "function") {
            this.state = state(this.state);
        } else {
            this.state = {...this.state, ...state};
        }
        let id = setTimeout(() => {
            clearTimeout(id);
            this.render(next);
        }, 0);
    }

    protected element: any = null;
    public on = on;

    private render(next?: Function | undefined) {
        const {
            reachStart,
            reachEnd,
            views,
            startDate,
            endDate,
            date,
            dateFormat,
            selection,
            i18n,
            disables
        } = this.state;

        const size =
            views == 2 ? 1 : views === "auto" ? diff(endDate, startDate) : 0;
        const withRange = selection === 2;

        const data = <any[]>(
            new TemplateData(date, size, queue.list, dateFormat, withRange)
        );

        i18n.heading = formatMonthHeading(i18n.title, i18n.months);

        this.element.innerHTML = template(data, i18n)(
            reachStart,
            reachEnd,
            views === "auto"
        );

        typeof next === "function" && next(this.state);

        const inDisable = date => this.state.disables.lastIndexOf(date) >= 0;

        //日期切换
        const dom = selector => $(this.element, selector);

        const nodeList = dom(".calendar-cell");
        const prevActionDOM = dom(".calendar-action-prev");
        const nextActionDOM = dom(".calendar-action-next");
        const update = monthSwitcher(date, startDate, endDate);

        if (prevActionDOM && nextActionDOM) {
            prevActionDOM.addEventListener("click", e => {
                e.preventDefault();
                !reachStart && update(-1)(this.setState.bind(this));
            });
            nextActionDOM.addEventListener("click", e => {
                e.preventDefault();
                !reachEnd && update(1)(this.setState.bind(this));
            });
        }
        const createRenderEmitter = () =>
            emitter("render")({
                nodeList,
                disables
            });

        createRenderEmitter();
        for (let i = 0; i < nodeList.length; i++) {
            nodeList[i].addEventListener("click", () => {
                const date = attr(nodeList[i], "data-date");
                const pickable = checkPickableDate({
                    date,
                    queue: queue.list,
                    dateFormat,
                    selection,
                    inDisable,
                    limit: this.state.limit
                });
                if (pickable) this.enqueue(date);
            });
        }
    }

    private enqueue(value) {
        const {selection, disables} = this.state;
        const next = queue.enqueue(value);
        const inDisable = date => disables.indexOf(date) >= 0;
        const afterEnqueue = () => {
            const dateFormat = this.state.dateFormat;
            if (selection === 2) {
                const includeDisabled = findDisableInQueue(
                    queue.list,
                    dateFormat,
                    inDisable
                );
                if (includeDisabled) {
                    if (inDisable(value)) {
                        queue.pop();
                    } else {
                        queue.shift();
                    }
                }
            }
            const createEmitter = () => emitter("select")(queue.list);
            this.render(createEmitter);
        };

        next(afterEnqueue);
    }

    public setDates(dates: Array<any>) {
        if (!isArray(dates)) return;
        let datesList: Array<any> = [];

        const {selection, limit, startDate, dateFormat, disables} = this.state;

        const parser = dateFormat => date => parse(date, dateFormat);
        const formater = dateFormat => date => format(date, dateFormat);
        const parseWithFormat = parser(dateFormat);
        const formatDate = formater(dateFormat);

        const inDisable = date => disables.indexOf(date) >= 0;

        if (selection !== 2) {
            datesList = dates
                .filter(date => !inDisable(date))
                .map(parseWithFormat)
                .filter(isDef);
        } else {
            if (dates.length < selection) {
                return;
            } else if (dates.length > selection) {
                dates = dates.slice(0, selection);
            }
            let [start, end] = dates;
            start = byCondition(date => !isDate(date))(start)(parseWithFormat);
            end = byCondition(date => !isDate(date))(end)(parseWithFormat);

            let gap = diff(end, start, "days", true);

            if (gap > limit || end < start) {
                return;
            }
            start = formatDate(start);
            end = formatDate(end);
            if (inDisable(start)) {
                return;
            }
            datesList = [start, end].filter(isDef);
        }

        if (datesList.length > 0) {
            let date = byCondition(date => !isDate(date))(datesList[0])(
                parseWithFormat
            );
            if (isDate(date)) {
                let reachStart = startDate && date <= startDate;
                this.setState({date, reachStart});
            }
        }
        for (let item of datesList) {
            this.enqueue(item);
        }
    }

    public disable({to, from, days, dates}: disable) {
        const {endDate, startDate, dateFormat} = this.state;

        const parser = dateFormat => date => parse(date, dateFormat);
        const formater = dateFormat => date => format(date, dateFormat);
        const parseWithFormat = parser(dateFormat);
        const formatDate = formater(dateFormat);
        const state = <any>{disables: [], startDate, endDate};

        const filterDay = day => {
            day = parseInt(day);
            return !isNaN(day) && day >= 0 && day <= 6;
        };
        const dayFilter = days => days.filter(filterDay);
        const value = v => v;

        const include = days => day => days.indexOf(day) >= 0;
        const filterDateByDay = days => date =>
            include(days)(date.getDay()) ? formatDate(date) : "";

        state.endDate = or(byCondition(isDate)(parseWithFormat(from))(value))(
            endDate
        );
        state.startDate = or(byCondition(isDate)(parseWithFormat(to))(value))(
            startDate
        );

        if (state.startDate) {
            state.reachStart = true;
            state.date = state.startDate;
        }

        const mapFormattedDate = dates =>
            dates.map(formatParse(dateFormat)).filter(isDef);
        const mapDateListFromProps = dates =>
            byCondition(isArray)(dates)(mapFormattedDate);

        const checkStartDateAndEndDate = start => end => next => {
            let isDates = isDate(start) && isDate(end);

            if (isDates && start < end) {
                next(start, end);
            } else {
                this.setState({
                    reachEnd: false,
                    reachStart: false,
                    disables: mapDateListFromProps(dates)
                });
            }
        };
        checkStartDateAndEndDate(state.startDate)(state.endDate)((start, end) => {
            start = setDate(start, 1);
            const filteredDays = or(byCondition(isArray)(days)(dayFilter))([]);
            const mapDateByDay = (dates, days) =>
                dates.map(filterDateByDay(days)).filter(isDef);


            end = new Date(end.getFullYear(), end.getMonth() + 1, 1);

            const disables = [
                //取出传进来的dates
                ...or(mapDateListFromProps(dates))([]),
                //取出start and end 之间的所有日期
                ...or(mapDateByDay(between(start, end), filteredDays))([])
            ];

            state.disables = dedupList(disables);
            this.setState(state);
        });
    }

    public i18n(pack: any) {
        if (isArray(pack.days) && isArray(pack.months)) {
            this.setState({
                i18n: {
                    week: pack.days,
                    months: pack.months,
                    title: pack.title
                }
            });
        }
    }

    public forceUpdate = () => this.render();
}
