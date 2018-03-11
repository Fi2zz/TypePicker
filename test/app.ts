import "../src/style.styl";
import "./test.styl";

import DatePicker from "../src/index";
import { source, languages as language } from "./mock";
import { addClass, diff } from "../src/util";

const date = new Date();

const dateFormat = "YYYY-M-D";
const activeLanguageCode: string = "en-us";
const formControl = <HTMLInputElement>document.getElementById("date-value");

function createDatePicker(create: boolean = true, selected?: Array<any>) {
  const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
  };
  const currDate = new Date(dist.year, dist.month, dist.date);
  const startDate = new Date(dist.year, dist.month, dist.date);
  const endDate = new Date(dist.year, dist.month + 20, dist.date);

  let app: any = create
    ? new DatePicker({
        el: document.getElementById("datepicker"),
        startDate,
        endDate,
        limit: 7,
        format: dateFormat,
        doubleSelect: true,
        views: 2 //'auto'
      })
    : null;

  if (app) {
    console.log(app);

    if (app) {
      app.on("update", (result: any) => {
        // console.log(JSON.stringify(result,null,2));
        if (result.type === "selected" && result.value.length === 2) {
          popupHandler(false);
        }
        formControl.value = result.value;
      });
      app.on("disabled", (result: any) => {
        const { dateList, nodeList } = result;
        for (let n = 0; n < nodeList.length; n++) {
          let node = nodeList[n];
          if (dateList[node.getAttribute("data-date")]) {
            node.classList.add("disabled");
          }
        }
      });
      app.on("data", (result: any) => {
        const data = result.data;
        const nodeList = result.nodeList;
        for (let i = 0; i < nodeList.length; i++) {
          let node = nodeList[i];
          let date = node.getAttribute("data-date");
          if (date in data) {
            if (!node.classList.contains("disabled")) {
              let itemData = source[date];
              if (itemData.highlight) {
                addClass(node, "highlight");
              }
              let placeholder: HTMLElement = node.querySelector(".placeholder");
              placeholder.innerHTML = itemData.value;
            }
          } else {
            addClass(node, "disabled");
          }
        }
      });
      if (selected.length >= 2) {
        app.setDates(selected);
      }

      app.setDisabled({
        dates: [
          "2018-2-18",
          "2018-2-19",
          "2018-2-22",
          "2018-2-23",
          new Date(),
          "2018-2-27",
          "2018-2-25",
          "2018-3-28",
          "2018-3-22",
          "2018-3-20",
          "2018-3-19"
        ],
        from: "2018-8-1",
        // to: new Date(2018, 6, 15)
        days: [5]
      });

      const bindData = true;
      if (bindData) {
        app.setData(() => {
          Object.keys(source).forEach(date => {
            let item = app.parse(date);

            if (diff(item, currDate) < 0) {
              delete source[date];
            }
          });
          return source;
        });
      }

      app.setLanguage(language[activeLanguageCode]);
    }
  }
  return app;
}

function popupHandler(visible: boolean) {
  const pop = <HTMLElement>document.querySelector(".popup");
  pop.style.display = visible ? "block" : "none";
}

function init(document: Document) {
  createDatePicker(true, ["2018-3-11", "2018-3-12"]);
  document.addEventListener("click", e => {
    const target = <HTMLElement>e.target;
    if (target) {
      const parent = <HTMLElement>target.parentNode;
      if (parent.nodeType === 1) {
        if (target.tagName.toLowerCase() === "input") {
          popupHandler(true);
        } else if (parent.tagName.toLowerCase() === "body") {
          popupHandler(false);
        }
      } else {
        popupHandler(false);
      }
    }
  });
}

init(document);
