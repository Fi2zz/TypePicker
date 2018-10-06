import { diff } from "./datepicker.helpers";
import { QueueInterface } from "./datepicker.interface";

/**
 *
 * @param {any} v
 * @returns {any}
 */
function copy(v: any) {
  return JSON.parse(JSON.stringify(v));
}

export class Queue {
  constructor(interfaces: QueueInterface) {
    const { size, limit, parse } = interfaces;
    this.size = size;
    this.limit = limit;
    this.parse = parse;
  }

  size = 1;
  limit: boolean | number = 1;
  parse = null;

  /**
   *
   * @param {string} date
   * @returns {(next?: (Function | undefined)) => void}
   */
  enqueue = (date: string) => (next?: Function | undefined): void => {
    let front = this.front();
    let now = this.parse(date);
    let prev = this.parse(front);
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
