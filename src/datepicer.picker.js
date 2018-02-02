import { diff, attr, removeClass, addClass, attrSelector, hasClass, } from "./util";
import { setRange } from './datepicker.ranger';
export default function (options) {
    var element = options.element, selected = options.selected, isDouble = options.isDouble, parse = options.parse, format = options.format, limit = options.limit, inDates = options.inDates, update = options.update, infiniteMode = options.infiniteMode, bindData = options.bindData;
    var init = selected;
    var collection = element.querySelectorAll(".calendar-date-cell");
    var _loop_1 = function (i) {
        var item = collection[i];
        item.addEventListener("click", function () {
            var cache = selected;
            var date = attr(item, "data-date");
            var index = selected.indexOf(date);
            if (!date || (selected.length <= 0 && !inDates(date)) && bindData) {
                return false;
            }
            if (index >= 0) {
                selected = [selected[0]];
            }
            if (isDouble && selected.length >= 2 || !isDouble) {
                selected = [];
            }
            selected.push(date);
            if (isDouble) {
                var handlerOptions = {
                    date: date, selected: selected, cache: cache, limit: limit, format: format, parse: parse,
                    inDates: inDates,
                    infiniteMode: infiniteMode,
                    bindData: bindData
                };
                var handled = doubleSelectHandler(handlerOptions);
                selected = handled.selected;
                var range = handled.range;
                var allValid = handled.allValid;
                var start = selected[0];
                var end = selected[selected.length - 1];
                var diff_1 = gap(parse(start), parse(end));
                var isOutOfLimit = diff_1 > limit;
                var isValid = doublePick(element, start, end, diff_1, isOutOfLimit, allValid);
                if (isValid) {
                    setRange([], element, true);
                }
                if (allValid && isValid) {
                    setRange(range, element, false);
                }
            }
            else {
                var selector = item;
                var shouldChange = true;
                if (!inDates(date)) {
                    selected = cache;
                    shouldChange = false;
                }
                singlePick(selector, element, shouldChange);
            }
            var type = isDouble ? init.join("-") === selected.join("-") ? 'disabled' : 'selected' : 'selected';
            update({
                type: type,
                value: selected
            });
        });
    };
    for (var i = 0; i < collection.length; i++) {
        _loop_1(i);
    }
}
function singlePick(selector, collector, shouldChange) {
    if (shouldChange) {
        var actives = collector.querySelectorAll(".active");
        for (var i = 0; i < actives.length; i++) {
            removeClass(actives[i], "active");
        }
        if (!hasClass(selector, "disabled")) {
            addClass(selector, "active");
        }
    }
}
function doublePick(collector, start, end, diff, outOfLimit, valid) {
    var cache = {
        start: collector.querySelector(".start-date"),
        end: collector.querySelector(".end-date")
    };
    var current = {
        start: collector.querySelector(attrSelector("data-date", start)),
        end: collector.querySelector(attrSelector("data-date", end))
    };
    if (diff === 0) {
        if (!hasClass(current.start, "disabled")) {
            removeClass(cache.start, "start-date");
            removeClass(cache.start, "active");
            removeClass(cache.end, "end-date");
            removeClass(cache.end, "active");
            addClass(current.start, "active");
            addClass(current.start, "start-date");
            return true;
        }
        else {
            return false;
        }
    }
    else {
        addClass(current.end, "active");
        if (diff > 0) {
            if (outOfLimit) {
                addClass(current.end, "start-date");
                removeClass(cache.start, "start-date");
                removeClass(cache.start, "active");
            }
            else {
                if (valid) {
                    addClass(current.end, "end-date");
                }
                else {
                    removeClass(current.start, "active");
                    removeClass(current.start, "start-date");
                    addClass(current.end, "start-date");
                }
            }
        }
        else if (diff < 0) {
            removeClass(current.start, "active");
            removeClass(current.start, "start-date");
            addClass(current.end, "start-date");
        }
    }
    return true;
}
function gap(d1, d2) {
    var value = diff(d1, d2, "days");
    return value === 0 ? 0 : value * -1;
}
function doubleSelectHandler(options) {
    var selected = options.selected, date = options.date, cache = options.cache, limit = options.limit, format = options.format, parse = options.parse, inDates = options.inDates, bindData = options.bindData;
    var range = [];
    var inRange = [];
    var allValid = false;
    var start = selected[0];
    var end = selected[selected.length - 1];
    var startDate = parse(start), endDate = parse(end);
    if (bindData) {
        var diff_2 = gap(startDate, endDate);
        var length_1 = selected.length;
        if (length_1 >= 2) {
            if (diff_2 <= 0) {
                if (inDates(date)) {
                    selected.shift();
                }
                else {
                    selected = [selected[0]];
                }
            }
            else {
                if (inDates(end)) {
                    var year = startDate.getFullYear(), month = startDate.getMonth(), date_1 = startDate.getDate();
                    for (var i = 1; i < diff_2; i++) {
                        var d = new Date(year, month, date_1 + i);
                        var formatted = format(d).value;
                        if (inDates(formatted)) {
                            inRange.push(formatted);
                        }
                        range.push(formatted);
                    }
                }
                else {
                    if (inDates() && end) {
                        selected.shift();
                        range.push(end);
                    }
                }
            }
        }
        else if (length_1 === 1) {
            var start_1 = selected[selected.length - 1];
            if (inDates(start_1)) {
                selected = [start_1];
            }
            else {
                if (cache.length >= 2) {
                    var validDates = [];
                    for (var i = 0; i < cache.length; i++) {
                        if (inDates(cache[i])) {
                            validDates.push(cache[i]);
                        }
                    }
                    if (validDates.length === cache.length) {
                        var front = cache[0];
                        var last = cache[cache.length - 1];
                        if (front !== last) {
                            selected = cache;
                        }
                        else {
                            selected = [front];
                        }
                    }
                    else {
                        selected = [];
                    }
                }
                else {
                    selected = [cache[0]];
                }
            }
        }
        else {
            selected = cache;
        }
        if (selected.length <= 0) {
            selected = cache;
        }
        allValid = range.length === inRange.length;
        if (!allValid) {
            selected = [selected[selected.length - 1]];
        }
        if (selected.length === 2) {
            var lastValidDate = null;
            var end_1 = selected[selected.length - 1];
            var endDate_1 = parse(end_1);
            var startDate_1 = parse(selected[0]);
            var diff_3 = gap(endDate_1, startDate_1) * -1;
            if (diff_3 > 0) {
                var year = startDate_1.getFullYear(), month = startDate_1.getMonth(), date_2 = startDate_1.getDate();
                range = [];
                inRange = [];
                for (var i = 0; i < diff_3; i++) {
                    var d = new Date(year, month, date_2 + i);
                    var string = format(d).value;
                    if (inDates(string)) {
                        lastValidDate = d;
                        inRange.push(string);
                    }
                    if (!~range.indexOf(string)) {
                        range.push(string);
                    }
                }
                var newDiff = gap(lastValidDate, endDate_1);
                if (newDiff === 1 || newDiff === -1) {
                    allValid = true;
                }
                else {
                    range = [];
                    selected = [selected[0]];
                    allValid = false;
                }
            }
            if (inRange.length === range.length) {
                allValid = true;
            }
            else {
                allValid = false;
                selected = [selected[0]];
            }
            if (range.length > limit) {
                allValid = false;
                var peek = selected[selected.length - 1];
                if (inDates(peek)) {
                    selected = [peek];
                }
                else {
                    selected = [cache[0]];
                }
            }
        }
    }
    else {
        if (selected.length >= 2) {
            if (start === end) {
                selected.pop();
            }
        }
        var diff_4 = gap(startDate, endDate);
        if (diff_4 > 0 && diff_4 <= limit) {
            for (var i = 1; i < diff_4; i++) {
                var date_3 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
                range.push(format(date_3).value);
            }
            allValid = true;
        }
        else if (diff_4 > limit || diff_4 < 0) {
            selected.shift();
        }
    }
    return {
        selected: selected,
        allValid: allValid,
        range: range
    };
}
