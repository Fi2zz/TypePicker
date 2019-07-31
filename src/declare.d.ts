type TimexDate = Date;
interface TypePickerConfig {
  date: Date | null;
  size: number;
  selection?: number;
  useInvalidAsSelected?: boolean;
}
interface TypePickerDisables {
  find: (date: Date) => boolean;
}
interface TypePickerSelected {
  value?: Date;
  disabled?: boolean;
}
interface TimexCreateDate {
  year?: number;
  date?: number;
  month?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}
interface TypePickerMatch {
  condition: Function | boolean;
  value?: any;
  expected?: any;
}

interface TypePickerDate {
  date: Date;
  invalid: boolean;
  disabled: boolean;
  status?: {
    isActive?: boolean;
    isStart?: boolean;
    isEnd?: Boolean;
    inRange?: Boolean;
  };
}
interface TypePickerMonth {
  year: number;
  month: number;
  dates: TypePickerDate[];
}
type TypePickerData = TypePickerMonth[];
