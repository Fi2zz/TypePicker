export interface TypePickerOptions {
  el: string | HTMLElement;
  limit?: number | boolean;
  format?: string;
  views?: number | string;
  startDate?: Date;
  endDate?: Date;
  selection?: number;
  infinite?: boolean;
  useInvalidAsSelected?: boolean;
}

export interface TypePickerState extends Partial<TypePickerOptions> {
  i18n: TypePickerI18n;
  selected: Array<any>;
}

export interface TypePickerI18n {
  title: string;
  days: string[];
  months: string[];
}

export interface TypePickerDisable {
  dates?: Array<any>;
  days?: Array<number>;
  to?: Date | string;
  from?: Date | string;
}

export interface TagData {
  tag: string;
  props?: any;
  children?: any;
  render?: Boolean;
}

export interface DateTagData {
  className: string;
  value: string | undefined;
  disabled: boolean | undefined;
  day: number;
  date: number;
}

export interface SelectionInterface {
  size: number;
  useRange: boolean;
}
export interface SelectionItem {
  value?: string;
  disabled?: boolean;
  selected?: boolean;
}
