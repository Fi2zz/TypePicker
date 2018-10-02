export interface datepicker {
  el: string | HTMLElement;
  limit?: number;
  format?: string;
  views?: number | string;
  startDate?: Date;
  endDate?: Date;
  selection?: number;
  infinite?: boolean;
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

export interface generateDate {
  date: Date;
  size: number;
  dateFormat?: string;
  direction?: number;
  position?: string;
  index?: number;
}

export interface nodeClassName {
  index: number;
  isEnd: boolean;
  isStart: boolean;
}

export interface template {
  data?: Array<any>;
  i18n: any;
  week: Array<any>;
  reachStart: boolean;
  reachEnd: boolean;
}

export interface tagData {
  date: string | number | undefined;
  day: string | number | undefined;
  className?: string | undefined;
}



export interface mapDates {
  year: number;
  month: number;
  size: number;
}
