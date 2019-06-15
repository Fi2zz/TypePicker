import TypePicker from "../src/index";
import { source, i18n } from "./mock";

const input = <HTMLInputElement>document.getElementById("date-value");
const { startDate, endDate } = (() => {
  const date = new Date();
  const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
  };
  const startDate = new Date(dist.year, dist.month, 29);
  const endDate = new Date(dist.year, dist.month + 1, dist.date);

  return {
    startDate,
    endDate
  };
})();

const options = {
  el: document.getElementById("datepicker"),
  startDate,
  endDate,
  limit: 10,
  format: "YYYY-M-D",
  selection: 2,
  views: 'auto',
  lastSelectedItemCanBeInvalid: false
};

const app = new TypePicker(options);
console.log(app);
app.onSelect((value: string[]) => (input.value = value.join(",")));
app.onRender(nodeList => {
  for (let i = 0; i < nodeList.length; i++) {
    let node = nodeList[i];
    let date = node.getAttribute("data-date");
    let disable = node.getAttribute("data-disabled");

    if (disable) {
      disable = JSON.parse(disable);
    }

    let placeholder = node.querySelector(".placeholder");

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
  // from: "2018-10-1", // new Date(2018, 10, 1),
  // to: "2019-10-1" //new Date(2019, 7, 15)
  // days: [4, 5]
});
app.setDates([
  // "2018-9-27",
  // "2018-9-28",
  "2019-6-16",
  // "2019-6-14"
]);
