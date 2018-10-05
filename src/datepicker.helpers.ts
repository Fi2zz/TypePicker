import {
  node,
  CreateDate,
  mapDates,
  TemplateDataInterface,
  monthItem,
  TagData
} from "./datepicker.interface";
import { isDate, padding, isArray, isDef } from "./util";
/**
 *
 * @param start
 * @param end
 * @param type
 * @param isAbsolute
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

export function cellElementClassName(type) {
  return (index, ...other) => {
    let names = ["calendar-cell"];

    names.push(`calendar-${type}-cell`);

    if (index === 0) {
      names.push("calendar-cell-weekday");
    } else if (index === 6) {
      names.push("calendar-cell-weekend");
    }
    if (other) {
      names.push(...other);
    }
    return names.join(" ");
  };
}

export function elementClassName(views) {
  let classes = ["calendar"];

  if (views === 1) {
    classes.push("calendar-single-view");
  } else if (views === 2) {
    classes.push("calendar-double-views");
  } else {
    classes.push("calendar-flat-view");
  }

  return classes.join("  ");
}

/**
 *
 * @param el
 * @returns {any}
 */
export function parseEl(el: any) {
  if (!el) {
    return null;
  }

  return typeof el === "string" ? document.querySelector(el) : el;
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

  return format.replace(
    /(?:\b|%)([dDMyY]+)(?:\b|%)/g,
    $1 => (parts[$1] === undefined ? $1 : parts[$1])
  );
}

/**
 *
 * @param strDate
 * @param format
 * @returns {any}
 */
export function parse(strDate: string | Date, format: string) {
  if (isDate(strDate)) {
    return strDate;
  }

  function parse(string: string | Date): any {
    if (!string) return new Date();
    if (string instanceof Date) return string;
    let split = string.split(/\W/).map(item => parseInt(item));
    let date = new Date(split.join(" "));
    if (!date.getTime()) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  //能直接解析成日期对象的，直接返回日期对象
  //如 YYYY/MM/DD YYYY-MM-DD
  if (!format) {
    format = "YYYY-MM-DD";
  }

  const formatRegExpTester = createDateFormatValidator(format);
  if (!formatRegExpTester.test(<string>strDate)) {
    return null;
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
    YYYY: [/\d{2,4}/, (d: any, v: any) => (d.year = parseInt(v))]
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

/**
 *
 * @param {string} format
 * @returns {RegExp}
 */
function createDateFormatValidator(formate: string) {
  const sepreator = formate.split(/\w/).filter(item => !!item);
  let result: any = formate.split(/\W/).map((string, index) => {
    let { length } = string;
    if (index === 0) {
      return `\\d{${length}}`;
    } else if (index === 1) {
      if (length === 1) {
        return `\(?:[1-9]?[0-9])`;
      } else if (length === 2) {
        return `\([0-9][0-2])`;
      }
    } else if (index === 2) {
      if (length === 1) {
        return `\(?:[1-9]?[0-9])`;
      } else if (length === 2) {
        return `\[0-9][1-9]`;
      }
    }
  });
  let regexpString = result.join(`\\${sepreator.pop()}`);
  return new RegExp(regexpString);
}

/**
 *
 * @param tag
 * @param props
 * @param children
 * @param render
 * @returns {string}
 */
export function tag({ tag, props = {}, render = true }: node) {
  if (!tag || !render) {
    return "";
  }
  let children: any = "";

  let attributes = <string[]>[];
  for (let key in props) {
    let value = props[key];

    if (key === "className") {
      key = "class";
    }

    if (key !== "children") {
      if (isDef(value)) {
        attributes.push(`${key}="${value}"`);
      }
    } else {
      if (children === false || children === undefined || children === null) {
        children = "";
      } else if (Array.isArray(value)) {
        children = value.filter(isDef).join("");
      } else {
        children = value;
      }
    }
  }
  let attrs = <string>attributes.join("");
  return `<${tag} ${attrs}>${children}</${tag}>`;
}

/**
 *
 * @param list
 * @param split
 * @returns {string|Request}
 */
export function join(list, split?: string) {
  if (!split) {
    split = "";
  }
  return list.join(split);
}

/**
 *
 * @param {CreateDate} options
 * @returns {any}
 */
function createDate(options: CreateDate): any {
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

function createFormatDate(dates) {
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
 * @returns {{title: string; week: Array<string>; months: Array<string>}}
 */
export function defaultI18n() {
  return {
    title: "YYYY年MM月",
    week: <Array<string>>["日", "一", "二", "三", "四", "五", "六"],
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

/**
 *
 * @param {TagData} options
 * @returns {{date: number | string; day: number | string; className: string; value: string; disabled: boolean}}
 */
function tagData(options: TagData = {}) {
  const { value, item, index, isEnd, isStart, isDisabled, withRange } = options;

  function tagClassName(index, isEnd, isStart, withRange: boolean) {
    let name = "";
    if (index >= 0) {
      name = "active";
    }
    if (withRange) {
      if (isStart) {
        name = `${name} start-date`;
      } else if (isEnd) {
        name = `${name} end-date`;
      } else if (index > 0) {
        name = "in-range";
      }
    }

    return name;
  }

  let day = <number | string>"";
  let date = <number | string>"";
  let className = "empty disabled";
  if (item) {
    day = item.getDay();
    date = item.getDate();

    className = tagClassName(index, isEnd, isStart, withRange);
    if (isDisabled) {
      className = `disabled ${className.trim()}`;
    }
  }

  return {
    date,
    day,
    className,
    value,
    disabled: isDisabled
  };
}

/**
 *
 * @param dateFormat
 * @returns {(date) => string}
 */
export const formatParse = dateFormat => date =>
  format(parse(date, dateFormat), dateFormat);

export const parseFormat = dateFormat => date =>
  parse(format(date, dateFormat), dateFormat);

/**
 *
 * @param {Date} date
 * @param start
 * @param end
 * @returns {(size) => (next) => void}
 */
export const changeMonth = (date: Date, start, end) =>next=> size  => {
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
  next({
    reachEnd,
    reachStart,
    date: now
  });
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

export class TemplateData {
  constructor({
    date,
    size,
    queue,
    format,
    parse,
    withRange,
    disables,
    heading
  }: TemplateDataInterface) {
    const { mapMonths, mapDates, mapQueue } = TemplateData;

    if (withRange) {
      queue = mapQueue(queue, format, parse);
    }

    return <any[]>(
      mapMonths(date, size, heading).map(
        mapDates({ queue, withRange, format, disables })
      )
    );
  }

  /**
   *
   * @param queue
   * @param format
   * @param parse
   * @returns {any}
   */
  static mapQueue(queue, format, parse) {
    if (queue.length <= 0) {
      return [];
    }

    let start = parse(queue[0]);
    let end = parse(queue[queue.length - 1]);
    return createDate({
      date: start,
      size: diff(end, start, "days")
    }).map(format);
  }

  /**
   *
   * @param date
   * @param size
   * @param heading
   * @returns {any[]}
   */
  static mapMonths(date, size, heading): any[] {
    const template = <any[]>[];

    function getDates(date): number {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)
      ).getUTCDate();
    }

    for (let i = 0; i <= size; i++) {
      let now = new Date(date.getFullYear(), date.getMonth() + i, 1);
      template.push({
        size: getDates(now),
        date: now,
        heading: heading(now)
      });
    }
    return template;
  }

  /**
   *
   * @param {mapDates} options
   * @returns {({ year, month, size }: monthItem) => {year: number; month: number; dates: any[]}}
   */
  static mapDates = (options: mapDates) => (monthItem: monthItem) => {
    const { date, size, heading } = monthItem;
    const { queue, withRange, format, disables } = options;

    const year = date.getFullYear();
    const month = date.getMonth();

    const dates = [];
    const createEmptyItem = (size, list) => {
      for (let i = 0; i < size; i++) {
        list.push(tagData({ isDisabled: true }));
      }
      return list;
    };
    createEmptyItem(new Date(year, month, 1).getDay(), dates);
    for (let i = 0; i < size; i++) {
      const date = new Date(year, month, i + 1);
      const index = queue.indexOf(format(date));
      let isEnd = withRange && index === queue.length - 1;
      let isStart = withRange && index === 0;

      if (queue.length <= 0) {
        isEnd = false;
        isStart = false;
      }
      let withFormat = format(date);
      let disabled =
        disables.days.indexOf(date.getDay()) >= 0 ||
        disables.dates.indexOf(withFormat) >= 0;

      dates.push(
        tagData({
          value: withFormat,
          item: date,
          index,
          isEnd,
          isStart,
          isDisabled: disabled,
          withRange
        })
      );
    }
    if (dates.length < 42) {
      // createEmptyItem(42 - dates.length, dates);
    }

    return { year, month, heading, dates };
  };

  /**
   *
   * @param format
   * @param months
   * @returns {(date) => string}
   */

  static formatMonthHeading(format, months) {
    return function(date) {
      return format
        .toLowerCase()
        .replace(/y{1,}/g, padding(date.getFullYear()))
        .replace(/m{1,}/g, months[date.getMonth()]);
    };
  }
}
