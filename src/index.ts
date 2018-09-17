interface datePickerOptions {
  el: string | HTMLElement;
  limit?: number;
  format?: string;
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
  isFunction,
  getPeek,
  getFront,
  parseToInt,
  nextTick,
  simpleListToMap,
  noop
} from "./util";
import template from "./datepicker.template";
import {
  getClassName,
  getViews,
  getDisableDates,
  getDisabledDays,
  parseEl,
  Observer,
  parse,
  format,
  setDate,
  diff,
  getDates,
  getMonthsByYear,
  getYearsByDate
} from "./datepicker.helpers";

class TypePicker {
  private setState<Function>(state: any, next?: Function | any) {
    this.state = {
      ...this.state,
      ...state
    };
    setTimeout(() => {
      this.render(this.createMonths());
      typeof next === "function" && next();
    }, 0);
  }

  state: any = {
    selection: <number>1,
    views: <number | string>1,
    date: <Date>new Date(),
    startDate: <Date>null,
    endDate: <Date>null,
    data: <any>{},
    selected: <string[]>[],
    reachEnd: <boolean>false,
    reachStart: <boolean>false,
    dateFormat: <string>null,
    doubleSelect: <boolean>false,
    limit: <number>1,
    disables: <any>{},
    language: <any>{
      title: (year, month) =>
        `${year}年 ${this.state.language.months[month]}月`,
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
    }
  };

  static diff = diff;
  private element: any = null;
  private language: any = {
    title: (year, month) => `${year}年 ${this.language.months[month]}月`,
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
    if (this.state.doubleSelect) {
      if (dates.length > 2) {
        dates = dates.slice(0, 2);
      }
      start = <any>dates[0];
      end = <any>dates[dates.length - 1];
      const startDate = isDate(start)
        ? start
        : this.parse(start, this.state.dateFormat);
      const endDate = isDate(end)
        ? end
        : this.parse(end, this.state.dateFormat);
      datesList = [this.format(startDate, this.state.dateFormat)];
      if (start !== end) {
        datesList.push(this.format(endDate, this.state.dateFormat));
      }

      let d = new Date();
      let currDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (
        startDate < currDate ||
        endDate < currDate ||
        startDate > this.state.endDate ||
        endDate > this.state.endDate
      ) {
        warn("setDates", "selected dates are illegal");
        datesList = [];
      }
    } else {
      const d = dates[dates.length - 1];
      datesList = [isDate(d) ? this.format(d, this.state.dateFormat) : d];
    }

    this.setState({
      selected: datesList
    });
  }

  public setDisabled(param: disable) {
    let state = <any>{};

    if (
      !param ||
      (isPlainObject(param) && Object.keys(param).length <= 0) ||
      !isArray(param.dates) ||
      !isArray(param.days)
    ) {
      return false;
    }

    let dateList = [];
    let dayList = [];

    if (isArray(param.dates)) {
      dateList = param.dates
        .map((date: any) => {
          let parsed = this.parse(<any>date, this.state.dateFormat);
          if (isDate(parsed)) {
            return this.format(parsed, this.state);
          }
        })
        .filter((item: string) => !!item);
    }

    let fromDate: any;
    let toDate: any;
    const to = param.to;
    const from = param.from;

    if (from) {
      if (isDate(from)) {
        fromDate = from;
      } else {
        const parsed = this.parse(<string>from, this.state.dateFormat);
        if (isDate(parsed)) {
          fromDate = parsed;
        } else {
          return false;
        }
      }
      state.endDate = setDate(fromDate);
    }
    if (to) {
      if (isDate(to)) {
        toDate = to;
      } else {
        const parsed = this.parse(<string>to, this.state.dateFormat);
        if (isDate(parsed)) {
          toDate = parsed;
        } else {
          return false;
        }
      }
      state.endDate = setDate(toDate);
    }

    if (isArray(param.days)) {
      dayList = param.days.filter(item => {
        let parsed = parseToInt(item);
        return !isNaN(parsed) && parsed >= 0 && parsed <= 6;
      });
    }

    this.setState({
      ...state,
      disables: merge(
        getDisableDates(
          this.state.startDate,
          this.state.endDate,
          this.state.dateFormat,
          this.state.data && this.state.selection <= 2
        ),
        getDisabledDays(
          this.state.startDate,
          this.state.endDate,
          dayList,
          this.state.dateFormat
        ),
        simpleListToMap(dateList)
      )
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
    if (isFunction(cb) && this.state.selection <= 2) {
      const result = cb();
      if (isPlainObject(result)) {
        const map = {};
        for (let key in result) {
          let date = this.parse(key, this.state.dateFormat);
          if (date instanceof Date) {
            map[key] = result[key];
          }
        }
        this.setState({ data: map });
      }
    }
  }

  private createMonths() {
    const { date, selected, dateFormat } = this.state;
    let ranger = selected => {
      let start = selected[0];
      let end = selected[selected.length - 1];
      let startDate = this.parse(start, dateFormat);
      let endDate = this.parse(end, dateFormat);
      let days = diff(endDate, startDate, "days");
      let dates = [];
      for (let i = 0; i <= days; i++) {
        let date = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() + i
        );
        dates.push(this.format(date, dateFormat));
      }
      return function(date) {
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
    };
    const monthSize =
      this.state.views == 2
        ? 1
        : this.state.views === "auto"
          ? diff(this.state.endDate, this.state.startDate)
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
        let formatted: any = this.format(lateMonthDate, this.state.dateFormat);
        dates[formatted] = {
          date: false,
          day: false,
          className: "disabled empty"
        };
      }
      for (let i = 0; i < item.dates; i++) {
        let date = new Date(item.year, item.month, i + 1);
        let formatted = this.format(date, this.state.dateFormat);
        dates[formatted] = {
          date: `${date.getDate()}`,
          day: `${date.getDay()}`,
          className: ranger(selected)(formatted)
        };
      }
      return {
        heading: this.language.title(item.year, item.month),
        year: item.year,
        month: item.month,
        dates
      };
    });
  }

  private beforeRender(option: datePickerOptions) {
    if (!option || !parseEl(option.el)) {
      return false;
    }

    this.element = parseEl(option.el);
    let isMultiSelect = false;
    let states: any = {
      selection: option.selection || 1,
      dateFormat: option.format
    };
    if (option.selection > 2) {
      isMultiSelect = true;
    }
    if (isDate(option.startDate)) {
      states.startDate = option.startDate;
    }
    if (isDate(option.endDate)) {
      states.endDate = option.endDate;
    }

    this.setState(
      {
        views: getViews(option.views),
        limit: isMultiSelect
          ? option.selection
          : option.limit
            ? option.limit
            : 1,
        doubleSelect: option.selection && option.selection === 2,
        ...states
      },
      () => {
        this.element.className = getClassName(
          this.element.className,
          this.state.views
        );
      }
    );
    return true;
  }

  private render(data) {
    const { views, reachStart, reachEnd } = this.state;

    this.element.innerHTML = template({
      renderWeekOnTop: views === "auto",
      data,
      week: this.language.week,
      extraPanel: null,
      reachStart: reachStart,
      reachEnd: reachEnd
    });
    this.afterRender();
  }

  private afterRender() {
    //日期切换
    const prev = this.element.querySelector(".calendar-action-prev");
    const next = this.element.querySelector(".calendar-action-next");

    const updater = (size: number, reachEnd: boolean, reachStart: boolean) => {
      this.setState(
        {
          reachEnd,
          reachStart,
          date: setDate(this.state.date, size, "month")
        },
        () => {
          Observer.$emit("select", {
            type: "switch",
            value: this.state.selected
          });
        }
      );
    };

    if (prev && next) {
      let { endDate, startDate, date } = this.state;
      const endGap = endDate ? diff(endDate, date) : 1;
      const startGap = endDate ? diff(date, startDate) : 2;

      let reachStart = startGap < 1 && endGap >= 1;
      let reachEnd = startGap >= 1 && endGap < 1;

      if (!this.state.reachStart) {
        prev.addEventListener("click", () => updater(-1, reachEnd, reachStart));
      }
      if (!this.state.reachEnd) {
        next.addEventListener("click", () => updater(1, reachEnd, reachStart));
      }
    }

    const bindData = !isEmpty(this.state.data) && this.state.selection <= 2;
    const isDoubleSelect = this.state.doubleSelect;
    const cache = this.state.selected;
    const isDisabled = (date: string) => !!this.state.disables[date];
    let selected = this.state.selected;

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
      const now = this.parse(date, this.state.dateFormat);
      const prevDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      );
      const prev = this.format(prevDate, this.state.dateFormat);
      const prevDateIsInValid = isDisabled(prev);
      const nextDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      const next = this.format(nextDate, this.state.dateFormat);
      const nextDateIsInValid = isDisabled(next);
      if (
        (bindData && selected.length <= 0 && isDisabledDate) ||
        (isDoubleSelect &&
          prevDateIsInValid &&
          isDisabledDate &&
          nextDateIsInValid) ||
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
        selected = isUndefined(this.state.disables[peek]) ? [peek] : [front];
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
            this.parse(peek, this.state.dateFormat),
            this.parse(front, this.state.dateFormat),
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
            if (range.invalidDates.length > 0 || diffed > this.state.limit) {
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
      if (selected.length > this.state.limit) {
        selected = [date];
      }
      return {
        type: "selected",
        value: selected
      };
    };
    const nodeList = this.element.querySelectorAll(".calendar-cell");
    if (!isEmpty(this.state.disables)) {
      Observer.$emit("disabled", {
        nodeList,
        dateList: this.state.disables
      });
    }
    if (bindData) {
      Observer.$emit("data", {
        data: this.state.data,
        nodeList
      });
    }

    for (let i = 0; i < nodeList.length; i++) {
      let node = nodeList[i];
      node.addEventListener("click", () => {
        const date = attr(node, "data-date");
        Observer.$emit(
          "select",
          this.state.selection > 2 ? multiPick(date) : pickDate(date)
        );
      });
    }
  }

  private getRange(data: Array<any>) {
    const startDate = getFront(data);
    const endDate = getPeek(data);
    const invalidDates: Array<string> = [];
    const validDates: Array<string> = [];
    let limit = this.state.limit;
    let outOfRange = false;

    if (startDate && endDate) {
      let start: Date;
      let end: Date;
      if (!isDate(startDate)) {
        start = <Date>this.parse(<string>startDate, this.state.dateFormat);
      } else {
        start = <Date>startDate;
      }
      if (!isDate(endDate)) {
        end = <Date>this.parse(<string>endDate, this.state.dateFormat);
      } else {
        end = <Date>endDate;
      }
      let gap = diff(<Date>end, <Date>start, "days");

      if (gap <= limit) {
        for (let i = 0; i < gap; i++) {
          let date = setDate(start, i);
          let formatted = this.format(date, this.state.dateFormat);
          if (this.state.disables[formatted]) {
            invalidDates.push(formatted);
          } else {
            if (formatted !== startDate && formatted !== endDate) {
              validDates.push(formatted);
            }
          }
        }
        if (end < start) {
          outOfRange = true;
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

  private update() {
    let states: any = {
      disables: {},
      selected: this.state.selected
    };
    const bindData = !isEmpty(this.state.data) && this.state.selection <= 2;
    //去掉data里的无效日期
    const validateData = ({
      disables,
      data,
      startDate,
      endDate,
      dateFormat
    }) => {
      if (!bindData) {
        return {
          disables
        };
      }
      // let data = this.data;
      //此处未排序日期，直接取this.data的最后一个key
      //排序在setData里做

      let gap = diff(startDate, endDate, "days", true);
      for (let i = 0; i < gap; i++) {
        let date = this.format(setDate(startDate, i), dateFormat);
        if (isUndefined(data[date])) {
          disables[date] = date;
        } else {
          delete data[date];
        }
      }

      endDate = this.parse(getPeek(Object.keys(data)), dateFormat);

      return {
        disables,
        data,
        endDate
      };
    };
    //校验初始selected
    const validateSelected = selected => {
      const front = getFront(selected);
      const peek = getPeek(selected);
      let initRange = this.getRange(selected);
      let canInitWithSelectedDatesWhenDataBinding = () => {
        return (
          (initRange.invalidDates.length > 0 || initRange.outOfRange) &&
          bindData
        );
      };
      if (canInitWithSelectedDatesWhenDataBinding() || initRange.outOfRange) {
        if (initRange.outOfRange) {
          warn("setDates", `[${selected}] out of limit:${this.state.limit}`);
        } else {
          warn("setDates", "Illegal dates [" + selected + "]");
        }
        selected = [];
      }
      if (this.state.views === "auto") {
        //flat 视图情况下，
        //自动限制endDate为半年后，startDate为当前日期
        //避免因为dom过多导致界面卡顿
        if (isUndefined(this.state.startDate)) {
          states.startDate = this.state.date;
        }
        if (isUndefined(this.state.endDate)) {
          states.endDate = setDate(this.state.date, 6, "month");
        }
      }
      if (this.state.views === 1) {
        if (this.state.doubleSelect && selected.length >= 2) {
          if (front === peek) {
            selected.pop();
          }
        }
      }
      return selected;
    };
    const setViewDate = () => {
      if (this.state.selected.length > 0) {
        return this.parse(getFront(this.state.selected), this.state.dateFormat);
      } else {
        return this.state.startDate ? new Date() : this.state.startDate;
      }
    };

    const { disables, data, endDate } = validateData(this.state);

    if (endDate) {
      states.endDate = endDate;
    }
    this.setState({
      ...states,
      disables,
      selected: validateSelected(this.state.selected),
      date: setViewDate(),
      data: data
    });
  }

  constructor(option: datePickerOptions) {
    let canInit = this.beforeRender(option);
    if (!canInit) {
      return;
    }

    Observer.$on("select", (result: any) => {
      const { type, value } = result;
      if (type === "disabled") {
        return false;
      }
      this.setState(
        {
          selected: value
        },
        () => {
          if (type !== "switch") {
            Observer.$emit("update", result);
          }
        }
      );
    });

    nextTick(this.update.bind(this));
  }
}
export default TypePicker;
