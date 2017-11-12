import {getFirstDay, getDates, diff, padding} from "./util"
import {format} from './datepicker.formatter'
const currDate = new Date();

function setItemClassName(date?: any) {
    let className = <Array<any> > ["calendar-cell", " calendar-date-cell"];
    if (!date) {
        className.push("disabled");
        className.push("empty");
    } else {
        if (diff(date, currDate, "days") < 0) {
            className.push("disabled")
        }
        if (date.getDay() === 0) {
            className.push("calendar-cell-weekend")
        }
        if (date.getDay() === 6) {
            className.push("calendar-cell-weekday")
        }
    }
    return className.join(" ")
}
function setDates(year: any, month: any, formater: string) {
    let List = <Array<any>>[];
    const d = new Date(year, month, 1);
    const curr = {
        year: d.getFullYear(),
        month: d.getMonth(),
        date: d.getDate(),
        index: d.getMonth()
    };
    const firstDay = getFirstDay(curr.year, curr.month);
    for (let i = 0; i < firstDay; i++) {
        List.push({
            date: "",
            className: setItemClassName(),
            text: "<div class='date'></div><div class='placeholder'></div>",
            key: ""
        })
    }
    for (let date = 1; date <= getDates(curr.year, curr.month); date++) {
        const currDate = new Date(curr.year, curr.month, date);
        const key = format(currDate, formater).value;
        const text = `<div class="date">${padding(date)}</div><div class="placeholder"></div>`;

        List.push({
            date,
            className: setItemClassName(currDate),
            text,
            key
        });
    }
    const template = List.map((item: any) => `<div class="${item.className}"
            ${item.key ? "data-date=" + item.key : ""}>${item.text}</div>`).join(" ");
    return {template, year: curr.year, month: curr.index}
}

/**
 * 集合月历，把多个月份的何在一起，构成日历
 * **/
function map(startDate: Date, format: string, gap: number) {
    let template = [];
    for (let i = 0; i <= gap; i++) {
        const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const paint = setDates(date.getFullYear(), date.getMonth(), format);
        template.push({template: paint.template, year: paint.year, month: paint.month})
    }
    return template
}
function viewMainClassName(index: number, flatView: boolean) {
    return flatView ? "" : ` calendar-${index}`
}

function template(template: any,
                  multiViews: boolean,
                  flatView: boolean,
                  language: any,) {

    const weekDays = language.week.map((day: any, index: number) => {
        let className = ["calendar-cell", "calendar-day-cell"];
        if (index === 0) {
            className.push("calendar-cell-weekday")
        } else if (index === 6) {
            className.push("calendar-cell-weekend")
        }
        return `<div class="${className.join(" ")}">${day}</div>`
    }).join("");

    let tpl = template.map((item: any, index: any) => {
        let year = item.year, month = item.month;
        let title = `<div class="calendar-title">${language.title(year, month)}</div>`,
            body = item.template;
        let tpl = "";
        if (!multiViews && !flatView) {
            tpl += `<div class='calendar-main calendar-${index}'>
                    <div class="calendar-head">${title}</div>
                    <div class="calendar-body">${body}</div>
              </div>`
        } else {
            tpl = `<div class="calendar-main${viewMainClassName(index, flatView)}">
                   <div class="calendar-head">${title}</div>  
                   <div class="calendar-day"> ${weekDays}</div>
                    <div class="calendar-body">${body}</div>
            </div>`
        }
        return tpl
    });
    if (!multiViews && !flatView) {
        tpl.unshift(`<div class="calendar-day">${weekDays}</div>`)
    }
    return tpl.join("")
}
/**
 * 生成完整日历
 *
 * **/
export default function compose(startDate: Date,
                                endDate: Date,
                                format: string,
                                multiViews: boolean,
                                flatView: boolean,
                                language: any) {
    const className = `calendar-${multiViews ? "double-views" : flatView ? "single-view" : "flat-view"}`;


    const gap = multiViews ? 1 : flatView ? 0 : diff(startDate, endDate);
    const tpl = template(map(startDate, format, gap), multiViews, flatView, language);

    const controller = multiViews || flatView ? `
         <div class="calendar-action-bar">
            <button class='calendar-action calendar-action-prev'><span>prev</span></button>
            <button class='calendar-action calendar-action-next'><span>next</span></button>
         </div>
        ` : "";
    return `<div class="calendar ${className}"> ${controller}${tpl}</div>`
}