import {
    templateComposeOption,
    templateMapOption,
    templateSetDatesOption,
    templateDateCellClassNameOption,
    templateFunctionOption
} from './datepicker.interfaces'
import {
    getFirstDay, getDates, diff, padding
} from "./util"
import {stringify} from "querystring";


const currDate = new Date();

function calendarDateCellClassName(options: templateDateCellClassNameOption) {
    const {date, infiniteMode, endDate} = options;

    const classStack = ["calendar-cell", "calendar-date-cell"];
    if (!date) {
        classStack.push("disabled", "empty")
    } else {
        // console.log({infiniteMode})
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

function calendarDateCellTemplate(options: templateSetDatesOption) {

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
            className: calendarDateCellClassName({}),
            text: calendarSingleDateCellTemplate(),
            key: ""
        })
    }

    for (let i = 1; i <= getDates(curr.year, curr.month); i++) {
        const date = new Date(curr.year, curr.month, i);
        const formatted = formatter(date);
        const key = formatted.value;
        const text = calendarSingleDateCellTemplate(formatted.date);
        const className = calendarDateCellClassName({date, infiniteMode, endDate});
        template.push({className, text, key});
    }

    const tpl = template.map((item: any) => calendarCellGenerate(item.className, item.key, item.text)).join(" ")
    return {
        template: tpl,
        year: curr.year,
        month: curr.index
    }
}


function calendarSingleDateCellTemplate(date?: number) {
    return `<div class="date">${date ? date : ''}</div><div class="placeholder"></div>`
}

function calendarCellGenerate(className: string, key: string, text: string) {
    return `<div class="${className}"${key ? "data-date=" + key : ""}>${text}</div>`
}

/**
 * 集合月历，把多个月份的何在一起，构成日历
 * **/

function calendarTemplateList(option: templateMapOption) {
    const {
        startDate,
        endDate,
        gap,
        // zeroPadding,
        infiniteMode,
        formatter,
        parse
    } = option;


    const template = [];

    for (let i = 0; i <= gap; i++) {
        const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const paint = calendarDateCellTemplate({
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


function calendarViewTemplate(options: templateFunctionOption) {
    const {
        template,
        multiViews,
        flatView,
        language,
        // zeroPadding
    } = options;
    const weekDays = language.week.map((day: any, index: number) => {
        const className = ["calendar-cell", "calendar-day-cell",
            index === 0 ? "calendar-cell-weekday" : index === 6 ? "calendar-cell-weekend" : ""];
        return `<div class="${className.join(" ")}">${day}</div>`
    }).join("");
    const tpl = template.map((item: any, index: any) => {
        const year = item.year, month = item.month;
        const title = `<div class="calendar-title">${language.title(year, month)}</div>`,
            body = item.template;
        let tpl = "";
        if (!multiViews && !flatView) {
            tpl += `<div class='calendar-main calendar-${index}'>
                    <div class="calendar-head">${title}</div>
                    <div class="calendar-body">${body}</div>
              </div>`
        } else {
            tpl = `<div class="calendar-main">
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

function calendarTemplateCompose(multiViews: boolean, flatView: boolean, singleView: boolean, template: any) {

    return `<div class="calendar calendar-${multiViews ? "double-views" : flatView ? "single-view" : "flat-view"}">${calendarActionBar(multiViews || singleView)}${template}</div>`
}

function calendarActionBar(actionbar: boolean) {
    if (!actionbar) {
        return ''
    }
    return `<div class="calendar-action-bar">
            <button class='calendar-action calendar-action-prev'><span>prev</span></button>
            <button class='calendar-action calendar-action-next'><span>next</span></button>
         </div>
    `
}


/**
 * 生成完整日历
 *
 * **/
export default function compose(option: templateComposeOption) {
    const {
        startDate,
        endDate,
        multiViews,
        flatView,
        singleView,
        language,
        infiniteMode,
        parse,
        formatter
    } = option;
    const gap = multiViews ? 1 : flatView ? diff(startDate, endDate) : 0;
    const mapConf = {
        startDate,
        endDate,
        gap,
        infiniteMode,
        formatter,
        parse
    };
    console.log(gap, flatView, singleView)
    const templateConf = {
        template: calendarTemplateList(mapConf),
        multiViews,
        flatView,
        language,
    };
    return calendarTemplateCompose(multiViews, flatView, singleView, calendarViewTemplate(templateConf))
}
