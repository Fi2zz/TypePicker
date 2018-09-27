export function attr(
  el: any,
  attr: any,
  attrvalue: any | undefined = undefined
) {
  if (!el) {
    return null;
  }
  let value = el.getAttribute(attr);
  if (attrvalue === undefined) {
    attrvalue = "";
  }
  return value ? value : el.setAttribute(attr, attrvalue);
}

export const padding = (n: Number) => `${n > 9 ? n : "0" + n}`;

export function toString(val: any) {
  return val == null
    ? ""
    : typeof val === "object"
      ? JSON.stringify(val, null, 2)
      : String(val);
}

export function isUndefined(v) {
  return v === undefined || v === null;
}

export function isDef(v) {
  return !isUndefined(v);
}

export function isArray(object: any) {
  return Object.prototype.toString.call(object) === "[object Array]";
}

export function isDate(object: any) {
  return Object.prototype.toString.call(object) === "[object Date]";
}

export function $(selector: string | any, selector$2?: string): any {
  const selectAll = (who, selector) => {
    let nodes = who.querySelectorAll(selector);

    let ArrayNodes = Array.prototype.slice.call(nodes);

    if (ArrayNodes.length <= 0) {
      return null;
    } else if (ArrayNodes.length === 1) {
      return nodes[0];
    } else {
      return nodes;
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
}

export const listHead = list => list[0];
export const listTail = list => list[list.length - 1];

export const dedupList = (list: any[], condition?) => {
  let map = {};

  let result = [];

  if (list.length <= 0) {
    return [];
  }

  for (let item of list) {
    if (!condition) {
      map[item] = item;
    } else {
      map[condition] = item;
    }
  }
  for (let key in map) {
    let item = map[key];
    result.push(item);
  }

  return result;
};

export function byCondition(condition: any, when?: Boolean) {
  return (value?: any) => {
    return (next?: Function) => {
      if (isUndefined(when)) {
        when = true;
      }
      let result;
      if (typeof condition === "function") {
        result = condition(value) === when;
      } else {
        result = condition === when;
      }

      if (next && typeof next === "function" && result) {
        return next(value);
      }
      return result;
    };
  };
}
