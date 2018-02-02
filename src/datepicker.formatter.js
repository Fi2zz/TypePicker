import { padding } from "./util";
function parse(string) {
    if (!string)
        return new Date();
    if (string instanceof Date)
        return string;
    var date = new Date(string);
    if (!date.getTime())
        return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
export function format(date, format, zeroPadding) {
    if (zeroPadding === void 0) { zeroPadding = true; }
    var shouldPadStart = zeroPadding;
    if (!format) {
        format = 'YYYY-MM-DD';
    }
    var parts = {
        DD: shouldPadStart ? padding(date.getDate()) : date.getDate(),
        dd: shouldPadStart ? padding(date.getDate()) : date.getDate(),
        MM: shouldPadStart ? padding(date.getMonth() + 1) : date.getMonth() + 1,
        mm: shouldPadStart ? padding(date.getMonth() + 1) : date.getMonth() + 1,
        YYYY: date.getFullYear(),
        D: date.getDate(),
        d: date.getDate(),
        M: date.getMonth() + 1,
        m: date.getMonth() + 1
    };
    return {
        origin: date,
        date: shouldPadStart ? parts["DD"] : parts["D"],
        month: shouldPadStart ? parts["MM"] : parts["M"],
        year: parts["YYYY"],
        day: date.getDay(),
        value: format.replace(/(?:\b|%)([dDMyYHhaAmsz]+|ap|AP)(?:\b|%)/g, function (match, $1) {
            noop(match);
            return parts[$1] === undefined ? $1 : parts[$1];
        })
    };
}
function noop(a) {
    return a;
}
export function parseFormatted(strDate, format) {
    if (!format) {
        format = 'YYYY-MM-DD';
    }
    var ret = parse(strDate);
    if (ret)
        return ret;
    var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
    var parseFlags = {
        D: [/\d{1,2}/, function (d, v) { return d.day = parseInt(v); }],
        M: [/\d{1,2}/, function (d, v) { return (d.month = parseInt(v) - 1); }],
        DD: [/\d{2}/, function (d, v) { return d.day = parseInt(v); }],
        MM: [/\d{2}/, function (d, v) { return d.month = parseInt(v) - 1; }],
        YY: [/\d{2,4}/, function (d, v) { return d.year = parseInt(v); }],
        YYYY: [/\d{2,4}/, function (d, v) { return d.year = parseInt(v); }]
    };
    ret = function (dateStr, format) {
        if (dateStr.length > 1000) {
            return null;
        }
        var isValid = true;
        var dateInfo = {
            year: 0,
            month: 0,
            day: 0
        };
        format.replace(token, function ($0) {
            if (parseFlags[$0]) {
                var info = parseFlags[$0];
                var regExp = info[0];
                var handler_1 = info[info.length - 1];
                var index_1 = dateStr.search(regExp);
                if (!~index_1) {
                    isValid = false;
                }
                else {
                    dateStr.replace(info[0], function (result) {
                        handler_1(dateInfo, result);
                        dateStr = dateStr.substr(index_1 + result.length);
                        return result;
                    });
                }
            }
            return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
        });
        if (!isValid) {
            return null;
        }
        var parsed = new Date(dateInfo.year, dateInfo.month, dateInfo.day);
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };
    return ret(strDate, format);
}
