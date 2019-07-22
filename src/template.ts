import { isDef, List } from "./util";
import { DOMHelpers } from "./dom.helper";

//#ifdef DEBUG
//#endif

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
function createActionView(reachStart: boolean, reachEnd: boolean) {
  const node = (type, disabled) => {
    const className = ["calendar-action", type];
    if (disabled) {
      className.push("disabled");
    }
    return createTag("div", {
      className: List.string(className, " "),
      disabled: disabled ? "disabled" : null
    });
  };
  return [node("prev", reachStart), node("next", reachEnd)].join("");
}

/**
 *
 * @param {TypePickerTagData} data
 * @returns {string}
 */
function createDateView(data: TypePickerTagData): string {
  const props = {
    className: DOMHelpers.class.cell(data.day, data.className),
    children: []
  };

  if (!data.invalid) {
    props.children.push(
      createTag("div", {
        className: "date",
        children: data.label
      })
    );
    if (data.value) {
      props.children.push(
        createTag("div", {
          className: "placeholder"
        })
      );
      props["data-date"] = data.value;
    }
  }
  props["data-disabled"] = data.disabled;
  return createTag("div", props);
}

/**
 *
 * @param {Array<string>} week
 * @returns {string}
 */
const createDayView = (week: Array<string>): string =>
  createTag("div", {
    className: "calendar-day",
    children: week.map((day, index) =>
      createTag("div", {
        className: DOMHelpers.class.cell(index),
        children: day
      })
    )
  });

/**
 *
 * @param weekView
 * @returns {string[]}
 */
const createCalendarView = ({
  data,
  days,
  switchable,
  reachStart,
  reachEnd
}): string[] => {
  const dayView = createDayView(days);
  let mapped = data.map(item => {
    const calendarViewData = [
      createTag("div", {
        className: "calendar-head",
        children: item.heading
      }),
      switchable && dayView,
      createTag("div", {
        className: "calendar-body",
        children: item.dates.map(createDateView)
      })
    ].filter(Boolean);

    return createTag("div", {
      className: "calendar-item",
      children: calendarViewData
    });
  });
  if (!switchable) {
    return [dayView, ...mapped];
  }
  return [createActionView(reachStart, reachEnd), ...mapped];
};

export const template = ({ data, days, reachStart, reachEnd, switchable }) =>
  List.string(
    createCalendarView({
      data,
      days,
      switchable,
      reachStart,
      reachEnd
    })
  );
