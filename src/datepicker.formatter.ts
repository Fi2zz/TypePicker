import {padding} from "./util"

function parseToInt(value: any) {
    return parseInt(value, 10);
}

function convertTo24Hour(hour: any, ap: any = "am") {
    let curr = parseToInt(hour);
    return ap.toLowerCase() === 'pm' ? (curr < 12 ? (curr + 12) : curr) : (curr === 12 ? 0 : curr);
}

function parse(string: string | Date): any {
    if (!string) return new Date();
    if (string instanceof Date) return string;
    let date = new Date(string);

    if (!date.getTime()) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function format(date: Date, format: string, zeroPadding: boolean = true) {
    const shouldPadStart = zeroPadding;


    if (!format) {
        format = 'YYYY-MM-DD'
    }

    let parts = <any>{
        DD: shouldPadStart ? padding(date.getDate()) : date.getDate(),
        dd: shouldPadStart ? padding(date.getDate()) : date.getDate(),
        MM: shouldPadStart ? padding(date.getMonth() + 1) : date.getMonth() + 1,
        mm: shouldPadStart ? padding(date.getMonth() + 1) : date.getMonth() + 1,
        YYYY: date.getFullYear(),
        D: date.getDate(),
        d: date.getDate(),
        M: date.getMonth() + 1,
        m: date.getMonth() + 1,
    };
    return {
        origin: date,
        date: shouldPadStart ? parts["DD"] : parts["D"],
        month: shouldPadStart ? parts["MM"] : parts["M"],
        year: parts["YYYY"],
        day: date.getDay(),
        value: format.replace(/(?:\b|%)([dDMyYHhaAmsz]+|ap|AP)(?:\b|%)/g, function (match, $1) {
            return parts[$1] === undefined ? $1 : parts[$1]
        })
    }

}


export function parseFormatted(strDate: string, format: string) {
    //能直接解析成日期对象的，直接返回日期对象
    //如 YYYY/MM/DD YYYY-MM-DD
    let ret = parse(strDate);
    if (ret) return ret;
    const token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
    const parseFlags: any = {
        D: [/\d{1,2}/, (d: any, v: any) => d.day = parseInt(v)],
        M: [/\d{1,2}/, (d: any, v: any) => (d.month = parseInt(v) - 1)],
        DD: [/\d{2}/, (d: any, v: any) => d.day = parseInt(v)],
        MM: [/\d{2}/, (d: any, v: any) => d.month = parseInt(v) - 1],
        YY: [/\d{2,4}/, (d: any, v: any) => d.year = parseInt(v)],
        YYYY: [/\d{2,4}/, (d: any, v: any) => d.year = parseInt(v)],
    };
    ret = function (dateStr: string, format: string) {
        if (dateStr.length > 1000) {
            return null;
        }
        let isValid = true;
        const dateInfo = {
            year: 0,
            month: 0,
            day: 0
        };
        format.replace(token, function ($0) {
            if (parseFlags[$0]) {
                const info = parseFlags[$0];
                const regExp = info[0];
                const handler = info[info.length - 1];
                const index = dateStr.search(regExp);
                if (!~index) {
                    isValid = false;
                } else {
                    dateStr.replace(info[0], function (result) {
                        handler(dateInfo, result);
                        dateStr = dateStr.substr(index + result.length);
                        return result;
                    });
                }
            }

            return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
        });

        if (!isValid) {
            return null;
        }
        const parsed = new Date(dateInfo.year, dateInfo.month, dateInfo.day);
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };

    return ret(strDate, format)
}
