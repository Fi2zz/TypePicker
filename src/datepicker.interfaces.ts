export interface datePickerOptions {
    el: string,
    to: Date | null | undefined,
    from: Date | null | undefined,
    limit: number,
    format: string,
    language: any,
    singleView: boolean,
    flatView: boolean,
    multiViews: boolean,
    doubleSelect: boolean,
    defaultLanguage: string,
    bindData: boolean,
    zeroPadding: boolean | undefined,
    infiniteMode: boolean | undefined,
}


export interface templateFunctionOption {
    template: any,
    multiViews: boolean,
    flatView: boolean,
    singleView: boolean,
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
    isInit: boolean,

}

export interface pickerDoubleSelectHandler {
    date: any,
    selected: Array<any>,
    cache: Array<any>,
    limit: number,
    // source: any,
    format: Function,
    parse: Function,
    inDates: Function,
    infiniteMode: boolean,
    bindData: boolean
}


export interface pickerHandler {
    element: any,
    selected: Array<any>,
    isDouble: boolean,
    source: any,
    parse: Function,
    format: Function,
    limit: number,
    inDates: Function,
    update: Function,
    infiniteMode: boolean,
    bindData: boolean

}

