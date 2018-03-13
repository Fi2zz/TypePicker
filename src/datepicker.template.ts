interface classTemplate {
  date: Date;
  language: any;
  infiniteMode?: boolean;
  views?: number | string;
  dateFormat: string;
  size: number;
  renderWeekOnTop?: boolean;
}

import { format } from "./datepicker.formatter";
import { getDates } from "./util";
export default class HTML {
  constructor(options: classTemplate) {
    const { date, language, dateFormat, size, renderWeekOnTop } = options;
    this.dateFormat = dateFormat;
    this.language = language;
    //因为typescript class不可以返回string类型，故使用一个数组来返回模板
    return <any>[
      `${this.createActionBar(!renderWeekOnTop)}  
       ${this.createView(size, date, renderWeekOnTop)}`
    ];
  }

  private dateFormat: string;
  private language: any = {};

  private createActionBar(create?: boolean) {
    if (!create) {
      return "";
    }
    return `<div class="calendar-action-bar">
            <button class='calendar-action calendar-action-prev'><span>prev</span></button>
            <button class='calendar-action calendar-action-next'><span>next</span></button>
         </div>
    `;
  }

  private createBody(size: number, date: Date) {
    const template = [];
    for (let i = 0; i <= size; i++) {
      const dat = new Date(date.getFullYear(), date.getMonth() + i, 1);
      const paint = this.createMonthDateTemplate(
        dat.getFullYear(),
        dat.getMonth()
      );
      template.push({
        template: paint.template,
        year: paint.year,
        month: paint.month
      });
    }
    return template;
  }

  private createMonthDateTemplate(year: number, month: number) {
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
      });
    }
    for (let i = 1; i <= getDates(curr.year, curr.month); i++) {
      const date = new Date(curr.year, curr.month, i);
      const formatted = format(date, this.dateFormat);
      const key = formatted.value;
      const text = this.createPlaceholder(formatted.date);
      const className = this.setNodeClassName(date);
      const day = formatted.day;
      template.push({ className, text, key, day });
    }
    const tpl = template
      .map((item: any) =>
        this.createNode(item.className, item.key, item.text, item.day)
      )
      .join("");
    return {
      template: tpl,
      year: curr.year,
      month: curr.index
    };
  }

  private createView(size: number, date: Date, renderWeekOnTop) {
    const week = this.createMonthWeek();

    const template = this.createBody(size, date).map((item: any) => {
      const head = this.createMonthHeader(item.year, item.month);
      return `<div class='calendar-main'> 
        ${head}   
        ${!renderWeekOnTop ? week : ""} 
        <div class="calendar-body">${item.template}</div>
      </div> `;
    });
    if (renderWeekOnTop) {
      template.unshift(week);
    }
    return template.join("").trim();
  }
  private createMonthWeek() {
    const template = this.language.days
      .map((day: any, index: number) => {
        const className = [
          "calendar-cell",
          "calendar-day-cell",
          index === 0
            ? "calendar-cell-weekday"
            : index === 6 ? "calendar-cell-weekend" : ""
        ];
        return `<div class="${className.join(" ")}">${day}</div>`;
      })
      .join("");
    return `  <div class="calendar-day">${template}</div>`;
  }

  private createMonthBody(content: any) {
    return `<div class="calendar-body">${content}</div>`;
  }

  private createMonthHeader(year: number, month: number) {
    const heading = function(pack, year, month) {
      if (pack.year) {
        return `${year}${pack.year}${pack.months[month]}`;
      } else {
        return `${pack.months[month]} ${year}`;
      }
    };
    return `<div class="calendar-head"><div class="calendar-title">${heading(
      this.language,
      year,
      month
    )}</div></div>`;
  }

  private createNode(
    className: string,
    key: string,
    text: string,
    day: number
  ) {
    return `<div class="${className}" ${day >= 0 ? "data-day=" + day : ""} ${
      key ? "data-date=" + key : ""
    }>${text}</div>`;
  }

  private createPlaceholder(date?: string) {
    return `<div class="date">${
      date ? date : ""
    }</div><div class="placeholder"></div>`;
  }

  private setNodeClassName(date?: Date) {
    const classStack = ["calendar-cell", "calendar-date-cell"];
    if (!date) {
      classStack.push("disabled", "empty");
    } else {
      if (date.getDay() === 0) {
        classStack.push("calendar-cell-weekend");
      }
      if (date.getDay() === 6) {
        classStack.push("calendar-cell-weekday");
      }
    }
    return classStack.join(" ");
  }
}
