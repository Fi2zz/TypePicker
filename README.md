
### Options

| OPTION       | TYPE               | DESC                       | 默认值,可选值          |
|--------------|--------------------|----------------------------|------------------|
| el           | string,HTMLElement | element to mount DatePcker         |   
| from         | Date               | 开始日期                       | new Date         |
| to           | Date               | 结束日期                       | new Date() + 6个月 |
| doubleSelect | boolean            | 双选                         | false            |
| limit        | number             | 双选情况下，日期跨度限制，单选自动设置为1      |                  |
| views        | number,string      | 日期展示数量，“auto”为竖向展示多个月份<br> | auto,1,2         |
	
	
###  Apis

##### Pass option to DatePicker


| API         | DESC                                     |
|-------------|------------------------------------------|
| setDates    | Set init dates to DatePicker,more detail see below |
| setLanguage | Set Datapicker's language,more detail see below |
| setData     | Set data to DatePicker,more detail see below |
| setDisabled | Set disable dates to DataPicker,more detail see below |
| parse       | Transform date string into date object   |
| format      | Trranform date object inito string       |
| on          | Event listener                           |
| diff        | Diff between two dates                   |



##### Not pass option to DatePicker
| API    | DESC                                     | EXAMPLE                                  |
|--------|------------------------------------------|------------------------------------------|
| diff   | Compare two dates                        | diff(new Date(2018,1,18),new Date(2018,1,19)) => 1 |
| format | Transform date object into formatted string | format(new Date(),'YYYY-MM-DD') =>2018-02-18 |
| parse  | Transfor formatted string into date object | parse("2018-02-18","YYYY-MM-DD") =>Sun Feb 18 2018 00:00:00 GMT+0800 (中国标准时间) |

    

                
### USAGE
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
                ],
                days: [1, 5, 2, 6]
            });
            //set data to DatePicker
            
            datepicker.setData((params: any) => {
            
                //params.data accept Oject like {
                //  
                //  "2018-1-31":123,
                //  "2018-2-21":123,
                //  
                //}
                
                // params.dates accept  Array like ["2018-1-31","2018-2-21"]
            
                Object.keys(source).forEach(date => {
                    let item = datepicker.parse(date);
                    if (datepicker.diff(item, currDate) >= 0) {
                        params.dates.push(date)
                    } else {
                        // delete source[date]
                    }
                });
                params.data = source;
                return params
            });
            datepicker.setLanguage(language[activeLanguageCode])
        }
       
       
       

```






	
	
	
	
	


