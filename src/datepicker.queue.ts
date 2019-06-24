import { diff } from "./datepicker.helpers";
import { QueueInterface } from "./datepicker.interface";
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
  enqueue = (date: any) => (next?: Function | undefined): void => {
    let front = this.front();
    let now = this.parse(date.value);
    let prev = this.parse(front ? front.value : null);

    if (this.limit && prev) {
      if (prev >= now || diff(now, prev, "days", true) > this.limit) {
        this.empty();
      }
    }

    if (this.find(date.value) && this.length() > 1) {
      this.empty();
    }

    if (this.find(date.value)) {
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
      this.replace([this.last()]);
    }
    if (typeof next === "function") {
      let id = setTimeout(function afterQueueReset() {
        next();
        clearTimeout(id);
      }, 0);
    }
  }

  resetWithValue(value) {
    this.empty();
    this.list.push(value);
  }

  last() {
    return this.list[this.length() - 1];
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
  find(value: string) {
    return this.list.filter(item => item.value === value).pop();
  }
  length() {
    return this.list.length;
  }

  replace(v) {
    this.list = v;
  }

  include(v) {
    return this.list.indexOf(v) >= 0;
  }

  has(value) {
    return !!this.find(value);
  }
  map(mapper) {
    return this.list.map(mapper);
  }
}
