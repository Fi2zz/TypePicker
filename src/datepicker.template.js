import { getFirstDay, getDates, diff, } from "./util";
var currDate = new Date();
function calendarDateCellClassName(options) {
    var date = options.date, infiniteMode = options.infiniteMode, endDate = options.endDate;
    var classStack = ["calendar-cell", "calendar-date-cell"];
    if (!date) {
        classStack.push("disabled", "empty");
    }
    else {
        if (!infiniteMode) {
            if (diff(date, currDate, "days") < 0) {
                classStack.push("disabled");
            }
            if (endDate && diff(date, endDate, "days") > 0) {
                classStack.push("disabled");
            }
        }
        if (date.getDay() === 0) {
            classStack.push("calendar-cell-weekend");
        }
        if (date.getDay() === 6) {
            classStack.push("calendar-cell-weekday");
        }
    }
    return classStack.join(" ");
}
function calendarDateCellTemplate(options) {
    var year = options.year, month = options.month, infiniteMode = options.infiniteMode, formatter = options.formatter, endDate = options.endDate;
    var template = [];
    var d = new Date(year, month, 1);
    var curr = {
        year: d.getFullYear(),
        month: d.getMonth(),
        date: d.getDate(),
        index: d.getMonth()
    };
    var firstDay = getFirstDay(curr.year, curr.month);
    for (var i = 0; i < firstDay; i++) {
        template.push({
            date: "",
            className: calendarDateCellClassName({}),
            text: calendarSingleDateCellTemplate(),
            key: ""
        });
    }
    for (var i = 1; i <= getDates(curr.year, curr.month); i++) {
        var date = new Date(curr.year, curr.month, i);
        var formatted = formatter(date);
        var key = formatted.value;
        var text = calendarSingleDateCellTemplate(formatted.date);
        var className = calendarDateCellClassName({ date: date, infiniteMode: infiniteMode, endDate: endDate });
        template.push({ className: className, text: text, key: key });
    }
    var tpl = template.map(function (item) { return calendarCellGenerate(item.className, item.key, item.text); }).join(" ");
    return {
        template: tpl,
        year: curr.year,
        month: curr.index
    };
}
function calendarSingleDateCellTemplate(date) {
    return "<div class=\"date\">" + (date ? date : '') + "</div><div class=\"placeholder\"></div>";
}
function calendarCellGenerate(className, key, text) {
    return "<div class=\"" + className + "\"" + (key ? "data-date=" + key : "") + ">" + text + "</div>";
}
function calendarTemplateList(option) {
    var startDate = option.startDate, endDate = option.endDate, gap = option.gap, infiniteMode = option.infiniteMode, formatter = option.formatter, parse = option.parse;
    var template = [];
    for (var i = 0; i <= gap; i++) {
        var date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        var paint = calendarDateCellTemplate({
            year: date.getFullYear(),
            month: date.getMonth(),
            formatter: formatter,
            parse: parse,
            infiniteMode: infiniteMode,
            endDate: endDate
        });
        template.push({ template: paint.template, year: paint.year, month: paint.month });
    }
    return template;
}
function calendarViewTemplate(options) {
    var template = options.template, multiViews = options.multiViews, flatView = options.flatView, singleView = options.singleView, language = options.language;
    var weekDays = language.week.map(function (day, index) {
        var className = ["calendar-cell", "calendar-day-cell",
            index === 0 ? "calendar-cell-weekday" : index === 6 ? "calendar-cell-weekend" : ""];
        return "<div class=\"" + className.join(" ") + "\">" + day + "</div>";
    }).join("");
    var tpl = template.map(function (item) {
        var year = item.year, month = item.month;
        var title = "<div class=\"calendar-title\">" + language.title(year, month) + "</div>", body = item.template;
        var tpl = "";
        if (multiViews || singleView) {
            tpl += "<div class='calendar-main'>\n                    <div class=\"calendar-head\">" + title + "</div>\n                   <div class=\"calendar-day\"> " + weekDays + "</div>\n                    <div class=\"calendar-body\">" + body + "</div>\n              </div>";
        }
        else {
            tpl = "<div class=\"calendar-main\">\n                   <div class=\"calendar-head\">" + title + "</div>  \n                    <div class=\"calendar-body\">" + body + "</div>\n            </div>";
        }
        return tpl;
    });
    if (flatView) {
        tpl.unshift("<div class=\"calendar-day\">" + weekDays + "</div>");
    }
    return tpl.join("");
}
function calendarActionBar(actionbar) {
    if (!actionbar) {
        return '';
    }
    return "<div class=\"calendar-action-bar\">\n            <button class='calendar-action calendar-action-prev'><span>prev</span></button>\n            <button class='calendar-action calendar-action-next'><span>next</span></button>\n         </div>\n    ";
}
export default function compose(option) {
    var startDate = option.startDate, endDate = option.endDate, multiViews = option.multiViews, flatView = option.flatView, singleView = option.singleView, language = option.language, infiniteMode = option.infiniteMode, parse = option.parse, formatter = option.formatter;
    var gap = multiViews ? 1 : flatView ? diff(startDate, endDate) : 0;
    var mapConf = {
        startDate: startDate,
        endDate: endDate,
        gap: gap,
        infiniteMode: infiniteMode,
        formatter: formatter,
        parse: parse
    };
    var templateConf = {
        template: calendarTemplateList(mapConf),
        multiViews: multiViews,
        flatView: flatView,
        language: language,
        singleView: singleView
    };
    return "" + calendarActionBar(multiViews || singleView) + calendarViewTemplate(templateConf);
}
