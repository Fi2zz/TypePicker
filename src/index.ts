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
  Observer,
  parse,
  format,
  diff,
  getDates,
  createDate,
  createNodeClassName,
  findDisableInQueue,
  defaultLanguage,
  containerClassName,
  checkPickableDate,
  formatParse,
  monthSwitcher,
  between,
  setSepecifiedDate
} from "./datepicker.helpers";
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

    byCondition(isDef)(option.views)(() => {
      states.views = getViews(option.views);
    });

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
    language: <any>defaultLanguage
  };

  protected setState<Function>(state: any | Function, next?: Function | any) {
    if (typeof state === "function") {
      this.state = state(this.state);
    } else {
      this.state = { ...this.state, ...state };
    }

    setTimeout(() => {
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

  private createTemplate() {
    const {
      date,
      dateFormat,
      views,
      endDate,
      startDate,
      selection
    } = this.state;
    const format = this.format;

    const monthSize =
      views == 2 ? 1 : views === "auto" ? diff(endDate, startDate) : 0;
    const template = [];
    for (let i = 0; i <= monthSize; i++) {
      let dat = new Date(date.getFullYear(), date.getMonth() + i, 1);
      let dates = getDates(dat.getFullYear(), dat.getMonth());
      template.push({
        dates,
        year: dat.getFullYear(),
        month: dat.getMonth()
      });
    }

    const range = ((queue, selection) => {
      if (!queue || queue.length <= 0) {
        return [];
      }
      if (selection > 2) {
        return queue;
      }
      let start = this.parse(queue[0]);
      let end = this.parse(queue[queue.length - 1]);
      return createDate({
        date: start,
        days: diff(end, start, "days"),
        dateFormat: dateFormat
      });
    })(queue.list, selection);

    return template.map((item: any) => {
      let heading = this.state.language.title(item.year, item.month);

      let dates = {};
      let firstDay = new Date(item.year, item.month, 1);
      let lastMonthDates = new Date(item.year, item.month, 0).getDate();

      for (let i = 0; i < firstDay.getDay(); i++) {
        let lateMonthDate: Date = new Date(
          item.year,
          item.month - 1,
          lastMonthDates - i
        );
        dates[format(lateMonthDate)] = {
          date: false,
          day: false,
          className: "disabled empty"
        };
      }
      for (let i = 0; i < item.dates; i++) {
        let date = new Date(item.year, item.month, i + 1);
        let formatted = format(date);
        dates[formatted] = {
          date: date.getDate(),
          day: date.getDay(),
          className: createNodeClassName({
            date: formatted,
            dates: range,
            onlyActive: selection !== 2
          })
        };
      }
      return { heading, year: item.year, month: item.month, dates };
    });
  }

  private render(next?: Function | undefined) {
    const {
      views,
      reachStart,
      reachEnd,
      language: { week }
    } = this.state;

    this.element.innerHTML = template({
      data: this.createTemplate(),
      week,
      reachStart: reachStart,
      reachEnd: reachEnd,
      renderWeekOnTop: views === "auto"
    });
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
    const update = monthSwitcher(date, startDate, endDate)(
      this.setState.bind(this)
    );

    if (prevActionDOM && nextActionDOM) {
      prevActionDOM.addEventListener("click", e => {
        e.preventDefault();

        !reachStart && update(-1);
      });
      nextActionDOM.addEventListener("click", e => {
        e.preventDefault();

        !reachEnd && update(1);
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

    const { selection, limit } = this.state;
    if (selection !== 2) {
      for (let item of dates) {
        if (!this.inDisable(item)) {
          datesList.push(item);
        }
      }
    } else {
      if (dates.length < selection) {
        return;
      } else if (dates.length > selection) {
        dates = dates.slice(0, selection);
      }
      let [start, end] = dates;
      if (!isDate(start)) {
        start = this.parse(start);
      }

      if (!isDate(end)) {
        end = this.parse(end);
      }

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

    for (let item of datesList) {
      this.enqueue(item);
    }
  }

  public disable({ to, from, days, dates }: disable) {
    const { endDate, startDate } = this.state;
    let { parse, format } = this;

    const state = <any>{ disables: [], startDate, endDate };

    parse = parse.bind(this);
    format = format.bind(this);

    const filterDay = day => {
      day = parseInt(day);
      return !isNaN(day) && day >= 0 && day <= 6;
    };

    const dayFilter = days => days.filter(filterDay);

    const filterDateByDay = days => {
      return date => {
        if (days.indexOf(date.getDay()) >= 0) {
          return this.format(date);
        }
        return null;
      };
    };
    state.endDate = or(byCondition(isDate)(parse(from))(date => date))(endDate);
    state.startDate = or(byCondition(isDate)(parse(to))(date => date))(
      startDate
    );

    if (state.startDate) {
      state.reachStart = true;
      state.date = state.startDate;
    }

    const mapFormattedDate = dates =>
      dates.map(formatParse(parse)(format)).filter(isDef);

    const mapDateListFromProps = dates =>
      byCondition(isArray)(dates)(mapFormattedDate);

    const checkCanGoNext = start => end => next => {
      let result = !(isDate(start) && isDate(end) && end < start);
      if (result) {
        next(start, end);
      }
    };

    checkCanGoNext(state.startDate)(state.endDate)((start, end) => {
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
        language: {
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
