export const isDef = (v: any) => v !== undefined && v !== null;
export const isBool = (v: any) => typeof v === "boolean";
export const isEmpty = (v): boolean => !isDef(v) || v == "";
export const isDate = object => object instanceof Date;
/**
 * @ only positive integer
 * @param input
 */
export const isPositiveInteger = (input: string) =>
  /^[1-9]?[0-9]+$/.test(input);
interface match {
  condition: any;
  value?: any;
  expected?: boolean;
}
export function match(input: match) {
  return (next?: Function) => {
    let { condition, value, expected } = input;
    expected = expected || true;
    let output: any =
      typeof condition === "function" ? condition(value) : condition;

    const outputIsArray = List.isList(output);
    let result = outputIsArray ? output[0] : output;
    result = result === expected;

    const dispatchValue = !outputIsArray
      ? value
      : (output as any[])[output.length - 1];
    if (typeof next === "function" && result) {
      return next(dispatchValue);
    }
  };
}
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
  dedup(list: any[], key?) {
    let map = {};
    if (list.length <= 0) {
      return [];
    }

    return list.reduce((acc, currItem) => {
      let curr = currItem;
      if (key) {
        if (typeof key === "function") {
          curr = key(curr, map);
        } else {
          curr = currItem[key];
        }
      }

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
  empty(list: any[]) {
    list = [];
  },
  isEmpty: list => List.isList(list) && list.length <= 0,
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
    if (!List.isList(list) || list.length <= 0) {
      return false;
    }
    const index = list.indexOf(value);
    return handler(index, list);
  },
  isList: list => list instanceof Array,
  includes(list, item) {
    const hasIncludes = typeof list.includes == "function";
    return hasIncludes ? list.includes(item) : list.indexOf(item) >= 0;
  },
  fetch(list, index: string | number = 0) {
    return list[index];
  },
  fetchEnd(list) {
    return List.fetch(list, list.length - 1);
  },
  fetchTop(list) {
    return List.fetch(list, 0);
  }
};

export const Dat = {
  firstDate: (date, index) =>
    new Date(date.getFullYear(), date.getMonth() + index, 1),
  dates: date =>
    new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)).getUTCDate()
};
export const pipe = (first: Function, ...more) =>
  more.reduce((acc, curr) => (...args) => curr(acc(...args)), first);
