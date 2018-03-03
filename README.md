
### OPTIONS

| OPTION       | TYPE               | DESC                                     | DEFAULT VALUE  |
|--------------|--------------------|------------------------------------------|-----------------------|
| el           | string,HTMLElement | element to mount DatePcker               |                       |
| from         | Date               | Start date of DatePicker                 | new Date              |
| to           | Date               | End date of DatePicker                   | new Date() + 6 months |
| doubleSelect | boolean            | Enable pick two dates                    | false                 |
| limit        | number             | Limitation between two dates while `doubleSelect` is on |                       |
| views        | number,string      | Display views of DatePicker              | auto,1,2              |
	
	
###  API



| API         | DESC                                     |
|-------------|------------------------------------------|
| setDates    | Set init dates to DatePicker,more detail see below |
| setLanguage | Set Datapicker's language,more detail see below |
| setData     | Set data to DatePicker,more detail see below |
| setDisabled | Set disable dates to DataPicker,more detail see below |
| parse       | Transform date string into date object   |
| format      | Transform date object into string       |
| on          | Event listener                           |
| diff        | Diff between two dates                   |




                
### USAGE
```typescript

        
      //es module
      import DatePicker from '/dist/datepicker.esm.js'
      
      //cjs
      const DatePicker =require("/dist/datepicker.js");
      
      //umd
      //<script src="/dist/datepicker.min.js"></script>

       const date = new Date();
       const dist = {
           year: date.getFullYear(),
           month: date.getMonth(),
           date: date.getDate()
       };
       
       const from = new Date(dist.year, dist.month, dist.date)
       const to = new Date(dist.year, dist.month + 9, 0);
       const currDate = new Date(dist.year, dist.month, dist.date);
       const dateFormat = 'YYYY-M-D';
       
         datepicker = <any>new DatePicker({
            el: document.getElementById("datepicker"),
            to,
            from,
            limit: 7,
            format: dateFormat,
            doubleSelect: true,
            views: 1
        });
        if (datepicker) {
            datepicker.on("update", (result: any) => {
                //`update`  fired by select dates
                //result contains two keys
                // value =>  selected dates
                // type  =>  two types => init,selected
                // your code goes here
                
            });
            datepicker.on("disabled", (result: any) => {
                
                // `disabled`event fired by `setDisabled`
                //set disabled state to HTML nodes
                
                const {dateList, nodeList} = result;
                
                for (let n = 0; n < nodeList.length; n++) {
                    let node = nodeList[n];
                    if (dateList[node.getAttribute("data-date")]) {
                        node.classList.add('disabled')
                    }
                }
                
            });
            datepicker.on("data", (result: any) => {
                // 'data' event fired by `setData` 
                //set HTML nodes 
            
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
            datepicker.setDates(selected);
            //disabled dates, 
            // dates<tuple>,accept <Date> and  <string>
            // days<Array<number>> accept 0,1,2,3,4,5,6
            datepicker.setDisabled({
                dates: [
                    "2018-2-18",
                    "2018-2-19",
                    "2018-2-22",
                    new Date
                ],
                days: [1, 5, 2, 6]
            });
            //set data to DatePicker
            datepicker.setData(() => {
                    
                    
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
            }
            datepicker.setLanguage(language)
        }
       
       
       

```






	
	
	
	
	


