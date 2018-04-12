import "../src/style.styl";
import "./test.styl";

import DatePicker from "../src/index";
import {source, languages as language} from "./mock";
import {addClass} from "../src/util";
import {diff, Observer, format} from "../src/datepicker.helpers";

const date = new Date();
const dateFormat = "YYYY-M-D";
const activeLanguageCode: string = "en-us";
const formControl = <HTMLInputElement>document.getElementById("date-value");

const ONE_DATE = (1000 * 3600 * 24);

let initDates = [format(new Date, dateFormat), "2018-4-14"];

formControl.value = initDates.join(",");

const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
};


const startDate = new Date(dist.year, dist.month, dist.date);
const endDate = new Date(dist.year + 10, dist.month + 6, dist.date);
const CONFIG = {
    startDate,
    endDate,
    limit: 7,
    format: dateFormat,
    doubleSelect: true,
    views: 2,
    selection: 0,
    bindData: true,
    selected: formControl.value.split(","),
    language: language[activeLanguageCode],
    data: source,
    controller: formControl
};


let instance = null;

function createDatePicker(config: any,) {
    let app = new DatePicker({
        el: "#datepicker",
        startDate: config.startDate,
        endDate: config.endDate,
        limit: config.limit,
        format: config.format,
        doubleSelect: config.doubleSelect,
        selection: config.selection,
        views: config.views
    });
    app.on("update", (result: any) => {
        if (result.type === "selected" && result.value.length === 2) {
            Observer.$emit("open", false)
        }
        Observer.$emit("selected", result.value);
    });
    app.on("disabled", (result: any) => {
        const {dateList, nodeList} = result;
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
    app.setDisabled({
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
        ],
        // from: new Date(2018, 4, 1), //"2018-5-1",
        // to: new Date(2018, 2, 15),
        days: [2]
    });

    console.log(config.selected)
    if (config.selected && config.selected.length >= 2) {
        app.setDates(config.selected);
    }
    if (config.bindData) {
        app.setData(() => {
            let currDate = new Date();
            Object.keys(config.data).forEach(date => {
                if (diff(app.parse(date, config.format), config.startDate, "days") < 0) {
                    delete source[date];
                }
            });
            return source;
        });
    }
    app.setLanguage(config.language);
    return app;
}


Observer.$on("selected", (result) => {
    CONFIG.controller.value = result;
});
Observer.$on("open", (result) => {

    const pop = <HTMLElement>document.querySelector(".popup");
    pop.style.display = result === true ? "block" : "none";
});

document.addEventListener("click", e => {
    const target = <HTMLElement>e.target;
    if (target) {
        const parent = <HTMLElement>target.parentNode;
        if (parent.nodeType === 1) {
            if (target.tagName.toLowerCase() === "input") {
                Observer.$emit("open", true);
                if (!instance) {
                    instance = createDatePicker(CONFIG);
                    console.log("init")
                }
            } else if (parent.tagName.toLowerCase() === "body") {
                Observer.$emit("open", false);

            }
        } else {

            Observer.$emit("open", false);
        }
    }
});
