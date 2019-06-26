// @ts-ignore

import TypePicker from "../src";

import { i18n, source } from "./mock";

const input = <HTMLInputElement>document.getElementById("date-value");
const { startDate, endDate } = (() => {
  const date = new Date();
  const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
  };
  const startDate = new Date(dist.year, dist.month, dist.date);
  const endDate = new Date(dist.year, dist.month + 6, dist.date);

  return {
    startDate,
    endDate
  };
})();

const options = {
  el: document.getElementById("datepicker"),
  //   startDate,
  //   endDate,
  limit: 10,
  format: "YYYY-MM-DD",
  selection: 3,
  views: 2,
  lastSelectedItemCanBeInvalid: false
};

const app = new TypePicker(options);

console.log(app);
app.onSelect((value: any[]) => {
  console.log("onselect", value);

  input.value = value.join("");
});
app.onRender(nodeList => {
  for (let i = 0; i < nodeList.length; i++) {
    let node = nodeList[i];
    let date = node.getAttribute("data-date");
    let disable = node.getAttribute("data-disabled");

    if (disable) {
      disable = JSON.parse(disable);
    }
    let placeholder: HTMLElement = node.querySelector(".placeholder");
    let data = source[date];
    if (!disable && data) {
      if (data.highlight) node.classList.add("highlight");
      placeholder.innerText = data.value;
    }
  }
});

app.i18n(i18n["zh-cn"]);

app.disable({
  // dates: [
  //   "2018-2-18",
  //   "2018-2-19",
  //   "2018-2-22",
  //   "2018-2-23",
  //   new Date(),
  //   "2018-2-27",
  //   "2018-2-25",
  //   "2018-3-28",
  //   "2018-3-22",
  //   "2018-3-20",
  //   "2018-4-19",
  //   "2018-4-18",
  //   "2018-4-20",
  //   "2018-4-29",
  //   "2018-4-30",
  //   "2018-10-1",
  //   "2018-10-2"
  // ],
  //   dates: ["2019-6-21", "2019-6-27", "2019-6-28"],
  //   to: "2019-6-1", // new Date(2018, 10, 1),
  //   from: "2019-8-28", //new Date(2019, 7, 15)
  days: [4, 5]
});

// app.setDates([
//   // "2019-6-25",
//   "2019-6-28",
//   // "2019-6-29",
//   // "2019-6-30",
//   // "2019-7-1",
//   "2019-7-3"
// ]);

app.setDates([
  //   new Date(),
  "2017-07-18"
  //   new Date(),
  //   "2019-6-20",
  //   "2019-6-26",
  //   "2019-6-28",
  //   "2019-6-29",
  //   // "2019-6-29",
  //   // "2019-6-30",
  //   "2019-7-1",
  //   "2019-7-3"
]);
