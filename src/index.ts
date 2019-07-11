import "./style.css";
import { DOMHelpers } from "./datepicker.dom.helper";
import {
  diffDates,
  diffMonths,
  i18nValidator,
  MonthPanelData,
  publish,
  subscribe
} from "./datepicker.helpers";
import {
  TypePickerOptions,
  Disable,
  TypePickerI18n,
  TypePickerState,
  QueueItem
} from "./datepicker.interface";
import { template } from "./datepicker.template";
import { match, isBool, isDate, isDef, isNotEmpty, toInt, List } from "./util";

import {
  getState,
  setState,
  checkSwitchable,
  useFormatDate,
  useParseDate,
  disables,
  queue,
  findDisabledBeforeStartDate,
  findDatesBetweenEnqueuedAndInqueue,
  usePanelTitle,
  inDisable,
  viewTypes,
  events,
  dataset
} from "./state";

let temp = [];

function useQueue(item: QueueItem, next: Function): void {
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
      const between = findDatesBetweenEnqueuedAndInqueue(
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

function useUpdate(data: QueueItem, next: Function) {
  const state = getState();
  if (data) {
    temp.push(data);
    state.selected.push(data);
  }
  const selected = List.map(temp, item => {
    item.disabled = disables.find(item.value);
    item.selected = true;
    return item;
  });

  List.loop(selected, item => {
    useQueue(item, dispatchValue => {
      let partial: Partial<TypePickerState> = {};
      partial.selected = dispatchValue;
      publish("select", dispatchValue);
      if (typeof next === "function") {
        next(partial);
      }
    });
  });
  temp = [];
}

function renderTemplate({ views, date, reachEnd, reachStart }): string {
  const state = getState();
  const monthPanelData = new MonthPanelData();
  monthPanelData.mapMonths(
    isNaN(views as number) ? state.startDate : date,
    views
  );

  monthPanelData.mapDates({
    useFormatDate,
    usePanelTitle,
    useRange: ({ date, value, day }) => {
      const range = queue.getRange();
      const inRange = List.inRange(
        range,
        value,
        (index, list) => index > 0 && index < list.length - 1
      );
      const isEnd = List.inRange(
        range,
        value,
        (index, list) => index === list.length - 1
      );
      const isStart = List.inRange(range, value, index => index === 0);
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
  monthPanelData.mapDisabled(dates => disables.set({ all: dates }));
  return template({
    data: monthPanelData.data,
    days: state.i18n.days,
    reachStart,
    reachEnd,
    switchable: views > 0 && views <= 2
  });
}

const isNumberOrTrue = v => !isNaN(v as number) || v === true;

const isNumber = v => !isNaN(v);

class TypePicker {
  startDate: Date | null;
  endDate: Date | null;
  date = new Date();
  views = 1;

  constructor(option: TypePickerOptions) {
    const el = DOMHelpers.select(option.el);
    if (!el || !option) {
      return;
    }
    let _date = this.date;
    let _views: string | number = this.views;
    const partial: Partial<TypePickerState> = {};
    match({ condition: isDef, value: option.format })(
      format => (partial.dateFormat = format)
    );
    match({ condition: isDef, value: option.views })(views => {
      _views = viewTypes[viewTypes[views]];
    });
    match({ condition: isNumber, value: option.selection })(
      size => (partial.selection = size)
    );
    match({ condition: isDate, value: useParseDate(option.startDate) })(
      date => {
        partial.startDate = date;
        _date = date;
      }
    );
    match({ condition: isDate, value: useParseDate(option.endDate) })(
      (date: Date) => (partial.endDate = date)
    );
    match({ condition: isNumberOrTrue, value: option.limit })(
      limit => (partial.limit = limit)
    );
    match({
      condition: (option.views as string) === viewTypes.auto,
      value: option.views
    })(() => {
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
      _views = diffMonths(partial.endDate, partial.startDate);
      _date = partial.startDate;
    });

    match({
      condition: (dates: any) => List.every(dates, isDate),
      value: [partial.startDate, partial.endDate]
    })(([startDate, endDate]) => {
      const date = startDate;
      const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const dateBeforeStartDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - 1
      );
      disables.set({
        dates: findDisabledBeforeStartDate(firstDate, dateBeforeStartDate),
        startDate,
        endDate
      });
    });
    match({ condition: isBool, value: option.lastSelectedItemCanBeInvalid })(
      value => {
        partial.lastSelectedItemCanBeInvalid = value;
        if (value === true) {
          partial.selection = 2;
        }
      }
    );

    queue.setOptions({
      size: partial.selection,
      limit: partial.limit,
      useRange: partial.selection === 2,
      useFormatDate,
      useParseDate
    });

    this.element = el;
    this.element.className = DOMHelpers.class.container(_views);
    this.startDate = partial.startDate;
    this.endDate = partial.endDate;
    this.date = _date;
    this.views = _views;

    this.update(partial);
  }

  protected element: HTMLElement = null;

  protected update(partial) {
    if (partial && Object.keys(partial).length <= 0) {
      return;
    }
    const [reachStart, reachEnd] = checkSwitchable(this.date);
    setState(partial);
    this.element.innerHTML = renderTemplate({
      views: this.views,
      date: this.date,
      reachEnd,
      reachStart
    });
    const select = selector => DOMHelpers.select(this.element, selector);
    const prevActionDOM = select(".calendar-action.prev");
    const nextActionDOM = select(".calendar-action.next");
    const nodeList = select(".calendar-cell");
    if (prevActionDOM && nextActionDOM) {
      const listener = (disabled: any, step: number) => {
        const now = new Date(
          this.date.getFullYear(),
          this.date.getMonth() + step * this.views,
          this.date.getDate()
        );
        if (disabled) {
          return;
        }
        this.date = now;
        this.update(null);
      };
      prevActionDOM.addEventListener(events.click, () =>
        listener(reachStart, -1)
      );
      nextActionDOM.addEventListener(events.click, () => listener(reachEnd, 1));
    }
    List.loop(nodeList, node => {
      node.addEventListener(events.click, () => {
        const value = DOMHelpers.attr(node, dataset.date);
        const disabled = DOMHelpers.attr(node, dataset.disabled) !== null;
        if (!value) {
          return;
        }
        useUpdate({ value, disabled }, this.update.bind(this));
      });
    });
    useUpdate(null, this.update.bind(this));
  }

  /**
   *
   * @param dates Array<string | Date>
   */
  public setDates(dates: Array<string | Date>): void {
    const { selection, limit } = getState();
    dates = List.slice(dates, 0, selection + 1);
    dates = List.map(dates, useParseDate);
    match({ condition: dates => List.every(dates, isDate), value: dates })(
      dates => {
        dates = List.map(dates, useParseDate, isDef);
        dates = List.reduce(dates, (prev: Date, curr: Date) => {
          if (selection == 2 && isNumber(limit)) {
            let gap = diffDates(curr, prev);
            if (gap > limit || gap < 0) {
              return [];
            }
          }
          return List.map(dates, useFormatDate, isDef);
        });
        if (dates.length <= 0) {
          return;
        }
        temp = List.map(dates, item => ({
          value: item,
          selected: true
        }));
        const currentDate = useParseDate(dates[dates.length - 1]);
        if (currentDate) {
          this.date = currentDate;
        }
        this.update(null);
      }
    );
  }

  /**
   *
   * @param {Disable} options
   */
  public disable(options: Disable): void {
    let { to, from, days, dates } = options;
    if (!List.isList(dates)) {
      dates = [];
    }
    if (!List.isList(days)) {
      days = [];
    }
    const partial: Partial<TypePickerState> = {};
    match({ condition: isDate, value: useParseDate(from) })(
      (from: Date) => (partial.endDate = from)
    );
    match({ condition: isDate, value: useParseDate(to) })(
      (to: Date) => (partial.startDate = to)
    );

    match({
      condition: dates => List.every(dates, isDate),
      value: [partial.startDate, partial.endDate]
    })(([start, end]) => {
      if (start > end) {
        partial.startDate = end;
        partial.endDate = start;
      }
      disables.set({ startDate: partial.startDate, endDate: partial.endDate });
      this.date = partial.startDate;
      this.startDate = partial.startDate;
      this.endDate = partial.endDate;
    });

    match({ condition: (v: { length: number }) => v.length > 0, value: days })(
      days => {
        const isValidDay = day => isNumber(day) && day >= 0 && day <= 6;
        disables.set({
          days: List.map(days, toInt, isValidDay)
        });
      }
    );
    match({ condition: v => v.length > 0, value: dates })(dates => {
      dates = List.map([...disables.dates, ...dates], useParseDate, isDate);
      dates = List.map(dates, useFormatDate, isDef);
      disables.set({
        dates: List.dedup(dates)
      });
    });
    this.update(partial);
  }

  /**
   *
   * @param i18n
   */
  public i18n(i18n: TypePickerI18n): void {
    i18nValidator(i18n, (i18n: TypePickerI18n) => this.update({ i18n }));
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

export { subscribe, publish };
export default TypePicker;
