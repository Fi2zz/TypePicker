import TypePicker from "./createPicker";
const config = {
  format: "YYYY/MM/DD",
  useInvalidAsSelected: true,
  selection: 1,
  limit: 5,
  el: "#picker",
  startDate: new Date(2019, 0, 1),
  endDate: new Date(2019, 12, 1)
};
const picker = new TypePicker(config);

picker.onSelect((value: any[]) => {
  // console.log("onselect", value);
  document.getElementById("value").innerText = value.join(",");
});
const datesToSet = [new Date("2019/07/31"), new Date("2019/08/02")];

picker.apply.disableDate(date => {
  // const partials = {
  //   date: date.getDate(),
  //   year: date.getFullYear(),
  //   day: date.getDay(),
  //   month: date.getMonth()
  // };
  // const day = partials.day;
  // return true;
  // return day === 4 || day === 2; /// % 5 === 0; // 2;
});

picker.apply.date(new Date(2019, 0, 1));
picker.apply.dates(datesToSet);
// picker.apply.select(datesToSet);

window["pickerApp"] = picker;
