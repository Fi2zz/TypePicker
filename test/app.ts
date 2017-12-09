import DatePicker from '../src/index'
import '../src/style.styl'
import './test.styl'
import source from './source'
import languages from './languages'
import {addClass} from "../src/util";


const date = new Date();
const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
};
const from = new Date(dist.year, dist.month, dist.date)
const to = new Date(dist.year, dist.month + 5, dist.date);
const calendar = <any>new DatePicker({
    el: '.calendar-container',
    from: new Date(dist.year, dist.month, dist.date),
    to: new Date(dist.year, dist.month + 4, dist.date),
    language: languages,
    format: "YYYY-MM-DD",
    doubleSelect: true,
    limit: 9,
    defaultLanguage: "en-us",
    multiViews: false,
    flatView: false,
    bindData: true
});


calendar.on("update", (output: any) => {
    console.log("onupdate", output)
    document.getElementById("layout").innerHTML = `选中的日期<br/>${output}`
});
// calendar.dateRanges();
calendar.dateRanges([new Date(dist.year, dist.month, dist.date + 10), "2017-12-25"]);


calendar.on("data", (result: any) => {
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


calendar.data((params: any) => {
    const keys = Object.keys(source);
    const currDate = new Date(dist.year, dist.month, dist.date);
    for (let i = 0; i < keys.length; i++) {
        let item = calendar.parse(keys[i]);
        if (calendar.diff(item, currDate) >= 0) {
            params.dates.push(keys[i])
        } else {
            delete source[keys[i]]
        }
    }
    params.from = from;
    params.to = to;
    params.data = source;
    // params.dates = [];
    // calendar.update()
    return params
});




