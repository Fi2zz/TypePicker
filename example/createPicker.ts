import Core from "../src";

const Timex = {
  isDate: d => d instanceof Date,
  dateComponents(input) {
    const month = input.getMonth();
    const year = input.getFullYear();
    const date = input.getDate();
    const day = input.getDay();
    const hours = input.getHours();

    const minutes = input.getMinutes();
    const seconds = input.getSeconds();
    const ms = input.getMilliseconds();

    const dateString = input.toDateString();
    const isoString = input.toISOString();
    const time = input.getTime();
    const timezoneOffset = input.getTimezoneOffset();

    return {
      year,
      date,
      month,
      day,
      hours,
      minutes,
      seconds,
      ms,
      milliseconds: ms,
      dateString,
      isoString,
      time,
      timezoneOffset
    };
  },
  createDate(options) {
    const {
      year,
      month,
      date,
      minutes = 0,
      hours = 0,
      seconds = 0,
      milliseconds = 0
    } = options;
    return new Date(year, month, date, hours, minutes, seconds, milliseconds);
  }
};

const DOMHelpers = {
  select(selector: string | HTMLElement, selector$2?: string): any {
    if (!selector$2) {
      if (typeof selector !== "string") {
        return selector;
      } else {
        return document.querySelector(selector);
      }
    }

    const selectAll = (who, selector) => {
      let ArrayNodes = who.querySelectorAll(selector);
      if (ArrayNodes.length <= 0) {
        return null;
      } else if (ArrayNodes.length === 1) {
        return ArrayNodes[0];
      } else {
        return ArrayNodes;
      }
    };

    return selectAll(selector, selector$2);
  },
  attr: (el: HTMLElement, attr: string) => el.getAttribute(attr),
  class(index: number, options) {
    function classname(options) {
      const {
        isActive,
        isStart,
        isEnd,
        isDisabled,
        inRange,
        isEmpty
      } = options;
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

    let names = ["calendar-cell"];
    if (index === 0) {
      names.push("is-weekday");
    } else if (index === 6) {
      names.push("is-weekend");
    }
    names.push(classname(options));
    return names.join(" ").trim();
  }
};
function createTemplate(data) {
  const isDef = (v: any) => v !== undefined && v !== null;
  function createTag(tag, props: any): string {
    if (!tag) {
      tag = "div";
    }
    let children: any = "";
    const attributes = <string[]>[];
    for (let key in props) {
      let value = props[key];
      if (isDef(value)) {
        if (key !== "children") {
          if (key === "className") {
            key = "class";
          }
          attributes.push(`${key}="${value}"`);
        } else {
          if (value !== false) {
            if (Array.isArray(value)) {
              children = value.filter(isDef).join("");
            } else {
              children = value;
            }
          }
        }
      }
    }
    return `<${tag} ${attributes.join("")}>${children}</${tag}>`;
  }
  const actionNode = type => {
    const className = ["calendar-action", type];
    return createTag("div", {
      className: className.join(" ")
    });
  };
  function dateNodes(data): string {
    const props = {
      className: DOMHelpers.class(data.day, data.status),
      children: []
    };

    // if (!data.invalid) {
    props.children.push(
      createTag("div", {
        className: "date",
        children: data.label
      })
    );
    props["data-date"] = data.value;
    // }
    props["data-disabled"] = data.disabled;
    return createTag("div", props);
  }

  const calendars = data.map(item => {
    const calendarViewData = [
      createTag("div", {
        className: "calendar-head",
        children: item.heading
      }),
      createTag("div", {
        className: "calendar-day",
        children: ["日", "一", "二", "三", "四", "五", "六"].map(day =>
          createTag("div", {
            className: "calendar-cell",
            children: day
          })
        )
      }),
      createTag("div", {
        className: "calendar-body",
        children: item.dates.map(dateNodes)
      })
    ];
    return createTag("div", {
      className: "calendar-item",
      children: calendarViewData
    });
  });
  return [actionNode("prev"), actionNode("next"), ...calendars].join("");
}
/**
 *
 * @param date
 * @param format
 * @returns {string}
 */
function format(date: Date | string, format?: string): string {
  if (!format) {
    format = "YYYY-MM-DD";
  }

  if (!Timex.isDate(date)) {
    return null;
  }
  const padding = (n: Number): string => `${n > 9 ? n : "0" + n}`;

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

function parse(strDate: string | Date, format: string) {
  if (Timex.isDate(strDate)) {
    return strDate;
  }
  if (!strDate) {
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

export default class TypePicker {
  constructor(options) {
    this.setup(options);
  }
  core;
  element: HTMLElement;
  date: Date;
  useFormatDate = date => format(date, this.dateFormat);
  useParseDate = date => parse(date, this.dateFormat);
  dateFormat = "YYYY/MM/DD";
  setup(options) {
    const element = DOMHelpers.select(options.el);
    this.element = element;
    this.element.classList.add("calendar");
    this.dateFormat = options.format;
    // let startDate = parse(options.startDate, options.format);
    // let endDate = new Date(options.endDate);
    options.size = 12; // viewSize;

    this.core = new Core(options);
    this.core.listen(({ types, type, payload }) => {
      if (type === types.update) {
        this.render(payload);
      }
    });
    this.apply = {
      ...this.core.apply,
      date: date => {
        this.date = date;
        this.core.apply.date(date);
      }
    };
    // this.apply.date(Timex.today());
  }
  render(data) {
    console.count("payload");
    data = data.map(item => {
      item.dates = item.dates.map(item => {
        item.disabled = item.disabled || item.invalid;
        item.status.isDisabled = item.disabled;
        if (item.invalid) {
          item.status.inRange = false;
          item.status.isStart = false;
          item.status.isEnd = false;
          item.status.isActive = false;
        }
        // item.className = classname(item.status);
        item.value = this.useFormatDate(item.date);
        item.label = item.date.getDate();
        item.day = item.date.getDay();
        return item;
      });
      item.heading = `${item.month + 1}月`;
      return item;
    });

    this.element.innerHTML = createTemplate(data);
    const select = (selector: string) =>
      DOMHelpers.select(this.element, selector);
    const prevActionDOM = select(".calendar-action.prev");
    const nextActionDOM = select(".calendar-action.next");
    const nodeList = select(".calendar-cell");
    if (prevActionDOM && nextActionDOM) {
      const listener = (step: number) => {
        const components = Timex.dateComponents(this.date);
        components.month += step;
        this.apply.date(Timex.createDate(components));
      };
      prevActionDOM.addEventListener("click", () => listener(-1));
      nextActionDOM.addEventListener("click", () => listener(1));
    }
    for (let i = 0; i < nodeList.length; i++) {
      let node = nodeList[i];

      node.addEventListener("click", () => {
        const value = DOMHelpers.attr(node, "data-date");
        if (!value) {
          return;
        }
        this.core.apply.select(this.useParseDate(value));
      });
    }
  }

  apply = null;
  onSelect(next) {
    this.core.listen(({ type, types, payload }) => {
      if (type === types.select) {
        const value = payload.map(item => this.useFormatDate(item));
        next(value);
      }
    });
  }
}
