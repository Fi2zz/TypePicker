export function parseToInt(string: any) {
  return parseInt(string, 10);
}
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

function _toString(object: any) {
  return Object.prototype.toString.call(object);
}

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

export function isString(object: any) {
  return _toString(object) === "[object String]";
}

export function isArray(object: any) {
  return _toString(object) === "[object Array]";
}

export function isPlainObject(object: any) {
  return _toString(object) === "[object Object]";
}

export function isNumber(object: any) {
  return _toString(object) === "[object Number]";
}

export function isDate(object: any) {
  return _toString(object) === "[object Date]";
}

export function isFunction(object: any) {
  return _toString(object) === "[object Function]";
}

let callbacks = [];
let pending = false;
let timer = null;
function flushCallbacks() {
  pending = false;
  let copies = callbacks.slice(0);
  callbacks = [];
  if (timer) {
    clearTimeout(timer);
  }
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
export function nextTick(cb) {
  callbacks.push(function() {
    cb();
  });
  if (!pending) {
    pending = true;
    timer = setTimeout(flushCallbacks, 0);
  }
}

export function warn(where: string, msg: any) {
  let message = msg;
  if (isPlainObject(msg) || isArray(msg)) {
    message = JSON.stringify(msg);
  }
  console.error(`[${where}] ${message} `);
}

export function getFront(list: Array<any>) {
  return list[0];
}

export function getPeek(list: Array<any>) {
  return list[list.length - 1];
}

export function merge(...args: Array<any>) {
  let merged: any = {};

  function generateObject(target: any = {}, object: any) {
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        target[key] = object[key];
      }
    }
    return target;
  }

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (arg) {
      if (isArray(arg)) {
        for (let i = 0; i < arg.length; i++) {
          let argItem = arg[i];
          if (isPlainObject(argItem)) {
            merged = generateObject(merged, argItem);
          } else if (!isDate(argItem)) {
            merged[argItem] = argItem;
          }
        }
      } else if (isPlainObject(arg)) {
        merged = generateObject(merged, arg);
      } else if (isString(arg) || isNumber(arg)) {
        merged[arg] = arg;
      }
    }
  }
  return merged;
}

export function isEmpty(listOrObject: any) {
  if (!isArray(listOrObject) && !isPlainObject(listOrObject)) {
    warn(
      "isEmpty",
      "Expect an Object or an Array,but got " + _toString(listOrObject)
    );
    return false;
  }
  if (isArray(listOrObject)) {
    return listOrObject.length <= 0;
  } else if (isPlainObject(listOrObject)) {
    return Object.keys(listOrObject).length <= 0;
  }
}

export function simpleListToMap(list: Array<any>, key?: string | number) {
  let map = {};
  for (let it of list) {
    map[key ? it[key] : it] = it;
  }
  return map;
}

export function noop(): void {}

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
