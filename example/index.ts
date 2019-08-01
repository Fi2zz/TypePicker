import TypePickerExample from "./createPicker";

const picker = new TypePickerExample("#picker", {
  selection: 2,
  size: 9
});

picker.apply.disableDate((_: Date) => {
  // const date =_.getDate()
  const day = _.getDay();
  // return true; // all dates will be disabled
  // return day===4  // all Thu will be disabled
  // return date===1  //all first date of month will be disabled
  // return false // no date will be disabled
  return day === 4 || day === 2;
});
//the first month will be render
//here will render Jan of 2019
picker.apply.date(new Date(2019, 0, 1));
//dates to be selected when init
const datesToSet = [new Date("2019/07/31"), new Date("2019/08/02")];
picker.apply.dates(datesToSet);

picker.onSelect((value: any[]) => {
  console.log("onselect", value);
  document.getElementById("value").innerText = value.join(",");
});

window["pickerApp"] = picker;
