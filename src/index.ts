import { Core } from "./core";
import { DOMHelpers, template } from "./dom.helper";
import { isDef, List, pipe } from "./util";
import { useViewTypes, events, dataset, SelectionItem } from "./helpers";
import "./style.css";
function classname(options) {
  const { isActive, isStart, isEnd, isDisabled, inRange, isEmpty } = options;
  if (isEmpty) {
    return "empty disabled";
  }
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
export default class TypePicker extends Core {
  constructor(options) {
    super(options);
    const element = DOMHelpers.select(options.el);
    const { type, size } = useViewTypes(options.views);
    element.className = DOMHelpers.class.container(type);
    this.subscribe("update", payload => {
      payload.data = payload.data.map(item => {
        item.dates = item.dates.map(item => {
          item.className = classname(item.status);
          return item;
        });
        return item;
      });
      element.innerHTML = template(payload);
      const { reachEnd, reachStart, date } = payload;
      const select = (selector: string) => DOMHelpers.select(element, selector);
      const prevActionDOM = select(".calendar-action.prev");
      const nextActionDOM = select(".calendar-action.next");
      const nodeList = select(".calendar-cell");
      this.publish("render", nodeList);
      if (prevActionDOM && nextActionDOM) {
        const listener = (disabled: any, step: number) => {
          if (disabled) {
            return;
          }
          this.switch(step * size);
        };
        prevActionDOM.addEventListener(events.click, () =>
          listener(reachStart, -1)
        );
        nextActionDOM.addEventListener(events.click, () =>
          listener(reachEnd, 1)
        );
      }
      List.loop(nodeList, (node: HTMLElement) => {
        node.addEventListener(events.click, () => {
          const value = DOMHelpers.attr(node, dataset.date);
          if (!value) {
            return;
          }
          this.select(new SelectionItem({ value }));
        });
      });
      const value = pipe(
        value => List.filter(value, isDef),
        value => List.map(value, item => item.value)
      )(payload.selected);
      this.publish("select", value);
    });
    this.onSelect = next => this.subscribe("select", next);
    this.onRender = next => this.subscribe("render", next);
  }
}
