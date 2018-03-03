export interface datePickerOptions {
    el: string | HTMLElement;
    to?: Date ;
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
    endDate: Date,
    language: any,
    infiniteMode: boolean,
    dateFormatter: Function,
    views: number | string
}

export interface initRangeOptions {
    collector: HTMLElement;
    collection: HTMLCollection;
    data: Array<string>;
    isDouble: boolean;
    parse: Function;
    format: Function;
    inDates: Function;
    isInit: boolean;
    active?: boolean,
    disables: any

}


export interface pickerHandler {
    element: any;
    selected: Array<any>;
    isDouble: boolean;
    limit: number;
    inDates: Function;
    bindData: boolean,
    dateFormat: string,
    emitter: Function

}

export interface disable {
    dates?: Array<any>;
    days?: Array<number> ;
}

export interface handleDoubleSelect {
    dateFormat: string,
    selected: Array<string>,
    limit: number,
    date: string,
}