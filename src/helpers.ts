import { isDate, List, isDef, Dat, pipe } from "./util";
export const padding = (n: Number): string => `${n > 9 ? n : "0" + n}`;

/**
 *
 * @param {Date} start
 * @param {Date} end
 * @param {string} type
 * @param {boolean} isAbsolute
 * @returns {number}
 */
export function timeDiff(
  start: Date,
  end: Date,
  type: string = "month",
  isAbsolute?: boolean
): number {
  let result: number;
  if (!isDate(start) || !isDate(end)) {
    return 0;
  }
  if (type === "month") {
    result =
      Math.abs(start.getFullYear() * 12 + start.getMonth()) -
      (end.getFullYear() * 12 + end.getMonth());
  } else if (type === "days") {
    const startTime = <any>(
      new Date(start.getFullYear(), start.getMonth(), start.getDate())
    );
    const endTime = <any>(
      new Date(end.getFullYear(), end.getMonth(), end.getDate())
    );
    const calcu = Math.ceil(startTime - endTime) / (1000 * 60 * 60 * 24);
    result = isAbsolute ? Math.abs(calcu) : calcu;
  }

  return result;
}
/**
 *
 * @param first Date
 * @param second Date
 * @param isAbsolute boolean
 */
export const diffDates = (first: Date, second: Date, isAbsolute?: boolean) =>
  timeDiff(first, second, "days", isAbsolute);

/**
 *
 * @param first Date
 * @param second Date
 * @param isAbsolute boolean
 */
export const diffMonths = (first: Date, second: Date, isAbsolute?: boolean) =>
  timeDiff(first, second, "month", isAbsolute);

/**
 *
 * @param date
 * @param format
 * @returns {string}
 */
export function format(date: Date | string, format?: string): string {
  if (!format) {
    format = "YYYY-MM-DD";
  }

  if (!isDate(date)) {
    if (createDateFormatRegExpression(format).test(date as string)) {
      return date as string;
    }

    return null;
  }

  format = format.toUpperCase();
  date = date as Date;
  let parts = <any>{
    YYYY: date.getFullYear(),
    DD: padding(date.getDate()),
    MM: padding(date.getMonth() + 1),
    D: date.getDate(),
    M: date.getMonth() + 1
  };

  return format.replace(/(?:\b|%)([dDMyY]+)(?:\b|%)/g, $1 =>
    parts[$1] === undefined ? $1 : parts[$1]
  );
}

/**
 *
 * @param strDate
 * @param format
 */
export function parse(strDate: string | Date, format: string) {
  if (isDate(strDate)) {
    return strDate;
  }
  if (
    !strDate ||
    !createDateFormatRegExpression(format).test(<string>strDate)
  ) {
    return null;
  }

  function parse(string: string | Date): any {
    if (!string) return new Date();
    if (string instanceof Date) return string;
    let split = string.split(/\W/).map(item => parseInt(item, 10));
    let date = new Date(split.join(" "));
    if (!date.getTime()) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  let ret = parse(strDate);
  if (ret) return ret;
  const token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
  const parseFlags: any = {
    D: [/\d{1,2}/, (d: any, v: any) => (d.day = parseInt(v))],
    M: [/\d{1,2}/, (d: any, v: any) => (d.month = parseInt(v) - 1)],
    DD: [/\d{2}/, (d: any, v: any) => (d.day = parseInt(v))],
    MM: [/\d{2}/, (d: any, v: any) => (d.month = parseInt(v) - 1)],
    YY: [/\d{2,4}/, (d: any, v: any) => (d.year = parseInt(v))],
    YYYY: [/\d{4}/, (d: any, v: any) => (d.year = parseInt(v))]
  };
  ret = function(dateStr: string, format: string) {
    if (dateStr.length > 1000) {
      return null;
    }
    let isValid = true;
    const dateInfo = {
      year: 0,
      month: 0,
      day: 0
    };
    format.replace(token, function($0) {
      if (parseFlags[$0]) {
        const info = parseFlags[$0];
        const regExp = info[0];
        const handler = info[info.length - 1];
        const index = dateStr.search(regExp);

        if (!~index) {
          isValid = false;
        } else {
          dateStr.replace(info[0], function(result) {
            handler(dateInfo, result);
            dateStr = dateStr.substr(index + result.length);
            return result;
          });
        }
      }
      return parseFlags[$0] ? "" : $0.slice(1, $0.length - 1);
    });
    if (!isValid) {
      return null;
    }
    const parsed = new Date(dateInfo.year, dateInfo.month, dateInfo.day);
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  return ret(strDate, format);
}

export function formatHeading(format, year, month) {
  return format
    .toLowerCase()
    .replace(/y{1,}/g, padding(year))
    .replace(/m{1,}/g, month);
}

const ALPHABET_AND_NUMBER_RE = /[A-Za-z0-9]/g;

/**
 * @param format string
 */
function createDateFormatRegExpression(format: string) {
  const separator = format.replace(ALPHABET_AND_NUMBER_RE, "").trim();
  const result = format
    .split(/\W/)
    .map((string, index) => {
      let { length } = string;
      let sep =
        index - 1 === -1
          ? ""
          : separator[index - 1]
          ? separator[index - 1]
          : "";
      let partial = "";
      if (index === 0) {
        partial = `(^[0-9]{${length}})`;
      } else if (index === 1) {
        let suffix = `[1-9]|1[0-2]`;
        let prefix = `${length === 1 ? "" : "0"}`;
        partial = `(${prefix}${suffix})`;
      } else if (index === 2) {
        const group$1 = `${length === 2 ? 0 : ""}[1-9]`.trim();
        const group$2 = "(1|2)[0-9]";
        const group$3 = "30|31";
        partial = `((${group$1})|(${group$2})|(${group$3}))`.trim();
      }
      return sep + partial;
    })
    .join("");
  return new RegExp(`${result}$`);
}

export function i18nValidator(i18n: TypePickerI18n, next: Function) {
  if (
    isDef(i18n) &&
    List.isList(i18n.days) &&
    List.isList(i18n.months) &&
    typeof i18n.title === "string"
  ) {
    next(i18n);
  }
}

export class Observer {
  constructor(name) {
    this.name = name;
  }
  name = "observe";
  clientList = <any>{};
  /**
   *
   * @param {string} key
   * @param {Function} fn
   */
  subscribe = (key: string, fn: Function) => {
    const typeName = `${this.name}:${key}`;
    if (!this.clientList[typeName]) {
      this.clientList[typeName] = [];
    }
    this.clientList[typeName].push(fn);
  };
  /**
   *
   * @param args
   * @returns {boolean}
   */
  publish = (...args: Array<any>) => {
    let id = setTimeout(() => {
      let key = [].shift.call(args);
      let fns = this.clientList[`${this.name}:${key}`];
      if (!fns || fns.length === 0) {
        return false;
      }
      for (let i = 0, fn; (fn = fns[i++]); ) {
        fn.apply(this, args);
      }
      clearTimeout(id);
    }, 0);
  };
}

export const useViewTypes = views => {
  const result = {
    type: viewTypes.singleView.toString(),
    size: 1
  };

  if (!views) {
    return result;
  }
  switch (views) {
    case 1:
      result.type = viewTypes.singleView.toString();
      result.size = 1;
      break;
    case 2:
      result.type = viewTypes.doubleViews.toString();
      result.size = 2;
      break;
    case "auto":
      result.type = viewTypes.flatView.toString();
      result.size = 3;
      break;
    default:
      break;
  }
  return result;
};
export enum viewTypes {
  singleView = "single-view",
  doubleViews = "double-views",
  flatView = "flat-view"
}
export enum events {
  click = "click"
}
export enum dataset {
  date = "data-date",
  disabled = "data-disabled"
}

export class TypePickerSelection implements TypePickerSelectionInterface {
  size = 1;
  list: any[] = [];
  setSize(size: number) {
    this.size = size;
  }
  setCanPushInvalid(can) {
    this.useInvalidAsSelected = can;
  }
  useInvalidAsSelected = false;
  last = () => this.list[this.length() - 1];
  front = () => this.list[0];
  length = () => this.list.length;

  isEmpty() {
    return this.length() <= 0;
  }

  isFilled() {
    return this.length() === this.size;
  }

  push = (date: TypePickerSelectionItem) => (afterPush: Function): void => {
    this.beforePush(date);
    this.list.push(date);
    this.afterPush();
    const id = setTimeout(function afterQueueReset() {
      afterPush();
      clearTimeout(id);
    }, 0);
  };
  beforePush(date) {
    for (let item of this.list) {
      if (item && item.value === date.value) {
        if (this.size === 2) {
          this.shift();
        } else {
          this.list = [];
        }
      }
    }
  }

  afterPush() {
    let temp = {};
    let list = [];
    for (let item of this.list) {
      if (!temp[item.value]) {
        temp[item.value] = 1;
        list.push(item);
      }
    }
    this.list = list;
  }
  clean = () => (this.list = []);
  shift = () => this.list.shift();
  pop = () => this.list.pop();
  has(value: string) {
    return this.list.filter(item => item && item.value === value).length > 0;
  }
}
export class TypePickerDisables implements TypePickerDisabledInterface {
  days = [];
  dates = [];
  getState = null;
  useFormatDate = null;
  constructor(getState: Function, useFormatDate: Function) {
    this.getState = getState;
    this.useFormatDate = useFormatDate;
  }

  set(partial) {
    for (let key in partial) {
      this[key] = partial[key];
    }
  }
  find(date: Date) {
    if (!isDate(date)) {
      return true;
    }

    const value = this.useFormatDate(date);

    const day = date.getDay();
    const { startDate, endDate } = this.getState();
    const outofRange =
      List.every([startDate, endDate], isDate) &&
      (date >= endDate || date < startDate);
    const result =
      List.includes(this.dates, value) ||
      List.includes(this.days, day) ||
      outofRange;
    return result;
  }
}

function getRangeFromQueue(
  useRange: boolean,
  queue,
  useFormatDate,
  useParseDate
) {
  const length = queue.length();
  if (length <= 0 || !useRange) {
    return [];
  }
  const first = queue.front();
  const last = queue.last();
  const start = useParseDate(first.value);
  const end = useParseDate(last.value);
  const size = diffDates(end, start);
  return List.create(size + 1, index => {
    const currYear = start.getFullYear();
    const currMonth = start.getMonth();
    const currDate = start.getDate() + index;
    return useFormatDate(new Date(currYear, currMonth, currDate));
  });
}
export const useSwitchable = (state: TypePickerState) => {
  const { startDate, endDate, views, date } = state;
  const diffEnd = diffMonths(endDate, date);
  const diffStart = diffMonths(date, startDate);
  return [
    diffStart <= 0 && diffEnd > 0,
    diffStart > 0 && diffEnd <= (views === 1 ? 0 : 1)
  ];
};

export function useCalendarData({
  state,
  date,
  queue,
  disables,
  useFormatDate,
  useParseDate
}: useCalendarData) {
  const i18n = state.i18n;
  const usePanelTitle = (year, month) =>
    formatHeading(i18n.title, year, i18n.months[month]);
  const genCalendar = (views, date) =>
    List.create(views, index => {
      const _date = Dat.firstDate(date, index);
      const day = _date.getDay();
      return {
        date: _date,
        dates: Dat.dates(date) + day,
        day,
        heading: usePanelTitle(_date.getFullYear(), _date.getMonth())
      };
    });
  const genMonth = calendars => {
    return List.map(calendars, ({ date, dates, day, heading }) => ({
      heading,
      dates: List.create(dates, index => {
        const invalid = index < day;
        const target = index < day ? 1 - day + index : index - day + 1;
        const current = new Date(date.getFullYear(), date.getMonth(), target);
        const disabled = invalid || disables.find(current);
        const value = useFormatDate(current);
        const range = getRangeFromQueue(
          state.selection === 2,
          queue,
          useFormatDate,
          useParseDate
        );
        const status = {
          isActive: queue.has(value),
          isStart: List.inRange(range, value, index => index === 0),
          isEnd: List.inRange(
            range,
            value,
            (index, list) => index === list.length - 1
          ),
          inRange: List.inRange(
            range,
            value,
            (index, list) => index > 0 && index < list.length - 1
          ),
          isDisabled: disabled,
          isEmpty: invalid
        };
        return {
          value,
          disabled,
          date,
          day: current.getDay(),
          label: current.getDate(),
          invalid,
          status
        };
      })
    }));
  };
  return pipe(
    genCalendar,
    genMonth
  )(state.views, date);
}
export function useSelection(
  queue: TypePickerSelection,
  item: TypePickerSelectionItem,
  unpushable: Function,
  popable,
  shiftable,
  next: Function
): void {
  const currentQueueLength = queue.length();
  const nextQueueLength = currentQueueLength + 1;
  const first = queue.front();
  const last = queue.last();
  if (item.disabled) {
    if (
      queue.size !== 2 ||
      (queue.size === 2 &&
        ((currentQueueLength === 1 && unpushable(first)) ||
          //queue is empty
          queue.isEmpty() ||
          //queue filled
          queue.isFilled() ||
          !queue.useInvalidAsSelected))
    ) {
      return;
    }
  }
  //find out disables between last and curren
  else if (queue.size === 2) {
    if (currentQueueLength) {
      if (unpushable(first) || shiftable(last)) {
        queue.shift();
      } else if (popable(first)) {
        queue.pop();
      }
    }
  }

  if (nextQueueLength > queue.size) {
    queue.clean();
  }
  const dispatchValue = () => next(queue.list);
  queue.push(item)(dispatchValue);
}

export class SelectionItem implements TypePickerSelectionItem {
  value: string;
  selected: boolean = true;
  disabled: boolean = false;
  constructor({ value }) {
    this.value = value;
  }
}
