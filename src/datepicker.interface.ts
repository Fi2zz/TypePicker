export interface TypePickerOptions {
  el: string | HTMLElement;
  limit?: number;
  format?: string;
  views?: number | string;
  startDate?: Date;
  endDate?: Date;
  selection?: number;
  infinite?: boolean;
  lastSelectedItemCanBeInvalid?: boolean;
}

export interface TypePickerI18n {
  title: string;
  days: string[];
  months: string[];
}

export interface Disable {
  dates?: Array<any>;
  days?: Array<number>;
  to?: Date | string;
  from?: Date | string;
}

export interface node {
  tag: string;
  props?: any;
  children?: any;
  render?: Boolean;
}

export interface CreateDate {
  date: Date;
  size: number;
  dateFormat?: string;
}

export interface DateTag {
  className: string;
  value: string | undefined;
  disabled: boolean | undefined;
  day: number;
  date: number;
}

export interface QueueInterface {
  size: number;
  limit: boolean | number;
  useRange: boolean;
  useParseDate: Function;
  useFormatDate: Function;
}

export interface QueueItem {
  value?: string;
  disabled?: boolean;
  selected?: boolean;
}

export interface Disables {
  days: number[];
  dates: string[];
  update: Function;
  setAll: Function;
  find: Function;
  all: string[];
  findDate: Function;
  findDay: Function;
  findBoth: Function;
  oneOf: Function;
  startDate: Date | null;
  endDate: Date | null;
  outofRange: Function;
  some: Function;
}
export interface TypePickerState {
  selection: number;
  startDate: Date | null;
  endDate: Date | null;
  dateFormat: string;
  limit: number | boolean;
  i18n: TypePickerI18n;
  lastSelectedItemCanBeInvalid: boolean;
  selected: Array<any>;
}
