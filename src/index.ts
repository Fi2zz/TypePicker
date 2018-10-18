import { datepicker, Disable, I18n, State } from "./datepicker.interface";
import {
  isDate,
  isArray,
  byCondition,
  dedupList,
  isDef,
  isNotEmpty
} from "./util";
import {
  getViews,
  parse,
  format,
  diff,
  formatParse,
  changeMonth,
  between,
  defaultI18n
} from "./datepicker.helpers";
import { publish, subscribe } from "./datepicker.observer";
import { Queue } from "./datepicker.queue";
import { template } from "./datepicker.template";
import { TemplateData } from "./datepicker.data.generator";
import { DOMHelpers } from "./datepicker.dom.helper";

let queue = null;
let initSelectedDates = [];

export default class TypePicker {
  constructor(option: datepicker) {
    let el = DOMHelpers.select(option.el);
    if (!option || !el) {
      return;
    }
    const state = { ...this.state };

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

    if (state.selection !== 2) {
      state.limit = false;
      state.lastSelectedItemCanBeInvalid = false;
    }

    this.element = el;
    this.element.className = DOMHelpers.class.container(state.views);

    queue = new Queue({
      size: state.selection,
      limit: state.limit,
      parse: date => parse(date, state.dateFormat)
    });

    this.setState(state);
  }

  private state = {
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

  protected setState<Function>(state: any): void {
    this.state = { ...this.state, ...state };
    let id = setTimeout(() => {
      clearTimeout(id);
      this.render();
    }, 0);
  }

  protected element: HTMLElement = null;

  private render(): void {
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
      disableDates
    } = this.state;

    const size = () =>
      views == 2
        ? 1
        : views === "auto"
          ? diff(<Date>endDate, <Date>startDate)
          : 0;

    const withRange = selection === 2;

    const withFormat = date => format(date, <string>dateFormat);
    const withParse = date => parse(date, <string>dateFormat);

    const data = new TemplateData({
      date,
      size: size(),
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
    const disables = TemplateData.findDisabled(data);

    initSelectedDates = TemplateData.setInitDatesToQueue(
      disables,
      initSelectedDates,
      this.enqueue.bind(this)
    );

    this.element.innerHTML = template(data, i18n.week)(
      reachStart,
      reachEnd,
      views === "auto"
    );

    //日期切换
    const select = selector => DOMHelpers.select(this.element, selector);

    const nodeList = select(".calendar-cell");
    const prevActionDOM = select(".calendar-action.prev");
    const nextActionDOM = select(".calendar-action.next");

    //dispatch render event when rendered
    publish("render", nodeList);
    //dispatch select event when rendered

    let transformed = queue.list.map(item => {
      return {
        time: withParse(item) ? withParse(item).getTime() : withParse(item),
        string: item
      };
    });
    publish("select", transformed);
    if (prevActionDOM && nextActionDOM) {
      const actionHandler = type => size => () => {
        !type && this.setState(changeMonth(date, startDate, endDate)(size));
      };
      prevActionDOM.addEventListener("click", actionHandler(reachStart)(-1));
      nextActionDOM.addEventListener("click", actionHandler(reachEnd)(1));
    }

    for (let i = 0; i < nodeList.length; i++) {
      let node = nodeList[i];
      node.addEventListener("click", () => {
        const date = DOMHelpers.attr(node, "data-date");
        const disable = <string>DOMHelpers.attr(node, "data-disabled");
        let isDisabled = false;
        if (isDef(disable)) {
          isDisabled = <boolean>JSON.parse(disable);
        }
        this.enqueue(date, disables, isDisabled);
      });
    }
  }

  /**
   *
   * @param {string} value
   * @param {string[]} disables
   * @param {boolean} invalidValue
   */
  private enqueue(
    value: string,
    disables: string[],
    invalidValue: boolean
  ): void {
    const cache = queue.cache();

    const {
      dateFormat,
      lastSelectedItemCanBeInvalid,
      limit,
      selection
    } = this.state;

    const withParse = date => parse(date, dateFormat);

    const checkPushable = () => {
      if (
        (!lastSelectedItemCanBeInvalid || queue.length() <= 0) &&
        invalidValue
      ) {
        return false;
      }

      if (queue.include(value) && queue.length() === 1 && !invalidValue) {
        return false;
      }

      if (selection === 2 && invalidValue) {
        let size = queue.length();
        if (size === 2) {
          return false;
        } else if (size === 1) {
          let f1 = queue.front();
          let space = diff(withParse(value), withParse(f1), "days");

          const disablesInQueue = TemplateData.findDisabledInQueue({
            queue: [...queue.list, value],
            disables,
            dateFormat,
            parse: withParse
          });
          if (disablesInQueue.length >= selection || space < 0) {
            return false;
          }
        }
      }

      return true;
    };

    if (!checkPushable()) {
      return;
    }

    const afterEnqueue = () => {
      if (limit !== false) {
        const date$1 = withParse(queue.list[0]);
        const date$2 = withParse(queue.list[queue.list.length - 1]);
        const space = diff(date$2, date$1, "days");
        if (
          space < 0 ||
          queue.list.length > selection ||
          (selection === 2 && space > limit)
        ) {
          queue.shift();
        }
      }

      const disablesInQueue = TemplateData.findDisabledInQueue({
        queue: queue.list,
        disables,
        dateFormat,
        parse: withParse
      });

      if (lastSelectedItemCanBeInvalid) {
        if (disablesInQueue.length >= selection) {
          if (invalidValue) {
            queue.pop();
          } else {
            queue.shift();
          }
        } else if (queue.length() === 1 && invalidValue) {
          queue.replace(cache);
        }
      } else {
        if (limit !== false) {
          if (disablesInQueue.length > 0) {
            queue.resetWithValue(value);
          }
        }
      }
      this.render();
    };

    queue.enqueue(value)(afterEnqueue);
  }

  /**
   *
   * @param {Array<any>} dates
   */
  public setDates(dates: Array<any>): void {
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

  /**
   *
   * @param {Disable} options
   */
  public disable(options: Disable): void {
    const { to, from, days, dates } = options;
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

  /**
   *
   * @param {I18n} pack
   */
  public i18n(pack: I18n): void {
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

  public forceUpdate = (): void => this.render();

  /**
   *
   * @param {Function} next
   */
  public onRender = (next: Function): void => subscribe("render", next);

  /**
   *
   * @param {Function} next
   */
  public onSelect = (next: Function): void => subscribe("select", next);
}
