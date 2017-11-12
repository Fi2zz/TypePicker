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


export function format(date: Date, format: string, lang?: any) {


  let parts = <any>{

    DD: padding(date.getDate()),
    MM: padding(date.getMonth() + 1),
    YYYY: date.getFullYear()

  };

  return {
    origin: date,
    date: parts["DD"],
    month: parts["MM"],
    year: parts["YYYy"],
    day: date.getDay(),
    value: format.replace(/(?:\b|%)([dDMyYHhaAmsz]+|ap|AP)(?:\b|%)/g, function (match, $1) {
      return parts[$1] === undefined ? $1 : parts[$1]
    })
  }

}

export function parseFormatted(strDate: string, format: string) {

  // format = format.toLowerCase()

  const parts =
    <any>
      {
        // d: '([0-9][0-9]?)',
        DD: '([0-9][0-9])',
        dd: '([0-9][0-9])',
        // M: '([0-9][0-9]?)',
        MM: '([0-9][0-9])',
        mm: '([0-9][0-9])',
        YYYY: '([0-9][0-9][0-9][0-9])',
        yyyy: '([0-9][0-9][0-9][0-9])',
        // yyy: '([0-9][0-9])[y]',
        // yy: '([0-9][0-9])',
        // H: '([0-9][0-9]?)',
        // hh: '([0-9][0-9])',
        // h: '([0-9][0-9]?)',
        // HH: '([0-9][0-9])',
        // m: '([0-9][0-9]?)',
        // MM: '([0-9][0-9])',
        // s: '([0-9][0-9]?)',
        // ss: '([0-9][0-9])',
        // z: '([0-9][0-9]?[0-9]?)',
        // zz: '([0-9][0-9]?[0-9]?)[z]',
        // zzz: '([0-9][0-9][0-9])',
        // ap: '([ap][m])',
        // a: '([ap][m])',
        // AP: '([AP][M])',
        // A: '([AP][M])',
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
    // console.log(token)
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
