import { datepicker, disable } from "./datepicker.interface";
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
  defaultLanguage,
  containerClassName,
  checkPickableDate,
  formatParse,
  monthSwitcher,
  between,
  setSepecifiedDate,
  TemplateData
} from "./datepicker.helpers";
import { Observer } from "./datepicker.observer";
import { Queue } from "./datepicker.queue";

const emitter = event => value => Observer.$emit(event, value);
let queue = null;

export default class TypePicker {
  constructor(option: datepicker) {
    if (!option || !parseEl(option.el)) {
      return;
    }

    this.element = parseEl(option.el);
    const states: any = { ...this.state };

    byCondition(isNaN, false)(option.selection)(() => {
      states.selection = option.selection;
    });

    byCondition(isDef)(option.format)(() => {
      states.dateFormat = option.format;
    });
    byCondition(isDate)(option.startDate)(() => {
      states.startDate = option.startDate;
      states.reachStart = true;
      states.date = option.startDate;
    });
    byCondition(isDate)(option.endDate)(() => {
      states.endDate = option.endDate;
    });
    byCondition(isNaN, false)(option.limit)(() => {
      states.limit = option.limit;
    });

    byCondition(isDef)(option.views)(() => {
      states.views = getViews(option.views);

      if (states.views === "auto") {
        if (!states.startDate) {
          states.startDate = new Date();
        }

        if (!states.endDate) {
          let start = states.startDate;

          states.endDate = new Date(
            start.getFullYear(),
            start.getMonth() + 6,
            start.getDate()
          );
        }
      }

      // if (!states.startDate|| !states.endDate )
      // {

      //  }
    });

    this.element.className = containerClassName(
      this.element.className,
      states.views
    );

    queue = new Queue({
      size: states.selection,
      limit: states.selection === 2 ? states.limit : false,
      dateFormat: states.dateFormat
    });

    this.setState(states);
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
    i18n: <any>defaultLanguage
  };

  protected setState<Function>(state: any | Function, next?: Function | any) {
    if (typeof state === "function") {
      this.state = state(this.state);
    } else {
      this.state = { ...this.state, ...state };
    }
    let id = setTimeout(() => {
      clearTimeout(id);
      this.render(next);
    }, 0);
  }

  protected element: any = null;
  public on = Observer.$on;
  public format = (date: Date) => format(date, this.state.dateFormat);
  public parse = (date: string | Date, dateFormat?: string) =>
    parse(date, dateFormat ? dateFormat : this.state.dateFormat);

  private inDisable(date: string) {
    return this.state.disables.indexOf(date) >= 0;
  }

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
      i18n
    } = this.state;

    const size =
      views == 2 ? 1 : views === "auto" ? diff(endDate, startDate) : 0;

    const withRange = selection === 2;

    const data = <any[]>(
      new TemplateData(date, size, queue.list, dateFormat, withRange)
    );
    this.element.innerHTML = template(data, i18n)(
      reachStart,
      reachEnd,
      views === "auto"
    );
    this.afterRender(next);
  }

  private afterRender(after: Function | undefined) {
    const {
      dateFormat,
      selection,
      date,
      reachStart,
      reachEnd,
      endDate,
      disables,
      startDate
    } = this.state;

    typeof after === "function" && after(this.state);
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

    const inDisable = date => this.inDisable(date);

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
    const { selection } = this.state;
    const next = queue.enqueue(value);
    const afterEnqueue = () => {
      const dateFormat = this.state.dateFormat;

      if (selection === 2) {
        const includeDisabled = findDisableInQueue(
          queue.list,
          dateFormat,
          this.inDisable.bind(this)
        );

        if (includeDisabled) {
          if (this.inDisable(value)) {
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

    const { selection, limit, startDate } = this.state;

    if (selection !== 2) {
      let parse = this.parse.bind(this);
      datesList = dates
        .filter(date => !this.inDisable(date))
        .map(parse)
        .filter(isDef);
    } else {
      if (dates.length < selection) {
        return;
      } else if (dates.length > selection) {
        dates = dates.slice(0, selection);
      }
      let [start, end] = dates;
      start = byCondition(date => !isDate(date))(start)(this.parse);
      end = byCondition(date => !isDate(date))(end)(this.parse);

      let gap = diff(end, start, "days", true);

      if (gap > limit || end < start) {
        return;
      }
      start = this.format(start);
      end = this.format(end);
      if (this.inDisable(start)) {
        return;
      }
      datesList = [start, end].filter(isDef);
    }

    if (datesList.length > 0) {
      let date = byCondition(date => !isDate(date))(datesList[0])(this.parse);
      if (isDate(date)) {
        let reachStart = startDate && date <= startDate;
        this.setState({ date, reachStart });
      }
    }
    for (let item of datesList) {
      this.enqueue(item);
    }
  }

  public disable({ to, from, days, dates }: disable) {
    const { endDate, startDate, dateFormat } = this.state;
    let { parse, format } = this;

    const state = <any>{ disables: [], startDate, endDate };
    parse = parse.bind(this);
    format = format.bind(this);
    const filterDay = day => {
      day = parseInt(day);
      return !isNaN(day) && day >= 0 && day <= 6;
    };
    const dayFilter = days => days.filter(filterDay);
    const value = v => v;
    const filterDateByDay = days => {
      return date => {
        if (days.indexOf(date.getDay()) >= 0) {
          return this.format(date);
        }
        return null;
      };
    };
    state.endDate = or(byCondition(isDate)(parse(from))(value))(endDate);
    state.startDate = or(byCondition(isDate)(parse(to))(value))(startDate);

    if (state.startDate) {
      state.reachStart = true;
      state.date = state.startDate;
    }

    const mapFormattedDate = dates =>
      dates.map(formatParse(dateFormat)).filter(isDef);
    const mapDateListFromProps = dates =>
      byCondition(isArray)(dates)(mapFormattedDate);
    const checkCanGoNext = start => end => next => {
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

    checkCanGoNext(state.startDate)(state.endDate)((start, end) => {
      console.log(start, end);
      start = setSepecifiedDate(start, 1);
      const filteredDays = or(byCondition(isArray)(days)(dayFilter))([]);
      const mapDateByDay = (dates, days) =>
        dates.map(filterDateByDay(days)).filter(isDef);
      const disables = [
        //取出传进来的dates
        ...or(mapDateListFromProps(dates))([]),
        //取出start and end 之间的所有日期
        ...or(mapDateByDay(between(start)(end)(), filteredDays))([])
      ];

      state.disables = dedupList(disables);
      this.setState(state);
    });
  }

  i18n(pack: any) {
    if (
      isArray(pack.days) &&
      isArray(pack.months) &&
      typeof pack.title === "function"
    ) {
      this.setState({
        i18n: {
          week: pack.days,
          months: pack.months,
          title: pack.title
        }
      });
    }
  }

  public update = () => this.render();
  static between = between;
  static diff = diff;
}
