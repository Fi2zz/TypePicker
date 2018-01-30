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
const to = new Date(dist.year, dist.month + 8, dist.date);

const datepicker = <any>new DatePicker({
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
    infiniteMode: true
});

datepicker.on("update", (output: any) => {
    document.getElementById("layout").innerHTML = `选中的日期<br/>${output.type} / ${output.value}`;
});


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



datepicker.dateRanges(["2018-2-3", "2018-2-7"], true);

datepicker.data((params: any) => {
    const currDate = new Date(dist.year, dist.month, dist.date);
    Object.keys(source).forEach(date => {
        let item = datepicker.parse(date);
        if (datepicker.diff(item, currDate) >= 0) {
            params.dates.push(date)
        } else {
            delete source[date]
        }
    });
    // params.from = from;
    // params.to = to;
    console.log(source)
    params.data = source;
});



