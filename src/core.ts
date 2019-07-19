import "./style.css";
import { DOMHelpers } from "./dom.helper";
import {
  diffDates,
  diffMonths,
  i18nValidator,
  publish,
  subscribe,
  parse,
  format,
  viewTypes,
  useViewTypes,
  events,
  dataset,
  Selection,
  Disabled,
  useCalendarData,
  useSwitchable,
  useSelection
} from "./helpers";
import { template } from "./template";
import { match, isBool, isDate, isDef, List, isPositiveInteger } from "./util";
const baseState = {
  selection: 1,
  startDate: null,
  endDate: null,
  format: "YYYY-MM-DD",
  limit: 1,
  viewType: "single",
  i18n: {
    title: "YYYY年MM月",
    days: <Array<string>>["日", "一", "二", "三", "四", "五", "六"],
    months: <Array<string>>[
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12"
    ]
  },
  useInvalidAsSelected: false,
  selected: [],
  views: 1
};
function fetchState(state) {
  return state[state.length - 1];
}
function updateState(state, partial): TypePickerState[] {
  if (partial) {
    const old = fetchState(state);
    state = [{ ...old, ...partial }];
  }
  return state;
}
// #test_start
const helloForLoaderTest = "123";
// #test_end
export function factory() {
  let updateTemp = [];
  let state: TypePickerState[] = [baseState];
  const setState = (partial: Partial<TypePickerState>) =>
    (state = updateState(state, partial));
  const getState = (): TypePickerState => fetchState(state);
  const useFormatDate = (date: Date) => format(date, getState().format);
  const useParseDate = (date: Date | string) => parse(date, getState().format);
  const disables = new Disabled(getState, useFormatDate);
  const queue = new Selection();
  function useUpdate(data: SelectionItem, next: Function) {
    console.log("before", data);

    if (data) {
      updateTemp.push(data);
      const date = useParseDate(data.value);
      if (data.isInitialValue) {
        const isDisabled = disables.find(date);
        console.log("isDisabled", isDisabled);

        if (isDisabled) {
          updateTemp = [];
          //   updateTemp.pop();
        }
      }
    }
    console.trace("updateTemp", updateTemp);
    const state = getState();
    List.loop(updateTemp, (item: SelectionItem) => {
      const current = useParseDate(item.value);
      item.disabled = disables.find(current);
      item.selected = true;
      const unpushable = first => {
        const firstDate = useParseDate(first.value);
        const size = diffDates(firstDate, current, true);
        const dates = List.create(size, (index: string | number) => {
          const date = new Date(
            firstDate.getFullYear(),
            firstDate.getMonth(),
            firstDate.getDate() + index
          );
          const disable = disables.find(date);
          return disable && useFormatDate(date) !== item.value;
        });
        const isTrue = v => v === true;
        return List.filter(dates, isTrue).length > 0;
      };
      const popable = target => useParseDate(target.value) > current;
      const shiftable = last =>
        diffDates(current, useParseDate(last.value)) > state.limit;
      useSelection(queue, item, unpushable, popable, shiftable, selected => {
        publish("select", selected.map(item => item.value));
        console.log("selected", selected.map(item => item.value));
        next({ selected });
      });
    });
    updateTemp = [];
  }

  return class TypePickerCore {
    startDate: Date | null;
    endDate: Date | null;
    date = new Date();
    protected element: HTMLElement = null;
    constructor(option: TypePickerOptions) {
      const el = DOMHelpers.select(option.el);
      if (!el || !option) {
        return;
      }

      const partial: Partial<TypePickerState> = {
        useInvalidAsSelected: false
      };
      match({ condition: isDef, value: option.format })(
        (format: string) => (partial.format = format)
      );
      match({ condition: isDef, value: option.views })(views => {
        const { type, size } = useViewTypes(views);
        partial.viewType = type;
        partial.views = size;
      });
      match({ condition: isPositiveInteger, value: option.selection })(
        (size: number) => (partial.selection = size)
      );
      match({ condition: isDate, value: useParseDate(option.startDate) })(
        (date: Date) => (partial.startDate = date)
      );
      match({ condition: isDate, value: useParseDate(option.endDate) })(
        (date: Date) => (partial.endDate = date)
      );
      match({
        condition: isPositiveInteger,
        value: option.limit
      })((limit: number) => (partial.limit = limit));

      match({
        condition:
          List.every([partial.startDate, partial.endDate], isDate) &&
          partial.startDate > partial.endDate
      })(() => {
        partial.startDate = null;
        partial.endDate = null;
      });
      match({
        condition: partial.viewType === viewTypes.flatView
      })(() => {
        if (!partial.startDate) {
          partial.startDate = new Date();
        }
        let start = partial.startDate;
        if (!partial.endDate) {
          partial.endDate = new Date(
            start.getFullYear(),
            start.getMonth() + 3,
            start.getDate()
          );
        }
        partial.views = diffMonths(partial.endDate, partial.startDate) + 1;
      });
      match({ condition: isBool, value: option.useInvalidAsSelected })(
        value => {
          partial.useInvalidAsSelected = value;
          if (value === true) {
            partial.selection = 2;
          }
        }
      );
      this.element = el;
      this.element.className = DOMHelpers.class.container(partial.viewType);
      queue.setSize(partial.selection);
      queue.setCanPushInvalid(partial.useInvalidAsSelected);
      this.update(partial, { date: new Date(), isInitialValue: true });
    }
    protected update(partial, addtionalValue?: any) {
      let initialValue = null;
      if (partial && Object.keys(partial).length <= 0) {
        return;
      }
      setState(partial);
      console.log("addtionalValue", addtionalValue);
      const state = getState();
      if (addtionalValue && addtionalValue.isInitialValue) {
        initialValue = {};
        initialValue.value = useFormatDate(addtionalValue.date);
        initialValue.isInitialValue = addtionalValue.isInitialValue;
        if (isDate(addtionalValue.date)) {
          this.date = addtionalValue.date;
        }
      }
      const calendarData = useCalendarData(getState, {
        date: this.date,
        useFormatDate,
        useParseDate,
        queue,
        disables
      });
      const { startDate, endDate } = state;
      this.startDate = startDate;
      this.endDate = endDate;
      if (state.viewType == viewTypes.flatView) {
        this.date = startDate;
      }
      const [reachStart, reachEnd] = useSwitchable(this.date, state);
      this.element.innerHTML = template({
        data: calendarData,
        days: state.i18n.days,
        reachStart,
        reachEnd,
        switchable: state.viewType !== viewTypes.flatView
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
            this.date.getMonth() + step * state.views,
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
        nextActionDOM.addEventListener(events.click, () =>
          listener(reachEnd, 1)
        );
      }
      List.loop(nodeList, (node: HTMLElement) => {
        node.addEventListener(events.click, () => {
          const value = DOMHelpers.attr(node, dataset.date);
          if (!value) {
            return;
          }
          useUpdate({ value, isInitialValue: false }, this.update.bind(this));
        });
      });
      useUpdate(initialValue, this.update.bind(this));
    }
    public setDates(dates: Array<string | Date>): void {
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
        condition: List.every(dates, isDate),
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

        updateTemp = List.map(dates, value => ({
          value,
          selected: true,
          disabled: disables.find(useParseDate(value))
        }));
        let initDate;

        let lastItem = updateTemp[updateTemp.length - 1];
        if (lastItem) {
          initDate = useParseDate(lastItem.value);
        }
        this.update(null, { date: initDate, isInitialValue: true });
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
      let partial: Partial<TypePickerState> = null;
      match({ condition: isDate, value: useParseDate(from) })((from: Date) => {
        if (!partial) {
          partial = {};
        }
        partial.endDate = from;
      });
      match({ condition: isDate, value: useParseDate(to) })((to: Date) => {
        if (!partial) {
          partial = {};
        }
        partial.startDate = to;
      });

      match({
        condition: dates => List.every(dates, isDate),
        value: partial && [(partial.startDate, partial.endDate)]
      })(([start, end]) => {
        if (start >= end) {
          partial = null;
        }
      });
      match({
        condition: !List.isEmpty(days)
      })(() => {
        const isValidDay = day =>
          isPositiveInteger(day) && day >= 0 && day <= 6;
        days = List.map(days, day => parseInt(day, 10));
        days = List.filter(days, isValidDay);
        disables.set({
          days
        });
      });
      match({ condition: v => v.length > 0, value: dates })(dates => {
        dates = List.map(dates, useParseDate, isDate);
        dates = List.map(dates, useFormatDate, isDef);
        dates = List.dedup(dates);
        disables.set({
          dates
        });
      });
      this.update(partial, {
        date: partial ? partial.startDate : this.date,
        isInitialValue: true
      });
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
  };
}
