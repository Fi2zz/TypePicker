import TypePicker from "./src/index";
import { source, languages as language } from "./test/mock";

export function hasClass(ele: any, className: string) {
  if (!ele) {
    return false;
  }
  return new RegExp("(\\s|^)" + className + "(\\s|$)").test(ele.className);
}

export function addClass(ele: any, className: string) {
  if (!ele || hasClass(ele, className)) return;
  ele.className += (ele.className ? " " : "") + className;
}

const date = new Date();
const dateFormat = "YYYY-M-D";
const activeLanguageCode: string = "en-us";
const formControl = <HTMLInputElement>document.getElementById("date-value");
const activeLanguage = language[activeLanguageCode];

const dist = {
  year: date.getFullYear(),
  month: date.getMonth(),
  date: date.getDate()
};
const startDate = new Date(dist.year, dist.month, dist.date);
const endDate = new Date(dist.year, dist.month + 6, dist.date);
let options = {
  el: "#datepicker", // document.getElementById("datepicker"),
  startDate,
  endDate,
  limit: 10,
  format: dateFormat,
  selection: 2,
  views: 2,
  infinite: true,
  lastSelectedItemCanBeInvalid: false
};

function createDatePicker(options) {
  let app = new TypePicker(options);

  console.log(app);
  app.on("select", (value: any) => {
    formControl.value = value;
  });

  app.on("render", nodeList => {
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

  app.i18n({
    title: `MM YYYY`,
    days: activeLanguage.days,
    months: activeLanguage.months
  });

  app.disable({
    dates: [
      "2018-2-18",
      "2018-2-19",
      "2018-2-22",
      "2018-2-23",
      // new Date(),
      "2018-2-27",
      "2018-2-25",
      "2018-3-28",
      "2018-3-22",
      "2018-3-20",
      "2018-4-19",
      "2018-4-18",
      "2018-4-20",
      "2018-4-29",
      "2018-4-30",
      "2018-10-1",
      "2018-10-2"
    ],
    // from: new Date(2018, 10, 1),
    // to: new Date(2019, 7, 15),
    days: [4, 5]
  });
  app.setDates([
    // "2018-9-27",
    // "2018-9-28",
    "2018-10-6",
    "2018-10-11"
  ]);

  // app.update();
  return app;
}

function popupHandler(visible: boolean) {
  const pop = <HTMLElement>document.querySelector(".popup");
  pop.style.display = visible ? "block" : "none";
}

function init(document: Document) {
  createDatePicker(options);

  document.addEventListener("click", e => {
    const target = <HTMLElement>e.target;
    if (target) {
      const parent = <HTMLElement>target.parentNode;

      if (!parent) {
        return null;
      }

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
