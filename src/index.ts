interface datePickerOptions {
  el: string | HTMLElement;
  limit?: number;
  format?: string;
  doubleSelect?: boolean;
  views?: number | string;
  startDate?: Date;
  endDate?: Date;
  selection?: number;
}

interface disable {
  dates?: Array<any>;
  days?: Array<number>;
  to?: Date | string;
  from?: Date | string;
}

import {
  attr,
  warn,
  merge,
  isDate,
  isEmpty,
  isArray,
  isUndefined,
  isPlainObject,
  isBoolean,
  isFunction,
  toString,
  getPeek,
  getFront,
  addClass,
  removeClass,
  parseToInt,
  nextTick,
  simpleListToMap,
  css
} from "./util";
import HTML, { yearPanel, monthPanel } from "./datepicker.template";
import {
  getClassName,
  getViews,
  getDisableDates,
  getDisabledDays,
  parseEl,
  setNodeActiveState,
  setNodeRangeState,
  Observer,
  parse,
  format,
  setDate,
  diff,
  getDates
} from "./datepicker.helpers";

export default class DatePicker {
  private dateFormat: string = null;
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
  private canSelectLength: number = 1;

  private language: any = {
    title: <Function>(year, month) =>
      `${year}年 ${this.language.months[month]}月`,
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
  public on(ev: string, cb: Function) {
    return Observer.$on(ev, cb);
  }

  public emit(ev: string, arg: any) {
    return Observer.$emit(ev, arg);
  }

  public format = format;
  public parse = parse;

  public setDates(dates: Array<any>) {
    if (!isArray(dates)) return;
    let datesList: Array<any> = [];
    let start: string = "",
      end: string = "";
    if (this.doubleSelect) {
      if (dates.length > 2) {
        dates = dates.slice(0, 2);
      }
      start = <any>dates[0];
      end = <any>dates[dates.length - 1];
      const startDate = isDate(start)
        ? start
        : this.parse(start, this.dateFormat);
      const endDate = isDate(end) ? end : this.parse(end, this.dateFormat);
      datesList = [this.format(startDate, this.dateFormat)];
      if (start !== end) {
        datesList.push(this.format(endDate, this.dateFormat));
      }
    } else {
      const d = dates[dates.length - 1];
      datesList = [isDate(d) ? this.format(d, this.dateFormat) : d];
    }
    this.selected = datesList;
  }

  public setDisabled(param: disable) {
    const result = toString({
      dates: `[optional]Expect an array of string or Date got ${toString(
        param.dates
      )} `,
      days: `[optional]Expect an array of number,got ${toString(param.days)}`,
      from: `[optional]Expect a string or Date ,got ${toString(param.to)}`,
      to: `[optional]Expect a string or Date ,got ${toString(param.to)}`
    });
    if (!param || (isPlainObject(param) && Object.keys(param).length <= 0)) {
      warn("setDisabled", result);
      return false;
    }
    if (
      (param.dates && !isArray(param.dates)) ||
      (param.days && !isArray(param.days))
    ) {
      warn("setDisabled", result);
      return false;
    }

    let dateList = isArray(param.dates)
      ? param.dates
          .map((date: any) => {
            if (date instanceof Date) {
              return this.format(date, this.dateFormat);
            } else {
              let parsed = this.parse(<string>date, this.dateFormat);
              if (parsed instanceof Date) {
                return date;
              }
            }
          })
          .filter((item: string) => !!item)
      : [];

    let fromDate: any;
    let toDate: any;
    const to = param.to;
    const from = param.from;

    if (from) {
      if (isDate(from)) {
        fromDate = from;
      } else {
        const parsed = this.parse(<string>from, this.dateFormat);
        if (isDate(parsed)) {
          fromDate = parsed;
        } else {
          warn("setDisabled", `invalid param,${toString({ from: from })}`);
          return false;
        }
      }
      fromDate = setDate(fromDate);
    }
    if (to) {
      if (isDate(to)) {
        toDate = to;
      } else {
        const parsed = this.parse(<string>to, this.dateFormat);
        if (isDate(parsed)) {
          toDate = parsed;
        } else {
          warn("setDisabled", `invalid param,${toString({ to: to })}`);
          return false;
        }
      }
      toDate = setDate(toDate);
    }

    const dayList = isArray(param.days)
      ? param.days.filter((item: any) => {
          let parsed = parseToInt(item);
          return !isNaN(parsed) && parsed >= 0 && parsed <= 6;
        })
      : [];
    Object.defineProperty(this, "disabledTemp", {
      configurable: true,
      writable: true,
      enumerable: true,
      value: {
        dayList,
        dateList,
        disableAfter: fromDate,
        disableBefore: toDate
      }
    });
  }

  public setLanguage(pack: any) {
    if (
      isArray(pack.days) &&
      isArray(pack.months) &&
      typeof pack.title === "function"
    ) {
      this.language = {
        week: pack.days,
        months: pack.months,
        title: pack.title
      };
    }
  }

  public setData(cb: Function) {
    if (isFunction(cb) && this.canSelectLength <= 1) {
      const result = cb();
      if (isPlainObject(result) && Object.keys(result).length > 0) {
        const map = {};
        for (let key in result) {
          let date = this.parse(key, this.dateFormat);
          if (date instanceof Date) {
            map[key] = result[key];
          }
        }
        this.data = map;
      } else {
        const key = this.format(new Date(), this.dateFormat);
        warn(
          "setData",
          `you are passing wrong type of data to DatePicker,data should be like :
          
                    {${key}:"value"}`
        );
      }
    }
  }

  private createMonths(date: Date) {
    const monthSize =
      this.views == 2
        ? 1
        : this.views === "auto"
          ? diff(this.endDate, this.startDate)
          : 0;
    const template = [];
    for (let i = 0; i <= monthSize; i++) {
      let dat = new Date(date.getFullYear(), date.getMonth() + i, 1);
      let dates = getDates(dat.getFullYear(), dat.getMonth());
      template.push({
        dates,
        year: dat.getFullYear(),
        month: dat.getMonth()
      });
    }

    return template.map((item: any) => {
      let dates = {};
      let firstDay = new Date(item.year, item.month, 1);
      let lastMonthDates = new Date(item.year, item.month, 0).getDate();
      for (let i = 0; i < firstDay.getDay(); i++) {
        let lateMonthDate: any = new Date(
          item.year,
          item.month - 1,
          lastMonthDates - i
        );
        let formatted: any = this.format(lateMonthDate, this.dateFormat);
        dates[formatted] = { date: false, day: false };
      }
      for (let i = 0; i < item.dates; i++) {
        let date = new Date(item.year, item.month, i + 1);
        let formatted = this.format(date, this.dateFormat);
        dates[formatted] = {
          date: `${date.getDate()}`,
          day: `${date.getDay()}`
        };
      }
      return {
        heading: this.language.title(item.year, item.month),
        dates
      };
    });
  }

  private render(data: Array<any>, renderWeekOnTop: boolean) {
    const template = new HTML({
      renderWeekOnTop,
      data,
      week: this.language.week
    });
    this.element.innerHTML = template[0];
    //日期切换
    const prev = this.element.querySelector(".calendar-action-prev");
    const next = this.element.querySelector(".calendar-action-next");
    if (prev && next) {
      const endGap = this.endDate ? diff(this.endDate, this.date) : 1;
      const startGap = this.endDate ? diff(this.date, this.startDate) : 2;
      if (startGap >= 1) {
        prev.addEventListener("click", () => {
          Observer.$emit("render", { type: "switch", size: -1 });
          removeClass(next, "disabled calendar-action-disabled");
        });
      } else {
        addClass(prev, "disabled calendar-action-disabled");
      }
      if (endGap >= 1) {
        next.addEventListener("click", () => {
          Observer.$emit("render", { type: "switch", size: 1 });
          removeClass(prev, "disabled calendar-action-disabled");
        });
      } else {
        addClass(next, "disabled calendar-action-disabled");
      }
    }
  }

  private renderYearPanel(visible: boolean) {
    const createPanel = years => {
      let title = `${years[0]} - ${years[years.length - 1]}`;
      yearPanelNode.innerHTML = yearPanel({
        years,
        title
      });
      let yearPrevAction = this.element.querySelector(".year-prev");
      let yearNextAction = this.element.querySelector(".year-next");
      yearPrevAction.addEventListener("click", () => {
        let dateString = this.date.toString();
        let startDate = years[0] - 11;
        let date = new Date(dateString);
        date.setFullYear(startDate);
        createPanel(createYearsList(date));
      });

      yearNextAction.addEventListener("click", () => {
        let dateString = this.date.toString();
        let startDate = years[years.length - 1] + 11;
        let date = new Date(dateString);
        date.setFullYear(startDate);
        createPanel(createYearsList(date));
      });
      let yearCell = this.element.querySelectorAll(".year-cell");
      for (let i = 0; i < yearCell.length; i++) {
        let cell = yearCell[i];
        cell.addEventListener("click", () => {
          let year = parseInt(attr(cell, "data-year"));
          this.date.setFullYear(year);
          css(".year-panel", { display: "none" });
          css(".month-panel", { display: "block" });
          this.renderMonthPanel(true);
          // Observer.$emit("renderMonthPanel", true)
        });
      }
    };
    const createYearsList = (date: Date) => {
      let year = date.getFullYear();
      let start = year - 11;
      let end = year;
      let years = [];
      for (let i = start; i <= end; i++) {
        years.push(i);
      }
      return years;
    };
    let years = createYearsList(this.date);
    let yearPanelNode = this.element.querySelector(".year-panel");
    css(".extra-panel", { display: visible ? "block" : "none" });
    css(".year-panel", { display: visible ? "block" : "none" });
    createPanel(years);
  }

  private renderMonthPanel(visible: any) {
    let month = this.element.querySelector(".month-panel");
    // css('.extra-panel', {display: 'block'});
    css(".year-panel", { display: "none" });
    month.style.display = visible ? "block" : "none";
    month.innerHTML = monthPanel(this.date.getFullYear(), this.language.months);
    let monthNodes = month.querySelectorAll(".month-cell");
    let back = month.querySelector(".year-title span");

    back.addEventListener("click", () => {
      css(".year-panel", { display: "block" });
      css(".month-panel", { display: "none" });
    });
    for (let i = 0; i < monthNodes.length; i++) {
      let cell = monthNodes[i];
      cell.addEventListener("click", () => {
        let month = parseInt(attr(cell, "data-month"));
        css(".extra-panel", { display: "none" });
        css(".month-panel", { display: "none" });
        css(".year-panel", { display: "none" });
        this.date.setMonth(month);
        Observer.$emit("render", { type: "select-month" });
      });
    }
  }

  private getRange(data: Array<any>) {
    const startDate = getFront(data);
    const endDate = getPeek(data);
    const invalidDates: Array<string> = [];
    const validDates: Array<string> = [];
    let limit = this.limit;
    let outOfRange = false;

    if (startDate && endDate) {
      let start: Date;
      let end: Date;
      if (!isDate(startDate)) {
        start = <Date>this.parse(<string>startDate, this.dateFormat);
      } else {
        start = <Date>startDate;
      }
      if (!isDate(endDate)) {
        end = <Date>this.parse(<string>endDate, this.dateFormat);
      } else {
        end = <Date>endDate;
      }
      let gap = diff(<Date>end, <Date>start, "days");

      if (gap <= limit) {
        for (let i = 0; i < gap; i++) {
          let date = setDate(start, i);
          let formatted = this.format(date, this.dateFormat);
          if (this.disables[formatted]) {
            invalidDates.push(formatted);
          } else {
            if (formatted !== startDate && formatted !== endDate) {
              validDates.push(formatted);
            }
          }
        }
      } else {
        outOfRange = true;
      }
    }
    return {
      invalidDates,
      validDates,
      outOfRange
    };
  }

  private initDisabled(bindData: boolean) {
    let disabledDays = [],
      disableDates: string[] = [];
    if (!isUndefined(this["disabledTemp"])) {
      let { dateList, disableBefore, disableAfter, dayList } = this[
        "disabledTemp"
      ];
      if (disableBefore) {
        this.startDate = disableBefore;
      }
      if (disableAfter) {
        this.endDate = disableAfter;
      }
      disableDates = dateList;
      disabledDays = dayList;
    }

    //无效日期
    this.disables = merge(
      getDisableDates(this.startDate, this.endDate, this.dateFormat, bindData),
      getDisabledDays(
        this.startDate,
        this.endDate,
        disabledDays,
        this.dateFormat
      ),
      simpleListToMap(disableDates)
    );
  }

  private init() {
    nextTick(() => {
      const bindData = !isEmpty(this.data) && this.canSelectLength < 2;
      //初始视图所在日期
      this.date = isUndefined(this.startDate) ? new Date() : this.startDate;
      this.initDisabled(bindData);
      //去掉data里的无效日期
      if (bindData) {
        let data = this.data;
        //此处未排序日期，直接取this.data的最后一个key
        //排序在setData里做
        this.endDate = this.parse(getPeek(Object.keys(data)), this.dateFormat);
        let gap = diff(this.startDate, this.endDate, "days", true);
        for (let i = 0; i < gap; i++) {
          let date = setDate(this.startDate, i);
          let formatted = this.format(date, this.dateFormat);
          if (isUndefined(data[formatted])) {
            this.disables[formatted] = formatted;
          } else if (!isUndefined(this.disables[formatted])) {
            delete data[formatted];
          }
        }
        this.data = data;
      }

      this.element.className = `${this.element.className} ${
        bindData ? "with-data" : "no-data"
      }`;

      const front = getFront(this.selected);
      const peek = getPeek(this.selected);

      let initRange = this.getRange(this.selected);

      let canInitWithSelectedDatesWhenDataBinding = (range: any, bindData) => {
        return (
          (range.invalidDates.length > 0 ||
            range.outOfRange ||
            range.validDates.length <= 0) &&
          bindData
        );
      };

      if (
        canInitWithSelectedDatesWhenDataBinding(initRange, bindData) ||
        initRange.outOfRange
      ) {
        if (initRange.outOfRange) {
          warn("setDates", `[${this.selected}] out of limit:${this.limit}`);
        } else {
          warn("setDates", "Illegal dates [" + this.selected + "]");
        }

        this.selected = [];
      }
      if (this.views === "auto") {
        if (!isEmpty(this.selected)) {
          this.date = this.parse(getFront(this.selected), this.dateFormat);
        }
        //flat 视图情况下，
        //自动限制endDate为半年后，startDate为当前日期
        //避免因为dom过多导致界面卡顿
        if (isUndefined(this.startDate)) {
          this.startDate = this.date;
        }
        if (isUndefined(this.endDate)) {
          this.endDate = setDate(this.date, 6, "month");
        }
      }
      if (this.views === 1) {
        if (this.doubleSelect && this.selected.length >= 2) {
          if (front === peek) {
            this.selected.pop();
          }
        }
      }
      Observer.$emit("render", { type: "init" });
      Observer.$emit("ready");
    });
  }

  private beforeInit(option: datePickerOptions) {
    if (!option || !parseEl(option.el)) {
      return false;
    }
    this.element = parseEl(option.el);
    this.views = getViews(option.views);
    this.element.className = getClassName(this.element.className, this.views);
    this.doubleSelect =
      isBoolean(option.doubleSelect) && option.doubleSelect === true;
    const selection = parseToInt(option.selection);
    let isMultiSelect = false;

    if (option.selection && !isNaN(selection) && selection >= 2) {
      this.canSelectLength = selection;
      isMultiSelect = true;
    }
    if (this.canSelectLength >= 2) {
      this.doubleSelect = false;
    }

    this.dateFormat = option.format;
    if (!isUndefined(option.startDate) && isDate(option.startDate)) {
      this.startDate = option.startDate;
    }
    if (!isUndefined(option.endDate) && isDate(option.endDate)) {
      this.endDate = option.endDate;
    }
    //選擇日期區間最大限制
    this.limit = this.doubleSelect
      ? !isNaN(option.limit)
        ? option.limit
        : 2
      : 1;

    if (isMultiSelect) {
      this.limit = this.canSelectLength;
    }

    return true;
  }

  public giveMeTheWheel(callback: Function) {
    if (callback && typeof callback === "function") {
      Object.defineProperty(this, "driver", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: callback
      });
    }
  }

  private bindListener() {
    Observer.$on("select", (result: any) => {
      const { type, value } = result;
      if (type === "disabled") {
        return false;
      }
      if (type === "selected") {
        this.selected = value;
      }
      if (type !== "switch") {
        Observer.$emit("update", result);
      }
      //外部不能设置html node的 state
      if (isUndefined(this["driver"])) {
        const currRange: any = this.getRange(value);
        //设置日期区间范围状态
        setNodeRangeState(
          this.element,
          currRange.validDates,
          this.doubleSelect
        );
        //设置激活的日期，开始日期和结束日期的状态
        setNodeActiveState(this.element, value, this.doubleSelect);
      }
    });
    Observer.$on("render", (result: any) => {
      let { type } = result;
      if (type !== "init") {
        this.initDisabled(!isEmpty(this.data));
      }
      if (type === "switch") {
        this.date = setDate(this.date, result.size, "month");
      }
      if (type === "custom" && result.value) {
        this.date = setDate(result.value);
      }
      this.render(this.createMonths(this.date), this.views === "auto");
      //初始化的时候的选中状态
      Observer.$emit("select", {
        type,
        value: this.selected
      });
      Observer.$emit("rendered");
    });
    Observer.$on("renderYearPanel", (result: any) =>
      this.renderYearPanel(result)
    );
    Observer.$on("renderMonthPanel", result => this.renderMonthPanel(result));
    Observer.$on("rendered", () => {
      const bindData = !isEmpty(this.data) && this.canSelectLength < 2;
      const isDoubleSelect = this.doubleSelect;
      const cache = this.selected;
      const isDisabled = (date: string) => !!this.disables[date];
      let selected = this.selected;
      const pickDate = (date: string) => {
        let type = "selected";
        //没有日期，直接返回
        if (!date) {
          return {
            type: "disabled",
            value: []
          };
        }
        const index = selected.indexOf(date);
        //bindData 状态下，且selected的length为0，点击不可选日期，返回
        //无效日期可以当作结束日期，但不能当作开始日期，故选择的日期的前一天是无效日期，返回
        // 如  2018-02-23，2018-02-24 为无效日期，则点击2018-02-24返回无效日期
        const isDisabledDate = isDisabled(date);
        const now = this.parse(date, this.dateFormat);
        const prevDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );
        const prevDateIsInValid = isDisabled(
          this.format(prevDate, this.dateFormat)
        );
        if (
          (bindData && selected.length <= 0 && isDisabledDate) ||
          (isDoubleSelect && prevDateIsInValid && isDisabledDate) ||
          (index >= 0 && isDisabledDate)
        ) {
          return {
            type: "disabled",
            value: []
          };
        }
        //重复选择
        //如选择了 2018-02-04 ~ 2018-02-06
        //但是用户实际想选择的是 2018-02-04~2018-02-05，
        //此时 用户再次选择 2018-02-04，其他日期将被删除
        if (index >= 0) {
          let peek = getPeek(selected);
          let front = getFront(selected);
          //如果选择的最后一个日期不是无效日期
          //则把最后一个日期保留，其他删除
          selected = isUndefined(this.disables[peek]) ? [peek] : [front];
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
          if (selected.length >= 2) {
            //两次选择的日期相同，选择
            let front = getFront(selected);
            let peek = getPeek(selected);
            const diffed = diff(
              this.parse(peek, this.dateFormat),
              this.parse(front, this.dateFormat),
              "days",
              false
            );
            if (diffed === 0) {
              selected = [front];
            } else if (diffed < 0) {
              peek = getPeek(selected);
              if (isDisabled(peek)) {
                selected.pop();
              } else {
                selected.shift();
              }
            } else {
              let range = this.getRange(selected);
              if (range.invalidDates.length > 0 || diffed > this.limit) {
                selected.shift();
              }
            }
          }
          // selected 长度为1 且 唯一的元素还是无效日期，则读取缓存
          if (selected.length <= 1) {
            if (isDisabled(getFront(selected))) {
              type = "disabled";
              selected = cache;
            }
          }
        }

        return {
          type,
          value: selected
        };
      };
      const multiPick = (date: string) => {
        const index = selected.indexOf(date);
        const isDisabledDate = isDisabled(date);
        if (!date || isDisabledDate) {
          return {
            type: "disabled",
            value: selected
          };
        }

        if (index >= 0) {
          let temp = [];

          for (let i = 0; i < selected.length; i++) {
            if (selected[i] !== date) {
              temp.push(selected[i]);
            }
          }
          selected = temp;
        } else {
          selected.push(date);
        }
        if (selected.length > this.limit) {
          selected = [date];
        }
        return {
          type: "selected",
          value: selected
        };
      };
      const nodeList = this.element.querySelectorAll(".calendar-cell");
      if (!isEmpty(this.disables)) {
        Observer.$emit("disabled", {
          nodeList,
          dateList: this.disables
        });
      }
      if (bindData) {
        Observer.$emit("data", {
          data: this.data,
          nodeList
        });
      }

      if (isUndefined(this["driver"])) {
        for (let i = 0; i < nodeList.length; i++) {
          let node = nodeList[i];
          node.addEventListener("click", () => {
            const date = attr(node, "data-date");
            Observer.$emit(
              "select",
              this.canSelectLength > 2 ? multiPick(date) : pickDate(date)
            );
          });
        }
      } else {
        const emitData = {
          disables: this.disables,
          data: this.data,
          element: this.element,
          date: this.date,
          startDate: this.startDate,
          endDate: this.endDate,
          limit: this.limit,
          doubleSelect: this.doubleSelect,
          dateFormat: this.dateFormat,
          selected: this.selected,
          emit: this.emit
        };
        this["driver"](nodeList, emitData);
      }

      //无开始和结束日期，则可以打开年份和月份面板
      if (!this.startDate && !this.endDate) {
        //打開年份列表
        this.element
          .querySelector(".calendar-title")
          .addEventListener("click", () =>
            Observer.$emit("renderYearPanel", true)
          );
      }
    });
    Observer.$on("custom", (result: any) => {
      if (!result.value) {
        Observer.$remove("custom");
        return false;
      }
      Observer.$emit("render", result);
    });
  }

  constructor(option: datePickerOptions) {
    let canInit = this.beforeInit(option);
    if (!canInit) {
      return;
    }
    this.bindListener();
    this.init();
  }
}
