const range = (start, end, fill) =>
  Array.from("x".repeat(end - start + 1), (_, index) => start + index);

const map = (list, mapper) => list.map(mapper);

numbers = range(1, 10);

numbers = map(numbers, item => item * item);

numbers = numbers.reverse();

console.log(numbers);

// console.log(fill.repeat(3));
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const r = months.reduce((acc, curr) => {
  acc[curr] = curr;

  return acc;
}, {});

console.log(r);
