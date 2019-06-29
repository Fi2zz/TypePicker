export interface datepicker {
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

export interface I18n {
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
  parse: Function;
  index?: Function;
}

export interface State {
  selection: number;
  views: number | string;
  startDate: Date | null;
  endDate: Date | null;
  reachStart: boolean;
  reachEnd: boolean;
  dateFormat: string;
  limit: number | boolean;
  i18n: I18n;
  date: Date;
  lastSelectedItemCanBeInvalid: boolean;
  selected: Array<any>;
  panelSize: number;
}
