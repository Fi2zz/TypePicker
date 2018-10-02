import { node, generateDate } from "./datepicker.interface";
import { isDate, padding, listHead, listTail, isArray, isDef } from "./util";

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
 * @param date
 * @param size
 * @param who
 * @returns {Date}
 */
export const setDate = (date: Date, size?: number, who?: string) => {
  if (!who) {
    who = "date";
  }
  if (!size) {
    size = 0;
  }
  let monthSize = 0;
  let yearSize = 0;
  let dateSize = size;
  if (who === "year") {
    yearSize = size;
  } else if (who === "month") {
    monthSize = size;
  }
  return new Date(
    date.getFullYear() + yearSize,
    date.getMonth() + monthSize,
    date.getDate() + dateSize
  );
};

export const setSepecifiedDate = (date: Date, day?: number) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    day >= 0 ? day : date.getDate()
  );

/**
 *
 * @param year
 * @param month
 * @returns {number}
 */
export function getDates(year: number, month: number): number {
  let d = new Date(year, month, 1);
  let utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
  return new Date(utc).getUTCDate();
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
      if (value) {
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

/***
 *
 * @param date
 * @param days
 * @param dateFormat
 * @param direction
 * @param position
 * @param index
 * @returns {Array}
 */
export function createDate({
  date,
  days,
  dateFormat,
  direction = 1,
  position = "date",
  index
}: generateDate): any {
  const dir = (v: number, size: number, dir: number) =>
    dir > 0 ? v + size : v - size;

  let result = [];

  for (let i = 0; i <= days; i++) {
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
    let dat = new Date(currYear, currMonth, currDate);

    if (dateFormat) {
      result.push(format(dat, dateFormat));
    } else {
      result.push(dat);
    }
  }
  return result;
}

/**
 *
 * @param index
 * @param isEnd
 * @param isStart
 * @returns {string}
 */
export function tagClassName(index, isEnd, isStart) {
  let name = "";
  if (index >= 0) {
    name = "active";
  }

  if (isStart) {
    name = `${name} start-date`;
  } else if (isEnd) {
    name = `${name} end-date`;
  } else if (index > 0 ) {
    name = "in-range";
  }
  return name;
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
 * @param {string} value
 * @param {Date} item
 * @param {number} index
 * @param {boolean} isEnd
 * @param {boolean} isStart
 * @param {string} className
 * @returns {{date: number | string; day: number | string; className: string; value: string | undefined}}
 */
export function tagData(
  value?: string,
  item?: Date,
  index?: number,
  isEnd?: boolean,
  isStart?: boolean,
  className?: string
) {
  let day = <number | string>"";
  let date = <number | string>"";
  className = "empty disabled";

  if (item) {
    day = item.getDay();
    date = item.getDate();
    className = tagClassName(index, isEnd, isStart);
  }

  return {
    date,
    day,
    className,
    value
  };
}

/***
 *
 * @param list
 * @param dateFormat
 * @param inDisable
 * @returns {any}
 */
export function findDisableInQueue(list, dateFormat, inDisable) {
  if (list.length <= 0) {
    return [];
  }
  let head = listHead(list);
  let tail = listTail(list);

  const date = parse(head, dateFormat);
  const end = parse(tail, dateFormat);
  const size = diff(end, date, "days");

  const dates = createDate({ date, days: size, dateFormat });

  const disables = dates.filter(inDisable);

  if (disables.length === 1) {
    let disable = disables[0];

    if (tail === disable) {
      return false;
    } else {
      return true;
    }
  } else if (disables.length > 1) {
    return true;
  } else {
    return false;
  }
}

/***
 *
 * @param selection
 * @param date
 * @param inDisable
 * @param dateFormat
 * @param queue
 * @param limit
 * @returns {boolean}
 */
export function checkPickableDate({
  selection,
  date,
  inDisable,
  dateFormat,
  queue,
  limit
}) {
  if (!date) {
    return false;
  }

  if (inDisable(date)) {
    if (selection === 2) {
      let gap = diff(
        parse(date, dateFormat),
        parse(listTail(queue), dateFormat),
        "days"
      );

      if (queue.length <= 0 || gap <= 0 || queue.length >= selection) {
        return false;
      }
      if (queue.length === 1) {
        let item = queue[0];
        let d = parse(item, dateFormat);
        let now = parse(date, dateFormat);
        let gap = diff(now, d, "days");
        if (gap > limit) {
          return false;
        }
      }
    } else {
      return false;
    }
  }
  return true;
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
 * @param date
 * @param start
 * @param end
 * @returns {(setState:any)=>(size?:any)=>undefined}
 */
export const monthSwitcher = (date: Date, start, end) => size => next => {
  const now = setDate(date, size, "month");
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
 * @returns {(end) => (dateFormat?: string) => (any)}
 */
export const between = start => end => (dateFormat?: string) => {
  start = parse(start, dateFormat);
  end = parse(end, dateFormat);

  if (!start || !end) {
    return [];
  }
  let dates = createDate({
    date: start,
    days: diff(end, start, "days", true),
    dateFormat,
    direction: end > start ? 1 : -1
  });

  if (!isArray(dates)) {
    return [dates];
  }
  return dates;
};

export class TemplateData {
  constructor(date, size, queue, dateFormat, withRange) {
    return <any[]>(
      TemplateData.mapMonths(date, size).map(
        TemplateData.mapItem(queue, withRange, dateFormat)
      )
    );
  }

  static mapRangeFromQueue(queue, dateFormat) {
    if (queue.length <= 0) {
      return [];
    }

    let start = parse(queue[0], dateFormat);
    let end = parse(queue[queue.length - 1], dateFormat);
    return createDate({
      date: start,
      days: diff(end, start, "days"),
      dateFormat: dateFormat
    });
  }

  static mapMonths(date, size): any[] {
    const template = <any[]>[];
    for (let i = 0; i <= size; i++) {
      let dat = new Date(date.getFullYear(), date.getMonth() + i, 1);
      let dates = getDates(dat.getFullYear(), dat.getMonth());
      template.push({
        size: dates,
        year: dat.getFullYear(),
        month: dat.getMonth()
      });
    }

    return template;
  }

  static mapItem = (queue, withRange, dateFormat) => item =>
    TemplateData.mapDates(
      item,
      TemplateData.mapRangeFromQueue(queue, dateFormat),
      withRange,
      dateFormat
    );
  static mapDates = ({ year, month, size }, range, withRange, dateFormat) => {
    const dates = [];

    const firstDateOfMonth = new Date(year, month, 1);

    for (let i = 0; i < firstDateOfMonth.getDay(); i++) {
      dates.push(tagData());
    }
    for (let i = 0; i < size; i++) {
      const date = new Date(year, month, i + 1);
      const index = range.indexOf(format(date, dateFormat));
      const isEnd = withRange && index === range.length - 1;
      const isStart = withRange && index === 0;

      dates.push(
        tagData(format(date, dateFormat), date, index, isEnd, isStart)
      );
    }
    return { year, month, dates };
  };
}
