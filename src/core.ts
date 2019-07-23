import {
  diffDates,
  diffMonths,
  i18nValidator,
  parse,
  format,
  viewTypes,
  useViewTypes,
  TypePickerSelection,
  TypePickerDisables,
  useCalendarData,
  useSwitchable,
  useSelection,
  Observer
} from "./helpers";
import {
  match,
  isBool,
  isDate,
  isDef,
  List,
  isPositiveInteger,
  pipe,
  uuid
} from "./util";

abstract class TypePickerCore {
  public i18n: Function;
  public disable: Function;
  public setDates: Function;
  public switch: Function;
  public subscribe;
  public publish;
  public select: Function;
  constructor(option: TypePickerOptions) {}
  public onSelect?(next: Function);
  public onRender?(next: Function);
}

const baseI18n = {
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
};

export class Core extends TypePickerCore {
  constructor(option: TypePickerOptions) {
    super(option);
    let updateTemp = [];
    const state: TypePickerState = {
      selection: 1,
      startDate: null,
      endDate: null,
      format: "YYYY-MM-DD",
      limit: 1,
      viewType: "single",
      date: new Date(),
      i18n: baseI18n,
      useInvalidAsSelected: false,
      selected: [],
      views: 1
    };
    const _setState = (partial: Partial<TypePickerState>, next?: Function) => {
      if (partial && Object.keys(partial).length > 0) {
        for (let key in partial) {
          if (state.hasOwnProperty(key)) {
            state[key] = partial[key];
          }
        }
        next(state);
      }
    };
    const getState = (): TypePickerState => state;
    const useFormatDate = (date: Date) => format(date, state.format);
    const useParseDate = (date: Date | string) => parse(date, state.format);
    const disables = new TypePickerDisables(() => state, useFormatDate);
    const queue = new TypePickerSelection();
    const { type, size } = useViewTypes(option.views);
    const partial: Partial<TypePickerState> = {
      useInvalidAsSelected: false,
      viewType: type,
      views: size
    };
    const key = `${partial.viewType}:${uuid()}`;
    const genType = type => `${key}:${type}`;
    const observe = new Observer(key);
    this.subscribe = (type, next) => observe.subscribe(genType(type), next);
    this.publish = (type, payload) => observe.publish(genType(type), payload);
    match({ condition: isDef, value: option.format })(
      (format: string) => (partial.format = format)
    );
    match({
      condition: isPositiveInteger,
      value: option.selection
    })((size: number) => (partial.selection = size));
    match({
      condition: isDate,
      value: useParseDate(option.startDate)
    })((date: Date) => (partial.startDate = date));
    match({
      condition: isDate,
      value: useParseDate(option.endDate)
    })((date: Date) => (partial.endDate = date));
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
    match({
      condition: isBool,
      value: option.useInvalidAsSelected
    })(value => {
      partial.useInvalidAsSelected = value;
      if (value === true) {
        partial.selection = 2;
      }
    });

    queue.setSize(partial.selection);
    queue.setCanPushInvalid(partial.useInvalidAsSelected);
    function useSelect(
      data: TypePickerSelectionItem | TypePickerSelectionItem[],
      next: Function
    ) {
      if (data) {
        let updateList = List.isList(data) ? data : [data];
        pipe(
          data => List.filter(data, isDef),
          data =>
            List.map(data, item => {
              const date = useParseDate(item.value);

              item.disabled = disables.find(date);
              item.selected = true;
              return item;
            }),
          data => List.loop(data, item => updateTemp.push(item))
        )(updateList);
      }

      if (updateTemp.length === 0) {
        next({ selected: [] });
      } else {
        List.loop(updateTemp, (item: TypePickerSelectionItem) => {
          const current = useParseDate(item.value);
          item.disabled = disables.find(current);
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
                date =>
                  disables.find(date) && useFormatDate(date) !== item.value
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
          useSelection(
            queue,
            item,
            unpushable,
            popable,
            shiftable,
            selected => {
              next({ selected });
            }
          );
        });
      }
      updateTemp = [];
    }

    const createUpdate = state => {
      const [reachStart, reachEnd] = useSwitchable(state);
      const calendarData = useCalendarData({
        state,
        date: state.date,
        useFormatDate,
        useParseDate,
        queue,
        disables
      });
      this.publish("update", {
        data: calendarData,
        days: state.i18n.days,
        reachStart,
        reachEnd,
        switchable: state.viewType !== viewTypes.flatView,
        date: state.date,
        selected: state.selected
      });
    };

    const setState = partial => _setState(partial, createUpdate);
    this.select = data => useSelect(data, setState);
    this.switch = step => {
      const now = new Date(
        state.date.getFullYear(),
        state.date.getMonth() + step,
        state.date.getDate()
      );
      setState({ date: now });
    };
    this.setDates = (dates): void => {
      const { selection, limit } = state;
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
        dates = List.map(dates, value => ({
          value,
          selected: true,
          disabled: disables.find(useParseDate(value))
        }));

        useSelect(dates, payload => {
          if (payload.selected.length > 0) {
            const selected = payload.selected;
            const last = selected[selected.length - 1];
            let date = useParseDate(last.value);
            if (date) {
              payload.date = date;
            }
          }
          setState(payload);
        });
      });
    };
    this.disable = (options: TypePickerDisableOptions): void => {
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

      if (partial) {
        partial.date = partial.startDate;
      }
      setState(partial);
    };
    this.i18n = (i18n: TypePickerI18n): void => {
      i18nValidator(i18n, (i18n: TypePickerI18n) => {
        setState({ i18n });
      });
    };
    setState(partial);
    return {
      subscribe: this.subscribe,
      publish: this.publish,
      select: this.select,
      switch: this.switch,
      disable: this.disable,
      setDates: this.setDates,
      i18n: this.i18n
    };
  }
}
