export const DOMHelpers = {
  select(selector: string | HTMLElement, selector$2?: string): any {
    if (typeof selector !== "string" && !selector$2) {
      return selector;
    }

    const selectAll = (who, selector) => {
      let ArrayNodes = Array.prototype.slice.call(
        who.querySelectorAll(selector)
      );
      if (ArrayNodes.length <= 0) {
        return null;
      } else if (ArrayNodes.length === 1) {
        return ArrayNodes[0];
      } else {
        return ArrayNodes;
      }
    };

    if (typeof selector === "string") {
      if (selector.indexOf("#") === 0) {
        selector = selector.substr(1);
        return document.getElementById(selector);
      } else if (selector.indexOf(".") == 0) {
        return selectAll(document, selector);
      }
    } else {
      return selectAll(selector, selector$2);
    }

    return null;
  },
  attr: (el: HTMLElement, attr: string) => el.getAttribute(attr),
  class: {
    cell(index: number, ...other) {
      let names = ["calendar-cell"];
      if (index === 0) {
        names.push("is-weekday");
      } else if (index === 6) {
        names.push("is-weekend");
      }
      if (other) {
        names.push(...other);
      }
      return names.join(" ");
    },
    container(views) {
      let classes = ["calendar"];

      if (views === 1) {
        classes.push("calendar-single-view");
      } else if (views === 2) {
        classes.push("calendar-double-views");
      } else {
        classes.push("calendar-flat-view");
      }

      return classes.join("  ");
    }
  }
};
