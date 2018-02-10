import '../src/style.styl'
import './test.styl'
// import Popper from './popper'


import Popper from './popper.js'

//
// console.log(Popper)
import {format} from '../src/datepicker.formatter'
import DatePicker from '../src/index'
import {source, languages as language} from './mock'
import {addClass} from "../src/util";


const date = new Date();
const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
};
const from = new Date(dist.year, dist.month, dist.date)
const to = new Date(dist.year, dist.month + 9, 0);
const currDate = new Date(dist.year, dist.month, dist.date);
const dateFormat = 'YYYY-M-D';
const initDates = function () {
    const nextDate = new Date(+currDate + (60 * 60 * 24 * 3 * 1000));
    const dates = [currDate, nextDate];
    return <Array<string>> dates.map(item => format(item, dateFormat).value)
};
const formControl = <HTMLInputElement> document.getElementById("date-value");
formControl.value = initDates().join(" ");
const pop = <HTMLElement> document.querySelector(".popup");
function createDatePicker(onUpdate: Function, create: boolean = true, selected?: Array<any>) {
    let datepicker = null;
    if (create) {
        datepicker = <any>new DatePicker({
            el: document.getElementById("datepicker"),
            to,
            from,
            limit: 7,
            language,
            bindData: true,
            format: dateFormat,
            doubleSelect: true,
            defaultLanguage: "jp",
            views: 2
        });
        if (datepicker) {
            datepicker.on("update", onUpdate);
            datepicker.on("data", (result: any) => {
                const data = result.data;
                const nodeList = result.nodeList;
                for (let i = 0; i < nodeList.length; i++) {
                    let node = nodeList[i];
                    let date = node.getAttribute("data-date");
                    if (date in data) {
                        let itemData = source[date];
                        if (itemData.highlight) {
                            addClass(node, "highlight")
                        }
                        let placeholder: HTMLElement = node.querySelector(".placeholder");
                        placeholder.innerHTML = itemData.value
                    } else {
                        addClass(node, "disabled")
                    }
                }
            });
            if (selected.length >= 2) {
                datepicker.setDates(selected, true);
            }
            datepicker.disable({
                dates: "2018-2-16", days: [123]
            });
            datepicker.data((params: any) => {
                Object.keys(source).forEach(date => {
                    let item = datepicker.parse(date);
                    if (datepicker.diff(item, currDate) >= 0) {
                        params.dates.push(date)
                    } else {
                        // delete source[date]
                    }
                });


                params.data = source;
                return params
            });
        }
    }
    return datepicker
}
function onUpdate(result: any = {value: <Array<string>>[], type: <string>''}) {
    if (result.type === 'selected' && result.value.length === 2) {
        pop.style.display = 'none'
    }
    formControl.value = result.value;
    formControl.nextElementSibling.innerHTML = `type:${result.type}`
}


function init(document: Document) {
    document.addEventListener("click", (e) => {
        const target = <HTMLElement> e.target;
        const popupVisible = window.getComputedStyle(pop, null).getPropertyValue("display") === 'block';
        if (target) {
            const parent = <HTMLElement>target.parentNode;
            if (parent.nodeType === 1) {
                if (parent.classList.contains("input-group")) {
                    if (!popupVisible) {
                        pop.style.display = 'block'
                    }

                }
                else if (parent.tagName.toLowerCase() === 'body') {
                    if (popupVisible) {
                        pop.style.display = 'none'
                    }
                }

            }

        }
    });
}
createDatePicker(onUpdate, true, formControl.value.split(" "));
init(document);
