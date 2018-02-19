import {classTemplate} from './datepicker.interfaces'
import {
    getDates,
    diff,
} from "./util"
const currDate = new Date();
export default class HTML {
    constructor(options: classTemplate) {
        const {
            startDate,
            endDate,
            views,
            language,
            infiniteMode,
            dateFormatter,
        } = options;
        const gap = views === 2 ? 1 : views === 'auto' ? diff(startDate, endDate) : 0;
        this.language = language;
        this.formatter = dateFormatter;
        this.startDate = startDate;
        this.endDate = endDate;
        this.views = views;
        this.infiniteMode = infiniteMode;
        this.template = `${this.createActionBar(this.views !== 'auto')}${this.createView(this.createBody(gap))}`
    }

    private startDate: Date = null;
    private endDate: Date = null;
    private formatter: Function = null;
    private infiniteMode: boolean = false;
    private language: any = {};
    public template: string;
    private views: number | string = 1;

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

    private  createBody(gap: number) {
        const template = [];
        for (let i = 0; i <= gap; i++) {
            const date = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + i, 1);
            const paint = this.createMonthDateTemplate(date.getFullYear(), date.getMonth());
            template.push({template: paint.template, year: paint.year, month: paint.month})
        }
        return template
    }

    private  createMonthDateTemplate(year: number, month: number) {
        const d = new Date(year, month, 1);
        const curr = {
            year: d.getFullYear(),
            month: d.getMonth(),
            date: d.getDate(),
            index: d.getMonth()
        };
        const firstDay = new Date(curr.year, curr.month, 1).getDay();
        const template = <Array<any>>[];
        for (let i = 0; i < firstDay; i++) {
            template.push({
                date: "",
                className: this.setNodeClassName(),
                text: this.createPlaceholder(),
                key: ""
            })
        }
        for (let i = 1; i <= getDates(curr.year, curr.month); i++) {
            const date = new Date(curr.year, curr.month, i);
            const formatted = this.formatter(date);
            const key = formatted.value;
            const text = this.createPlaceholder(formatted.date);
            const className = this.setNodeClassName(date);
            const day = formatted.day;
            template.push({className, text, key, day});
        }
        const tpl = template.map((item: any) => {
            return this.createNode(item.className, item.key, item.text, item.day)
        }).join(" ");
        return {
            template: tpl,
            year: curr.year,
            month: curr.index
        }
    }

    private  createView(template: Array<any>) {
        const week = this.createMonthWeek();
        const tpl = template.map((item: any) => {
            const year = item.year, month = item.month;
            const head = this.createMonthHeader(year, month);
            const body = this.createMonthBody(item.template);
            let tpl = "";
            if (this.views !== 'auto') {
                tpl += this.createMonthWrap(head, body, week);
            } else {
                tpl = this.createMonthWrap(head, body)
            }
            return tpl
        });
        if (this.views === 'auto') {
            tpl.unshift(week)
        }
        return tpl.join("")
    }

    private createMonthWrap(head: string, body: string, week?: string) {
        return `<div class="calendar-main">${head} ${week ? week : ''} ${body}</div>`
    }

    private createMonthWeek() {
        const template = this.language.days.map((day: any, index: number) => {
            const className = [
                "calendar-cell",
                "calendar-day-cell",
                index === 0 ?
                    "calendar-cell-weekday"
                    : index === 6 ?
                    "calendar-cell-weekend" : ""
            ];
            return `<div class="${className.join(" ")}">${day}</div>`
        }).join("");


        return `  <div class="calendar-day">${template}</div>`
    }

    private createMonthBody(content: any) {
        return `<div class="calendar-body">${content}</div>`
    }

    private createMonthHeader(year: number, month: number) {
        const heading = function (pack, year, month) {
            if (pack.year) {
                return `${year}${pack.year}${pack.months[month]}`
            } else {
                return `${pack.months[month]} ${year}`
            }
        };
        return `<div class="calendar-head"><div class="calendar-title">${heading(this.language, year, month)}</div></div>`
    };

    private  createNode(className: string, key: string, text: string, day: number) {
        return `<div class="${className}" ${day >= 0 ? "data-day=" + day : ""} ${key ? "data-date=" + key : ""}>${text}</div>`
    }

    private  createPlaceholder(date?: string) {
        return `<div class="date">${date ? date : ''}</div><div class="placeholder"></div>`
    }

    private  setNodeClassName(date?: Date) {
        const endDate = this.endDate;
        const classStack = ["calendar-cell", "calendar-date-cell"];
        if (!date) {
            classStack.push("disabled", "empty")
        } else {
            if (!this.infiniteMode) {
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
