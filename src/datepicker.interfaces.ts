export interface datePickerOptions {
    el: string | HTMLElement;
    to?: Date;
    from?: Date;
    limit?: number;
    format?: string;
    doubleSelect?: boolean;
    views?: number | string,
    disables?: any,
    startDate?: Date,
    endDate?: Date
}


export interface classTemplate {
    startDate: Date,
    language: any,
    infiniteMode?: boolean,
    views: number | string,
    dateFormat:string,
    diff:number
}

export interface initRangeOptions {
    collector: HTMLElement;
    collection: HTMLCollection;
    data: Array<string>;
    isDouble: boolean;
    parse?: Function;
    format?: Function;
    inDates: Function;
    isInit: boolean;
    active?: boolean,
    disables: any,
    dateFormat:string

}


export interface pickerHandler {
    element: any;
    selected: Array<any>;
    isDouble: boolean;
    limit: number;
    inDates: Function;
    bindData: boolean,
    dateFormat: string,
    emitter?: Function,
    infiniteMode: boolean

}

export interface disable {
    dates?: Array<any>;
    days?: Array<number>;
    to?: Date | string;
    from?: Date | string;
}

export interface handleDoubleSelect {
    dateFormat: string,
    selected: Array<string>,
    limit: number,
    date: string,
}