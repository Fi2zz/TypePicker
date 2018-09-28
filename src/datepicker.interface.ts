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
  days: number;
  dateFormat?: string;
  direction?: number;
  position?: string;
  index?: number;
}

export interface nodeClassName {
  date: string;
  dates: string[];
  onlyActive: boolean;
}

export interface template {
  renderWeekOnTop?: boolean;
  extraPanel?: { type: string; list?: any[] };
  extraYearsList?: any;
  data?: Array<any>;
  week: Array<any>;
  reachStart: boolean;
  reachEnd: boolean;
}
