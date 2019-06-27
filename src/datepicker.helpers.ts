import { CreateDate, I18n } from "./datepicker.interface";
import { isDate, padding, isArray, isDef, toInt } from "./util";

/**
 *
 * @param {Date} start
 * @param {Date} end
 * @param {string} type
 * @param {boolean} isAbsolute
 * @returns {number}
 */
export function diff(
  start: Date,
  end: Date,
  type: string = "month",
  isAbsolute?: boolean
) {
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
 * @param view
 * @returns {any}
 */
export function getViews(view: number | string) {
  if (!view) {
    return 1;
  }
  const views = parseInt(<any>view, 10);
  if (isNaN(views)) {
    if (view !== "auto") {
      return 1;
    } else {
      return "auto";
    }
  } else {
    if (view > 2 || views <= 0) {
      return 1;
    } else {
      return views;
    }
  }
}

/**
 *
 * @param date
 * @param format
 * @returns {string}
 */
export function format(date: Date, format?: string) {
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
 * @param options
 */
export function createDate(options: CreateDate): any {
  const { date, size, direction = 1, position = "date", index } = options;

  const dir = (v: number, size: number, dir: number) =>
    dir > 0 ? v + size : v - size;

  let result = [];

  for (let i = 0; i <= size; i++) {
    let currYear = date.getFullYear();
    let currMonth = date.getMonth();
    let currDate = date.getDate();
    if (position === "year") {
      currYear = dir(index ? index : currYear, i, direction);
    } else if (position === "month") {
      currMonth = dir(index ? index : currMonth, i, direction);
    } else {
      currDate = dir(index ? index : currDate, i, direction);
    }
    result.push(new Date(currYear, currMonth, currDate));
  }
  return result;
}

/**
 *
 * @param {Array<Date>} dates
 * @returns {(dateFormat) => (string[] | string[])}
 */
function createFormatDate(dates: Array<Date>) {
  return dateFormat => {
    const fmt = dateFormat => date => format(date, dateFormat);
    if (isArray(dates)) {
      return dates.map(fmt(dateFormat));
    } else {
      return [fmt(dateFormat)(dates)];
    }
  };
}

/**
 *
 * @returns {{title: string; days: Array<string>; months: Array<string>}}
 */
export function defaultI18n() {
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
 * @param dateFormat
 * @returns {(date) => string}
 */
export const formatParse = (dateFormat: string) => (date: Date) =>
  format(parse(date, dateFormat), dateFormat);
/**
 *
 * @param {Date} date
 * @param start
 * @param end
 * @returns {(size) => (next) => void}
 */
export const changeMonth = (date: Date, start, end) => size => {
  const now = new Date(
    date.getFullYear(),
    date.getMonth() + size,
    date.getDate()
  );

  const endGap = end ? diff(end, now) : 1;
  const startGap = end ? diff(now, start) : 2;
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
 * @returns {any}
 */
export const between = (start, end, dateFormat?) => {
  start = parse(start, dateFormat);
  end = parse(end, dateFormat);

  if (!start || !end) {
    return [];
  }

  const dates = createDate({
    date: start,
    size: diff(end, start, "days", true),
    direction: end > start ? 1 : -1
  });

  return dateFormat ? createFormatDate(dates)(dateFormat) : dates;
};
