import { template } from "./datepicker.interface";
import { createNode, calendarCellClassName, join } from "./datepicker.helpers";

function createActionBar(create: boolean, reachStart, reachEnd) {
  if (!create) {
    return [];
  }

  let actionNode = (type, disabled) => {
    let className = ["calendar-action", `calendar-action-${type}`];
    if (disabled) {
      className.push("disabled", "calendar-action-disabled");
    }
    return createNode({
      tag: "button",
      props: {
        class: className.join(" ")
      },
      children: createNode({ tag: "span", children: type })
    });
  };

  return [actionNode("prev", reachStart), actionNode("next", reachEnd)];
}

function createDateNode({ date, day, className }, item) {
  let placeholder = createNode({
    tag: "div",
    props: {
      class: "placeholder"
    }
  });
  let dateNode = createNode({
    tag: "div",
    props: {
      class: "date"
    },
    children: date
  });

  return createNode({
    tag: "div",
    props: {
      class: `${calendarCellClassName("date", day)} ${className}`,
      "data-day": day,
      "data-date": `${day}` ? item : ""
    },
    children: [dateNode, placeholder]
  });
}

function createView(
  data: Array<any>,
  week: Array<any>,
  renderWeekOnTop: Boolean
) {
  const head = (title, year, month) =>
    createNode({
      tag: "div",
      props: { class: "calendar-head" },
      children: [
        createNode({
          tag: "div",
          props: {
            class: "calendar-title"
          },
          children: createNode({
            tag: "span",
            props: {
              "data-year": year,
              "data-month": month
            },
            children: title
          })
        })
      ]
    });

  const weekMapper = (day, index) =>
    createNode({
      tag: "div",
      props: { class: calendarCellClassName("day", index) },
      children: day
    });
  const weeker = createNode({
    tag: "div",
    props: { class: "calendar-day" },
    children: week.map(weekMapper)
  });

  const mainNode = children =>
    createNode({
      tag: "div",
      props: {
        class: "calendar-main"
      },
      children
    });
  let dateNodes = dates =>
    Object.keys(dates).map(item => createDateNode(dates[item], item));
  let template = data.map((item: any) =>
    mainNode([
      head(item.heading, item.year, item.month),
      !renderWeekOnTop ? weeker : "",
      createNode({
        tag: "div",
        props: {
          class: "calendar-body"
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
  reachStart
}: template) {
  let nodes = [
    ...createActionBar(!renderWeekOnTop, reachStart, reachEnd),
    createView(data, week, renderWeekOnTop)
  ];

  return join(nodes);
}
