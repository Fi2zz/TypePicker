import { diff, createDate, between } from "./datepicker.helpers";
import { padding } from "./util";
function getDates(date): number {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)
  ).getUTCDate();
}

const getFirstWeek = (year, month) => {
  const size = new Date(year, month, 1).getDay();
  const list = [];
  for (let i = 0; i < size; i++) {
    list.push({
      orign: null,
      month,
      year,
      day: i,
      disabled: true,
      selected: false
    });
  }
  return list;
};
const getFirstDate = (date, size) => {
  const dates = [];

  for (let i = 0; i <= size; i++) {
    const now = new Date(date.getFullYear(), date.getMonth() + i, 1);
    dates.push({
      month: now.getMonth(),
      year: now.getFullYear(),
      size: getDates(now)
    });
  }

  return dates;
};
export class TemplateData {
  /**
   *
   * @param queue
   * @param formater
   * @param parser
   * @param should
   * @returns Array<string>
   */
  static mapQueue(
    queue,
    formater: Function,
    parser: Function,
    should: boolean
  ): any {
    const length = queue.length();

    if (length <= 0) {
      return [];
    }

    if (!should) {
      return queue.map(item => item.value);
    }

    const first = queue.front();
    const last = queue.last();

    if (first.value === last.value) {
      return [];
    }
    const start = parser(first.value);
    const end = parser(last.value);
    const size = diff(end, start, "days");
    return createDate({
      date: start,
      size: size
    }).map(formater);
  }

  /**
   *
   * @param date
   * @param size
   * @param heading
   * @returns {any[]}
   */
  static mapMonths(
    date: { getFullYear: () => number; getMonth: () => number },
    size: number,
    heading: Function
  ): any[] {
    return getFirstDate(date, size).map(item => {
      item.heading = heading(item);
      item.dates = TemplateData.getDates(item);
      return item;
    });
  }

  static getDates({ size, year, month }) {
    //get days of first week at each month
    const dates = getFirstWeek(year, month);
    for (let i = 0; i < size; i++) {
      const now = new Date(year, month, i + 1);
      dates.push({
        origin: now,
        day: now.getDay(),
        date: now.getDate(),
        month: now.getMonth(),
        year: now.getFullYear(),
        disabled: false,
        selected: false
      });
    }
    return dates;
  }

  static getBetweens(date, size, format) {
    let dates = [];

    for (let i = 0; i < size; i++) {
      const now = new Date(
        date.getFullYear(),
        date.getMonth(),
        i + date.getDate()
      );
      dates.push(format(now));
    }
    return dates;
  }
}
