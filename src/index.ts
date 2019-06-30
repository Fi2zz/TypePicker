import "./style.css";
import { DOMHelpers } from "./datepicker.dom.helper";
import {
  changeMonth,
  defaultI18n,
  diffDates,
  diffMonths,
  format,
  i18nValidator,
  parse,
  Disabled,
  MonthPanelData,
  createDates,
  publish,
  subscribe,
  Queue
} from "./datepicker.helpers";
import { datepicker, Disable, I18n, State } from "./datepicker.interface";
import { template } from "./datepicker.template";
import {
  and,
  condition,
  dedupList,
  equal,
  notEqual,
  filterList,
  isArray,
  isBool,
  isDate,
  isDef,
  isNotEmpty,
  mapList,
  or,
  padding,
  reduceList,
  sliceList,
  createList,
  toInt
} from "./util";

let queue = null;
let disables = new Disabled();
const viewsMap = {
  auto: "auto",
  1: 1,
  2: 2
};

function formatPanelTitle(year, month) {
  return getState()
    .i18n.title.toLowerCase()
    .replace(/y{1,}/g, padding(year))
    .replace(/m{1,}/g, getState().i18n.months[month]);
}
const findDisabledBeforeStartDate = (
  startDate: Date | string,
  dateBeforeStartDate: Date | string
) => {
  const _start: Date = useParseDate(startDate);
  const _end: Date = useParseDate(dateBeforeStartDate);
  if (!_start || !_end) {
    return [];
  }
  return createDates(_start, diffDates(_end, _start, true), -1).map(
    useFormatDate
  );
};

const datesBetweenEnqueuedAndInqueue = (current, last) => {
  const size = diffDates(current, last);
  return createList(size, index => {
    const now = new Date(
      current.getFullYear(),
      current.getMonth(),
      index + current.getDate()
    );
    return useFormatDate(now);
  });
};

function enqueue(
  queue: Queue,
  item: { value: string; disabled: any; selected: boolean },
  next: Function
): void {
  const { lastSelectedItemCanBeInvalid, selection } = getState();
  if (item.disabled && selection !== 2) {
    return;
  }
  const length = queue.length();
  if (selection === 2) {
    const last = queue.last();
    let size = 0;
    let someInvalid = false;

    if (last) {
      const between = datesBetweenEnqueuedAndInqueue(
        useParseDate(item.value),
        useParseDate(last.value)
      );
      size = between.length;
      someInvalid = disables.some((date: string) => between.indexOf(date) >= 0);
    }
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

function useEnqueue(
  data: { value: string; disabled: boolean } | null,
  next: Function
) {
  const state = getState();
  if (data) {
    state.selected.push(data);
  }

  state.selected
    .map(item => {
      if ("disabled" in item === false) {
        item.disabled = disables.find(item.value); //> -1;
      }
      item.selected = true;
      return item;
    })
    .forEach(item => enqueue(queue, item, next));
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
  selected: [],
  panelSize: 1
};

function setState(partial: Partial<State>) {
  state = partial ? { ...state, ...partial } : state;
}
function getState() {
  return state;
}
function useFormatDate(date: Date): string {
  return format(date, getState().dateFormat);
}

function useParseDate(date: Date | string): Date {
  return parse(date, getState().dateFormat);
}

const inDisable = (date: Date | null, formattedDate: string, day: number) => {
  return disables.oneOf(formattedDate, day) || disables.outofRange(date);
};

function getInRange({ range, value, expected, lower }) {
  const index = range.indexOf(value);

  if (!lower || expected === lower) {
    return index === expected;
  }

  return index > expected && index < lower;
}

function renderTemplate(): string {
  const state = getState();
  const monthPanelData = new MonthPanelData();
  monthPanelData.mapMonths(
    isNaN(state.views as number) ? state.startDate : state.date,
    state.panelSize
  );
  monthPanelData.mapDates({
    useFormatDate: useFormatDate,
    usePanelTitle: formatPanelTitle,
    useRange: ({ date, value, day }) => {
      const range = queue.getRange();
      const inRange = getInRange({
        range,
        value,
        expected: 0,
        lower: range.length - 1
      });
      const isEnd = getInRange({
        range,
        value,
        expected: range.length - 1,
        lower: range.length - 1
      });
      const isStart = getInRange({ range, value, expected: 0, lower: 0 });
      const inQueue = queue.has(value);
      return [
        inQueue,
        inDisable(date, value, day),
        queue.useRange && inRange,
        queue.useRange && isStart,
        queue.useRange && isEnd
      ];
    }
  });
  monthPanelData.mapDisabled(dates => disables.update("all", dates));
  return template({
    data: monthPanelData.data,
    days: state.i18n.days,
    reachStart: state.reachStart,
    reachEnd: state.reachEnd,
    switchable: !isNaN(state.views as number)
  });
}

export default class TypePicker {
  startDate: Date | null;
  endDate: Date | null;
  date: Date | null;

  constructor(option: datepicker) {
    const el = DOMHelpers.select(option.el);
    if (!el || !option) {
      return;
    }
    const partial: Partial<State> = {};
    condition(isDef)(option.format)(
      (format: string) => (partial.dateFormat = format)
    );

    condition(isDef)(option.views)((views: any) => {
      const view = viewsMap[views];
      partial.views = view ? view : viewsMap[1];
    });
    condition((size: number) => !isNaN(size))(option.selection)(
      (size: number) => {
        partial.selection = size;
      }
    );

    condition(isDate)(option.startDate)((startDate: Date) => {
      partial.startDate = startDate;
      partial.reachStart = true;
      partial.date = startDate;
    });
    condition(isDate)(option.endDate)(
      (endDate: Date) => (partial.endDate = endDate)
    );

    condition(
      (limit: number | boolean) => !isNaN(limit as number) || limit !== false
    )(option.limit)((limit: number | boolean) => {
      partial.limit = limit;
    });
    equal(option.views as string, "auto")(() => {
      if (!partial.startDate) {
        partial.startDate = new Date();
      }

      let start = partial.startDate;
      if (!partial.endDate) {
        partial.endDate = new Date(
          start.getFullYear(),
          start.getMonth() + 6,
          start.getDate()
        );
      }
      partial.date = partial.startDate;
    });

    and(isDate(partial.startDate), isDate(partial.endDate))(() => {
      const date = partial.startDate;
      const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const dateBeforeStartDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - 1
      );
      disables.update(
        "dates",
        findDisabledBeforeStartDate(firstDate, dateBeforeStartDate)
      );
      disables.update("startDate", partial.startDate);
      disables.update("endDate", partial.endDate);
    });
    condition(isBool)(option.lastSelectedItemCanBeInvalid)((value: boolean) => {
      partial.lastSelectedItemCanBeInvalid = value;
      if (value === true) {
        partial.selection = 2;
      }
    });
    this.element = el;
    this.element.className = DOMHelpers.class.container(partial.views);
    queue = new Queue({
      size: partial.selection,
      limit: partial.limit,
      useRange: partial.selection === 2,
      useFormatDate,
      useParseDate
    });

    partial.panelSize =
      partial.views === "auto"
        ? diffMonths(partial.endDate, partial.startDate)
        : (partial.views as number);

    this.update(partial);
  }
  protected element: HTMLElement = null;
  protected update(partial) {
    if (partial && Object.keys(partial).length <= 0) {
      return;
    }

    setState(partial);
    const {
      date,
      startDate,
      endDate,
      reachEnd,
      reachStart,
      panelSize
    } = getState();

    this.date = date;
    this.startDate = startDate;
    this.endDate = endDate;
    this.element.innerHTML = renderTemplate();
    const select = (selector: string) =>
      DOMHelpers.select(this.element, selector);
    const nodeList = select(".calendar-cell");
    const prevActionDOM = select(".calendar-action.prev");
    const nextActionDOM = select(".calendar-action.next");

    //dispatch render event when rendered
    publish("render", nodeList);

    const useUpdate = (
      item: {
        value: string;
        disabled: boolean;
        selected?: boolean;
      } | null
    ) =>
      useEnqueue(item, (dispatchValue: string[]) => {
        publish("select", dispatchValue);
        this.update(null);
      });
    useUpdate(null);
    if (prevActionDOM && nextActionDOM) {
      const actionHandler = (disabled: any, size: number) => () => {
        !disabled && this.update(changeMonth(date, startDate, endDate)(size));
      };
      prevActionDOM.addEventListener(
        "click",
        actionHandler(reachStart, -1 * (panelSize as number))
      );
      nextActionDOM.addEventListener(
        "click",
        actionHandler(reachEnd, panelSize as number)
      );
    }

    for (let i = 0; i < nodeList.length; i++) {
      let node = nodeList[i];
      node.addEventListener("click", () => {
        useUpdate({
          value: DOMHelpers.attr(node, "data-date"),
          disabled: DOMHelpers.attr(node, "data-disabled") === "true",
          selected: true
        });
      });
    }
  }

  /**
   *
   * @param dates Array<string | Date>
   */
  public setDates(dates: Array<string | Date>): void {
    const { selection, limit, startDate, endDate } = getState();
    if (!isArray(dates) || dates.length <= 0) return;

    dates = sliceList(dates, 0, selection + 1);

    if (dates.length <= 0 || dates.some(date => !isDate(useParseDate(date)))) {
      return;
    }
    dates = mapList(dates, useParseDate, isDef);
    if (dates.length <= 0) {
      return;
    }

    dates = reduceList(
      dates,
      (prev: Date | null, curr: Date | null, _: number, dates: Array<any>) => {
        if (selection == 2 && isDef(limit)) {
          let gap = 0;
          if (prev && curr) {
            gap = diffDates(curr, prev);
          }
          if (gap > limit || gap < 0) {
            return [];
          }
        }
        return mapList(dates, useFormatDate, isDef);
      }
    );

    if (dates.length <= 0) {
      return;
    }
    const partial: Partial<State> = {
      selected: mapList(dates, (item: string) => ({
        value: item,
        selected: true
      }))
    };
    const currentDate = useParseDate(dates[0]);
    if (currentDate) {
      if (startDate) {
        partial.reachStart = currentDate < startDate;
      }
      if (endDate) {
        partial.reachEnd = currentDate > endDate;
      }
      if (!partial.reachEnd && !partial.reachStart) {
        partial.date = currentDate;
      }
    }
    this.update(partial);
  }

  /**
   *
   * @param {Disable} options
   */
  public disable(options: Disable): void {
    let { to, from, days, dates } = options;
    const state = getState();
    if (!isArray(dates)) {
      dates = [];
    }
    if (!isArray(days)) {
      days = [];
    }
    const partial: Partial<State> = {
      startDate: state.startDate,
      endDate: state.endDate
    };
    condition(isDate)(useParseDate(from))((from: any) => {
      partial.endDate = from;
      disables.update("endDate", from);
    });
    condition(isDate)(useParseDate(to))((to: any) => {
      partial.startDate = to;
      partial.reachStart = true;
      partial.date = to;
      disables.update("startDate", to);
    });

    or(!isDate(partial.startDate), !isDate(partial.endDate))(
      () => {
        partial.reachEnd = false;
        partial.reachStart = false;
      },
      () => {
        let start = state.startDate;
        let end = state.endDate;
        if (start > end) {
          partial.startDate = end;
          partial.endDate = start;
          partial.date = end;
          partial.reachStart = true;
        }
      }
    );

    if (days.length > 0) {
      disables.update(
        "days",
        filterList(
          mapList(days, toInt, (day: number) => day >= 0 && day <= 6),
          isNotEmpty
        )
      );
    }
    if (dates.length > 0) {
      disables.update(
        "dates",
        filterList(
          dedupList(
            mapList([...disables.dates, ...dates], useParseDate, isNotEmpty)
          ),
          isNotEmpty
        )
      );
    }
    this.update(partial);
  }

  /**
   *
   * @param i18n
   */
  public i18n(i18n: I18n): void {
    i18nValidator(i18n, (i18n: I18n) => this.update({ i18n }));
  }
  /**
   *
   * @param next: (dispatchValue: NodeListOf<HTMLElement>) => void
   */
  public onRender(next: Function) {
    subscribe("render", next);
  }

  /**
   *
   * @param next : (dispatchValue: string[]) => void
   */
  public onSelect(next: (dispatchValue: string[]) => void): void {
    subscribe("select", next);
  }
}
