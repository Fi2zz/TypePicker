import { datepicker, disable } from "./datepicker.interface";
import {
  attr,
  isDate,
  isArray,
  byCondition,
  $,
  dedupList,
  isDef
} from "./util";
import template from "./datepicker.template";
import {
  getViews,
  parseEl,
  parse,
  format,
  diff,
  formatParse,
  changeMonth,
  between,
  TemplateData,
  elementClassName,
  defaultI18n
} from "./datepicker.helpers";
import { emitter, on } from "./datepicker.observer";
import { Queue } from "./datepicker.queue";

const isNotEmpty = v => isDef(v) && v !== "";

let queue = null;
let initSelectedDates = [];

export default class TypePicker {
  constructor(option: datepicker) {
    let el = parseEl(option.el);

    if (!option || !el) {
      return;
    }
    const state: any = { ...this.state };

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
    byCondition(v => isDef(v) && (!isNaN(v) || v === false))(option.limit)(
      limit => (state.limit = limit)
    );
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

    if (state.startDate && state.endDate) {
      let date = state.startDate;
      let firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
      let dates = between(firstDate, date, state.dateFormat);
      dates.pop();
      state.disableDates = dates;
    } else {
    }

    byCondition(v => isDef(v) && typeof v === "boolean")(
      option.lastSelectedItemCanBeInvalid
    )(value => {
      state.lastSelectedItemCanBeInvalid = value;
      if (value === true) {
        state.selection = 2;
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
    limit: <number | boolean>1,
    i18n: <any>defaultI18n(),
    disableDays: <number[]>[],
    lastSelectedItemCanBeInvalid: false,
    disableDates: <string[]>[]
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

  public onRender = next => on("render", next);
  public onSelect = next => on("select", next);

  private render(next?: Function | undefined) {
    let {
      reachStart,
      reachEnd,
      views,
      startDate,
      endDate,
      date,
      dateFormat,
      selection,
      i18n,
      disableDays,
      disableDates,
      lastSelectedItemCanBeInvalid
    } = this.state;

    const size =
      views == 2 ? 1 : views === "auto" ? diff(endDate, startDate) : 0;
    const withRange = selection === 2;

    const withFormat = date => format(date, dateFormat);
    const withParse = date => parse(date, dateFormat);

    const data = new TemplateData({
      date,
      size,
      queue: queue.list,
      format: withFormat,
      parse: withParse,
      withRange,
      heading: TemplateData.formatMonthHeading(i18n.title, i18n.months),
      disables: {
        days: disableDays,
        dates: disableDates
      }
    });
    const findDisabledFromTemplateData = data => {
      let result = [];
      for (let item of data) {
        let dates = item.dates;

        for (let dateItem of dates) {
          if (dateItem.disabled && dateItem.date) {
            result.push(dateItem.value);
          }
        }
      }
      return result;
    };

    const disables = findDisabledFromTemplateData(data);

    this.element.innerHTML = template(data, i18n.week)(
      reachStart,
      reachEnd,
      views === "auto"
    );
    const setInitDatesToQueue = () => {
      if (initSelectedDates.length > 0) {
        let initDisables = [];
        for (let item of initSelectedDates) {
          let isDisable = disables.indexOf(item) >= 0;
          if (isDisable) {
            initDisables.push(item);
          }
        }

        let f1 = initSelectedDates[0];

        if (
          initSelectedDates.length !== initDisables.length &&
          disables.indexOf(f1) <= -1
        ) {
          for (let item of initSelectedDates) {
            let isDisable = disables.indexOf(item) >= 0;
            this.enqueue(item, disables, isDisable);
          }
        }

        initSelectedDates = [];
      }
    };

    setInitDatesToQueue();

    typeof next === "function" && next(this.state);

    //日期切换
    const dom = selector => $(this.element, selector);

    const nodeList = dom(".calendar-cell");
    const prevActionDOM = dom(".calendar-action-prev");
    const nextActionDOM = dom(".calendar-action-next");
    const update = changeMonth(date, startDate, endDate)(
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

    //dispatch render event when rendered
    emitter("render")(nodeList);
    for (let i = 0; i < nodeList.length; i++) {
      nodeList[i].addEventListener("click", () => {
        const date = attr(nodeList[i], "data-date");
        let disable = attr(nodeList[i], "data-disabled");

        if (isDef(disable)) {
          disable = JSON.parse(disable);
        }

        if (!lastSelectedItemCanBeInvalid && disable) {
          return;
        }

        if (queue.length() <= 0) {
          if (disable) {
            return;
          }
        }
        this.enqueue(date, disables, disable);
      });
    }
  }

  private enqueue(value, disables, valueIsDisabled) {
    let cache = queue.cache();

    const {
      dateFormat,
      lastSelectedItemCanBeInvalid,
      limit,
      selection
    } = this.state;

    const next = queue.enqueue(value);

    const withParse = date => parse(date, dateFormat);

    const afterEnqueue = () => {
      const date$1 = withParse(queue.list[0]);
      const date$2 = withParse(queue.list[queue.list.length - 1]);

      const findDisabled = (queue, disables, dateFormat) => parse => {
        let date$1 = queue[0];
        let date$2 = queue[queue.length - 1];

        if (date$1 === date$2) {
          return 0;
        }
        date$1 = parse(date$1);
        date$2 = parse(date$2);
        let dates = between(date$1, date$2, dateFormat)
          .map((_, index) => (disables.indexOf(_) >= 0 ? index : -1))
          .filter(v => isDef(v) && v >= 0);

        return isArray(dates) ? dates : [dates];
      };

      const space = diff(date$2, date$1, "days");

      if (limit !== false) {
        if (
          space < 0 ||
          queue.list.length > selection ||
          (selection === 2 && space > limit)
        ) {
          queue.shift();
        }
      }

      let queueIncludeDisabled = findDisabled(queue.list, disables, dateFormat)(
        withParse
      );

      if (lastSelectedItemCanBeInvalid) {
        if (queueIncludeDisabled.length >= selection) {
          if (valueIsDisabled) {
            queue.pop();
          } else {
            queue.shift();
          }
        } else if (queue.length() === 1 && valueIsDisabled) {
          queue.replace(cache);
        }
      } else {
        if (limit !== false) {
          if (queueIncludeDisabled.length > 0) {
            queue.resetWithValue(value);
          }
        }
      }
      this.render(() => emitter("select")(queue.list));
    };

    next(afterEnqueue);
  }

  public setDates(dates: Array<any>) {
    if (!isArray(dates)) return;

    const { selection, limit, dateFormat } = this.state;

    const withParse = date => parse(date, dateFormat);
    const withFormat = date => format(date, dateFormat);

    let datesList = dates.map(withParse).filter(isDef);
    if (selection === 2) {
      if (datesList.length > selection) {
        datesList = datesList.slice(0, selection);
      }
      let [start, end] = datesList
        .map(item => (isDate(item) ? item : withParse(item)))
        .filter(isDef);
      let gap = diff(end, start, "days", true);
      if ((gap > limit && selection === 2) || end < start) {
        return;
      }
      datesList = [start, end];
    }

    initSelectedDates = datesList
      .map(date => (isDate(date) ? withFormat(date) : date))
      .filter(isDef);
  }

  public disable({ to, from, days, dates }: disable) {
    const {
      endDate,
      startDate,
      dateFormat,
      disableDates,
      disableDays
    } = this.state;

    const parser = dateFormat => date => parse(date, dateFormat);
    const parseWithFormat = parser(dateFormat);
    const state = <any>{ disableDates: [], startDate, endDate, disableDays };

    const parseToInt = item => parseInt(item, 10);

    const mapDay = days =>
      isArray(days)
        ? days.map(parseToInt).filter(day => day >= 0 && day <= 6)
        : [];

    byCondition(isDate)(parseWithFormat(from))(date => {
      state.endDate = date;
    });

    byCondition(isDate)(parseWithFormat(to))(date => {
      state.startDate = date;
      state.reachStart = true;
      state.date = date;
    });

    const mapDatesFromProps = dates =>
      isArray(dates)
        ? dates.map(formatParse(dateFormat)).filter(isNotEmpty)
        : [];
    if (!isDate(state.startDate) || !isDate(state.endDate)) {
      state.reachEnd = false;
      state.reachStart = false;
    } else {
      let start = state.startDate;
      let end = state.endDate;
      if (start > end) {
        state.startDate = end;
        state.endDate = start;
        state.date = end;
        state.reachStart = true;
      }
    }

    state.disableDates = dedupList([
      ...disableDates,
      ...mapDatesFromProps(dates)
    ]).filter(isNotEmpty);

    state.disableDays = [...disableDays, ...mapDay(days)].filter(isNotEmpty);
    this.setState(state);
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
