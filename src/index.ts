import "./style.css";
import { DOMHelpers } from "./datepicker.dom.helper";
import {
  diffDates,
  diffMonths,
  i18nValidator,
  MonthPanelData,
  publish,
  subscribe,
  createDates
} from "./datepicker.helpers";
import {
  TypePickerOptions,
  TypePickerDisable,
  TypePickerI18n,
  TypePickerState,
  SelectionItem
} from "./datepicker.interface";
import { template } from "./datepicker.template";
import { match, isBool, isDate, isDef, List } from "./util";
import {
  getState,
  setState,
  useSwitchable,
  useFormatDate,
  useParseDate,
  disables,
  queue,
  findDisabledBeforeStartDate,
  usePanelTitle,
  viewTypes,
  events,
  dataset
} from "./state";

let temp = [];

function useQueue(item: SelectionItem, next: Function): void {
  const { useInvalidAsSelected, selection, limit } = getState();
  const currentQueueLength = queue.length();
  const nextQueueLength = currentQueueLength + 1;
  const current = useParseDate(item.value);
  const first = queue.front();
  const findOutDisablesBeforePush = () => {
    const firstDate = useParseDate(first.value);
    const size = diffDates(firstDate, current, true);
    const dates = List.filter(createDates(firstDate, size), date => {
      const value = useFormatDate(date);
      const disable = disables.of(date, value);
      return disable && value !== item.value;
    });
    return dates.length > 0;
  };

  if (item.disabled) {
    if (selection !== 2) {
      return;
    } else {
      if (currentQueueLength >= 0) {
        if (!useInvalidAsSelected) {
          return;
        }
        //find out disables before push
        if (
          (currentQueueLength === 1 && findOutDisablesBeforePush()) ||
          currentQueueLength === 2
        ) {
          return;
        }
      }
    }
  }
  //find out disables between last and curren
  else if (selection === 2) {
    if (currentQueueLength) {
      if (findOutDisablesBeforePush()) {
        queue.shift();
      } else {
        const firstDate = useParseDate(first.value);
        if (firstDate > current) {
          queue.pop();
        }
      }
    }
  }

  if (nextQueueLength > queue.size) {
    queue.clean();
  }
  const dispatchValue = () => next(queue.list);
  queue.push(item)(dispatchValue);
}
function useUpdate(data: SelectionItem, next: Function) {
  if (data) {
    temp.push(data);
  }
  List.loop(temp, (item: SelectionItem) => {
    const date = useParseDate(item.value);
    item.disabled = disables.of(date, item.value);
    item.selected = true;
    useQueue(item, selected => {
      publish("select", selected.map(item => item.value));
      next({ selected });
    });
  });
  temp = [];
}

function getRangeFromQueue(useRange: boolean) {
  const length = queue.length();
  if (length <= 0 || !useRange) {
    return [];
  }
  const first = queue.front();
  const last = queue.last();
  const start = useParseDate(first.value);
  const end = useParseDate(last.value);
  const size = diffDates(end, start);
  return createDates(start, size).map(useFormatDate);
}

let viewType;

function renderTemplate({ date, reachEnd, reachStart }): string {
  const state = getState();
  const monthPanelData = new MonthPanelData();
  monthPanelData.mapMonths(
    isNaN(state.views as number) ? state.startDate : date,
    state.views as number
  );
  monthPanelData.mapDates({
    useFormatDate,
    usePanelTitle,
    useRange: ({ date, value, day }) => {
      const range = getRangeFromQueue(state.selection === 2);
      const inRange = List.inRange(
        range,
        value,
        (index: number, list: { length: number }) =>
          index > 0 && index < list.length - 1
      );
      const isEnd = List.inRange(
        range,
        value,
        (index: number, list: { length: number }) => index === list.length - 1
      );
      const isStart = List.inRange(range, value, index => index === 0);
      const inQueue = queue.has(value);
      const inDisables = disables.of(date, value);
      return [inQueue, inDisables, inRange, isStart, isEnd];
    }
  });
  monthPanelData.mapDisabled(dates => disables.set({ all: dates }));
  return template({
    data: monthPanelData.data,
    days: state.i18n.days,
    reachStart,
    reachEnd,
    switchable: viewType !== viewTypes.auto
  });
}
const isNumber = (v: string) => /[0-9]/.test(v);
class TypePicker {
  startDate: Date | null;
  endDate: Date | null;
  date = new Date();
  protected element: HTMLElement = null;
  constructor(option: TypePickerOptions) {
    const el = DOMHelpers.select(option.el);
    if (!el || !option) {
      return;
    }
    const partial: Partial<TypePickerState> = {};
    match({ condition: isDef, value: option.format })(
      (format: string) => (partial.format = format)
    );
    match({ condition: isDef, value: option.views })(views => {
      partial.views = viewTypes[viewTypes[views]];
      viewType = views;
    });
    match({ condition: isNumber, value: option.selection })(
      (size: number) => (partial.selection = size)
    );
    match({ condition: isDate, value: useParseDate(option.startDate) })(
      (date: Date) => (partial.startDate = date)
    );
    match({ condition: isDate, value: useParseDate(option.endDate) })(
      (date: Date) => (partial.endDate = date)
    );
    match({
      condition: isNumber,
      value: option.limit
    })((limit: number) => (partial.limit = limit));
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
      partial.views = diffMonths(partial.endDate, partial.startDate);
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
    match({ condition: isBool, value: option.useInvalidAsSelected })(value => {
      partial.useInvalidAsSelected = value;
      if (value === true) {
        partial.selection = 2;
      }
    });
    this.element = el;
    this.element.className = DOMHelpers.class.container(partial.views);
    queue.setSize(partial.selection);
    this.update(partial);
  }
  protected update(partial) {
    if (partial && Object.keys(partial).length <= 0) {
      return;
    }

    setState(partial);
    const { startDate, endDate } = getState();
    this.startDate = startDate;
    this.endDate = endDate;
    if (partial && partial.selected) {
      let item = List.fetchEnd(partial.selected);
      let date = useParseDate(item.value);
      this.date = date;
    }
    const [reachStart, reachEnd] = useSwitchable(this.date);
    useUpdate(null, this.update.bind(this));
    this.element.innerHTML = renderTemplate({
      date: this.date,
      reachEnd,
      reachStart
    });
    const select = (selector: string) =>
      DOMHelpers.select(this.element, selector);
    const prevActionDOM = select(".calendar-action.prev");
    const nextActionDOM = select(".calendar-action.next");
    const nodeList = select(".calendar-cell");
    if (prevActionDOM && nextActionDOM) {
      const listener = (disabled: any, step: number) => {
        const now = new Date(
          this.date.getFullYear(),
          this.date.getMonth() + step,
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
    List.loop(nodeList, (node: HTMLElement) => {
      node.addEventListener(events.click, () => {
        const value = DOMHelpers.attr(node, dataset.date);
        const disabled = DOMHelpers.attr(node, dataset.disabled) !== null;
        if (!value) {
          return;
        }
        this.date = useParseDate(value);
        useUpdate({ value, disabled }, this.update.bind(this));
      });
    });
  }

  public setDates(dates: Array<string | Date>, shouldUpdate?): void {
    shouldUpdate = shouldUpdate || true;
    const { selection, limit } = getState();
    dates = List.slice(dates, 0, selection);
    dates = List.map(dates, useParseDate, isDef);
    dates = List.dedup(dates, (date: Date, map: Function) => {
      if (!map[date.toDateString()]) {
        return date;
      }
      return null;
    });

    match({
      condition: (dates: any) => List.every(dates, isDate),
      value: dates
    })((dates: any[]) => {
      dates = List.reduce(dates, (prev: Date, curr: Date, index, list) => {
        if (selection == 2 && index > 0) {
          prev = list[index - 1];
          const gap = diffDates(curr, prev);
          if (gap <= 0) {
            return [useFormatDate(curr)];
          }
          if (limit && gap > limit) {
            return [];
          }
        }
        dates = dates.sort((a, b) => a.getTime() - b.getTime());
        return List.map(dates, useFormatDate, isDef);
      });
      if (dates.length <= 0) {
        return;
      }

      temp = List.map(dates, value => ({
        value,
        selected: true,
        disabled: false
      }));

      if (shouldUpdate) {
        this.update(null);
      }
    });
  }
  public disable(options: TypePickerDisable): void {
    let { to, from, days, dates } = options;
    if (!List.isList(dates)) {
      dates = [];
    }
    if (!List.isList(days)) {
      days = [];
    }
    let partial: Partial<TypePickerState> = {};
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
      if (start >= end) {
        return;
      }
      disables.set({ startDate: partial.startDate, endDate: partial.endDate });
    });

    match({ condition: (v: { length: number }) => v.length > 0, value: days })(
      (days: any[]) => {
        const isValidDay = day => isNumber(day) && day >= 0 && day <= 6;
        days = List.map(days, day => parseInt(day, 10), isValidDay);
        disables.set({
          days
        });
      }
    );
    match({ condition: v => v.length > 0, value: dates })(dates => {
      dates = List.map([...disables.dates, ...dates], useParseDate, isDate);
      dates = List.map(dates, useFormatDate, isDef);
      dates = List.dedup(dates);
      disables.set({
        dates
      });
    });
    if (partial.startDate && partial.endDate && viewType === viewTypes.auto) {
      partial.views = diffMonths(partial.startDate, partial.endDate, true);
    }
    this.update(partial);
  }

  public i18n(i18n: TypePickerI18n): void {
    i18nValidator(i18n, (i18n: TypePickerI18n) => this.update({ i18n }));
  }
  public onRender(next: Function) {
    subscribe("render", next);
  }
  public onSelect(next: (dispatchValue: string[]) => void): void {
    subscribe("select", next);
  }
}

export { subscribe, publish };
export default TypePicker;
