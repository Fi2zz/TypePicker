interface datePickerOptions {
  el: string | HTMLElement;
  to?: Date;
  from?: Date;
  limit?: number;
  format?: string;
  doubleSelect?: boolean;
  views?: number | string;
  disables?: any;
  startDate?: Date;
  endDate?: Date;
}
interface disable {
  dates?: Array<any>;
  days?: Array<number>;
  to?: Date | string;
  from?: Date | string;
}

import Observer from "./datepicker.observer";
import {
  attr,
  diff,
  warn,
  merge,
  isDate,
  isEmpty,
  isArray,
  isNumber,
  isString,
  isObject,
  isBoolean,
  isFunction,
  getPeek,
  getFront,
  getDates,
  hasClass,
  addClass,
  removeClass,
  parseToInt,
  nextTick,
  attrSelector
} from "./util";
import HTML from "./datepicker.template";
import { parseFormatted, format as formatter } from "./datepicker.formatter";

const getDisableDates = (
  startDate: Date,
  endDate: Date,
  dateFormat: string,
  should: boolean
) => {
  const startMonthDates = startDate.getDate();
  const temp: any = {};
  if (should) {
    //处理开始日期前的日期
    for (let i = 1; i <= startMonthDates - 1; i++) {
      let date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startMonthDates - i
      );
      let formatted = formatter(date, dateFormat).value;
      temp[formatted] = formatted;
    }
    //处理结束日期后的日期
    const endMonthDates = getDates(endDate.getFullYear(), endDate.getMonth());
    const diffs = endMonthDates - endDate.getDate();
    for (let i = 1; i <= diffs; i++) {
      let date = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate() + i
      );
      let formatted = formatter(date, dateFormat).value;
      temp[formatted] = formatted;
    }
  }
  return temp;
};

function getViews(view: number | string) {
  if (!view) {
    return 1;
  }
  const views = parseToInt(view);
  if (isNaN(views)) {
    if (view !== "auto") {
      return 1;
    } else {
      return "auto";
    }
  } else {
    if (views > 2 || views <= 0) {
      return 1;
    } else {
      return views;
    }
  }
}

function parseEl(el: any) {
  if (!el) {
    return null;
  }
  if (!isString(el)) {
    return el;
  } else {
    if (el.indexOf("#") >= 0) {
      return document.querySelector(el);
    } else if (el.indexOf(".") >= 0) {
      return document.querySelectorAll(el)[0];
    } else {
      if (el.indexOf("#") <= -1 || el.indexOf(".") <= -1) {
        warn(`ParseEl`, `Do not mount DatePicker to a pure html tag,${el}`);
        return false;
      }
      return document.querySelector(el);
    }
  }
}
function setHTMLNodeRange(data: Array<any>, collector: HTMLElement) {
  let collection = collector.querySelectorAll(".in-range");
  for (let i = 0; i < collection.length; i++) {
    removeClass(collection[i], "in-range");
  }
  for (let i = 0; i < data.length; i++) {
    let selector = <string>attrSelector("data-date", data[i]);
    let element = collector.querySelector(selector);
    if (!hasClass(element, "active")) {
      addClass(element, "in-range");
    }
  }
}

function setHTMLNodeState(el: HTMLElement, dates: Array<string>, isDouble) {
  const nodes = el.querySelectorAll(".calendar-date-cell");
  for (let i = 0; i < nodes.length; i++) {
    removeClass(nodes[i], "active");
    if (isDouble) {
      removeClass(nodes[i], "start-date");
      removeClass(nodes[i], "end-date");
    }
  }
  for (let i = 0; i < dates.length; i++) {
    let date = dates[i];
    let dateElement = el.querySelector(`[data-date="${date}"]`);
    addClass(dateElement, "active");
    if (isDouble) {
      if (i === 0) {
        addClass(dateElement, "start-date");
      }
      if (dates.length === 2 && i === dates.length - 1) {
        addClass(dateElement, "end-date");
      }
    }
  }
}

export default class DatePicker {
  private dateFormat: string;
  private limit: number = 1;
  private views: number | string = 1;
  private date: Date = new Date();
  private startDate: Date = null;
  private endDate: Date = null;
  private selected: string[] = [];
  private data: any = {};
  private disables: any = {};
  private element: any = null;
  private doubleSelect: boolean = false;
  private bindData: boolean = false;
  private disableDays: number[] = [];
  private language: any = {
    days: ["日", "一", "二", "三", "四", "五", "六"],
    months: [
      "01月",
      "02月",
      "03月",
      "04月",
      "05月",
      "06月",
      "07月",
      "08月",
      "09月",
      "10月",
      "11月",
      "12月"
    ],
    year: "年"
  };

  public on(ev: string, cb: Function) {
    return Observer.$on(ev, cb);
  }

  public format: Function = (date: Date, format?: string) =>
    formatter(date, format ? format : this.dateFormat);
  public parse: Function = (string: string, format?: string) =>
    parseFormatted(string, format ? format : this.dateFormat);

  public setDates(dates: Array<any>) {
    if (!isArray(dates)) {
      dates = [];
      warn("setDates", `no dates provided,${dates}`);
      return;
    }
    let datesList: Array<any> = [];
    let start: string = "",
      end: string = "";
    if (this.doubleSelect) {
      if (dates.length > 2) {
        dates = dates.slice(0, 2);
      }
      start = <any>dates[0];
      end = <any>dates[dates.length - 1];
      const startDate = isDate(start) ? start : this.parse(start);
      const endDate = isDate(end) ? end : this.parse(end);
      datesList = [this.format(startDate).value];
      if (start !== end) {
        datesList.push(this.format(endDate).value);
      }
    } else {
      const d = dates[dates.length - 1];
      datesList = [isDate(d) ? this.format(d).value : d];
    }
    Observer.$emit("setDates", datesList);
  }

  public setLanguage(pack?: any) {
    if (isArray(pack.days) && isArray(pack.months)) {
      this.language = {
        days: pack.days,
        months: pack.months,
        year: pack.year
      };
    }
  }

  public setDisabled(param: disable) {
    if (!param || (isObject(param) && Object.keys(param).length <= 0)) {
      warn(
        "setDisabled",
        `invalid params, \nparams should be {dates:<Array<any>>[], days:<Array<number>>[] }`
      );
      return false;
    }
    if (!isArray(param.dates) && !isArray(param.days)) {
      warn(
        "setDisabled",
        `invalid params  { dates:<Array<any>>${
          param.dates
        }, days:<Array<number>>${param.days} }`
      );
      return false;
    }

    const dateList = isArray(param.dates)
      ? param.dates
          .map((date: any) => {
            if (date instanceof Date) {
              return this.format(date).value;
            } else {
              let parsed = this.parse(date);
              if (parsed instanceof Date) {
                return date;
              }
            }
          })
          .filter((item: string) => !!item)
      : [];
    const dayList = isArray(param.days)
      ? param.days.filter((item: any) => {
          let parsed = parseToInt(item);
          return !isNaN(parsed) && parsed >= 0 && parsed <= 6;
        })
      : [];

    let fromDate: any;
    let toDate: any;
    const to = param.to;
    const from = param.from;
    if (from) {
      if (isDate(from)) {
        fromDate = from;
      } else {
        const parsed = this.parse(from);
        if (isDate(parsed)) {
          fromDate = parsed;
        } else {
          return false;
        }
      }
      this.endDate = fromDate;
    }
    if (to) {
      if (isDate(to)) {
        toDate = to;
      } else {
        const parsed = this.parse(to);
        if (isDate(parsed)) {
          toDate = parsed;
        } else {
          return false;
        }
      }
      this.date = toDate;
      this.startDate = toDate;
    }
    Observer.$emit("setDisabled", {
      dayList,
      dateList
    });
  }

  public setData(cb: Function) {
    if (isFunction(cb)) {
      const result = cb();
      if (isObject(result) && Object.keys(result).length > 0) {
        const map = {};
        for (let key in result) {
          let date = this.parse(key);
          if (date instanceof Date) {
            map[key] = result[key];
          }
        }
        Observer.$emit("setData", map);
      } else {
        const key = this.format(new Date(), this.dateFormat).value;
        warn(
          "setData",
          `you are passing wrong type of data to DatePicker,data should be like :
                    {${key}:"value"}`
        );
      }
    }
  }

  private createDatePicker() {
    this.element.className = `${this.element.className} calendar calendar-${
      this.views === 2
        ? "double-views"
        : this.views === 1 ? "single-view" : "flat-view"
    }`;
    const template = new HTML({
      date: this.date,
      size: diff(this.startDate, this.endDate),
      language: this.language,
      views: this.views,
      dateFormat: this.dateFormat
    });
    this.element.innerHTML = template[0];
    //日期切换
    const prev = this.element.querySelector(".calendar-action-prev");
    const next = this.element.querySelector(".calendar-action-next");
    if (prev && next) {
      const endGap = this.endDate ? diff(this.endDate, this.date) : 1;
      const startGap = this.endDate ? diff(this.date, this.startDate) : 2;
      if (startGap > 1) {
        prev.addEventListener("click", () => {
          Observer.$emit("create", { type: "switch", size: -1 });
          removeClass(next, "disabled calendar-action-disabled");
        });
      } else {
        addClass(prev, "disabled calendar-action-disabled");
      }
      if (endGap >= 1) {
        next.addEventListener("click", () => {
          Observer.$emit("create", { type: "switch", size: 1 });
          removeClass(prev, "disabled calendar-action-disabled");
        });
      } else {
        addClass(next, "disabled calendar-action-disabled");
      }
    }
  }

  private init(option: datePickerOptions) {
    this.doubleSelect = isBoolean(option.doubleSelect);
    this.dateFormat = option.format;
    this.views = getViews(option.views);
    //开始日期
    this.startDate = isDate(option.startDate) ? option.startDate : new Date();
    //结束日期
    if (isDate(option.endDate)) {
      this.endDate = option.endDate;
    }
    //初始视图所在日期
    this.date = this.startDate;
    //選擇日期區間最大限制
    this.limit = this.doubleSelect
      ? isNumber(option.limit) ? option.limit : 2
      : 1;

    let rawDisableMap: any = {
      dateList: [],
      dayList: []
    };

    Observer.$on("setDates", (result: any) => (this.selected = result));
    Observer.$on("setData", (result: any) => (this.data = result));
    Observer.$on("setDisabled", (result: any) => (rawDisableMap = result));

    nextTick(() => {
      const dateMap = {};
      this.bindData = !isEmpty(this.data);
      if (!isDate(option.startDate) || !isDate(option.endDate)) {
        if (this.bindData) {
          warn(
            "init",
            "please provide [startDate] and [endDate] while binding data to datepicker"
          );
        }
      }

      const disabledMap = {};
      const { dateList, dayList } = rawDisableMap;
      if (this.endDate) {
        for (let key in this.data) {
          dateMap[key] = this.parse(key).getDay();
        }
        if (this.bindData) {
          const diffs = diff(this.startDate, this.endDate, "days", true);
          for (let i = 0; i < diffs; i++) {
            let date = new Date(
              this.startDate.getFullYear(),
              this.startDate.getMonth(),
              this.startDate.getDate() + i
            );
            let formatted = this.format(date).value;
            if (!this.data[formatted]) {
              disabledMap[formatted] = formatted;
            }
          }
        }
        for (let date in dateMap) {
          let day = parseToInt(dateMap[date]);
          if (dateList.indexOf(date) >= 0) {
            delete this.data[date];
            if (!disabledMap[date]) {
              disabledMap[date] = date;
            }
          }
          if (dayList.indexOf(day) >= 0) {
            if (dateMap[date]) {
              delete this.data[date];
            }
            if (!disabledMap[date]) {
              disabledMap[date] = date;
            }
          }
        }
      } else {
        for (let date of dateList) {
          disabledMap[date] = date;
        }
        this.disableDays = dayList;
      }

      const disableBeforeStartDateAndAfterEndDate = getDisableDates(
        this.startDate,
        this.endDate,
        this.dateFormat,
        !!this.endDate
      );
      //无效日期
      this.disables = merge(disableBeforeStartDateAndAfterEndDate, disabledMap);
      const front = getFront(this.selected);
      const peek = getPeek(this.selected);
      if (
        this.disables[front] ||
        this.disables[peek] ||
        (this.doubleSelect && front && front === peek && peek)
      ) {
        warn("setDates", "Illegal dates" + this.selected);
        this.selected = [];
      }
      if (this.views === "auto") {
        if (!isEmpty(this.selected)) {
          this.date = this.parse(getFront(this.selected));
        }
      }
      if (this.views === 1) {
        if (this.doubleSelect && this.selected.length >= 2) {
          if (front === peek) {
            this.selected.pop();
          }
        }
      }
      Observer.$emit("create", { type: "init", size: 0 });
    });
  }

  constructor(option: datePickerOptions) {
    if (!option) {
      warn("init", "No instance option provided");
      return;
    }

    this.element = parseEl(option.el);
    if (!this.element) {
      warn("init", `invalid selector,current selector ${this.element}`);
      return;
    }
    if (option.from) {
      warn("option.from", "use option.startDate instead");
      delete option.from;
    }
    if (option.to) {
      warn("option.to", "use option.endDate instead");
      delete option.to;
    }

    const getRange = (data: Array<any>) => {
      const startDate = getFront(data);
      const endDate = getPeek(data);
      const invalidDates = [];
      const validDates = [];
      if (startDate && endDate) {
        let start: Date;
        let end: Date;
        if (!isDate(startDate)) {
          start = <Date>this.parse(<string>startDate);
        } else {
          start = <Date>startDate;
        }
        if (!isDate(endDate)) {
          end = <Date>this.parse(<string>endDate);
        } else {
          end = <Date>endDate;
        }
        const gap = diff(<Date>start, <Date>end, "days", true);
        if (gap <= this.limit) {
          for (let i = 0; i < gap; i++) {
            let date = new Date(
              start.getFullYear(),
              start.getMonth(),
              start.getDate() + i
            );
            let formatted = this.format(date).value;
            if (this.disables[formatted]) {
              invalidDates.push(formatted);
            } else {
              validDates.push(formatted);
            }
          }
        }
      }
      return {
        invalidDates,
        validDates
      };
    };

    Observer.$on("select", (result: any) => {
      let { type, value } = result;

      if (type === "disabled") {
        return false;
      }
      if (type === "selected") {
        this.setDates(value);
      }
      if (type !== "switch") {
        Observer.$emit("update", result);
      }
      const currRange: any = getRange(value);
      if (this.doubleSelect) {
        setHTMLNodeRange(currRange.validDates, this.element);
      }
      setHTMLNodeState(this.element, value, this.doubleSelect);
    });
    Observer.$on("create", (result: any) => {
      let { type, size } = result;
      if (type === "switch") {
        const curr = {
          year: this.date.getFullYear(),
          month: this.date.getMonth(),
          date: this.date.getDate()
        };
        this.date = new Date(curr.year, curr.month + size, curr.date);
      }

      this.createDatePicker();
      const nodeList = this.element.querySelectorAll(".calendar-cell");

      //因为没有日期列表，因此只能在实例化后再设置by day的disable 状态
      if (!this.endDate) {
        const days = this.disableDays;
        for (let i = 0; i < nodeList.length; i++) {
          let node = nodeList[i];
          let day = parseToInt(attr(node, "data-day"));
          let date = attr(node, "data-date");
          if (!isNaN(day) && days.indexOf(day) >= 0) {
            this.disables[date] = date;
          }
        }
      }
      //初始化的时候的选中状态
      Observer.$emit("select", {
        type,
        value: this.selected
      });
      if (this.bindData) {
        Observer.$emit("data", {
          data: this.data,
          nodeList
        });
      }
      if (!isEmpty(this.disables)) {
        Observer.$emit("disabled", {
          nodeList,
          dateList: this.disables
        });
      }

      const bindData = this.bindData;
      const isDoubleSelect = this.doubleSelect;
      const cache = this.selected;
      const isDisabled = (date: string) => !!this.disables[date];
      let selected = this.selected;
      const loop = node => {
        node.addEventListener("click", () => {
          let type = "selected";
          const date = attr(node, "data-date");
          //没有日期，直接返回
          if (!date) {
            return false;
          }
          const index = selected.indexOf(date);
          //bindData 状态下，且selected的length为0，点击不可选日期，返回
          //无效日期可以当作结束日期，但不能当作开始日期，故选择的日期的前一天是无效日期，返回
          // 如  2018-02-23，2018-02-24 为无效日期，则点击2018-02-24返回无效日期
          const isDisabledDate = isDisabled(date);
          const now = this.parse(date);
          const prevDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
          );
          const prevDateIsInValid = isDisabled(this.format(prevDate).value);
          if (
            (bindData && selected.length <= 0 && isDisabledDate) ||
            (isDoubleSelect && prevDateIsInValid && isDisabledDate) ||
            (index >= 0 && isDisabledDate)
          ) {
            return false;
          }
          //重复选择
          //如选择了 2018-02-04 ~ 2018-02-06
          //但是用户实际想选择的是 2018-02-04~2018-02-05，
          //此时 用户再次选择 2018-02-04，其他日期将被删除
          if (index >= 0) {
            selected = !!this.disables[getPeek(selected)]
              ? [getPeek(selected)]
              : [getFront(selected)];
          }
          //选择的日期数量超出了范围，置空selected
          if ((isDoubleSelect && selected.length >= 2) || !isDoubleSelect) {
            selected = [];
          }
          selected.push(date);
          if (!isDoubleSelect) {
            selected = isDisabledDate ? cache : selected;
            type = isDisabledDate ? "disabled" : "selected";
          } else {
            let front = getFront(selected);
            let peek = getPeek(selected);
            if (front === peek) {
              selected = [front];
            }
            if (selected.length >= 2) {
              let diffed = diff(
                this.parse(peek),
                this.parse(front),
                "days",
                false
              );
              if (diffed < 0) {
                peek = getPeek(selected);
                if (isDisabled(peek)) {
                  selected.pop();
                } else {
                  selected.shift();
                }
              } else {
                let range = getRange(selected);
                if (range.invalidDates.length > 0 || diffed > this.limit) {
                  selected.shift();
                }
              }
            }
            //selected 长度为1 且 唯一的元素还是无效日期，则读取缓存
            if (selected.length <= 1) {
              if (isDisabled(getFront(selected))) {
                type = "disabled";
                selected = cache;
              }
            }
          }
          Observer.$emit("select", {
            type,
            value: selected
          });
        });
      };
      for (let i = 0; i < nodeList.length; i++) {
        loop(nodeList[i]);
      }
    });
    this.init(option);
  }
}
