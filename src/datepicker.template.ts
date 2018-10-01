import { template } from "./datepicker.interface";
import { tag, calendarCellClassName, join } from "./datepicker.helpers";

function createActionBar(create: boolean, reachStart, reachEnd) {
  if (!create) {
    return [];
  }

  let actionNode = (type, disabled) => {
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

  return [actionNode("prev", reachStart), actionNode("next", reachEnd)];
}

function createDateNode({ date, day, className }, item) {
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
      className: `${calendarCellClassName("date", day)} ${className}`,
      "data-day": day,
      "data-date": item ? item : ""
    },
    children: nodeChildren
  });
}

function createView(
  data: Array<any>,
  week: Array<any>,
  heading: Function,
  renderWeekOnTop: Boolean
) {
  const head = (title, year, month) =>
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

  const weekMapper = (day, index) =>
    tag({
      tag: "div",
      props: { className: calendarCellClassName("day", index) },
      children: day
    });
  const weeker = tag({
    tag: "div",
    props: { className: "calendar-day" },
    children: week.map(weekMapper)
  });

  const mainNode = children =>
    tag({
      tag: "div",
      props: {
        className: "calendar-main"
      },
      children
    });
  let dateNodes = dates =>
    Object.keys(dates).map(item => createDateNode(dates[item], item));
  let template = data.map((item: any) =>
    mainNode([
      head(item.heading, item.year, item.month),
      !renderWeekOnTop ? weeker : "",
      tag({
        tag: "div",
        props: {
          className: "calendar-body"
        },
        children: dateNodes(item.dates)
      })
    ])
  );
  if (renderWeekOnTop) {
    template.unshift(weeker);
  }
  template = template.filter(item => !!item);
  return template.join("").trim();
}

export default function template({
  renderWeekOnTop,
  data,
  week,
  reachEnd,
  reachStart,
  heading
}: template) {
  let nodes = [
    ...createActionBar(!renderWeekOnTop, reachStart, reachEnd),
    createView(data, week, heading, renderWeekOnTop)
  ];

  return join(nodes);
}
