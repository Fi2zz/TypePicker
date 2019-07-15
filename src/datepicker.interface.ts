export interface TypePickerOptions {
  el: string | HTMLElement;
  limit?: number;
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

export interface DateTagData {
  className: string;
  value: string | undefined;
  disabled: boolean | undefined;
  day: number;
  date: number;
}
export interface SelectionItem {
  selected?: boolean;
  value?: string;
  disabled?: boolean;
}
