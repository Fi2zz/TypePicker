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
  TypePickerSelection,
  TypePickerDisables,
  useCalendarData,
  useSwitchable,
  useSelection
} from "./helpers";
import { template } from "./template";
import {
  match,
  isBool,
  isDate,
  isDef,
  List,
  isPositiveInteger,
  pipe
} from "./util";
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

export function factory() {
  let updateTemp = [];
  let state: TypePickerState[] = [baseState];
  const setState = (partial: Partial<TypePickerState>) =>
    (state = updateState(state, partial));
  const getState = (): TypePickerState => fetchState(state);
  const useFormatDate = (date: Date) => format(date, getState().format);
  const useParseDate = (date: Date | string) => parse(date, getState().format);
  const disables = new TypePickerDisables(getState, useFormatDate);
  const queue = new TypePickerSelection();
  function useUpdate(data: TypePickerSelectionItem, next: Function) {
    if (data) {
      const date = useParseDate(data.value);
      data.disabled = disables.find(date);
      data.selected = true;
      updateTemp.push(data);
    }
    const state = getState();
    List.loop(updateTemp, (item: TypePickerSelectionItem) => {
      const current = useParseDate(item.value);
      item.disabled = disables.find(current);
      // item.selected = true;
      const unpushable = first => {
        const isTrue = v => v === true;

        const getSize = (current, first) => {
          return {
            size: diffDates(current, first, true),
            date: first
          };
        };
        const createDateList = ({ date, size }) =>
          List.create(
            size,
            index =>
              new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate() + index
              )
          );

        const mapDisables = dates =>
          List.map(
            dates,
            date => disables.find(date) && useFormatDate(date) !== item.value
          );

        return pipe(
          getSize,
          createDateList,
          mapDisables,
          dates => List.filter(dates, isTrue),
          dates => dates.length > 0
        )(current, useParseDate(first.value));
      };

      const popable = target => useParseDate(target.value) > current;
      const shiftable = last =>
        diffDates(current, useParseDate(last.value)) > state.limit;
      useSelection(queue, item, unpushable, popable, shiftable, selected => {
        publish("select", selected.map(item => item.value));
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
      this.update(partial, { date: new Date() });
    }
    protected update(partial, addtional?: any) {
      if (partial && Object.keys(partial).length <= 0) {
        return;
      }
      setState(partial);
      const state = getState();
      if (addtional && isDate(addtional.date)) {
        this.date = addtional.date;
      }
      const calendarData = useCalendarData({
        state,
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
          useUpdate({ value }, this.update.bind(this));
        });
      });
      useUpdate(null, this.update.bind(this));
    }
    public setDates(dates): void {
      const { selection, limit } = getState();
      const dedup = (date: Date, map: any) => {
        if (!map[date.toDateString()]) {
          return date;
        }
        return null;
      };
      dates = pipe(
        dates => List.slice(dates, 0, selection),
        (dates: Date[]) => List.map(dates, useParseDate, isDef),
        (dates: Date[]) => List.dedup(dates, dedup)
      )(dates);
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
        queue.clean();
        updateTemp = List.map(dates, value => ({
          value,
          selected: true,
          disabled: disables.find(useParseDate(value))
        }));
        let initDate: Date;
        let lastItem = updateTemp[updateTemp.length - 1];
        if (lastItem) {
          initDate = useParseDate(lastItem.value);
        }
        this.update(null, { date: initDate });
      });
    }
    public disable(options: TypePickerDisableOptions): void {
      let { to, from, days, dates } = options;
      if (!List.isList(dates)) {
        dates = [];
      }
      if (!List.isList(days)) {
        days = [];
      }
      let partial: Partial<TypePickerState> = null;

      match({
        condition: () => {
          to = useParseDate(to);
          from = useParseDate(from);
          const allAreDates = isDate(to) && isDate(from);
          return [allAreDates && from > to, { from, to }];
        }
      })(({ from, to }) => {
        partial = {};
        partial.startDate = to;
        partial.endDate = from;
      });
      match({
        condition: () => {
          const isValidDay = day =>
            isPositiveInteger(day) && day >= 0 && day <= 6;
          days = pipe(
            days => List.map(days, day => parseInt(day, 10)),
            days => List.filter(days, isValidDay)
          )(days);
          dates = pipe(
            dates => List.map(dates, useParseDate, isDate),
            dates => List.map(dates, useFormatDate, isDef),
            dates => List.dedup(dates)
          )(dates);
          return [dates.length > 0 || days.length > 0, { days, dates }];
        }
      })(({ days, dates }) => {
        disables.set({
          dates,
          days
        });
      });
      this.update(partial, {
        date: partial && partial.startDate
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
