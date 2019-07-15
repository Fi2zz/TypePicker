import "./style.css";
import TypePicker from "../src";
import { i18n, source } from "./mock";
const input = <HTMLDivElement>document.getElementById("date-value");
const { startDate, endDate } = (() => {
  const date = new Date();
  const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
  };
  const startDate = new Date(dist.year - 1, 0, dist.date);
  const endDate = new Date(dist.year, dist.month, dist.date);
  return {
    startDate,
    endDate
  };
})();
const options = {
  el: document.getElementById("datepicker"),
  startDate,
  endDate,
  format: "YYYY-MM-DD",
  useInvalidAsSelected: true,
  selection: 2,
  views: "auto"
};

const app = new TypePicker(options);
app.onSelect((value: any[]) => {
  console.log("onselect", value);
  input.innerText = value.join(",");
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
  days: [3, 4, 5],
  dates: ["2019-06-21", "2019-6-27", "2019-07-28"],
  to: "2019-09-12", // new Date(2018, 10, 1),
  from: "2019-07-01" //new Date(2019, 7, 15)
});
app.setDates([
  "2019-07-22",
  "2019-07-25",
  "2019-05-03",
  "2019-05-03",
  "2019-07-15",
  "2019-08-15"
]);

console.log(app);

setTimeout(() => console.log("date", app.date), 0);
