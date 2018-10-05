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

export interface disable {
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
  direction?: number;
  position?: string;
  index?: number;
}



export interface template {
  data?: Array<any>;
  i18n: any;
  week: Array<any>;
  reachStart: boolean;
  reachEnd: boolean;
}

export interface TagData {
  value?: string;
  item?: Date;
  index?: number;
  isEnd?: boolean;
  isStart?: boolean;
  isDisabled?: boolean;
  withRange?: boolean;
}

export interface monthItem {
  date: Date;
  size: number;
  heading: string;
}

export interface mapDates {
  queue: string[];
  withRange: boolean;
  format: Function;
  disables: any;
}

export interface TemplateDataInterface {
  date: Date;
  size: number;
  queue: any[];
  withRange: boolean;
  format: Function;
  heading: Function;
  parse: Function;
  disables: {
    days: number[];
    dates: string[];
  };
}
