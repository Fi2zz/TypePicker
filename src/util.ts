/**
 *
 * @param v {any}
 * @returns {boolean}
 */
const isUndef = (v: any) => v === undefined || v === null;
export const isBool = (v: any) => typeof v === "boolean";

/**
 *
 * @param v
 * @returns {boolean}
 */
const isEmpty = v => isUndef(v) || v == "";

/**
 *
 * @param {Number} n
 * @returns {string}
 */
export const padding = (n: Number) => `${n > 9 ? n : "0" + n}`;
/**
 *
 * @param v
 * @returns {boolean}
 */
export const isNotEmpty = v => !isEmpty(v);
/**
 *
 * @param v
 * @returns {boolean}
 */
export const isDef = v => !isUndef(v);
/**
 *
 * @param list
 * @returns {boolean}
 */
export const isArray = list => list instanceof Array;
/**
 *
 * @param object
 * @returns {boolean}
 */
export const isDate = object => object instanceof Date;

/**
 *
 * @param {string | any} selector
 * @param {string} selector$2
 * @returns {any}
 */

export function $(selector: string | any, selector$2?: string): any {
  const selectAll = (who, selector) => {
    let ArrayNodes = Array.prototype.slice.call(who.querySelectorAll(selector));
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
}

/**
 *
 * @param {any[]} list
 * @param condition
 * @returns {any[]}
 */
export function dedupList(list: any[], condition?) {
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
}

export const yes = v => v === true;

export const not = v => !yes(v);

export function ifYes(
  condition: boolean,
  then: Function,
  otherwise?: Function
) {
  if (condition) {
    then();
  } else {
    typeof otherwise === "function" && otherwise();
  }
}

/**
 *
 * @param condition
 * @param expected
 */
export function condition(condition: any, expected?: boolean) {
  return (value?: any) => {
    return (next?: Function) => {
      expected = expected || true;
      const output: boolean =
        (typeof condition === "function" ? condition(value) : condition) ===
        expected;
      if (typeof next === "function" && output) {
        return next(value);
      }
    };
  };
}

export const equal = (input: any, matched: any) => (next?: Function) => {
  const isTrue = input === matched;

  if (isTrue) {
    if (typeof next === "function") {
      next(input);
    } else {
      return isTrue;
    }
  }
};

export const notEqual = (input: any, matched: any) => (next?: Function) => {
  const isFalse = input === matched;

  if (isFalse) {
    if (typeof next === "function") {
      next(input);
    } else {
      return isFalse;
    }
  }
};

/**
 *
 * @param list
 * @param split
 * @returns {string|Request}
 */
export function join(list, split?: string) {
  if (!split) {
    split = "";
  }
  return list.join(split);
}

export function createList(size, filled = undefined) {
  const list = [];
  if (!size || size === 0) {
    return list;
  }

  for (let i = 0; i < size; i++) {
    list.push(typeof filled === "function" ? filled(i) : filled);
  }

  return list;
}

export function mapList(input, map, filter?) {
  if (!isArray(input)) {
    return [];
  }

  const list = input.map((item, index) => map(item, index));

  if (!filter) {
    return list;
  }

  return list.filter(filter);
}

/**
 *
 * @param list
 * @param filter
 */
export function filterList(
  list: any[],
  filter: (value?: any, index?: number, array?: any[]) => boolean
) {
  return list.filter(filter);
}

export function reduceList(list: any[], reducer, initValue?) {
  if (!isArray) {
    return [];
  }
  return list.reduce(reducer, initValue);
}

export function sliceList(list, start, end) {
  return list.slice(start, end);
}

export const toInt = input => parseInt(input, 10);

export const or = (condition$1, condition$2) => (
  then,
  otherwise?: Function
) => {
  condition$1 || condition$2 ? then() : otherwise && otherwise();
};
export const and = (con$1, con$2) => (then, otherwise?: Function) => {
  con$1 && con$2 ? then() : otherwise && otherwise();
};
