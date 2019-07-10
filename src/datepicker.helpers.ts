import { TypePickerI18n, QueueInterface } from "./datepicker.interface";
import { isDate, padding, toInt, isEmpty, List, isDef } from "./util";

export function classname(options) {
  const { isActive, isStart, isEnd, isDisabled, inRange, isEmpty } = options;
  if (isEmpty) {
    return "empty disabled";
  }
  let className = "";
  if (isActive) {
    className = "active";

    if (isStart) {
      className = "active start-date";
    } else if (isEnd) {
      className = "active end-date";
    }
  }

  if (inRange) {
    return "in-range";
  }

  if (isDisabled && !isActive) {
    className = "disabled";
  }

  return className;
}
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
export function format(date: Date, format?: string): string {
  if (!isDate(date)) {
    return null;
  }
  if (!format) {
    format = "YYYY-MM-DD";
  }
  format = format.toUpperCase();
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
    let split = string.split(/\W/).map(toInt);
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

/**
 *
 * @param date
 * @param size
 * @param direction
 */
export function createDates(
  date: Date,
  size: number,
  direction?: number
): Array<Date> {
  direction = direction || 1;

  const dir = (now: number, size: number) =>
    direction > 0 ? now + size : now - size;

  let result = [];
  if (!isDate(date)) {
    return result;
  }

  for (let i = 0; i <= size; i++) {
    let currYear = date.getFullYear();
    let currMonth = date.getMonth();
    let currDate = date.getDate();
    currDate = dir(currDate, i);
    result.push(new Date(currYear, currMonth, currDate));
  }
  return result;
}

export function defaultI18n(): TypePickerI18n {
  return {
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
}

export function i18nValidator(i18n: TypePickerI18n, next: Function) {
  if (
    List.isList(i18n.days) &&
    List.isList(i18n.months) &&
    typeof i18n.title === "string"
  ) {
    next(i18n);
  }
}

export const createDateDataOfMonth = (origin, disabled?, partial?) => {
  disabled = disabled || false;

  partial = partial || {};
  let { year, month, day } = partial;

  let date = null;

  if (isDate(origin)) {
    year = origin.getFullYear();
    month = origin.getMonth();
    day = origin.getDay();
    date = origin.getDate();
  }

  return {
    origin,
    month,
    year,
    day,
    date,
    disabled,
    selected: false
  };
};

/**
 *
 * @type {{subscribe: (key: string, fn: Function) => void; publish: (...args: any[]) => boolean}}
 */
const Observer = (function() {
  const clientList = <any>{};
  /**
   *
   * @param {string} key
   * @param {Function} fn
   */
  const subscribe = function(key: string, fn: Function) {
    if (!clientList[key]) {
      clientList[key] = [];
    }
    clientList[key].push(fn);
  };
  /**
   *
   * @param args
   * @returns {boolean}
   */
  const publish = function(...args: Array<any>) {
    let key = [].shift.call(args);
    let fns = clientList[key];
    if (!fns || fns.length === 0) {
      return false;
    }
    for (let i = 0, fn; (fn = fns[i++]); ) {
      fn.apply(this, args);
    }
  };
  return {
    subscribe,
    publish
  };
})();

/**
 *
 * @param {string} event
 * @param value
 * @returns {boolean}
 */
export const publish = (event: string, value: any) =>
  Observer.publish(event, value);
/**
 *
 * @type {(key: string, fn: Function) => void}
 */
export const subscribe = Observer.subscribe;

export class Disabled {
  days = [];
  dates = [];
  all = [];
  startDate;
  endDate;

  update(type: string, value: any) {
    this[type] = value;
  }

  set(partial) {
    for (let key in partial) {
      this[key] = partial[key];
    }
  }

  findDay(day) {
    return List.includes(this.days, day);
  }
  findDate(date) {
    return List.includes(this.dates, date);
  }
  both(date, day) {
    return this.findDate(date) && this.findDay(day);
  }
  oneOf(date, day) {
    return this.findDate(date) || this.findDay(day);
  }
  find(date) {
    return List.includes(this.all, date);
  }
  outofRange(date: Date) {
    const isValidDates = List.every(
      [this.startDate, this.endDate, date],
      isDate
    );
    return isValidDates && (date > this.endDate || date < this.startDate);
  }

  some(handler) {
    return this.all.some(handler);
  }
}

export class MonthPanelData {
  data = [];
  /**
   *
   * @param date
   * @param size
   * @param heading
   * @returns {any[]}
   */
  mapMonths(date: Date, size: number) {
    const getFirstDateOfMonth = index =>
      new Date(date.getFullYear(), date.getMonth() + index, 1);
    this.data = List.create(size, getFirstDateOfMonth).map(date => {
      const dates = new Date(
        Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)
      ).getUTCDate();

      const day = date.getDay();
      //get days of first week at each month
      const firstWeek = List.create(day, day => ({
        year: date.getFullYear(),
        month: date.getMonth(),
        day
      })).map(item => createDateDataOfMonth(null, true, item));
      const restWeeks = createDates(date, dates - 1).map(now =>
        createDateDataOfMonth(now)
      );
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        dates: [...firstWeek, ...restWeeks]
      };
    });
  }

  mapDates({
    useFormatDate,
    usePanelTitle, //: Function,
    useRange //: Function
  }) {
    this.data = this.data.map(item => {
      const dates = item.dates.map(item => {
        const value = useFormatDate(item.origin);
        const date = item.date;
        const [inQueue, inDisabled, inRange, isStart, isEnd] = useRange({
          date: item.origin,
          value,
          day: item.day
        });

        const disabled = inDisabled || item.disabled;

        const className = classname({
          isActive: inQueue,
          isStart,
          isEnd,
          inRange,
          isDisabled: disabled,
          isEmpty: isEmpty(value)
        });

        return {
          value,
          disabled,
          date,
          className
        };
      });

      return {
        dates,
        heading: usePanelTitle(item.year, item.month)
      };
    });
    return this.data;
  }

  mapDisabled(handler) {
    const data = this.data;
    const result = [];
    for (let item of data) {
      let dates = item.dates;
      for (let dateItem of dates) {
        if (dateItem.disabled && dateItem.date) {
          result.push(dateItem.value);
        }
      }
    }
    handler(result);
  }
}

export class Queue {
  setOptions(options: QueueInterface) {
    const { size, limit, useRange, useFormatDate, useParseDate } = options;
    this.size = size;
    this.limit = limit;
    this.useRange = useRange;
    this.useFormatDate = useFormatDate;
    this.useParseDate = useParseDate;
  }

  size = 1;
  limit: boolean | number = 1;
  parse = null;
  useRange: boolean = false;
  useFormatDate = null;
  useParseDate = null;
  /**
   *
   * @param {string} date
   * @returns {(next?: (Function | undefined)) => void}
   */
  enqueue = (date: any) => (next?: Function | undefined): void => {
    let last = this.last();

    if (last) {
      if (last.value == date.value) {
        this.dequeue();
      }
      let lastDate = this.useParseDate(last.value);
      let nowDate = this.useParseDate(date.value);
      if (lastDate > nowDate) {
        this.list = [];
      }
    }
    this.list.push(date);
    this.reset(next);
  };

  dequeue() {
    this.list.shift();
  }

  /**
   *
   * @param {Function} next
   */
  reset(next?: Function) {
    if (this.list.length > this.size) {
      this.replace([this.last()]);
    } else {
      const [first, last] = this.list;

      if (first && last) {
        const diffs = diffDates(
          this.useParseDate(first.value),
          this.useParseDate(last.value),
          true
        );
        if (diffs > this.limit) {
          this.dequeue();
        }
      }
    }
    if (typeof next === "function") {
      let id = setTimeout(function afterQueueReset() {
        next();
        clearTimeout(id);
      }, 0);
    }
  }

  resetWithValue(value) {
    this.empty();
    this.list.push(value);
  }

  last() {
    return this.list[this.length() - 1];
  }
  pop() {
    this.list.pop();
  }

  empty() {
    this.list = [];
  }

  front() {
    return this.list[0];
  }

  list: any[] = [];
  find(value: string) {
    return this.list.filter(item => item.value === value).pop();
  }
  length() {
    return this.list.length;
  }

  replace(v) {
    this.list = v;
  }

  include(v) {
    return this.list.indexOf(v) >= 0;
  }

  has(value) {
    return !!this.find(value);
  }
  map(mapper) {
    return this.list.map(mapper);
  }
  getRange() {
    const length = this.length();

    if (length <= 0) {
      return [];
    }

    if (!this.useRange) {
      return this.map(item => item.value);
    }

    const first = this.front();
    const last = this.last();

    if (first.value === last.value) {
      return [];
    }
    const start = this.useParseDate(first.value);
    const end = this.useParseDate(last.value);
    const size = diffDates(end, start);
    return createDates(start, size).map(this.useFormatDate.bind(this));
  }
}
