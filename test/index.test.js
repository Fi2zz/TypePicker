const { default: TypePicker } = require("../src");

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const map = months.reduce((acc, curr, index) => {
  acc[curr] = curr;
  return acc;
}, {});

//   listen: [Function],
//   apply:{ dates: [Function: applyDates],
//           disableDate: [Function: disableDate],
//           date: [Function: date],
//           update: [Function: update]
//           select: [Function]
//  }

describe("TypePicker", () => {
  test("config.size, Picker data size of 12", done => {
    const picker = new TypePicker({ size: 12 });
    picker.listen(({ type, types, payload }) => {
      if (type === types.update) {
        expect(payload.length).toBe(12);
        done();
      }
    });
    picker.apply.date(new Date(2019, 2, 1));
  });

  test("config.useInvalidAsSelected,Has disabled date", done => {
    const picker = new TypePicker({
      size: 12,
      selection: 2,
      useInvalidAsSelected: true
    });
    picker.listen(({ type, types, payload }) => {
      if (type === types.select) {
        // console.log(payload);
        expect(payload.length).toBe(2);
        done();
      }
    });
    picker.apply.dates([new Date(2019, 6, 2), new Date(2019, 6, 3)]);
    picker.apply.disableDate(date => {
      return date.toISOString() === new Date(2019, 6, 3).toISOString();
    });
  });

  test("config.selection,Has 2 selected dates", done => {
    const picker = new TypePicker({
      size: 12,
      selection: 2
    });
    picker.listen(({ type, types, payload }) => {
      if (type === types.select) {
        expect(payload.length).toBe(2);
        done();
      }
    });
    picker.apply.dates([new Date(2019, 6, 2), new Date(2019, 6, 3)]);
  });

  test("apply.date, Month of first picker data item is " + map.Mar, done => {
    const picker = new TypePicker();

    picker.listen(({ type, types, payload }) => {
      if (type === types.update) {
        const firstMonth = payload.shift();
        const month = months[firstMonth.month];
        expect(month).toBe(map.Mar);
        done();
      }
    });
    picker.apply.date(new Date(2019, 2, 1));
  });

  test("apply.date, Month of last picker data item is Feb", done => {
    const picker = new TypePicker({ size: 12 });
    picker.listen(({ type, types, payload }) => {
      if (type === types.update) {
        const last = payload.pop();
        const month = months[last.month];
        expect(month).toBe("Feb");
        done();
      }
    });
    picker.apply.date(new Date(2019, 2, 1));
  });

  test("apply.dates,Only 1 selected date", done => {
    const picker = new TypePicker({
      size: 12,
      selection: 1
    });
    picker.listen(({ type, types, payload }) => {
      if (type === types.select) {
        expect(payload.length).toBe(1);
        done();
      }
    });
    picker.apply.dates([new Date(2019, 6, 2), new Date(2019, 6, 3)]);
  });

  test("apply.dates,Has 3 selected date", done => {
    const config = {
      size: 12,
      selection: 3
    };

    const picker = new TypePicker(config);
    picker.listen(({ type, types, payload }) => {
      if (type === types.select) {
        expect(payload.length).toBe(config.selection);
        done();
      }
    });
    picker.apply.dates([
      new Date(2019, 6, 2),
      new Date(2019, 6, 3),
      new Date(2019, 6, 4),
      new Date(2019, 6, 5)
    ]);
  });

  test("apply.disableDate,Only 1 date selected", done => {
    const picker = new TypePicker({ size: 12, selection: 2 });
    picker.listen(({ type, types, payload }) => {
      if (type === types.select) {
        // console.log(payload);
        expect(payload.length).toBe(1);
        done();
      }
    });
    picker.apply.dates([new Date(2019, 6, 1), new Date(2019, 6, 2)]);
    picker.apply.disableDate(date => {
      return date.toISOString() === new Date(2019, 6, 1).toISOString();
    });
  });

  test("apply.disableDate,No selected", done => {
    const picker = new TypePicker({ size: 1, selection: 2 });

    const types = [];
    const map = {
      select: null,
      update: null
    };

    picker.listen(({ type, payload }) => {
      types.push(type);

      // done();
    });

    setTimeout(() => {
      console.log(types);
      done();
    }, 5006);
    // picker.apply.disableDate(date => true);
    // expect(map.select).toBe(null);
    // expect(map.update).toBe(null);
    console.log(types);
    // done();
  });
});
