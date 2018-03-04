
## OPTIONS

| OPTION       | TYPE               | DESC                                     | DEFAULT VALUE         |
|--------------|--------------------|------------------------------------------|-----------------------|
| el           | string,HTMLElement | element to mount DatePcker               |                       |
| startDate    | Date               | Start date of DatePicker                 | new Date              |
| endDate      | Date               | End date of DatePicker                   | new Date() + 6 months |
| doubleSelect | boolean            | Enable pick two dates                    | false                 |
| limit        | number             | Limitation between two dates while `doubleSelect` is on |                       |
| views        | number,string      | Display views of DatePicker              | auto,1,2              |

	
##  API


```typescript

   setDates([dates]:tuple);
   //Set  dates to DatePicker
   //dates accept <string> and <Date>
   
   setLanguage(language:any);
   //set DatePicker's language
   
   setData(data:any)
   //set data to DatePicker
   
   setDisabled({
        days?:Array<number>[5],
        dates?:Array<string|Date>,
        from?:<Date|string>,
        to?:<Date|string>
    })
   //Set disabled dates to DataPicker
   //dates =>dates accept <string> and <Date>,  all dates in [dates] will be disabled 
   //days => days accept number of [0~6],   all days in [days] will be disabled
   //from => from accept <string> or <Date>, all dates after [from] date will be disabled,eg: from = 2018-3-31 => disabled from 2018-4-1  
   //to   => to accept <string> or <Date> all dates before [to] date will be disabled, eg: to =2018-3-4 => all dates before 2018-3-5 will be disabled
   
   parse(formattedDate:string,dateFormat:string)
   //Transform date string into date object,return Date object
   //eg: formattedDate ='2018-3-4',format='YYYY-M-D" =>  new Date(2018,2,4)

   format(date:Date,format:string)
   //Transform date object into string,return string  
   //eg: date =new Date(),format='YYYY-MM-DD' => 2018-03-04

   on(event:string,fn:Function)
   //Event listener
   //eg: datePicker.on("event",(result)=>{ 
                //your logic
   //    })
   
   diff(date1:Date,date2:Date) 
   // Diff between two dates,return  number type 
    
```

## USAGE
```typescript

        
    //es module
    import DatePicker from '/dist/datepicker.esm.js'
      
    //cjs
    const DatePicker =require("/dist/datepicker.js");

    //umd
    <script src="/dist/datepicker.min.js"></script>
      
    const date = new Date();
    const dist = {
           year: date.getFullYear(),
           month: date.getMonth(),
           date: date.getDate()
    };
       
    const from = new Date(dist.year, dist.month, dist.date)
    const to = new Date(dist.year, dist.month + 9, 0);
    const currDate = new Date(dist.year, dist.month, dist.date);
       
    //setup DatePicker instance
    const app:any = new DatePicker({
            el: document.getElementById("datepicker"),
            endDate:to,
            startDate:from,
            limit: 7,
            format: 'YYYY-M-D',
            doubleSelect: true,
            views: 1
    });
       
       //`update`  fired by click on date cell or DatePicker init function 
    app.on("update", (result: any) => {
        // result contains two keys, `value` and `type`
        // value =>  selected dates
        // type  =>  two types => `init` and `selected`
        // place your logic  here
    });
       
    // `disabled`event fired by `setDisabled` and DatePicker init function
    app.on("disabled", (result: any) => {
        // result contains two keys, `dateList` and `nodeList`
        const {dateList, nodeList} = result;
        for (let n = 0; n < nodeList.length; n++) {
            let node = nodeList[n];
            if (dateList[node.getAttribute("data-date")]) {
                node.classList.add('disabled')
            }
        }
    });
       
    // 'data' event fired by `setData` 
    app.on("data", (result: any) => {
        //set HTML nodes states
        // result contains two keys, `data:any` and `nodeList:Array<string>`
                const data = result.data;
                const nodeList = result.nodeList;
                for (let i = 0; i < nodeList.length; i++) {
                    let node = nodeList[i];
                    let date = node.getAttribute("data-date");
                    if (date in data) {
                        if (!node.classList.contains("disabled")) {
                            let itemData = source[date];
                            if (itemData.highlight) {
                                addClass(node, "highlight")
                            }
                            let placeholder: HTMLElement = node.querySelector(".placeholder");
                            placeholder.innerHTML = itemData.value

                        }

                    } else {
                        addClass(node, "disabled")
                    }
                }
        });

       //tuple type,accept <string> and <Date>
       const selected=["2018-2-21",new Date()];
       //use `setDates` to set init dates to DatePicker instance 
       app.setDates(selected);

       // use `setDisabled` to set specified date or day to disabled,
       // `setDisabled` accept an object => {dates,days},
       // <tuple>dates,accept <Date> and  <string>
       // <Array<number>>days accept 0,1,2,3,4,5,6
       app.setDisabled({
                dates: [
                    "2018-2-18",
                    "2018-2-19",
                    "2018-2-22",
                    new Date
                ],
                days: [1, 5, 2, 6]
            });
       
        // To display your data,like price info on date cell, 
        // use `setData` to pass data to `DatePicker` instance
        // `setData` function will dispatch `data` event
        // setup a listener to handle it
       app.setData(() => {
                    
                    
                    /*data accept Object like
                     {
                       "2018-1-31":123,
                       "2018-2-21":123,
                        }
                    */
                    Object.keys(source).forEach(date => {
                        let item = datepicker.parse(date);
                        if (datepicker.diff(item, currDate) < 0) {
                            delete source[date]
                        }
                    });
                    return source
              });
       
       //set DatePicker's language
       //language options 
       const language={
                 days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                 months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                 year: "" 
       };
       app.setLanguage(language)
       
       
       

```






	
	
	
	
	


