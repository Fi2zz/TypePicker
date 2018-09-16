import { createNode, calendarCellClassName, join } from "./datepicker.helpers";

interface classTemplate {
  renderWeekOnTop?: boolean;
  extraPanel: { type: string; list?: any[] };
  extraYearsList?: any;
  data?: Array<any>;
  week: Array<any>;
}
function createActionBar(create?: boolean) {
  let actionNode = type =>
    createNode({
      tag: "button",
      props: {
        class: "calendar-action calendar-action-" + type
      },
      children: createNode({ tag: "span", children: type })
    });
  if (!create) {
    return "";
  }
  return [actionNode("prev"), actionNode("next")].join("");
}

function createDateNode({ date, day }, item) {
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
      class: calendarCellClassName("date", day),
      "data-day": day,
      "data-date": day ? item : ""
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
  extraPanel
}: classTemplate) {
  let nodes = [
    createActionBar(!renderWeekOnTop),
    createView(data, week, renderWeekOnTop)
  ];

  if (extraPanel.type) {
    let heading = type => {
      if (type !== "month") {
        return "";
      }
      let item = extraPanel.list.filter(item => item.active).pop();
      return createNode({
        tag: "h3",
        children: item.year
      });
    };

    let extraPanelList = extraPanel.list.map(item =>
      createNode({
        tag: "div",
        props: {
          class: `extra-item${item.active ? " active" : ""}`
        },
        children: createNode({ tag: "span", children: item.displayName })
      })
    );

    nodes.push(
      createNode({
        tag: "div",
        props: {
          class: "extra-panel extra-panel-" + extraPanel.type
        },
        children: [
          heading(extraPanel.type),
          createNode({
            tag: "div",
            children: extraPanelList
          })
        ]
      })
    );
  }

  return join(nodes);
}
