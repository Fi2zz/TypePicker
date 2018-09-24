import { isDate, padding, isArray, listHead, listTail } from "./util";

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

export const getDisableDates = (
  startDate: Date,
  endDate: Date,
  dateFormat: string,
  should: boolean
) => {
  const temp: any = {};
  if (should) {
    //处理开始日期前的日期
    if (startDate instanceof Date) {
      const startDateIndex = <number>startDate.getDate();
      for (let i = 1; i <= startDateIndex - 1; i++) {
        let date = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDateIndex - i
        );
        let formatted = format(date, dateFormat);
        temp[formatted] = formatted;
      }
    }

    if (endDate instanceof Date) {
      //处理结束日期后的日期
      const endMonthDates = getDates(endDate.getFullYear(), endDate.getMonth());
      //结束日期往后计算多一个月，避免在 views=2 的情况下出错
      const endDateNextMonthDate = getDates(
        endDate.getFullYear(),
        endDate.getMonth() + 1
      );
      const diffs = endMonthDates - endDate.getDate() + endDateNextMonthDate;

      for (let i = 1; i <= diffs; i++) {
        let date = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate() + i
        );
        let formatted = format(date, dateFormat);
        temp[formatted] = formatted;
      }
    }
  }
  return temp;
};

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

export const getClassName = (baseClassName: string, views: number | string) => {
  return `${baseClassName} calendar calendar-${
    views === 2 ? "double-views" : views === 1 ? "single-view" : "flat-view"
  }`;
};

export const containerClassName = (base, views) => {
  return `${base} calendar calendar-${
    views === 2 ? "double-views" : views === 1 ? "single-view" : "flat-view"
  }`;
};

export function parseEl(el: any) {
  if (!el) {
    return null;
  }

  return typeof el === "string" ? document.querySelector(el) : el;
}

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

function noop(a: any) {
  return a;
}

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

export function getDisabledDays(
  start: Date,
  end: Date,
  days: Array<number>,
  dateFormat: string
) {
  let map = {};

  if (start && end) {
    start = new Date(start.getFullYear(), start.getMonth(), 1);
    end = new Date(
      end.getFullYear(),
      end.getMonth() + 1,
      getDates(end.getFullYear(), end.getMonth())
    );
    let gap = diff(start, end, "days", true);
    for (let i = 0; i < gap; i++) {
      let date = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + i
      );
      let day = date.getDay();
      if (~days.indexOf(day)) {
        let formatted = format(date, dateFormat);
        map[formatted] = formatted;
      }
    }
  }
  return map;
}

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

export const Observer = (function() {
  let clientList = <any>{};
  const $remove = function(key: string, fn?: any | undefined) {
    let fns = clientList[key];
    // key对应的消息么有被人订阅
    if (!fns) {
      return false;
    }
    // 没有传入fn(具体的回调函数), 表示取消key对应的所有订阅
    if (!fn) {
      fns && (fns.length = 0);
    } else {
      // 反向遍历
      for (let i = fns.length - 1; i >= 0; i--) {
        let _fn = fns[i];
        if (_fn === fn) {
          // 删除订阅回调函数
          fns.splice(i, 1);
        }
      }
    }
  };
  const $on = function(key: string, fn: Function) {
    if (!clientList[key]) {
      clientList[key] = [];
    }
    clientList[key].push(fn);
  };
  const $emit = function(...args: Array<any>) {
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
    $on,
    $emit,
    $remove
  };
})();

export function getDates(year: number, month: number): number {
  let d = new Date(year, month, 1);
  let utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
  return new Date(utc).getUTCDate();
}

interface node {
  tag: string;
  props?: any;
  children?: any;
  render?: Boolean;
}
export function createNode({
  tag,
  props = {},
  children = "",
  render = true
}: node) {
  if (!tag || !render) {
    return "";
  }

  let attributes = [];
  for (let key in props) {
    let value = props[key];
    if (value) {
      attributes.push(`${key}="${value}"`);
    }
  }
  if (children === false || children === undefined || children === null) {
    children = "";
  } else if (Array.isArray(children)) {
    children = children.filter(item => !!item).join("");
  }
  return `<${tag} ${attributes.join("")}>${children}</${tag}>`;
}

export function calendarCellClassName(type: string, index?: number) {
  let name = `calendar-cell calendar-${type}-cell ${
    index === 0 ? "calendar-cell-weekday" : ""
  } ${index === 6 ? "calendar-cell-weekend" : ""}
 `;

  return name.replace(/\n/, "").trim();
}

export function join(list, spliter?: string) {
  if (!spliter) {
    spliter = "";
  }
  return list.join(spliter);
}

export function getYearsByDate(date) {
  let year = date.getFullYear();

  let years = [];
  for (let i = 0; i < 12; i++) {
    years.push({
      displayName: i,
      active: i === year,
      value: i,
      year: i
    });
  }
  return years;
}

export function getMonthsByYear(date) {
  let months = [];
  let month = date.getMonth();
  let year = date.getFullYear();

  for (let i = 0; i < 12; i++) {
    months.push({
      year,
      value: i,
      active: i === month
    });
  }
  return months;
}

interface generateDate {
  date: Date;
  days: number;
  dateFormat?: string;
  direction?: number;
  position?: string;
  index?: number;
}

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

export function createFormatDate(dateFormat) {
  return function(date) {
    return format(date, dateFormat);
  };
}

export function createParseDate(format) {
  return function(date) {
    return parse(date, format);
  };
}

interface nodeClassName {
  date: string;
  dates: string[];
  onlyActive: boolean;
}

export const createNodeClassName = ({
  date,
  dates,
  onlyActive = false
}: nodeClassName) => {
  if (dates.length <= 0) {
    return "";
  }

  if (onlyActive && dates.indexOf(date) >= 0) {
    return "active";
  }

  if (dates.indexOf(date) === 0) {
    return "active start-date";
  } else if (dates.indexOf(date) === dates.length - 1) {
    return "active end-date";
  } else if (
    dates.indexOf(date) > 0 &&
    dates.indexOf(date) < dates.length - 1
  ) {
    return "in-range";
  } else {
    return "";
  }
};

export function findDiableDates(start, end) {
  return createDate({ date: start, days: diff(end, start, "days") });
}

export const defaultLanguage = {
  title: (year, month) => `${year}年 ${defaultLanguage.months[month]}月`,
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

export const findDisableInQueue = (list, dateFormat, inDisable) => {
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
};

export const checkPickableDate = ({
  selected,
  selection,
  date,
  inDisable,
  dateFormat,
  queue,
  limit
}) => {
  if (!date) {
    return false;
  }

  if (inDisable(date)) {
    if (selection === 2) {
      let gap = diff(
        parse(date, dateFormat),
        parse(listTail(selected), dateFormat),
        "days"
      );

      if (selected.length <= 0 || gap <= 0 || queue.length >= selection) {
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
};
