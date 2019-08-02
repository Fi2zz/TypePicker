export interface TypePickerConfig {
    date?: Date | null;
    size?: number;
    selection?: number;
    useInvalidAsSelected?: boolean;
}
export interface TypePickerDate {
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
export declare type TypePickerData = TypePickerMonth[];
export default function TypePicker(option: TypePickerConfig): void;
export {};
