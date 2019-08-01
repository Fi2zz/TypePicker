import TypePicker from "../src";

const Timex = {
  isDate: d => d instanceof Date,
  dateComponents(input) {
    const month = input.getMonth();
    const year = input.getFullYear();
    const date = input.getDate();
    const day = input.getDay();
    const hours = input.getHours();

    const minutes = input.getMinutes();
    const seconds = input.getSeconds();
    const ms = input.getMilliseconds();

    const dateString = input.toDateString();
    const isoString = input.toISOString();
    const time = input.getTime();
    const timezoneOffset = input.getTimezoneOffset();

    return {
      year,
      date,
      month,
      day,
      hours,
      minutes,
      seconds,
      ms,
      milliseconds: ms,
      dateString,
      isoString,
      time,
      timezoneOffset
    };
  },
  createDate(options) {
    const {
      year,
      month,
      date,
      minutes = 0,
      hours = 0,
      seconds = 0,
      milliseconds = 0
    } = options;
    return new Date(year, month, date, hours, minutes, seconds, milliseconds);
  }
};

const DOMHelpers = {
  select(selector: string | HTMLElement, selector$2?: string): any {
    if (!selector$2) {
      if (typeof selector !== "string") {
        return selector;
      } else {
        return document.querySelector(selector);
      }
    }

    const selectAll = (who, selector) => {
      let ArrayNodes = who.querySelectorAll(selector);
      if (ArrayNodes.length <= 0) {
        return null;
      } else if (ArrayNodes.length === 1) {
        return ArrayNodes[0];
      } else {
        return ArrayNodes;
      }
    };

    return selectAll(selector, selector$2);
  },
  attr: (el: HTMLElement, attr: string) => el.getAttribute(attr),
  class(index: number, options) {
    function classname(options) {
      const { isActive, isStart, isEnd, isDisabled, inRange } = options;

      let className = "";
      if (isActive) {
        className = "active";
        if (isStart) {
          className = "active start-date";
        } else if (isEnd) {
          className = "active end-date";
        }
      }
      if (inRange) {
        return "in-range";
      }
      if (isDisabled && !isActive) {
        className = "disabled";
      }
      return className;
    }

    let names = ["calendar-cell"];
    if (index === 0) {
      names.push("is-weekday");
    } else if (index === 6) {
      names.push("is-weekend");
    }
    names.push(classname(options));
    return names.join(" ").trim();
  }
};
function renderTemplate(data) {
  const isDef = (v: any) => v !== undefined && v !== null;
  function createTag(tag, props: any): string {
    if (!tag) {
      tag = "div";
    }
    let children: any = "";
    const attributes = <string[]>[];
    for (let key in props) {
      let value = props[key];
      if (isDef(value)) {
        if (key !== "children") {
          if (key === "className") {
            key = "class";
          }
          attributes.push(`${key}="${value}"`);
        } else {
          if (value !== false) {
            if (Array.isArray(value)) {
              children = value.filter(isDef).join("");
            } else {
              children = value;
            }
          }
        }
      }
    }
    return `<${tag} ${attributes.join("")}>${children}</${tag}>`;
  }
  const actionNode = (type, step) => {
    const className = ["calendar-action", type];
    return createTag("div", {
      className: className.join(" "),
      "data-step": step
    });
  };
  function dateNodes(data): string {
    const props = {
      className: DOMHelpers.class(data.day, data.status),
      children: []
    };

    props.children.push(
      createTag("div", {
        className: "date",
        children: data.label
      })
    );
    props["data-date"] = data.value;
    props["data-disabled"] = data.disabled;
    return createTag("div", props);
  }

  const calendars = data.map(item => {
    const calendarViewData = [
      createTag("div", {
        className: "calendar-head",
        children: item.heading
      }),
      createTag("div", {
        className: "calendar-day",
        children: ["日", "一", "二", "三", "四", "五", "六"].map(day =>
          createTag("div", {
            className: "calendar-cell",
            children: day
          })
        )
      }),
      createTag("div", {
        className: "calendar-body",
        children: item.dates.map(dateNodes)
      })
    ];
    return createTag("div", {
      className: "calendar-item",
      children: calendarViewData
    });
  });
  return [actionNode("prev", -1), actionNode("next", 1), ...calendars].join("");
}

interface TypePickerExampleConfig {
  selection?: number;
  size?: number;
}

interface TypePickerRenderDate {
  date: Date;
  invalid: boolean;
  disabled: boolean;
  status?: {
    isActive?: boolean;
    isStart?: boolean;
    isEnd?: Boolean;
    inRange?: Boolean;
    isDisabled?: boolean;
  };
  value?: string;
  day?: string;
  label?: string;
}

export default class TypePickerExample {
  constructor(element: string | HTMLElement, options: TypePickerExampleConfig) {
    this.init(element, options);
  }
  element: HTMLElement;
  date = new Date();
  apply = null;
  init(element: string | HTMLElement, config: TypePickerExampleConfig) {
    this.element = DOMHelpers.select(element);
    //config.selection => size of data picked
    //config.size => size of data created
    const picker = new TypePicker(config);
    //subscribe update data action and pick data action
    picker.listen(this.render.bind(this));
    //bind picker apply api to instance
    this.apply = {
      ...picker.apply,
      date: (date: Date) => {
        this.date = date;
        picker.apply.date(date);
      }
    };
    //apply first month of data
    //it will render start from  applied date
    this.apply.date(new Date());
  }
  render(options) {
    let data = options.payload;
    if (options.type !== options.types.update) {
      data = data.map(item => item.toLocaleDateString());
      this._onSelect(data);
      return;
    }
    //render DOMs
    this.element.innerHTML = renderTemplate(
      data.map(
        (item: {
          month: number;
          dates: TypePickerRenderDate[];
          year: number;
        }) => {
          return {
            heading: `${item.year}年 ${item.month + 1}月`,
            dates: item.dates.map(item => {
              item.value = item.date.toLocaleDateString();
              item.label = item.date.getDate().toString();
              item.day = item.date.getDay().toString();
              if (item.invalid) {
                for (let key in item.status) {
                  item.status[key] = false;
                }
              }
              item.status.isDisabled = item.disabled || item.invalid;

              return item;
            })
          };
        }
      )
    );
    // switch month action
    const actions = DOMHelpers.select(this.element, ".calendar-action");

    if (actions) {
      for (let actioner of actions) {
        const stepper = () => {
          const _step = DOMHelpers.attr(actioner, "data-step");
          const step = parseInt(_step, 10) as number;
          const components = Timex.dateComponents(this.date);
          components.month += step;
          this.apply.date(Timex.createDate(components));
        };
        actioner.addEventListener("click", () => stepper());
      }
    }
    // calendar date cells
    const cells = DOMHelpers.select(this.element, ".calendar-cell");
    for (let node of cells) {
      node.addEventListener("click", () => {
        const value = DOMHelpers.attr(node, "data-date");
        if (!value) {
          return;
        }
        //select date action
        this.apply.select(new Date(value));
      });
    }
  }
  _onSelect: (data: Date[]) => void;
  onSelect(next: (data: Date[]) => void) {
    this._onSelect = next;
  }
}
