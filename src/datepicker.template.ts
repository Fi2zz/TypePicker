import { DateTag } from "./datepicker.interface";
import { tag, join, cellElementClassName } from "./datepicker.helpers";

import { isNotEmpty } from "./util";

/**
 *
 * @param {boolean} reachStart
 * @param {boolean} reachEnd
 * @returns {(string)[]}
 */

function createActionView(reachStart: boolean, reachEnd: boolean) {
  const node = (type, disabled) => {
    let className = ["calendar-action", `calendar-action-${type}`];
    if (disabled) {
      className.push("disabled", "calendar-action-disabled");
    }
    return tag({
      tag: "a",
      props: {
        className: className.join(" "),
        href: "javascripts:;",
        children: tag({ tag: "span", props: { children: type } })
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
  const dateTag = tag({
    tag: "div",
    props: {
      className: "date",
      children: data.date
    }
  });
  const nodeChildren = [dateTag];
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
  return tag({
    tag: "div",
    props: {
      className: `${cellElementClassName("date")(data.day, data.className)}`,
      "data-day": data.day,
      "data-date": data.value ? data.value : "",
      "data-disabled": data.disabled,
      children: nodeChildren
    }
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
      className: cellElementClassName("day")(index),
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
