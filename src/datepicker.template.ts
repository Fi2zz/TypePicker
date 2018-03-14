interface classTemplate {
  renderWeekOnTop?: boolean;
  data?: Array<any>;
  week: Array<any>;
}

export default class HTML {
  constructor(options: classTemplate) {
    const { renderWeekOnTop, data, week } = options;
    //因为typescript class不可以返回string类型，故使用一个数组来返回模板
    return <any>[
      `${this.createActionBar(!renderWeekOnTop)}  
       ${this.createView(data, week, renderWeekOnTop)}`
    ];
  }

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

  private createMonthDateTemplate(dates: any) {
    return Object.keys(dates).map(item => {
      let result = dates[item];
      let day = result.day;
      let date = result.date;
      let data = {
        key: day ? item : "",
        text: `<div class="date">${
          date ? date : ""
        }</div><div class="placeholder"></div>`,
        day: day ? day : ""
      };
      let classNames = ["calendar-cell", "calendar-date-cell"];
      if (!day) {
        classNames.push("disabled", "empty");
      } else {
        if (day === 0) {
          classNames.push("calendar-cell-weekend");
        }
        if (day === 6) {
          classNames.push("calendar-cell-weekday");
        }
      }
      return this.createNode(
        classNames.join(" "),
        data.key,
        data.text,
        data.day
      );
    });
  }
  private createView(
    data: Array<any>,
    week: Array<any>,
    renderWeekOnTop: Boolean
  ) {
    const template = data.map(
      (item: any) => `
                <div class="calendar-main">
                <div class="calendar-head">
                    <div class="calendar-title">${item.heading}</div>
                </div>
                ${!renderWeekOnTop ? this.createMonthWeek(week) : ""}
                <div class="calendar-body">${this.createMonthDateTemplate(
                  item.dates
                ).join(" ")}</div>
                </div>
            `
    );

    if (renderWeekOnTop) {
      template.unshift(this.createMonthWeek(week));
    }
    return template.join("").trim();
  }

  private createMonthWeek(language: Array<string>) {
    const template = language
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

  private createNode(
    className: string,
    key: string,
    text: string,
    day: number
  ) {
    return `<div class="${className}"  ${day>=0 ? "data-day=" + day : ""} ${
      key ? "data-date=" + key : ""
    }>${text}</div>`;
  }
}
