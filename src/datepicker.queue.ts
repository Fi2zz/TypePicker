import { diff, parse } from "./datepicker.helpers";
interface q {
  size: number;
  limit: boolean | number;
  dateFormat;
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
  enqueue = date => next => {
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
    this.list.push(date);
    this.reset(next);
  };
  reset(next) {
    if (this.list.length > this.size) {
      this.list = [this.list.pop()];
    }
    if (typeof next === "function") {
      setTimeout(() => next(), 0);
    }
  }

  shift() {
    this.list.shift();
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
}
