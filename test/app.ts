import '../src/style.styl'
import './test.styl'


import Pop from './popup'


import DatePicker from '../src/index'

import {source, languages} from './mock'
import {addClass} from "../src/util";


const date = new Date();
const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
};
const from = new Date(dist.year, dist.month, dist.date)
const to = new Date(dist.year, dist.month + 5, dist.date);
const datepicker = <any>new DatePicker({
    el: '#datepicker',
    from,
    to,
    language: languages,
    format: "YYYY-M-D",
    doubleSelect: true,
    limit: 7,
    defaultLanguage: "zh-cn",
    multiViews: false,
    flatView: true,
    bindData: true,
    zeroPadding: true
});


// const popup = new Pop({
//     el: '.popup'
// });
//

// YYYY/MM/DD YYYY-MM-DD


// console.log(new Date("2018-01-01"),new Date("2018/01/01"),)



datepicker.on("update", (output: any) => {
    console.log("onupdate", output)


    console.log("onupdate")

    document.getElementById("layout").innerHTML = `选中的日期<br/>${output.value}`;
    if (output.length >= 2) {
        // datepicker.dateRanges(output.value)
    }
});
// calendar.dateRanges();
// datepicker.dateRanges(["2018-1-10", "2018-1-14"]);


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


datepicker.data((params: any) => {
    const keys = Object.keys(source);

    const currDate = new Date(dist.year, dist.month, dist.date);
    for (let i = 0; i < keys.length; i++) {


        let item = datepicker.parse(keys[i]);

        // console.info(item)

        if (datepicker.diff(item, currDate) >= 0) {
            params.dates.push(keys[i])
        } else {
            // delete source[keys[i]]
        }
    }
    params.from = from;
    params.to = to;
    params.data = source;
});

//
// const dateValue: HTMLElement = document.getElementById('date-value');
//
//
//
//
// dateValue.addEventListener("click", () => {
//
//
//
//     // popup.open();
//
// })
