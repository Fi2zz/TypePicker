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
    if (!date.getTime()) date = null;
    return date;
}


export function format(date: Date, format: string, zeroPadding:boolean=true) {



    let shouldPadStart =true
    if(!zeroPadding){
        shouldPadStart =false
    }
    let parts = <any>{
        DD:shouldPadStart?padding(date.getDate()):date.getDate(),
        MM: shouldPadStart?padding(date.getMonth() + 1):date.getMonth()+1,
        YYYY: date.getFullYear()

    };
    return {
        origin: date,
        date: parts["DD"],
        month: parts["MM"],
        year: parts["YYYY"],
        day: date.getDay(),
        value: format.replace(/(?:\b|%)([dDMyYHhaAmsz]+|ap|AP)(?:\b|%)/g, function (match, $1) {
            return parts[$1] === undefined ? $1 : parts[$1]
        })
    }

}



// console.log(format(new Date,'DD/MM/YYYY',false))

export function parseFormatted(strDate: string, format: string) {
    const parts = <any>{
        DD: '([0-9][0-9])',
        dd: '([0-9][0-9])',
        MM: '([0-9][0-9])',
        mm: '([0-9][0-9])',
        YYYY: '([0-9][0-9][0-9][0-9])',
        yyyy: '([0-9][0-9][0-9][0-9])',
        '%': '',
    };
    let regex = '', i = 0, outputs = [''],
        token, matches, len;
    let tmp: any = ""
    let ret = parse(strDate);
    if (ret) return ret;
    ret = new Date(2000, 0, 1);
    while (i < format.length) {
        token = format.charAt(i);
        while ((i + 1 < format.length) && parts[token + format.charAt(i + 1)] !== undefined) {
            token += format.charAt(++i);
        }


        if ((tmp = parts[token]) !== undefined) {
            if (tmp !== '') {
                regex += parts[token];
                outputs.push(token);
            }
        } else {
            regex += token;
        }
        i++;
    }

    matches = strDate.match(new RegExp(regex));
    len = outputs.length;
    if (!matches || matches.length !== len) return null;
    for (i = 0; i < len; i++) {
        if ((token = outputs[i]) !== '') {
            tmp = parseToInt(matches[i]);
            switch (token) {
                case 'YYYY':
                    ret.setYear(tmp);
                    break;
                case 'MM':
                    ret.setMonth(tmp);
                    break;
                case 'DD':
                    ret.setDate(tmp);
                    break;
            }
        }

    }
    return ret;
}
