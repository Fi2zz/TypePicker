export const attrSelector = (attr: string, value: string) =>
  `[${attr}="${value}"]`;
export function parseToInt(string: any) {
  return parseInt(string, 10);
}

export function getDates(year: number, month: number): number {
  let d = new Date(year, month, 1);
  let utc = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0);
  return new Date(utc).getUTCDate();
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

export function diff(
  start: Date,
  end: Date,
  type: string = "month",
  isAbsolute?: boolean
) {
  let result: number;
  if (!isDate(start) || !isDate(end)) {
    return 0;
  }
  if (type === "month") {
    result =
      Math.abs(start.getFullYear() * 12 + start.getMonth()) -
      (end.getFullYear() * 12 + end.getMonth());
  } else if (type === "days") {
    const startTime = <any>new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    const endTime = <any>new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );
    const calcu = Math.round(startTime - endTime) / (1000 * 60 * 60 * 24);
    result = isAbsolute ? Math.abs(calcu) : calcu;
  }
  return result;
}

export const padding = (n: Number) => `${n > 9 ? n : "0" + n}`;

function _toString(object: any) {
  return Object.prototype.toString.call(object);
}

export function isString(object: any) {
  return _toString(object) === "[object String]";
}

export function isArray(object: any) {
  return _toString(object) === "[object Array]";
}
export function isBoolean(object: any) {
  return _toString(object) === "[object Boolean]";
}

export function isObject(object: any) {
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
export function hasClass(ele: any, className: string) {
  if (
    !ele ||
    !className ||
    !ele.className ||
    ele.className.search(new RegExp("\\b" + className + "\\b")) == -1
  ) {
    return false;
  }
  return true;
}

export function addClass(ele: any, className: string) {
  if (
    !ele ||
    !className ||
    (ele.className &&
      ele.className.search(new RegExp("\\b" + className + "\\b")) != -1)
  )
    return;
  ele.className += (ele.className ? " " : "") + className;
}

export function removeClass(ele: any, className: string) {
  if (
    !ele ||
    !className ||
    (ele.className &&
      ele.className.search(new RegExp("\\b" + className + "\\b")) == -1)
  )
    return;
  ele.className = ele.className.replace(
    new RegExp("\\s*\\b" + className + "\\b", "g"),
    ""
  );
}

export function nextTick(fn: Function, autoReset: boolean = true) {
  const timer = window.setTimeout(() => {
    if (!isFunction(fn)) {
      warn("nextTick", `Except a function,but got ${_toString(fn)}`);
      clearTimeout(timer);
    } else {
      fn();
      if (autoReset) {
        clearTimeout(timer);
      }
    }
  }, 0);
}

export function warn(where: string, msg: any) {
  let message = msg;
  if (isObject(msg) || isArray(msg)) {
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
          if (isObject(argItem)) {
            merged = generateObject(merged, argItem);
          } else if (!isDate(argItem)) {
            merged[argItem] = argItem;
          }
        }
      } else if (isObject(arg)) {
        merged = generateObject(merged, arg);
      } else if (isString(arg) || isNumber(arg)) {
        merged[arg] = arg;
      }
    }
  }
  return merged;
}
export function isEmpty(listOrObject: any) {
  if (!isArray(listOrObject) && !isObject(listOrObject)) {
    warn(
      "isEmpty",
      "Expect an Object or an Array,but got " + _toString(listOrObject)
    );
    return false;
  }
  if (isArray(listOrObject)) {
    return listOrObject.length <= 0;
  } else if (isObject(listOrObject)) {
    for (let key in listOrObject) {
      if (key) {
        return false;
      }
    }
    return true;
  }
}
