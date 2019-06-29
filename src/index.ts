import "./style.css";
import { MonthPanelData } from "./datepicker.data.generator";
import { DOMHelpers } from "./datepicker.dom.helper";
import {
  between,
  changeMonth,
  defaultI18n,
  diffDates,
  diffMonths,
  format,
  i18nValidator,
  parse,
  createDates
} from "./datepicker.helpers";
import { datepicker, Disable, I18n, State } from "./datepicker.interface";
import { publish, subscribe } from "./datepicker.observer";
import { Queue } from "./datepicker.queue";
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
let disableDates = [];
let disableDays = [];
let disables = [];

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

function getSelectedFromQueue(shouldMapQueue: boolean): any {
  const length = queue.length();

  if (length <= 0) {
    return [];
  }

  if (!shouldMapQueue) {
    return queue.map(item => item.value);
  }

  const first = queue.front();
  const last = queue.last();

  if (first.value === last.value) {
    return [];
  }
  const start = useParseDate(first.value);
  const end = useParseDate(last.value);
  const size = diffDates(end, start);
  return createDates(start, size).map(useFormatDate);
}

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
        item.disabled = disables.indexOf(item.value) > -1;
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

function renderTemplate(): string {
  const state = getState();
  let {
    reachStart,
    reachEnd,
    views,
    startDate,
    endDate,
    date,
    selection,
    i18n,
    panelSize
  } = state;
  const useRange = selection === 2;

  const monthPanelData = new MonthPanelData();
  monthPanelData.mapMonths(
    isNaN(views as number) ? startDate : date,
    panelSize
  );
  monthPanelData.mapDates(
    (date, value, day) => {
      const useSelected = getSelectedFromQueue(useRange);
      const inSelelected = (value, greater, lower?) => {
        const index = useSelected.indexOf(value);
        if (!lower) {
          return index === greater;
        }
        if (greater === lower) {
          if (greater >= 0 && lower >= 0) {
            return index >= greater;
          } else {
            return index <= lower;
          }
        }
        return index > greater && index < lower;
      };
      const inDisable = (date, value, day) => {
        const isDisabled = value => {
          const isValidDates =
            isDate(value) && isDate(startDate) && isDate(endDate);
          return isValidDates && (value > endDate || value < startDate);
        };
        return (
          disableDates.indexOf(value) >= 0 ||
          disableDays.indexOf(day) >= 0 ||
          isDisabled(date)
        );
      };
      const inRange = inSelelected(value, 0, useSelected.length - 1);
      const isEnd = inSelelected(value, useSelected.length - 1);
      const isStart = inSelelected(value, 0);
      const inQueue = queue.has(value);
      return [
        useRange && inRange,
        useRange && isStart,
        useRange && isEnd,
        inSelelected(value, 0, 0),
        inQueue,
        inDisable(date, value, day)
      ];
    },
    useFormatDate,
    formatPanelTitle
  );
  monthPanelData.mapDisabled(disables);
  return template({
    data: monthPanelData.data,
    days: i18n.days,
    reachStart,
    reachEnd,
    switchable: !isNaN(views as number)
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
      disableDates = between(
        firstDate,
        dateBeforeStartDate,
        partial.dateFormat
      );
    });
    condition(isBool)(option.lastSelectedItemCanBeInvalid)((value: boolean) => {
      partial.lastSelectedItemCanBeInvalid = value;
      if (value === true) {
        partial.selection = 2;
      }
    });

    notEqual(partial.selection as number, 2)(() => {
      partial.limit = isDef(partial.limit) ? partial.selection : false;
      partial.lastSelectedItemCanBeInvalid = false;
    });
    this.element = el;
    this.element.className = DOMHelpers.class.container(partial.views);
    queue = new Queue({
      size: partial.selection,
      limit: partial.limit,
      parse: (date: string | Date) => parse(date, partial.dateFormat)
    });

    partial.panelSize =
      partial.views === "auto"
        ? diffMonths(partial.endDate, partial.startDate)
        : (partial.views as number);

    this.update(partial);
  }
  protected element: HTMLElement = null;
  protected update(partial) {
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
    const partial: Partial<State> = {};
    condition(isDate)(useParseDate(from))((from: any) => {
      partial.endDate = from;
    });
    condition(isDate)(useParseDate(to))((to: any) => {
      partial.startDate = to;
      partial.reachStart = true;
      partial.date = to;
    });

    or(!isDate(state.startDate), !isDate(state.endDate))(
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
      disableDays = filterList(
        mapList(days, toInt, (day: number) => day >= 0 && day <= 6),
        isNotEmpty
      );
    }
    if (dates.length > 0) {
      disableDates = filterList(
        dedupList(
          mapList([...disableDates, ...dates], useParseDate, isNotEmpty)
        ),
        isNotEmpty
      );
    }
    if (Object.keys(partial).length > 0) {
      this.update(partial);
    }
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
