import '../src/style.styl'
import './test.styl'


import DatePicker from '../src/index'
import {source, languages as language} from './mock'
import {addClass, diff} from "../src/util";

const date = new Date();

const dateFormat = 'YYYY-M-D';
const activeLanguageCode: string = "en-us";
const formControl = <HTMLInputElement> document.getElementById("date-value");

function createDatePicker(create: boolean = true, selected?: Array<any>) {

    let datepicker = null;
    if (create) {
        const dist = {
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate()
        };
        const currDate = new Date(dist.year, dist.month, dist.date);
        const from = new Date(dist.year, dist.month, dist.date);
        const to = new Date(dist.year, dist.month + 7, dist.date);
        datepicker = <any>new DatePicker({
            el: document.getElementById("datepicker"),
            to,
            from,
            limit: 7,
            format: dateFormat,
            doubleSelect: true,
            views: 2//'auto'
        });
        console.log(datepicker);


        if (datepicker) {
            datepicker.on("update", (result: any) => {

                // console.log(JSON.stringify(result,null,2));
                if (result.type === 'selected' && result.value.length === 2) {
                    popupHandler(false)
                }
                formControl.value = result.value;
            });
            datepicker.on("disabled", (result: any) => {
                const {dateList, nodeList} = result;
                for (let n = 0; n < nodeList.length; n++) {
                    let node = nodeList[n];
                    if (dateList[node.getAttribute("data-date")]) {
                        node.classList.add('disabled')
                    }
                }
            });
            datepicker.on("data", (result: any) => {
                const data = result.data;
                const nodeList = result.nodeList;
                for (let i = 0; i < nodeList.length; i++) {
                    let node = nodeList[i];
                    let date = node.getAttribute("data-date");
                    if (date in data) {
                        if (!node.classList.contains("disabled")) {
                            let itemData = source[date];
                            if (itemData.highlight) {
                                addClass(node, "highlight")
                            }
                            let placeholder: HTMLElement = node.querySelector(".placeholder");
                            placeholder.innerHTML = itemData.value

                        }

                    } else {
                        addClass(node, "disabled")
                    }
                }
            });
            if (selected.length >= 2) {
                datepicker.setDates(selected);
            }

            datepicker.setDisabled({
                dates: [
                    // "2018-2-18",
                    // "2018-2-19",
                    // "2018-2-22",
                    // "2018-2-23",
                    // "2018-3-24",
                    "2018-2-27",
                    "2018-2-25",
                    "2018-3-28",
                ],
                // days: [1, 5, 2, 6]
            });

            const bindData = true;
            if (bindData) {
                datepicker.setData(() => {
                    Object.keys(source).forEach(date => {
                        let item = datepicker.parse(date);
                        if (datepicker.diff(item, currDate) < 0) {
                            delete source[date]
                        }
                    });
                    return source
                });
            }

            datepicker.setLanguage(language[activeLanguageCode])
        }
    }
    return datepicker
}

function popupHandler(visible: boolean) {
    const pop = <HTMLElement> document.querySelector(".popup");
    pop.style.display = visible ? 'block' : 'none';
}

function init(document: Document) {
    createDatePicker(true, formControl.value.split(" "));
    document.addEventListener("click", (e) => {
        const target = <HTMLElement> e.target;
        if (target) {
            const parent = <HTMLElement>target.parentNode;
            if (parent.nodeType === 1) {
                if (target.tagName.toLowerCase() === 'input') {
                    popupHandler(true);
                }
                else if (parent.tagName.toLowerCase() === 'body') {
                    popupHandler(false);
                }
            } else {
                popupHandler(false);
            }
        }
    });
}

init(document);
