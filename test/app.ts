import '../src/style.styl'
import './test.styl'


import DatePicker from '../src/index'
import {source, languages} from './mock'
import {addClass} from "../src/util";

const date = new Date();
const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
};
const from = new Date(dist.year, dist.month - 1, dist.date)
const to = new Date(dist.year, dist.month + 9, 0);


const popTrigger = document.getElementById("date-value");

const pop: HTMLElement = document.querySelector(".popup")


function createDatePicker() {


    const options: any = {
        el: '#datepicker',
        from,
        to,
        language: languages,
        format: "YYYY-M-D",
        doubleSelect: true,
        limit: 7,
        defaultLanguage: "jp",
        multiViews: true,
        flatView: false,
        singleView: false,
        bindData: true,
        zeroPadding: false,
        infiniteMode: false
    };
    const datepicker = <any>new DatePicker(options);

    if (datepicker) {
        datepicker.on("update", (output: any) => layout(output));
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
        datepicker.dateRanges(["2018-2-16", "2018-2-18"], true);
        datepicker.disable({
            dates: "2018-2-16", days: [123]
        });
        datepicker.data((params: any) => {
            const currDate = new Date(dist.year, dist.month, dist.date);
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


function layout(result: any = {value: <Array<string>>[], type: <string>''}) {
    if (result.type === 'selected' && result.value.length === 2) {
        pop.style.display = 'none'
    }
    document.getElementById("layout").innerHTML = `选中的日期<br/>${result.type} / ${result.value}`;
}


popTrigger.addEventListener("click", () => {
    pop.style.display = 'block'
});

createDatePicker();




