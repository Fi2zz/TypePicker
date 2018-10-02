import { tag, join, cellElementClassName } from "./datepicker.helpers";
import { isDef, padding } from "./util";

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
        href: "javascripts:;",
        children: tag({ tag: "span", props: { children: type } })
      }
    });
  };
  return [node("prev", reachStart), node("next", reachEnd)];
}

function createDateTag(data) {
  const dateTag = tag({
    tag: "div",
    props: {
      className: "date",
      children: data.date
    }
  });
  const nodeChildren = [dateTag];
  if (data.value) {
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
      className: `${cellElementClassName("date")(data.day, data.className)}`,
      "data-day": data.day,
      "data-date": data.value ? data.value : "",
      children: nodeChildren
    }
  });
}

const mapHeadView = (year, month, title) => ({
  year,
  month,
  title: title({ year, month })
});

const headView = ({ year, month, title }) =>
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

const mainView = children =>
  tag({
    tag: "div",
    props: {
      className: "calendar-item",
      children
    }
  });
const bodyView = dates =>
  tag({
    tag: "div",
    props: {
      className: "calendar-body",
      children: dates.map(item => createDateTag(item))
    }
  });

const mapView = (weekView, title) => item =>
  mainView([
    headView(mapHeadView(item.year, item.month, title)),
    weekView(),
    bodyView(item.dates)
  ]);

const createView = (data: Array<any>, title: string) => weekView =>
  data.map(mapView(weekView, title)).filter(isDef);

const createWeekViewMapper = (day, index) =>
  tag({
    tag: "div",
    props: {
      className: cellElementClassName("day")(index),
      children: day
    }
  });
const createWeekView = week =>
  tag({
    tag: "div",
    props: {
      className: "calendar-day",

      children: week.map(createWeekViewMapper)
    }
  });
export default function template(data, i18n) {
  return function(reachStart, reachEnd, notRenderAction) {
    const createdWeekView = createWeekView(i18n.week);
    const createdView = createView(data, i18n.heading);
    const mainView = createdView(
      () => (notRenderAction ? "" : createdWeekView)
    );
    let createdActionView = createActionView(reachStart, reachEnd);
    if (notRenderAction) {
      mainView.unshift(createdWeekView);
      createdActionView = [];
    }
    return join([...createdActionView, ...mainView]);
  };
}
