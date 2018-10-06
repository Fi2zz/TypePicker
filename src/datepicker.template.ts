import { DateTag, node } from "./datepicker.interface";
import { isDef, isNotEmpty, join } from "./util";
import { DOMHelpers } from "./datepicker.dom.helper";

/**
 *
 * @param tag
 * @param props
 * @param children
 * @param render
 * @returns {string}
 */
function tag({ tag, props = {}, render = true }: node) {
  if (!tag || !render) {
    return "";
  }
  let children: any = "";

  let attributes = <string[]>[];
  for (let key in props) {
    let value = props[key];

    if (key === "className") {
      key = "class";
    }

    if (key !== "children") {
      if (isDef(value)) {
        attributes.push(`${key}="${value}"`);
      }
    } else {
      if (children === false || children === undefined || children === null) {
        children = "";
      } else if (Array.isArray(value)) {
        children = value.filter(isDef).join("");
      } else {
        children = value;
      }
    }
  }
  let attrs = <string>attributes.join("");
  return `<${tag} ${attrs}>${children}</${tag}>`;
}

/**
 *
 * @param {boolean} reachStart
 * @param {boolean} reachEnd
 * @returns {(string)[]}
 */

function createActionView(reachStart: boolean, reachEnd: boolean) {
  const node = (type, disabled) => {
    const className = ["calendar-action", type];
    if (disabled) {
      className.push("disabled");
    }
    return tag({
      tag: "div",
      props: {
        className: join(className, " "),
        children: [type]
      }
    });
  };
  return [node("prev", reachStart), node("next", reachEnd)];
}

/**
 *
 * @param {DateTag} data
 * @returns {string}
 */
function createDateTag(data: DateTag) {
  const nodeChildren = [];
  if (isNotEmpty(data.date)) {
    nodeChildren.push(
      tag({
        tag: "div",
        props: {
          className: "date",
          children: data.date
        }
      })
    );
  }

  if (data.value) {
    nodeChildren.push(
      tag({
        tag: "div",
        props: {
          className: "placeholder"
        }
      })
    );
  }

  const props = {
    className: DOMHelpers.class.cell(data.day, data.className),
    "data-disabled": data.disabled,
    children: nodeChildren
  };
  if (isNotEmpty(data.value)) {
    props["data-date"] = data.value;
  }
  if (isNotEmpty(data.day)) {
    props["data-day"] = data.day;
  }
  return tag({
    tag: "div",
    props
  });
}

/**
 *
 * @param {number} year
 * @param {number} month
 * @param {string} title
 * @returns {string}
 */
const headView = (year: number, month: number, title: string) =>
  tag({
    tag: "div",
    props: {
      className: "calendar-head",
      children: [
        tag({
          tag: "div",
          props: {
            className: "calendar-title",
            children: tag({
              tag: "span",
              props: {
                "data-year": year,
                "data-month": month,
                children: title
              }
            })
          }
        })
      ]
    }
  });

/**
 *
 * @param {string | any[]} children
 * @returns {string}
 */
const mainView = (children: string | any[]) =>
  tag({
    tag: "div",
    props: {
      className: "calendar-item",
      children
    }
  });

/**
 *
 * @param {Array<any>} dates
 * @returns {string}
 */
const bodyView = (dates: Array<any>) =>
  tag({
    tag: "div",
    props: {
      className: "calendar-body",
      children: dates.map(item => createDateTag(item))
    }
  });

/**
 *
 * @param {string} weekView
 * @returns {(item: any) => string}
 */
const mapView = (weekView: string) => (item: any) =>
  mainView([
    headView(item.year, item.month, item.heading),
    weekView,
    bodyView(item.dates)
  ]);

/**
 *
 * @param {Array<any>} data
 * @param weekView
 * @returns {string[]}
 */
const createView = (data: Array<any>, weekView) =>
  data.map(mapView(weekView)).filter(isNotEmpty);

/**
 *
 * @param {string} day
 * @param {number} index
 * @returns {string}
 */
const createWeekViewMapper = (day: string, index: number) =>
  tag({
    tag: "div",
    props: {
      className: DOMHelpers.class.cell(index),
      children: day
    }
  });

/**
 *
 * @param {Array<string>} week
 * @returns {string}
 */
const createWeekView = (week: Array<string>) =>
  tag({
    tag: "div",
    props: {
      className: "calendar-day",
      children: week.map(createWeekViewMapper)
    }
  });

/**
 *
 * @param data
 * @param week
 * @returns {(reachStart, reachEnd, notRenderAction) => any}
 */

export function template(data, week) {
  return function(reachStart, reachEnd, notRenderAction) {
    const createdWeekView = createWeekView(week);
    const mainView = createView(data, notRenderAction ? "" : createdWeekView);
    let createdActionView = createActionView(reachStart, reachEnd);
    if (notRenderAction) {
      mainView.unshift(createdWeekView);
      createdActionView = [];
    }
    return join([...createdActionView, ...mainView]);
  };
}
