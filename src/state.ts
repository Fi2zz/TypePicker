import {
  defaultI18n,
  diffDates,
  diffMonths,
  parse,
  format,
  Disabled,
  createDates,
  formatHeading
} from "./datepicker.helpers";

import { TypePickerState, SelectionItem } from "./datepicker.interface";

const state: TypePickerState = {
  selection: 1,
  startDate: null,
  endDate: null,
  format: "YYYY-MM-DD",
  limit: 1,
  i18n: defaultI18n(),
  useInvalidAsSelected: false,
  selected: [],
  views: 1
};

export function setState(partial: Partial<TypePickerState>, next?: Function) {
  if (partial) {
    for (let key in partial) {
      if (state.hasOwnProperty(key)) {
        state[key] = partial[key];
      }
    }
  }
}
export function getState(): TypePickerState {
  return state;
}

export class Selection {
  size = 1;
  list: any[] = [];
  setSize(size: number) {
    this.size = size;
  }
  last = () => this.list[this.length() - 1];
  front = () => this.list[0];
  length = () => this.list.length;

  push = (date: SelectionItem) => (afterPush: Function): void => {
    this.beforePush(date);
    this.list.push(date);
    this.afterPush();
    const id = setTimeout(function afterQueueReset() {
      afterPush();
      clearTimeout(id);
    }, 0);
  };
  beforePush(date) {
    for (let item of this.list) {
      if (item && item.value === date.value) {
        if (this.size === 2) {
          this.shift();
        } else {
          this.list = [];
        }
      }
    }
  }

  afterPush() {
    let temp = {};
    let list = [];
    for (let item of this.list) {
      if (!temp[item.value]) {
        temp[item.value] = 1;
        list.push(item);
      }
    }
    this.list = list;
  }
  clean = () => (this.list = []);
  shift = () => this.list.shift();
  pop = () => this.list.pop();

  has(value: string) {
    return this.list.filter(item => item && item.value === value).length > 0;
  }
  map = mapper => this.list.map(mapper);
  findIndex(item) {
    for (let date of this.list) {
      if (date.value === item) {
        return this.list.indexOf(date);
      }
    }
    return -1;
  }
}

/**
 *
 * @param date
 * @param start
 * @param end
 */
export const checkSwitchable = (date: Date) => {
  const { startDate, endDate, views } = getState();
  if (views > 2) {
    return [false, false];
  }
  const diffEnd = diffMonths(endDate, date);
  const diffStart = diffMonths(date, startDate);
  return [
    diffStart <= 0 && diffEnd > 0,
    diffStart > 0 && diffEnd <= (views === 1 ? 0 : 1)
  ];
};
export function useFormatDate(date: Date): string {
  return format(date, getState().format);
}

export function useParseDate(date: Date | string): Date {
  return parse(date, getState().format);
}

export const findDisabledBeforeStartDate = (
  startDate: Date | string,
  dateBeforeStartDate: Date | string
) => {
  startDate = useParseDate(startDate) as Date;
  dateBeforeStartDate = useParseDate(dateBeforeStartDate) as Date;
  if (!startDate || !dateBeforeStartDate) {
    return [];
  }
  return createDates(
    startDate,
    diffDates(dateBeforeStartDate, startDate, true),
    -1
  ).map(useFormatDate);
};

export function usePanelTitle(year, month) {
  const { i18n } = getState();
  return formatHeading(i18n.title, year, i18n.months[month]);
}
export enum viewTypes {
  single = 1,
  double = 2,
  auto = "auto",
  undefined = 1,
  null = 1
}

export enum events {
  click = "click"
}

export enum dataset {
  date = "data-date",
  disabled = "data-disabled"
}

export const disables = new Disabled();
export const queue = new Selection();
