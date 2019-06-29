import { I18n } from "./datepicker.interface";
import { isDate, padding, isArray, isDef, toInt } from "./util";

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
 * @param view
 * @returns {number|string}
 */
export function getViews(view: number | string): number | string {
  const map = {
    auto: "auto",
    1: 1,
    2: 2
  };
  const views = map[view];
  return views ? views : 1;
}

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

export function defaultI18n(): I18n {
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

export function i18nValidator(i18n: I18n, next: Function) {
  if (
    isArray(i18n.days) &&
    isArray(i18n.months) &&
    typeof i18n.title === "string"
  ) {
    next(i18n);
  }
}

/**
 *
 * @param date
 * @param start
 * @param end
 */
export const changeMonth = (date: Date, start: Date, end: Date) => size => {
  const now = new Date(
    date.getFullYear(),
    date.getMonth() + size,
    date.getDate()
  );

  const endGap = end ? diffMonths(end, now) : 1;
  const startGap = end ? diffMonths(now, start) : 2;
  let reachStart = startGap < 1 && endGap >= 0;
  let reachEnd = startGap > 1 && endGap <= 1;

  if (!start || !end) {
    reachEnd = false;
    reachStart = false;
  }

  return {
    reachEnd,
    reachStart,
    date: now
  };
};

/**
 *
 * @param start
 * @param end
 * @param dateFormat
 */
export const between = (
  start: Date | string,
  end: Date | string,
  dateFormat?: string
) => {
  const _start: Date = parse(start, dateFormat);
  const _end: Date = parse(end, dateFormat);

  if (!start || !end) {
    return [];
  }

  const dates = createDates(
    _start,
    diffDates(_end, _start, true),
    end > start ? 1 : -1
  );

  const formatter = date => format(date, dateFormat);
  return dateFormat ? dates.map(formatter) : dates;
};

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
