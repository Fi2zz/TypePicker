export interface datePickerOptions {
    el: string,
    to: Date | any,
    from: Date | any,
    limit: number,
    format: string,
    language: any,
    singleView: boolean,
    flatView: boolean,
    multiViews: boolean,
    doubleSelect: boolean,
    defaultLanguage: string,
    bindData: boolean,
    zeroPadding: boolean,
    infiniteMode: boolean,
}


export interface templateFunctionOption {
    template: any,
    multiViews: boolean,
    flatView: boolean,

    language: any,
}


export interface templateComposeOption {
    startDate: Date,
    endDate: Date,
    multiViews: boolean,
    flatView: boolean,
    singleView: boolean,
    language: any,
    infiniteMode: boolean,
    formatter: Function,
    parse: Function
}


export interface templateMapOption {
    startDate: Date,
    endDate: Date,
    gap: number,
    infiniteMode: boolean,
    formatter: Function,
    parse: Function
}

export interface templateSetDatesOption {
    year: any,
    month: any,
    infiniteMode: boolean,
    formatter: Function,
    parse: Function,
    endDate: Date,
}

export interface templateDateCellClassNameOption {
    date?: Date,
    endDate?: Date,
    infiniteMode?: boolean
}


export interface initRangeOptions {


    collector: HTMLElement,
    collection: HTMLCollection,
    data: Array<string>,
    // source: Array<any>,
    isDouble: boolean,
    parse: Function,
    format: Function,
    inDates: Function,
    isInit: boolean
}
