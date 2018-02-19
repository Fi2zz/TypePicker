import {
    templateMapOption,
    templateSetDatesOption,
    templateDateCellClassNameOption,
    templateFunctionOption
} from './datepicker.interfaces'
interface template {

    startDate: Date,
    endDate: Date,
    multiViews: boolean,
    flatView: boolean,
    singleView: boolean,
    language: any,
    infiniteMode: boolean,
    dateParser: Function,
    dateFormatter: Function
}

import {
    getFirstDay,
    getDates,
    diff,
} from "./util"
const currDate = new Date();
export default class HTML {
    constructor(options: template) {
        const {
            startDate,
            endDate,
            multiViews,
            flatView,
            singleView,
            language,
            infiniteMode,
            dateParser,
            dateFormatter,
        } = options;

        const parse = dateParser;
        const formatter = dateFormatter;
        const gap = multiViews ? 1 : flatView ? diff(startDate, endDate) : 0;
        const bodyOption = {
            startDate,
            endDate,
            gap,
            infiniteMode,
            formatter,
            parse
        };
        const viewOption = {
            template: this.createBody(bodyOption),
            multiViews,
            flatView,
            language,
            singleView
        };
        this.template = `${this.createActionBar(multiViews || singleView)}${this.createView(viewOption)}`
    }

    public template: string;
    private  createActionBar(create?: boolean) {
        if (!create) {
            return ''
        }
        return `<div class="calendar-action-bar">
            <button class='calendar-action calendar-action-prev'><span>prev</span></button>
            <button class='calendar-action calendar-action-next'><span>next</span></button>
         </div>
    `
    }
    private  createBody(option: templateMapOption) {
        const {
            startDate,
            endDate,
            gap,
            infiniteMode,
            formatter,
            parse
        } = option;
        const template = [];
        for (let i = 0; i <= gap; i++) {
            const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            const paint = this.createNodeList({
                year: date.getFullYear(),
                month: date.getMonth(),
                formatter: formatter,
                parse: parse,
                infiniteMode,
                endDate,
            });
            template.push({template: paint.template, year: paint.year, month: paint.month})
        }
        return template
    }
    private  createNodeList(options: templateSetDatesOption) {
        const {
            year,
            month,
            infiniteMode,
            formatter,
            endDate
        } = options;
        let template = <Array<any>>[];
        const d = new Date(year, month, 1);
        const curr = {
            year: d.getFullYear(),
            month: d.getMonth(),
            date: d.getDate(),
            index: d.getMonth()
        };
        const firstDay = getFirstDay(curr.year, curr.month);
        for (let i = 0; i < firstDay; i++) {
            template.push({
                date: "",
                className: this.setCellClassList({}),
                text: this.createPlaceholder(),
                key: ""
            })
        }
        for (let i = 1; i <= getDates(curr.year, curr.month); i++) {
            const date = new Date(curr.year, curr.month, i);
            const formatted = formatter(date);
            const key = formatted.value;
            const text = this.createPlaceholder(formatted.date);
            const className = this.setCellClassList({date, infiniteMode, endDate});
            const day = formatted.day;
            template.push({className, text, key, day});
        }
        const tpl = template.map((item: any) => this.createNode(item.className, item.key, item.text, item.day)).join(" ");
        return {
            template: tpl,
            year: curr.year,
            month: curr.index
        }


    }

    private  createView(options: templateFunctionOption) {
        const {
            template,
            multiViews,
            flatView,
            singleView,
            language,
        } = options;
        const weekDays = language.week.map((day: any, index: number) => {
            const className = ["calendar-cell", "calendar-day-cell",
                index === 0 ? "calendar-cell-weekday" : index === 6 ? "calendar-cell-weekend" : ""];
            return `<div class="${className.join(" ")}">${day}</div>`
        }).join("");
        const tpl = template.map((item: any) => {
            const year = item.year, month = item.month;
            const title = `<div class="calendar-title">${language.title(year, month)}</div>`,
                body = item.template;
            let tpl = "";
            if (multiViews || singleView) {
                tpl += `<div class='calendar-main'>
                    <div class="calendar-head">${title}</div>
                   <div class="calendar-day"> ${weekDays}</div>
                    <div class="calendar-body">${body}</div>
              </div>`
            } else {
                tpl = `<div class="calendar-main">
                   <div class="calendar-head">${title}</div>  
                    <div class="calendar-body">${body}</div>
            </div>`
            }
            return tpl
        });
        if (flatView) {
            tpl.unshift(`<div class="calendar-day">${weekDays}</div>`)
        }
        return tpl.join("")
    }

    private  createNode(className: string, key: string, text: string, day: number) {
        return `<div class="${className}" ${day ? "data-day=" + day : ""} ${key ? "data-date=" + key : ""}>${text}</div>`
    }

    private  createPlaceholder(date?: string) {
        return `<div class="date">${date ? date : ''}</div><div class="placeholder"></div>`
    }

    private  setCellClassList(options: templateDateCellClassNameOption) {
        const {date, infiniteMode, endDate} = options;
        const classStack = ["calendar-cell", "calendar-date-cell"];
        if (!date) {
            classStack.push("disabled", "empty")
        } else {
            if (!infiniteMode) {
                if (diff(date, currDate, "days") < 0) {
                    classStack.push("disabled")
                }
                if (endDate && diff(date, endDate, "days") > 0) {
                    classStack.push("disabled")
                }
            }
            if (date.getDay() === 0) {
                classStack.push("calendar-cell-weekend")
            }
            if (date.getDay() === 6) {
                classStack.push("calendar-cell-weekday")
            }
        }
        return classStack.join(" ")

    }

}


