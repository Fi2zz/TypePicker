/**
 *
 * @param v
 * @returns {boolean}
 */
const isUndef = v => v === undefined || v === null;
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

/**
 *
 * @param condition
 * @param {Boolean} when
 * @returns {(value?: any) => (next?: Function) => (any)}
 */
export function byCondition(condition: any, when?: Boolean) {
  return (value?: any) => {
    return (next?: Function) => {
      if (!isDef(when)) {
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
