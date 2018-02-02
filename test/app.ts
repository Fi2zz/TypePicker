import '../src/style.styl'
import './test.styl'



import DatePicker from '../src/index'

import { source, languages } from './mock'
import { addClass } from "../src/util";

const date = new Date();
const dist = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
};
const from = new Date(dist.year, dist.month, dist.date)
const to = new Date(dist.year, dist.month + 3, 0);


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


// datepicker.dateRanges([new Date(2018, 0, 31), new Date(2018, 1, 2)], true);

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


function layout(result: any = { value: <Array<string>>[], type: <string>'' }) {

    console.log(JSON.stringify(result,null,2))

    document.getElementById("layout").innerHTML = `选中的日期<br/>${result.type} / ${result.value}`;
}

function merge(...args: Array<any>) {


    let merged: any = {};

    function toString(object: any) {
        return Object.prototype.toString.call(object)
    }

    function whichType(object: any, type: string) {
        return toString(object) === `[object ${type}]`
    }

    function generateObject(target: any = {}, object: any) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                target[key] = object[key]
            }
        }
        return target
    }

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        if (arg) {
            if (whichType(arg, "Array")) {
                for (let i = 0; i < arg.length; i++) {
                    let argItem = arg[i];
                    if (whichType(argItem, "Object")) {
                        merged = generateObject(merged, argItem)
                    } else if (!whichType(argItem, "Date")) {
                        merged[argItem] = argItem
                    }
                }
            } else if (whichType(arg, "Object")) {
                merged = generateObject(merged, arg)
            } else if (whichType(arg, "String") || whichType(arg, "Number")) {
                merged[arg] = arg
            }
        }
    }
    return merged
}



merge(new Date(), options, [], 123, [123, { 120: 0 }, new Date()], { abc: 123 }, "123456", null, "", true, 0)


