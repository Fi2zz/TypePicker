export interface datePickerOptions {
    el: string | HTMLElement;
    to?: Date ;
    from?: Date;
    limit: number;
    format?: string;
    doubleSelect?: boolean;
    views?: number | string,
}
export interface templateFunctionOption {
    template: any;
    multiViews: boolean;
    flatView: boolean;
    singleView: boolean;
    language: any;
}


export interface templateMapOption {
    startDate: Date;
    endDate: Date;
    gap: number;
    infiniteMode: boolean;
    formatter: Function;
    parse: Function
}

export interface templateSetDatesOption {
    year: any;
    month: any;
    infiniteMode: boolean;
    formatter: Function;
    parse: Function;
    endDate: Date;
}

export interface templateDateCellClassNameOption {
    date?: Date;
    endDate?: Date;
    infiniteMode?: boolean
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

export interface pickerDoubleSelectHandler {
    date: any;
    selected: Array<any>;
    cache: Array<any>;
    limit: number;
    format: Function;
    parse: Function;
    inDates: Function;
    infiniteMode: boolean;
    bindData: boolean
}

export interface pickerHandler {
    element: any;
    selected: Array<any>;
    isDouble: boolean;
    source: any;
    parse: Function;
    format: Function;
    limit: number;
    inDates: Function;
    update: Function;
    infiniteMode: boolean;
    bindData: boolean

}
export interface disable {
    dates?: Array<any>;
    days?: Array<number> ;
}
