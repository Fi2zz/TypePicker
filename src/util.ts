/**
 *
 * @param v
 * @returns {boolean}
 */
export const isDef = (v: any) => v !== undefined && v !== null;
export const isBool = (v: any) => typeof v === "boolean";
/**
 *
 * @param v
 * @returns {boolean}
 */
export const isEmpty = (v): boolean => !isDef(v) || v == "";
/**
 *
 * @param {Number} n
 * @returns {string}
 */
export const padding = (n: Number): string => `${n > 9 ? n : "0" + n}`;
/**
 *
 * @param v
 * @returns {boolean}
 */
export const isNotEmpty = (v): boolean => !isEmpty(v);
/**
 *
 * @param object
 * @returns {boolean}
 */
export const isDate = object => object instanceof Date;

interface match {
  condition: any;
  value?: any;
  expected?: boolean;
}

export function match(input: match) {
  return (next?: Function) => {
    let { condition, value, expected } = input;
    expected = expected || true;
    const output: boolean =
      (typeof condition === "function" ? condition(value) : condition) ===
      expected;
    if (typeof next === "function" && output) {
      return next(value);
    }
  };
}
export const toInt = input => parseInt(input, 10);
export const List = {
  slice: (list, start, end) =>
    List.isList(list) ? list.slice(start, end) : [],
  reduce: (list: any[], reducer, initValue?) => list.reduce(reducer, initValue),
  filter: (list: any[], filter) => list.filter(filter),
  map(input: any[], map: Function, filter?) {
    if (!List.isList(input)) {
      return [];
    }
    const list = input.map((item, index) => map(item, index));
    if (!filter) {
      return list;
    }
    return list.filter(filter);
  },
  create(size, filled?) {
    filled = filled || undefined;
    const list = [];
    if (!size || size === 0) {
      return list;
    }
    for (let i = 0; i < size; i++) {
      list.push(typeof filled === "function" ? filled(i) : filled);
    }
    return list;
  },
  dedup(list: any[]) {
    let map = {};
    if (list.length <= 0) {
      return [];
    }

    return list.reduce((acc, curr) => {
      if (!map[curr]) {
        map[curr] = 1;
        acc.push(curr);
      }
      return acc;
    }, []);
  },
  string(list: any[], split?: string) {
    if (!split) {
      split = "";
    }
    if (!List.isList(list)) {
      return split;
    }

    return list.join(split);
  },
  isEmpty: list => list.length <= 0,
  loop(list, looper) {
    for (let item of list) {
      let index = list.indexOf(item);
      looper(item, index, list);
    }
  },
  every(list, handler) {
    if (!List.isList(list) || list.length <= 0) {
      return false;
    }
    return list.every(handler);
  },
  inRange(list, value, handler) {
    if (!List.isList(list)) {
      return false;
    }
    const index = list.indexOf(value);
    handler(index, list);
  },
  isList: list => list instanceof Array
};
