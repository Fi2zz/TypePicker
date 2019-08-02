export interface TypePickerConfig {
  date?: Date | null;
  size?: number;
  selection?: number;
  useInvalidAsSelected?: boolean;
}

type TimexDate = Date;

interface TypePickerSelected {
  value?: Date;
  disabled?: boolean;
}
interface TimexCreateDate {
  year?: number;
  date?: number;
  month?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export interface TypePickerDate {
  date: Date;
  invalid: boolean;
  disabled: boolean;
  status?: {
    isActive?: boolean;
    isStart?: boolean;
    isEnd?: Boolean;
    inRange?: Boolean;
  };
}
interface TypePickerMonth {
  year: number;
  month: number;
  dates: TypePickerDate[];
}
export type TypePickerData = TypePickerMonth[];

const List = {
  map(input: any[], map: Function) {
    if (!List.isList(input)) {
      return [];
    }
    return input.map((item, index) => map(item, index));
  },
  create(size, filled?) {
    filled = filled || undefined;
    const list = [];
    if (!size || size === 0) {
      return list;
    }
    for (let i = 0; i < size; i++) {
      list.push(
        filled ? (typeof filled === "function" ? filled(i) : filled) : i
      );
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
  findIndex(list, value) {
    return list.indexOf(value);
  },
  isTop(list, value) {
    return List.findIndex(list, value) === 0;
  },
  isTail(list, value) {
    return List.findIndex(list, value) === List.length(list) - 1;
  },
  isList: list => list instanceof Array,
  includes(list, item) {
    return List.findIndex(list, item) >= 0;
  },
  length(list: any[]) {
    return list.length;
  }
};

const pipe = (first: Function, ...more: Function[]) =>
  more.reduce((acc, curr) => (...args: any[]) => curr(acc(...args)), first);
/**
 * @ only positive integer
 * @param input
 */
const isPositiveInteger = (input: string | number) =>
  /^[1-9]?[0-9]+$/.test(`${input}`);

const isInterger = (input: string | number) =>
  /^(-)?[1-9]?[0-9]+$/.test(`${input}`);

const isBool = (v: any) => typeof v === "boolean";
const genRandomNumber = () =>
  `${Math.random() * 0x100000000}`.replace(".", "-");
class PubSub {
  constructor(name) {
    this.name = name;
  }
  name = "observe";
  getType(type) {
    return `${this.name}${type}`;
  }
  clientList = <any>{};
  /**
   *
   * @param {string} key
   * @param {Function} fn
   */
  subscribe = (key: string, fn: Function) => {
    const typeName = this.getType(key);
    if (!this.clientList[typeName]) {
      this.clientList[typeName] = [];
    }
    this.clientList[typeName].push(fn);
  };
  /**
   *
   * @param args
   * @returns {boolean}
   */
  publish = (type, args: any) => {
    Timex.delay(() => {
      const fns = this.clientList[this.getType(type)];
      if (!fns || fns.length === 0) {
        return false;
      }
      for (let fn of fns) {
        fn(args);
      }
    }, 1);
  };
}

class Selection {
  value: Date;
  disabled: Boolean;
  constructor(value) {
    this.value = value;
  }
  toString() {
    return `${+this.value}${this.disabled}`;
  }
}

class Queue {
  size = 1;
  list: Selection[] = [];
  constructor(size: number, canPushInvalid: boolean) {
    this.size = size;
    this.canPushInvalid = canPushInvalid;
  }
  canPushInvalid = false;
  last = () => this.list[this.length() - 1];
  front = () => this.fetch(0);
  length = () => this.list.length;
  fetch = (index?: number) =>
    <Selection | Selection[]>(index >= 0 ? this.list[index] : this.list);
  isEmpty = () => this.length() <= 0;
  isFullFilled = () => this.length() === this.size;
  clean = () => (this.list = []);
  shift = () => this.list.shift();
  pop = () => this.list.pop();
  push = (data: Selection) => (afterPush: Function): void => {
    const before = this.list.filter(
      item => item.toString() === data.toString()
    );
    if (before.length > 0) {
      if (this.length() === 1) {
        return;
      }
      if (this.size === 2) {
        this.shift();
      } else {
        this.clean();
      }
    }
    this.list.push(data);
    Timex.delay(afterPush);
  };
}
class TimeX {
  millisecondsOfDate = 1000 * 60 * 60 * 24;
  diff(
    first: TimexDate,
    second: TimexDate,
    type: string = "days",
    isAbsolute?: boolean
  ): number {
    let result: number;
    if (!Timex.isDate(first) || !Timex.isDate(second)) {
      return 0;
    }
    const that = this;
    const components = {
      start: that.dateComponents(first),
      end: that.dateComponents(second)
    };
    if (type === "month") {
      result =
        Math.abs(components.start.year * 12 + components.start.month) -
        (components.end.year * 12 + components.end.month);
    } else if (type === "days") {
      result =
        Math.ceil(components.start.time - components.end.time) /
        Timex.millisecondsOfDate;
    }

    return isAbsolute ? Math.abs(result) : result;
  }
  delay(handler: Function, duration = 0) {
    const delayed = setTimeout(() => {
      handler();
      clearTimeout(delayed);
    }, duration);
  }
  isDate = (object: any) => object instanceof Date;
  dateComponents(input: TimexDate) {
    const month = input.getMonth();
    const year = input.getFullYear();
    const date = input.getDate();
    const day = input.getDay();
    const hours = input.getHours();

    const minutes = input.getMinutes();
    const seconds = input.getSeconds();
    const ms = input.getMilliseconds();

    const dateString = input.toDateString();
    const isoString = input.toISOString();
    const time = input.getTime();
    const timezoneOffset = input.getTimezoneOffset();

    return {
      year,
      date,
      month,
      day,
      hours,
      minutes,
      seconds,
      ms,
      milliseconds: ms,
      dateString,
      isoString,
      time,
      timezoneOffset
    };
  }
  createDate(options: TimexCreateDate) {
    const {
      year,
      month,
      date,
      minutes = 0,
      hours = 0,
      seconds = 0,
      milliseconds = 0
    } = options;
    return new Date(year, month, date, hours, minutes, seconds, milliseconds);
  }
  today() {
    const date = new Date();
    const components = this.dateComponents(date);
    return this.createDate({
      year: components.year,
      month: components.month,
      date: components.date
    });
  }
}

const Timex = new TimeX();
function genTypePickerData<TypePickerData>(
  mapRange: Function,
  mapDisables: Function
) {
  return function(size: number, date: TimexDate) {
    const genCalendar = ({ size, date }) =>
      List.create(size, index => {
        const components = Timex.dateComponents(date);
        components.month += index;
        const firstDate = Timex.createDate({
          ...components,
          date: 1
        });
        const endDate = Timex.createDate({
          ...components,
          month: components.month + 1,
          date: 0
        });
        return {
          ...Timex.dateComponents(firstDate),
          dates: Timex.dateComponents(endDate).date,
          endDate,
          firstDate
        };
      });
    const genDates = calendars =>
      List.map(calendars, ({ day, year, month, endDate, firstDate }) => ({
        year,
        month,
        dates: List.create(42, index => {
          const date = Timex.createDate({
            year,
            month,
            date: index - day + 1
          });
          const components = Timex.dateComponents(date);
          const invalid = date > endDate || date < firstDate;
          return {
            date,
            invalid,
            disabled: invalid || mapDisables(date),
            status: mapRange(components.dateString)
          };
        })
      }));
    const genSize = ({ size, date }) => {
      return {
        size: size >= 0 ? size : size * -1,
        date
      };
    };

    return pipe(
      genSize,
      genCalendar,
      genDates
    )({ size, date });
  };
}
function checkQueue(
  queue: Queue,
  disabled: boolean,
  unpushable: Function,
  popable: Function
): boolean {
  const currentQueueLength = queue.length();
  const nextQueueLength = currentQueueLength + 1;
  if (disabled) {
    if (
      queue.size !== 2 ||
      (queue.size === 2 &&
        ((currentQueueLength === 1 && unpushable()) ||
          //queue is empty
          queue.isEmpty() ||
          //queue filled
          queue.isFullFilled() ||
          !queue.canPushInvalid))
    ) {
      return false;
    }
  }
  //only queue size of 2
  //find out disables between last and current
  else if (queue.size === 2) {
    if (currentQueueLength) {
      if (unpushable()) {
        queue.shift();
      } else if (popable()) {
        queue.pop();
      }
    }
  }
  if (nextQueueLength > queue.size) {
    queue.clean();
  }
  return true;
}
function setDatesDedupe(date: TimexDate, map: any) {
  if (!map[date.toDateString()]) {
    return date;
  }
  return null;
}

function getOptions(option: TypePickerConfig) {
  option = option || ({} as TypePickerConfig);
  const partial: Partial<TypePickerConfig> = {};
  if (isInterger(option.size)) {
    partial.size = option.size;
  }
  if (isPositiveInteger(option.selection)) {
    partial.selection = option.selection;
  }

  if (isBool(option.useInvalidAsSelected)) {
    partial.useInvalidAsSelected = option.useInvalidAsSelected;
    if (option.useInvalidAsSelected === true) {
      partial.selection = 2;
    }
  }

  return partial;
}

const mapStatusOfDate = (range: Queue, useRange: boolean) => (
  dateString: string
) => {
  const length = range.length();
  const status = {
    isActive: false,
    isEnd: false,
    isStart: false,
    inRange: false
  };
  if (length <= 0) {
    return status;
  }
  const dateToString = date => Timex.dateComponents(date).dateString;
  if (!useRange) {
    status.isActive = pipe(
      (data: Selection[]) => List.map(data, item => item.value),
      (data: TimexDate[]) => List.map(data, dateToString),
      (data: string[]) => List.includes(data, dateString)
    )(range.fetch() as Selection[]);
  } else {
    const first = range.fetch(0) as Selection;
    const last = range.fetch(range.length() - 1) as Selection;
    const getRange = pipe(
      ($1: TimexDate, $2: TimexDate) => Timex.diff($1, $2, "days", true),
      (size: number) => List.create(size + 1),
      (range: number[]) =>
        List.map(range, item => {
          const components = Timex.dateComponents(first.value);
          components.date += item;
          const date = Timex.createDate(components);
          return dateToString(date);
        })
    );
    const data = getRange(last.value, first.value);
    status.isActive =
      List.isTop(data, dateString) || List.isTail(data, dateString);
    status.inRange = List.includes(data, dateString);

    status.isStart = List.isTop(data, dateString);
    status.isEnd = List.isTail(data, dateString);
    if (status.isStart || status.isEnd) {
      status.inRange = false;
    }
  }
  return status;
};

class Updater {
  constructor(config: TypePickerConfig) {
    this.config = config;
    this.queue = new Queue(config.selection, config.useInvalidAsSelected);
  }
  pubsub = new PubSub(genRandomNumber());
  update = (date: TimexDate, selectedValue: TypePickerSelected[]) => {
    if (date) {
      this.config.date = date;
    }

    const createData = pipe(
      genTypePickerData(
        mapStatusOfDate(this.queue, this.config.selection === 2),
        this.disables.find
      )
    );
    this.pubsub.publish(
      TypePickerListenerTypes.update,
      createData(this.config.size, this.config.date)
    );
    if (List.isList(selectedValue)) {
      this.pubsub.publish(
        TypePickerListenerTypes.select,
        List.map(selectedValue, (item: Selection) => item.value)
      );
    }
  };
  queue = null;
  data = [];
  disables = {
    find: (date: TimexDate) => false
  };
  config: TypePickerConfig;
  checkQueue(item) {
    const queue = this.queue;
    const disables = this.disables;

    const current = item.value;

    let last = queue.last();
    let first = queue.front();

    const unpushable = () => {
      if (item.disabled && current < last.value) {
        return true;
      }
      const getSize = ([current, first]) => [
        Timex.diff(current, first, "days", true),
        first
      ];
      const create = date => index => {
        const components = Timex.dateComponents(date);
        components.date += index;
        return Timex.createDate(components);
      };
      const findDates = ([size, date]) => List.create(size, create(date));
      const findDisables = dates =>
        List.map(
          dates,
          date =>
            disables.find(date) &&
            Timex.dateComponents(date).time !==
              Timex.dateComponents(current).time
        );
      const filterTrue = data => data.filter((item: any) => item === true);
      const has = data => List.length(data) > 0;
      return pipe(
        getSize,
        findDates,
        findDisables,
        filterTrue,
        has
      )([item.value, first.value]);
    };
    const popable = () => first.value > current;
    return checkQueue(queue, item.disabled, unpushable, popable);
  }
  push(date: TimexDate | TimexDate[], cleanQueue: boolean = false) {
    const createItem = (value: TimexDate) => {
      if (!Timex.isDate(value)) {
        console.error(`Error: expected Date object, but got ${value} `);
        return;
      }
      const components = Timex.dateComponents(value);
      const date = Timex.createDate(components);
      const select = new Selection(date);
      select.disabled = this.disables.find(date);
      return select;
    };
    const data = (List.isList(date) ? date : [date]) as TimexDate[];
    if (cleanQueue) {
      this.queue.clean();
      this.data = [];
    }
    this.data = List.map(data, createItem);
    if (List.length(this.data) <= 0) {
      this.update(null, []);
    }
    List.loop(this.data, item => {
      Timex.delay(() => {
        item.disabled = this.disables.find(item.value);
      }, 0);
      const canPush = this.checkQueue(item);
      const callUpdate = () => this.update(null, this.queue.fetch());
      if (canPush) {
        this.queue.push(item)(callUpdate);
      }
    });
  }
}

const TypePickerListenerTypes = {
  update: "update",
  select: "select"
};

interface TypePickerListener {
  type: string;
  payload: Selection[] | TypePickerData;
  types?: any;
}

export default function TypePicker(option: TypePickerConfig): void {
  const updater = new Updater({
    selection: 1,
    date: Timex.today(),
    useInvalidAsSelected: false,
    size: 1,
    ...getOptions(option)
  });
  const applyDates = (dates: TimexDate[]): void => {
    const setDates = pipe(
      (dates: TimexDate[]) => dates.slice(0, updater.config.selection),
      (dates: TimexDate[]) => dates.filter(Timex.isDate),
      (dates: TimexDate[]) => List.dedup(dates, setDatesDedupe),
      (dates: TimexDate[]) => (List.every(dates, Timex.isDate) ? dates : []),
      (dates: TimexDate[]) => dates.sort((t1, t2) => +t1 - +t2)
    );
    Timex.delay(() => {
      updater.push(setDates(dates), true);
    });
  };

  this.listen = (next: (options: TypePickerListener) => void) => {
    updater.pubsub.subscribe(
      TypePickerListenerTypes.update,
      (payload: TypePickerData) =>
        next({
          type: TypePickerListenerTypes.update,
          payload,
          types: TypePickerListenerTypes
        })
    );
    updater.pubsub.subscribe(
      TypePickerListenerTypes.select,
      (payload: Selection[]) =>
        next({
          type: TypePickerListenerTypes.select,
          payload,
          types: TypePickerListenerTypes
        })
    );
  };

  const select = (date: TimexDate | TimexDate[]) => {
    if (List.isList(date)) {
      date = (<TimexDate[]>date).pop();
    }
    updater.push(date);
  };

  this.apply = {
    dates: applyDates,
    disableDate: (handler: (date: TimexDate) => boolean) =>
      (updater.disables.find = handler),
    date: (date: TimexDate) => updater.update(date, null),
    update: () => updater.update(null, null),
    select
  };
  Timex.delay(() => {
    this.apply.select(updater.config.date, true);
  });
}
