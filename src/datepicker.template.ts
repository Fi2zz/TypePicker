import { tag, join } from "./datepicker.helpers";
import { isDef } from "./util";

/**
 *
 * @param type
 * @param index
 * @returns {string}
 */
function cellClassName(type: string, index?: number) {
  let name = `calendar-cell calendar-${type}-cell ${
    index === 0 ? "calendar-cell-weekday" : ""
  } ${index === 6 ? "calendar-cell-weekend" : ""}
 `;

  return name.replace(/\n/, "").trim();
}

function createActionView(reachStart, reachEnd) {
  const node = (type, disabled) => {
    let className = ["calendar-action", `calendar-action-${type}`];
    if (disabled) {
      className.push("disabled", "calendar-action-disabled");
    }
    return tag({
      tag: "a",
      props: {
        className: className.join(" "),
        href: "javascripts:;"
      },
      children: tag({ tag: "span", children: type })
    });
  };
  return [node("prev", reachStart), node("next", reachEnd)];
}

function createDateTag({ date, day, className }, item) {
  const dateTag = tag({
    tag: "div",
    props: {
      className: "date"
    },
    children: date
  });

  const nodeChildren = [dateTag];

  if (date) {
    const placeholderTag = tag({
      tag: "div",
      props: {
        className: "placeholder"
      }
    });
    nodeChildren.push(placeholderTag);
  }
  return tag({
    tag: "div",
    props: {
      className: `${cellClassName("date", day)} ${className}`,
      "data-day": day,
      "data-date": item ? item : ""
    },
    children: nodeChildren
  });
}

function createView(data: Array<any>, heading: Function) {
  return function(week) {
    const headView = (title, year, month) =>
      tag({
        tag: "div",
        props: { className: "calendar-head" },
        children: [
          tag({
            tag: "div",
            props: {
              className: "calendar-title"
            },
            children: tag({
              tag: "span",
              props: {
                "data-year": year,
                "data-month": month
              },
              children: heading(year, month)
            })
          })
        ]
      });

    const mainView = children =>
      tag({
        tag: "div",
        props: {
          className: "calendar-main"
        },
        children
      });
    let dateView = (list, dates) =>
      list.map(item => createDateTag(dates[item], item));

    const bodyView = (list, dates) =>
      tag({
        tag: "div",
        props: {
          className: "calendar-body"
        },
        children: dateView(list, dates)
      });

    const template = data.map((item: any) =>
      mainView([
        headView(item.heading, item.year, item.month),
        week,
        tag({
          tag: "div",
          props: {
            className: "calendar-body"
          },
          children: bodyView(Object.keys(item.dates), item.dates)
        })
      ])
    );
    return template.filter(isDef);
  };
}

const createWeekViewMapper = (day, index) =>
  tag({
    tag: "div",
    props: { className: cellClassName("day", index) },
    children: day
  });

const createWeekView = week =>
  tag({
    tag: "div",
    props: { className: "calendar-day" },
    children: week.map(createWeekViewMapper)
  });
export default function template(data, i18n) {
  return function(reachEnd, reachStart, notRenderAction) {
    const createdWeekView = createWeekView(i18n.week);
    const createdView = createView(data, i18n.title);
    const mainView = createdView(notRenderAction ? "" : createdWeekView);
    let createdActionView = createActionView(reachStart, reachEnd);
    if (notRenderAction) {
      mainView.unshift(createdWeekView);
      createdActionView = [];
    }
    return join([...createdActionView, ...mainView]);
  };
}
