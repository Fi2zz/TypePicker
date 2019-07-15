# TypePicker

##### uh! naming project is the most difficult thing of the world

DatePicker build with typescript

<a href="./react/index.js"> react version</a> <a href="./vue/index.vue"> vue version </a>

<table>
    <tr>
    <td colspan="2">
            <h4>Double views</h4>
            <img src="assets/double.png">
        </td>
    </tr>
    <tr>
        <td valign="top">
            <h4>Single view</h4>
            <img src="assets/single.png">
        </td>
        <td>
            <h4>Flat view</h4>
            <img src="assets/auto.png">
        </td>
    </tr>
    
</table>

## FEATURES

1.  Easy to display data on html element by using `onRender`
2.  Support double views,flat view and single view
3.  Support multi selection

## OPTIONS

| OPTION    | REQUIRED | TYPE               | DESC                                   | Default /Possible Value |
| --------- | -------- | ------------------ | -------------------------------------- | ----------------------- |
| el        | YES      | string,HTMLElement | Element or selector to mount DatePcker |                         |
| format    | YES      | string             | Date string format                     | YYYY-MM-DD              |
| startDate | NO       | Date               | Start date of DatePicker               | null                    |
| endDate   | NO       | Date               | End date of DatePicker                 | null                    |
| limit     | NO       | number             | Limitation between two dates           | 1                       |
| views     | NO       | number,string      | Display views of DatePicker            | auto,1,2                |
| selection | NO       | number             | Size of dates can be picked            | 1                       |

```
NOTE

`limit` option only works when `selection` option's value is 2

```

## API

```typescript

   public setDates(dates:tuple);
   //Set  dates to DatePicker
   //dates accept <string> and <Date>
   //the datepicker i18n
   public i18n({
                days:Array<number>,
                months:Array<string>,
                title:<string>
            });

   public disable({
        days?:Array<number>,
        dates?:Array<string|Date>,
        from?:<Date|string>,
        to?:<Date|string>
    })
   //Set disabled dates to DataPicker
   //dates =>dates accept <string> and <Date>,  all dates in [dates] will be disabled
   //days => days accept number of [0~6],   all days in [days] will be disabled
   //from => from accept <string> or <Date>, all dates after [from] date will be disabled,
   //        eg: from = 2018-3-31 => disabled from 2018-4-1
   //to   => to accept <string> or <Date> all dates before [to] date will be disabled,
   //        eg: to =2018-3-4 => all dates before 2018-3-5 will be disabled


   public onSelect(fn:Function);
   //trigger when date picked

   public onRender(fn:Function);
   //trigger every time TypePicker render


```

## HOW TO USE

### use build tools,like webpack

if you're using TypeScript

```typescript
import TypePicker from "./src/index.ts";
```

if you are using JavaScript

```javascript
//import js file
import TypePicker from "/dist/datepicker.js";
//import css file
import "/dist/style.css";
```

### legacy way

```html
<script src="/dist/datepicker.js"></script>
<link href="/dist/style.css" rel="stylesheet" />
```

```typescript

const date = new Date();
const dist = {
   year: date.getFullYear(),
   month: date.getMonth(),
   date: date.getDate()
};

const from = new Date(dist.year, dist.month, dist.date)
const to = new Date(dist.year, dist.month + 9, 0);
const currDate = new Date(dist.year, dist.month, dist.date);

//setup typePicker instance
const app = new TypePicker({
    el: document.getElementById("datepicker"),
    endDate:to,
    startDate:from,
    limit: 7,
    format: 'YYYY-M-D',
    views: 1,
    selection:4
});


//get nodes list from  TypePicker instance.
//use `onRender`,you could put your data to DOMs outside TypePicker instance
app.onRender(nodeList => {


for (let i = 0; i < nodeList.length; i++) {
    let node = nodeList[i];
    let date = node.getAttribute("data-date");
    let disable =node.getAttribute('data-disabled');

    if(disable){
	disable =JSON.parse(disable)
    }
    let data =YOUR_SOURCE_WHATEVER_YOU_LIKE[date];
    //render your value to datepicker
    if(data&& !disable){
	node.querySelector(".placeholder").innerText = data.value;
    }

}
});

//get selected dates from TypePicker instance
app.onSelect(value => {
// place your logic  here
//eg:
// document.getElementById("dates").innerText = value
});


//use `setDates` to set init dates to DatePicker instance
//`setDates` accept an array which type can be string and Date.
//as type string, dates' format must be the same as TypePicker's date format
app.setDates(["2018-2-21",new Date()]);

// use `disable` to set specified date or day to disabled,
// `disable ` accept an object => {dates,days,from,to},
// dates<Array<any>>,accept <Date> and  <string>
// days<Array<number>>,accept 0,1,2,3,4,5,6
// from<Date|string>,as type string,who's format must be the same as TypePicker's date format
// to<Date|string> ,as type string,who's format must be the same as TypePicker's date format
app.disable({
    dates: [
	"2018-2-18",
	"2018-2-19",
	"2018-2-22",
	new Date
    ],
    days: [1, 5, 2, 6],
    from:new Date(2018,2,10)
    to:'2018-7-15'
});

//TypePicker i18n
app.i18n({
    days:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    title:"YYYY MM"
})


```
