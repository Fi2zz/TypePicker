const isDate = v => v instanceof Date;

const ALPHABET_AND_NUMBER_RE = /[A-Za-z0-9]/g;

function createDateFormatRegExpression(format) {
  const separator = format.replace(ALPHABET_AND_NUMBER_RE, "").trim();
  const result = format
    .split(/\W/)
    .map((string, index) => {
      let { length } = string;
      let sep =
        index - 1 === -1
          ? ""
          : separator[index - 1]
          ? separator[index - 1]
          : "";
      let partial = "";
      if (index === 0) {
        partial = `(^[0-9]{${length}})`;
      } else if (index === 1) {
        let suffix = `[1-9]|1[0-2]`;
        let prefix = `${length === 1 ? "" : "0"}`;
        partial = `(${prefix}${suffix})`;
      } else if (index === 2) {
        const group$1 = `${length === 2 ? 0 : ""}[1-9]`.trim();
        const group$2 = "(1|2)[0-9]";
        const group$3 = "30|31";
        partial = `((${group$1})|(${group$2})|(${group$3}))`.trim();
      }
      return sep + partial;
    })
    .join("");
  return new RegExp(`${result}$`);
}

function format(date, format) {
  if (!isDate(date)) {
    if (new RegExp(format, "g").test(date)) {
      return date;
    }

    return null;
  }
  if (!format) {
    format = "YYYY-MM-DD";
  }
  format = format.toUpperCase();
  let parts = {
    YYYY: date.getFullYear(),
    DD: padding(date.getDate()),
    MM: padding(date.getMonth() + 1),
    D: date.getDate(),
    M: date.getMonth() + 1
  };

  return format.replace(/(?:\b|%)([dDMyY]+)(?:\b|%)/g, $1 =>
    parts[$1] === undefined ? $1 : parts[$1]
  );
}

const d = "2009-10-10";

const formats = "YYYY-MM-DD";
console.log(format(d, formats));
console.log(createDateFormatRegExpression(formats).test(d));
