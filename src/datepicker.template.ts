import {template} from "./datepicker.interface";
import {tag, calendarCellClassName, join} from "./datepicker.helpers";

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
            children: tag({tag: "span", children: type})
        });
    };

    return [actionNode("prev", reachStart), actionNode("next", reachEnd)];
}

function createDateNode({date, day, className}, item) {
    let placeholder = tag({
        tag: "div",
        props: {
            className: "placeholder"
        }
    });
    let dateNode = tag({
        tag: "div",
        props: {
            className: "date"
        },
        children: date
    });

    return tag({
        tag: "div",
        props: {
            className: `${calendarCellClassName("date", day)} ${className}`,
            "data-day": day,
            "data-date": day !== false ? item : ""
        },
        children: [dateNode, placeholder]
    });
}

function createView(data: Array<any>,
                    week: Array<any>,
                    renderWeekOnTop: Boolean) {
    const head = (title, year, month) =>
        tag({
            tag: "div",
            props: {className: "calendar-head"},
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
                        children: title
                    })
                })
            ]
        });

    const weekMapper = (day, index) =>
        tag({
            tag: "div",
            props: {className: calendarCellClassName("day", index)},
            children: day
        });
    const weeker = tag({
        tag: "div",
        props: {className: "calendar-day"},
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
                                     reachStart
                                 }: template) {
    let nodes = [
        ...createActionBar(!renderWeekOnTop, reachStart, reachEnd),
        createView(data, week, renderWeekOnTop)
    ];

    return join(nodes);
}
