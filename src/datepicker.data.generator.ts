import { createDates, createDateDataOfMonth } from "./datepicker.helpers";
import { classname } from "./datepicker.template";
import { createList, isNotEmpty } from "./util";
export class MonthPanelData {
  data = [];
  /**
   *
   * @param date
   * @param size
   * @param heading
   * @returns {any[]}
   */
  mapMonths(date: Date, size: number) {
    const getFirstDateOfMonth = index =>
      new Date(date.getFullYear(), date.getMonth() + index, 1);
    this.data = createList(size, getFirstDateOfMonth).map(date => {
      const dates = new Date(
        Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)
      ).getUTCDate();

      const day = date.getDay();
      //get days of first week at each month
      const firstWeek = createList(day, day => ({
        year: date.getFullYear(),
        month: date.getMonth(),
        day
      })).map(item => createDateDataOfMonth(null, true, item));
      const restWeeks = createDates(date, dates - 1).map(now =>
        createDateDataOfMonth(now)
      );
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        dates: [...firstWeek, ...restWeeks]
      };
    });
  }

  mapDates(range, useFormatDate, usePanelTitle) {
    this.data = this.data.map(item => {
      const dates = item.dates.map(item => {
        const value = useFormatDate(item.origin);
        const date = item.date;

        const [inRange, isStart, isEnd, selected, inQueue, inDisabled] = range(
          item.origin,
          value,
          item.day
        );

        const disabled = inDisabled || item.disabled;

        const className = classname({
          isActive: inQueue,
          isStart,
          isEnd,
          inRange,
          isDisabled: disabled,
          isSelected: inQueue,
          isEmpty: !isNotEmpty(value)
        });

        return {
          value,
          disabled,
          selected,
          date,
          className
        };
      });

      return {
        dates,
        heading: usePanelTitle(item.year, item.month)
      };
    });
    return this.data;
  }

  mapDisabled(disables) {
    const data = this.data;

    const result = [];
    for (let item of data) {
      let dates = item.dates;
      for (let dateItem of dates) {
        if (dateItem.disabled && dateItem.date) {
          result.push(dateItem.value);
        }
      }
    }
    disables = result;
  }
}
