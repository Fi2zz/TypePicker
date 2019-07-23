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

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset?) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return [
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    "-",
    bth[buf[i++]],
    bth[buf[i++]],
    "-",
    bth[buf[i++]],
    bth[buf[i++]],
    "-",
    bth[buf[i++]],
    bth[buf[i++]],
    "-",
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]]
  ].join("");
}

function mathRNG() {
  var rnds = new Array(16);
  for (var i = 0, r; i < 16; i++) {
    if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
    rnds[i] = (r >>> ((i & 0x03) << 3)) & 0xff;
  }
  return rnds;
}
export function uuid() {
  var rnds = mathRNG();
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  return bytesToUuid(rnds);
}
