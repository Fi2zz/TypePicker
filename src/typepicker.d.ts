interface TypePickerOptions {
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

interface TypePickerState extends Partial<TypePickerOptions> {
  i18n: TypePickerI18n;
  selected: Array<any>;
  views: number;
  viewType: String;
}

interface TypePickerI18n {
  title: string;
  days: string[];
  months: string[];
}

interface TypePickerDisable {
  dates?: Array<any>;
  days?: Array<number>;
  to?: Date | string;
  from?: Date | string;
}

interface DateTagData {
  className: string;
  value: string | undefined;
  disabled: boolean | undefined;
  day: number;
  date: string;
  label: number | string;
  invalid: boolean;
}
interface SelectionItem {
  selected?: boolean;
  value?: string;
  disabled?: boolean;
  isInitialValue?: boolean;
}
