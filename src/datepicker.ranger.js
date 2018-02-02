import { attr, diff, addClass, hasClass, removeClass, attrSelector, } from "./util";
var date = new Date();
var currDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
function getRange(collection, start, end) {
    var temp = [];
    for (var i = 0; i < collection.length; i++) {
        var date_1 = attr(collection[i], "data-date");
        if (date_1) {
            temp.push(date_1);
        }
    }
    var startIndex = -1;
    var endIndex = -1;
    for (var i = 0; i < temp.length; i++) {
        var data = temp[i];
        if (data === start) {
            startIndex = i;
        }
        else if (data === end) {
            endIndex = i;
        }
    }
    if (endIndex === startIndex || endIndex < 0) {
        return [];
    }
    return temp.slice(startIndex + 1, endIndex);
}
function setStartAndEnd(collection, inDates, data, parse) {
    var temp = [];
    var start = data[0];
    var end = data[data.length - 1];
    for (var i = 0; i < collection.length; i++) {
        var item = collection[i];
        var nextItem = collection[i + 1];
        if (data.length > 0) {
            var date_2 = attr(collection[i], "data-date");
            if (date_2 === start) {
                addClass(item, "start-date");
            }
            else if (date_2 === end) {
                addClass(item, "end-date");
            }
        }
        else {
            if (item && nextItem) {
                var curr = attr(item, "data-date");
                var next = attr(nextItem, "data-date");
                if (curr && next) {
                    var start_1 = parse(curr);
                    if (diff(start_1, currDate, "days") >= 0) {
                        var hasItem = inDates(next) && inDates(curr) || inDates(curr) && !inDates(next);
                        if (hasItem) {
                            if (temp.length < 2) {
                                addClass(item, "start-date");
                                addClass(nextItem, "end-date");
                                temp.push(curr, next);
                            }
                        }
                    }
                }
            }
        }
    }
    if (data.length > 0) {
        temp = data;
    }
    return temp;
}
export function setRange(data, collector, remove, clearRange) {
    if (remove) {
        var collection = collector.querySelectorAll(".in-range");
        for (var i = 0; i < collection.length; i++) {
            removeClass(collection[i], "in-range");
        }
    }
    else {
        for (var i = 0; i < data.length; i++) {
            var selector = attrSelector("data-date", data[i]);
            var element = collector.querySelector(selector);
            if (!hasClass(element, "active")) {
                addClass(element, "in-range");
            }
        }
    }
    if (clearRange) {
        return [];
    }
}
export function setInitRange(options) {
    var collector = options.collector, collection = options.collection, data = options.data, isDouble = options.isDouble, parse = options.parse, format = options.format, inDates = options.inDates, isInit = options.isInit;
    var dates = [];
    if (!isDouble) {
        dates = data;
    }
    else {
        if (data.length >= 2) {
            var start_2 = data[0];
            var end_1 = data[data.length - 1];
            if (!inDates(start_2)) {
                data = [];
            }
            var startDate = parse(start_2);
            var endDate = parse(end_1);
            var year = startDate.getFullYear();
            var month = startDate.getMonth();
            var date_3 = startDate.getDate();
            var inValidDates = [];
            var gap = diff(endDate, startDate, "days") + 1;
            for (var i = 0; i < gap; i++) {
                var d = new Date(year, month, date_3 + i);
                var formatted = format(d).value;
                if (!inDates(formatted)) {
                    inValidDates.push(formatted);
                }
            }
            if (inValidDates.length >= 2) {
                data = [];
            }
        }
        if (data.length > 0 && isInit || !isInit) {
            dates = setStartAndEnd(collection, inDates, data, parse);
        }
        var start = dates[0];
        var end = dates[dates.length - 1];
        var range = getRange(collection, start, end);
        if (range.length > 0) {
            setRange(range, collector, false);
        }
    }
    for (var i = 0; i < dates.length; i++) {
        var selector = attrSelector("data-date", dates[i]);
        var element = collector.querySelector(selector);
        addClass(element, "active");
    }
    return dates;
}
