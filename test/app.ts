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

const calendar = <any>new DatePicker({
    el: '.calendar-container',
    from: new Date(dist.year, dist.month, dist.date),
    to: new Date(dist.year, dist.month + 4, dist.date),
    language: languages,
    format: "YYYY-MM-DD",
    doubleSelect: true,
    limit: 7,
    defaultLanguage: "en-us",
    multiViews: true,
    flatView: false,
});
calendar.on("update", (output: any) => {
    document.getElementById("layout").innerHTML = `选中的日期${output}`
});
calendar.on("data", (result: any) => {
    const data = result.data;
    const nodeList = result.nodeList;
    for (let i = 0; i < nodeList.length; i++) {
        let node = nodeList[i];
        let date = node.getAttribute("data-date");
        if (date in data) {
            let itemData = data[date];
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

calendar.data(source);





