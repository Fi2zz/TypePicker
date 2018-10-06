import {
  mapDates,
  monthItem,
  TagData,
  TemplateDataInterface
} from "./datepicker.interface";
import { diff, createDate, between } from "./datepicker.helpers";
import { isArray, isDef, padding } from "./util";

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

  static findDisabled(data) {
    const result = [];
    for (let item of data) {
      let dates = item.dates;
      for (let dateItem of dates) {
        if (dateItem.disabled && dateItem.date) {
          result.push(dateItem.value);
        }
      }
    }
    return result;
  }

  static findDisabledInQueue({ queue, disables, dateFormat, parse }) {
    let date$1 = queue[0];
    let date$2 = queue[queue.length - 1];

    if (date$1 === date$2) {
      return 0;
    }
    date$1 = parse(date$1);
    date$2 = parse(date$2);
    let dates = between(date$1, date$2, dateFormat)
      .map((_, index) => (disables.indexOf(_) >= 0 ? index : -1))
      .filter(v => isDef(v) && v >= 0);

    return isArray(dates) ? dates : [dates];
  }

  static setInitDatesToQueue(disables, selected, enqueue) {
    if (selected.length > 0) {
      let initDisables = [];
      for (let item of selected) {
        let isDisable = disables.indexOf(item) >= 0;
        if (isDisable) {
          initDisables.push(item);
        }
      }

      let f1 = selected[0];

      if (
        selected.length !== initDisables.length &&
        disables.indexOf(f1) <= -1
      ) {
        for (let item of selected) {
          let isDisable = disables.indexOf(item) >= 0;
          enqueue(item, disables, isDisable);
        }
      }

      return [];
    } else {
      return [];
    }
  }
}
