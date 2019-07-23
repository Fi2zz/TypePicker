type TypePickerSetDates = string | Date[];

interface TypePickerOptions {
  el?: string | HTMLElement;
  limit?: number;
  format?: string;
  views?: number | string;
  startDate?: Date;
  endDate?: Date;
  selection?: number;
  infinite?: boolean;
  useInvalidAsSelected?: boolean;
  typeNameOfUpdate?: string;
  typeNameOfSelect?: string;
}
interface TypePickerState extends Partial<TypePickerOptions> {
  i18n: TypePickerI18n;
  selected: Array<any>;
  views: number;
  viewType: String;
  date: Date | null;
}

interface TypePickerI18n {
  title: string;
  days: string[];
  months: string[];
}

interface TypePickerDisableOptions {
  dates?: Array<any>;
  days?: Array<number>;
  to?: Date | string;
  from?: Date | string;
}

interface TypePickerTagData {
  className: string;
  value: string | undefined;
  disabled: boolean | undefined;
  day: number;
  date: string;
  label: number | string;
  invalid: boolean;
}
interface TypePickerSelectionItem {
  selected?: boolean;
  value?: string;
  disabled?: boolean;
}
interface TypePickerSelectionInterface {
  size: number;
  list: any[];
  setSize: (size: number) => void;
  setCanPushInvalid: (can: boolean) => void;
  useInvalidAsSelected: boolean;
  last: () => TypePickerSelectionItem;
  front: () => TypePickerSelectionItem;
  length: () => number;
  isEmpty: () => boolean;
  isFilled: () => boolean;
  push: (date: TypePickerSelectionItem) => (afterPush: () => void) => void;
  beforePush: (date: TypePickerSelectionItem) => void;
  afterPush: () => void;
  clean: () => void;
  shift: () => void;
  pop: () => void;
  has: (item: string) => boolean;
}
interface TypePickerDisabledInterface {
  days: number[];
  dates: string[];
  set: (partial: any) => void;
  find: (date: Date) => boolean;
  useFormatDate: (date: Date | string) => string;
  getState: () => TypePickerState;
}
interface useCalendarData {
  state: TypePickerState;
  date: Date;
  queue: TypePickerSelectionInterface;
  disables: TypePickerDisabledInterface;
  useFormatDate: (date: Date | string) => string;
  useParseDate: (date: Date | string) => Date | null;
}

declare abstract class TypePickerCore {
  public i18n: Function;
  public disable: Function;
  public setDates: Function;
  protected setState?: Function;
  public switch: Function;
  public subscribe;
  public publish;
  public select: Function;
  constructor(option: TypePickerOptions);
}
