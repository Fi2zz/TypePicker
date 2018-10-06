import { diff, parse } from "./datepicker.helpers";

interface q {
  size: number;
  limit: boolean | number;
  dateFormat;
}

/**
 *
 * @param {any} v
 * @returns {any}
 */
function copy(v: any) {
  return JSON.parse(JSON.stringify(v));
}

export class Queue {
  constructor({ size, limit, dateFormat }: q) {
    this.size = size;
    this.limit = limit;
    this.format = dateFormat;
  }

  size = 1;
  limit: boolean | number = 1;
  format = "";

  /**
   *
   * @param {string} date
   * @returns {(next?: (Function | undefined)) => void}
   */
  enqueue = (date: string) => (next?: Function | undefined): void => {
    let front = this.front();
    let now = parse(date, this.format);
    let prev = parse(front, this.format);
    if (this.limit) {
      if (prev >= now || diff(now, prev, "days", true) > this.limit) {
        this.empty();
      }
    }

    if (this.list.indexOf(date) >= 0 && this.list.length > 1) {
      this.empty();
    }

    if (this.list.indexOf(date) >= 0) {
      return;
    }

    this.list.push(date);
    this.reset(next);
  };

  /**
   *
   * @param {Function} next
   */
  reset(next?: Function) {
    if (this.list.length > this.size) {
      this.list = [this.list.pop()];
    }
    if (typeof next === "function") {
      setTimeout(() => next(), 0);
    }
  }

  resetWithValue(value) {
    this.empty();
    this.list.push(value);
  }

  shift() {
    this.list.shift();
  }

  cache() {
    return copy(this.list);
  }

  slice(start, end) {
    this.list.slice(start, end);
  }

  dequeue() {
    this.list.shift();
  }

  pop() {
    this.list.pop();
  }

  empty() {
    this.list = [];
  }

  front() {
    return this.list[0];
  }

  list: any[] = [];

  length() {
    return this.list.length;
  }

  replace(v) {
    this.list = v;
  }

  include(v) {
    return this.list.indexOf(v) >= 0;
  }
}
