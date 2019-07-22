// #test_start

const hello = 123;
// #test_end

import "./style.css";
import TypePicker from "../src";
import { i18n, source } from "./mock";

const date = new Date();
const dist = {
  year: date.getFullYear(),
  month: date.getMonth(),
  date: date.getDate(),
  day: date.getDay()
};

const copy = target => JSON.parse(JSON.stringify(target));
const { startDate, endDate } = (dist => {
  const startDate = new Date(dist.year - 1, 0, dist.date);
  const endDate = new Date(dist.year, dist.month + 2, dist.date);
  return {
    startDate,
    endDate
  };
})(dist);

const basicConfig = {
  startDate,
  endDate,
  format: "YYYY-MM-DD",
  useInvalidAsSelected: false,
  selection: 2,
  limit: 4,
  views: 2
};

function createSingleView() {
  const el = (document.getElementById("single-view-app").style.display =
    "block");
  const config = copy(basicConfig);

  config.startDate = startDate;
  config.endDate = endDate;
  config.views = 1;
  config.el = "#single";
  const picker = new TypePicker(config);
  onReady(picker, document.getElementById("single-value"));
  return picker;
}

function createDoubleView() {
  document.getElementById("double-view-app").style.display = "block";
  const config = copy(basicConfig);

  config.el = "#double";
  config.startDate = startDate;
  config.endDate = endDate;
  config.views = 2;
  const picker = new TypePicker(config);
  onReady(picker, document.getElementById("double-value"));
  return picker;
}

function createFlatView() {
  document.getElementById("flat-view-app").style.display = "block";
  const config = copy(basicConfig);
  config.selection = 1;
  config.views = "auto";
  config.el = "#flat";
  config.useInvalidAsSelected = false;
  config.startDate = new Date(config.startDate);
  config.endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 2,
    endDate.getDate()
  );
  const picker = new TypePicker(config);
  onReady(picker, document.getElementById("flat-value"));
  return picker;
}

// const input = <HTMLDivElement>document.getElementById("date-value");

// const options = {
//   el: document.getElementById("datepicker"),
//   startDate,
//   endDate,
//   format: "YYYY-MM-DD",
//   useInvalidAsSelected: true,
//   selection: 2,
//   views: 2 // "auto"
// };

// const app = new TypePicker(options);

function onReady(app, element) {
  app.onSelect((value: any[]) => {
    console.log("onselect", value);
    element.innerText = value.join(",");
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
}
const datesToSet = ["2019-07-22", "2019-07-25"];
const disable = {
  // to: "2019-06-12",
  // from: "2019-12-12",
  dates: ["2019-07-25", "2019-08-01"],
  days: [0, dist.day, 6]
};
// const flatViewTypePicker = createFlatView();
// flatViewTypePicker.setDates(datesToSet);
// flatViewTypePicker.disable(disable);

// const singleViewTypePicker = createSingleView();
// singleViewTypePicker.disable(disable);
// singleViewTypePicker.setDates(datesToSet);
const doubleViewTypePicker = createDoubleView();
doubleViewTypePicker.disable(disable);
doubleViewTypePicker.setDates([new Date()]);
doubleViewTypePicker.setDates(datesToSet);
