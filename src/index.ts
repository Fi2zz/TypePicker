import "./style.css";
import { TemplateData } from "./datepicker.data.generator";
import { DOMHelpers } from "./datepicker.dom.helper";
import {
  between,
  changeMonth,
  defaultI18n,
  diff,
  format,
  formatParse,
  getViews,
  i18nValidator,
  parse
} from "./datepicker.helpers";
import { datepicker, Disable, I18n, State } from "./datepicker.interface";
import { publish, subscribe } from "./datepicker.observer";
import { Queue } from "./datepicker.queue";
import { classname, template } from "./datepicker.template";
import {
  and,
  condition,
  dedupList,
  equal,
  filterList,
  isArray,
  isBool,
  isDate,
  isDef,
  isNotEmpty,
  mapList,
  not,
  or,
  padding,
  reduceList,
  sliceList,
  toInt
} from "./util";

let queue = null;
let disableDates = [];
let disableDays = [];
let disables = [];

function formatMonthHeading(
  format: {
    toLowerCase: () => {
      replace: (
        arg0: RegExp,
        arg1: string
      ) => { replace: (arg0: RegExp, arg1: any) => string };
    };
  },
  months: { [x: string]: any }
) {
  return function({ year, month }) {
    return format
      .toLowerCase()
      .replace(/y{1,}/g, padding(year))
      .replace(/m{1,}/g, months[month]);
  };
}

function flatDisables(data: any) {
  const result = [];
  for (let item of data) {
    let dates = item.dates;
    for (let dateItem of dates) {
      if (dateItem.disabled && dateItem.date) {
        result.push(dateItem.value);
      }
    }
  }
  return result;
}

function enqueue(
  queue: Queue,
  item: { value: string; disabled: any; selected: boolean },
  options: any,
  next: Function
): void {
  const {
    disables,
    lastSelectedItemCanBeInvalid,
    selection,
    parse,
    format
  } = options;

  if (item.disabled && selection !== 2) {
    return;
  }
  const length = queue.length();
  if (selection === 2) {
    const last = queue.last();
    const current = parse(item.value);
    let size = 0;
    let between = [];
    if (last) {
      const prev = parse(last.value);
      size = diff(current, prev, "days");
      between = TemplateData.getBetweens(prev, size, format);
    }
    const someInvalid = disables.some(
      (date: string) => between.indexOf(date) >= 0
    );
    if (item.disabled) {
      if (length === 1) {
        if (
          last.disabled ||
          size < 0 ||
          someInvalid ||
          !lastSelectedItemCanBeInvalid
        ) {
          return;
        }
      } else {
        return;
      }
    } else if (length === 1 && someInvalid) {
      queue.resetWithValue(item);
    }
  }
  queue.enqueue(item)(
    (): void => {
      const dispatchValue = queue.map((item: { value: any }) => item.value);
      next(dispatchValue);
    }
  );
}

function updater(
  queue: Queue,
  data: { value: string; disabled: boolean } | null,
  options: any,
  next: Function
) {
  [...state.selected, data]
    .filter(Boolean)
    .map(item => {
      if ("disabled" in item === false) {
        item.disabled = options.disables.indexOf(item.value) > -1;
      }
      item.selected = true;
      return item;
    })
    .forEach(item => enqueue(queue, item, options, next));
  state.selected = [];
}

let state: State = {
  date: new Date(),
  selection: 1,
  views: 1,
  startDate: null,
  endDate: null,
  reachEnd: false,
  reachStart: false,
  dateFormat: "YYYY-MM-DD",
  limit: 1,
  i18n: defaultI18n(),
  lastSelectedItemCanBeInvalid: false,
  selected: []
};

function useCallback(partial: Partial<State>) {
  if (partial) {
    state = { ...state, ...partial };
  }
  return (render: Function): void => render();
}

export default class TypePicker {
  constructor(option: datepicker) {
    const el = DOMHelpers.select(option.el);
    if (!el || !option) {
      return;
    }
    condition(isDef)(getViews(option.views))(
      (views: any) => (state.views = views)
    );
    condition(isNaN, false)(option.selection)(size => (state.selection = size));
    condition(isDef)(option.format)(format => (state.dateFormat = format));
    condition(isDate)(option.startDate)((startDate: any) => {
      state.startDate = startDate;
      state.reachStart = true;
      state.date = startDate;
    });
    condition(isDate)(option.endDate)(
      (endDate: any) => (state.endDate = endDate)
    );
    or(!isNaN(option.limit), not(option.limit))(() => {
      state.limit = option.limit;
    });

    and(isDef(option.views), equal(option.views)("auto"))(() => {
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

    and(isDate(state.startDate), isDate(state.endDate))(() => {
      let date = state.startDate;
      let firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
      let dates = between(firstDate, date, state.dateFormat);
      dates.pop();
      disableDates = dates;
    });
    condition(isBool)(option.lastSelectedItemCanBeInvalid)((value: boolean) => {
      state.lastSelectedItemCanBeInvalid = value;
      if (value === true) {
        state.selection = 2;
      }
    });
    if (!equal(state.selection)(2)) {
      state.limit = false;
      state.lastSelectedItemCanBeInvalid = false;
    }

    this.element = el;
    this.element.className = DOMHelpers.class.container(state.views);

    queue = new Queue({
      size: state.selection,
      limit: state.limit,
      parse: (date: string | Date) => parse(date, state.dateFormat)
    });

    this.render = this.render.bind(this);
    useCallback(state)(this.render);
  }

  protected element: HTMLElement = null;

  protected render(): void {
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
      lastSelectedItemCanBeInvalid
    } = state;

    const size = (() =>
      views == 2 ? 1 : views === "auto" ? diff(endDate, startDate) : 0)();

    const withFormat = (date: Date) => format(date, dateFormat);
    const withParse = (date: string | Date) => parse(date, dateFormat);
    const useRange = selection === 2;

    const selected = TemplateData.mapQueue(
      queue,
      withFormat,
      withParse,
      useRange
    );

    const heading = formatMonthHeading(i18n.title, i18n.months);
    const monthData = TemplateData.mapMonths(date, size, heading);

    const data = monthData.map(item => {
      item.dates = item.dates.map(item => {
        let value = "";
        if (item.origin) {
          value = withFormat(item.origin);
        }

        const isValidDates =
          isDate(item.origin) && isDate(startDate) && isDate(endDate);
        const disabled =
          disableDates.indexOf(value) >= 0 ||
          disableDays.indexOf(item.day) >= 0 ||
          item.disabled ||
          (isValidDates &&
            (item.origin.getTime() > endDate.getTime() ||
              item.origin.getTime() < startDate.getTime()));

        const index = selected.indexOf(value);
        const selectedLength = selected.length;

        const className = classname({
          isActive: queue.has(value),
          isStart: useRange && index === 0,
          isEnd: useRange && index === selectedLength - 1,
          inRange: useRange && index > 0 && index < selectedLength - 1,
          isDisabled: disabled,
          isSelected: queue.has(value),
          isEmpty: !isNotEmpty(value)
        });

        return {
          value,
          disabled,
          selected: index >= 0,
          date: item.date,
          className
        };
      });
      return item;
    });

    this.element.innerHTML = template({
      data,
      days: i18n.days,
      reachStart,
      reachEnd,
      switchable: views !== "auto"
    });
    disables = flatDisables(data);

    const update = (
      item: {
        value: string;
        disabled: boolean;
        selected?: boolean;
      } | null,
      auto: boolean
    ) => {
      updater(
        queue,
        item,
        {
          disables: disables,
          selection,
          lastSelectedItemCanBeInvalid,
          parse: withParse,
          format: withFormat,
          auto
        },
        (dispatchValue: string[]) => {
          publish("select", dispatchValue);
          this.render();
        }
      );
    };
    update(null, true);
    //日期切换
    const select = (selector: string) =>
      DOMHelpers.select(this.element, selector);

    const nodeList = select(".calendar-cell");
    const prevActionDOM = select(".calendar-action.prev");
    const nextActionDOM = select(".calendar-action.next");

    //dispatch render event when rendered
    publish("render", nodeList);

    if (prevActionDOM && nextActionDOM) {
      const actionHandler = (disabled: any, size: number) => () => {
        !disabled &&
          useCallback(changeMonth(date, startDate, endDate)(size))(
            this.render.bind(this)
          );
      };

      prevActionDOM.addEventListener("click", actionHandler(reachStart, -1));
      nextActionDOM.addEventListener("click", actionHandler(reachEnd, 1));
    }

    for (let i = 0; i < nodeList.length; i++) {
      let node = nodeList[i];
      node.addEventListener("click", () => {
        update(
          {
            value: DOMHelpers.attr(node, "data-date"),
            disabled: DOMHelpers.attr(node, "data-disabled") === "true",
            selected: true
          },
          false
        );
      });
    }
  }

  /**
   *
   * @param dates Array<string | Date>
   */
  public setDates = (dates: Array<string | Date>): void => {
    const { selection, limit, dateFormat } = state;

    const withParse = (date: Date | string) => parse(date, dateFormat);

    if (!isArray(dates) || dates.some(date => !isDate(withParse(date)))) return;
    const withFormat = (date: Date) =>
      isDate(date) ? format(date, dateFormat) : date;

    dates = reduceList(
      mapList(sliceList(dates, 0, selection), withParse, isDef),
      (prev: Date | null, curr: Date | null, _: number, dates: Array<any>) => {
        let gap = 0;
        if (prev && curr) {
          gap = diff(curr, prev, "days");
        }
        return selection === 2
          ? gap > limit || gap < 0
            ? []
            : mapList(dates, withFormat, isDef)
          : mapList(dates, withFormat, isDef);
      }
    );

    if (dates.length <= 0) {
      return;
    }

    const selected = mapList(dates, (item: string) => ({
      value: item,
      selected: true
    }));
    useCallback({
      selected,
      date: withParse(dates[0])
    })(this.render);
  };

  /**
   *
   * @param {Disable} options
   */
  public disable = (options: Disable): void => {
    let { to, from, days, dates } = options;
    const { endDate, startDate, dateFormat } = state;

    const withParse = (date: string | Date) => parse(date, dateFormat);
    const withFormat = (date: Date) => formatParse(dateFormat)(date);

    if (!isArray(dates)) {
      dates = [];
    }
    if (!isArray(days)) {
      days = [];
    }
    const newState: Partial<State> = {
      startDate,
      endDate
    };

    condition(isDate)(withParse(from))((from: any) => {
      newState.endDate = from;
    });
    condition(isDate)(withParse(to))((to: any) => {
      newState.startDate = to;
      newState.reachStart = true;
      newState.date = to;
    });

    or(!isDate(state.startDate), !isDate(state.endDate))(
      () => {
        newState.reachEnd = false;
        newState.reachStart = false;
      },
      () => {
        let start = state.startDate;
        let end = state.endDate;
        if (start > end) {
          newState.startDate = end;
          newState.endDate = start;
          newState.date = end;
          newState.reachStart = true;
        }
      }
    );

    disableDays = filterList(
      mapList(days, toInt, (day: number) => day >= 0 && day <= 6),
      isNotEmpty
    );
    disableDates = filterList(
      dedupList(mapList([...disableDates, ...dates], withFormat, isNotEmpty)),
      isNotEmpty
    );

    useCallback(newState)(this.render);
  };

  /**
   *
   * @param i18n
   */
  public i18n = (i18n: I18n): void =>
    i18nValidator(i18n, (i18n: I18n) => useCallback({ i18n })(this.render));
  /**
   *
   * @param next: (dispatchValue: NodeListOf<HTMLElement>) => void
   */
  public onRender = (
    next: (dispatchValue: NodeListOf<HTMLElement>) => void
  ): void => subscribe("render", next);
  /**
   *
   * @param next : (dispatchValue: string[]) => void
   */
  public onSelect = (next: (dispatchValue: string[]) => void): void =>
    subscribe("select", next);
}
