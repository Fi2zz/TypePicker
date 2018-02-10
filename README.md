
| api|    类型| 说明|
|----|----    |----|
|el|String|选择器,用于挂载日历|
|from<sup>**<sup> 	|Date|                             开始日期|
|to    |Date|                            结束日期|
|language<sup>[0]</sup>|Map                         | 语言包，默认为简体中文语言包| 
|defaultLanguage |String                |  当前选择日历语言，需要和language选项配合使用，没有默认值|
|format |String|                           日期格式|
|doubleSelect|Boolean|                      是否双选，对于酒店和车船票机票比较有用|
|bindData<sup>***</sup>   |Boolean|                      绑定数据到日历，|
|limit   |Number|                          双选情况下，限制最大跨度,如果`doubleSelect=false`,则自动限制为`1`|
|view   |Number|String|                    日曆視圖數量，大於2或小於0或者其他字符串都會設置為singleView,如果傳入的是auto會被設置為flatView      |

    **   from默认是new Date(),to默认为new Date()往后推6个月
    ***  bindData,如果不想显示价格，开启此项即可，同时将移除data事件,此时再调用data相关的事件和方法无法生效
                
*使用方法
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
       //不传参可以获取到parse format diff 三个方法
       //分别是反格式日期化方法、格式化日期方法、对比日期方法
       const datepickerUtil = new DatePicker;
       const options ={
              el: document.getElementById("datepicker"),
              to,
              from,
              limit: 7,
              language,
              bindData: true,
              format: dateFormat,
              doubleSelect: true,
              defaultLanguage: "zh",
              views: 1
            };
        const datePicker = <any>new DatePicker(options);
        //更新选择的日期
        datePicker.on("update", (output: any) => {
            const {type,value}=output;
            //type => 'init'或'selected'
            //valye => 选择的日期
            document.getElementById("layout").innerHTML = `选中的日期${value}`
        });
        //设置默认日期，使用datePicker.dateRanges方法
        //如果不需要设置默认选中的日期，不执行此方法即可    
        //dateRanges =<Array<any>>[<Date>|<string>]
        const  dateRanges:Array<any> =[new Date(),"2017-12-20"];
        datePicker.setDates(dateRanges);
        //通过data事件来控制每个日期格子展示的数据
        datePicker.on("data", (result: any) => {
            //返回传入的数据和nodeList
            //返回传入的数据是因为需要和外部的数据做校验
            const data = result.data;
            const nodeList = result.nodeList;
            for (let i = 0; i < nodeList.length; i++) {
                let node = nodeList[i];
                let date = node.getAttribute("data-date");
                if (date in data) {
                    let itemData = data[date];
                    let placeholder: HTMLElement = node.querySelector(".placeholder");
                    placeholder.innerHTML = itemData.value
                } else {
                    node.classList.add("disabled")
                }
            }
        });
        
        //初始化后，需要手动调用一下data方法，把日历数据传入日历
        datePicker.data((params: any) => {
            //params为datePicker.data的callback 的参数
            /* params={
                    dates:Array<string>["2017-11-18",...,"2017-12-31"],
                    data:<Map>{
                        "2017-11-18":<any>,
                        ...,
                         "2017-12-31":<any>,
                    }
                    data的类型为map,由如下key-value的形式组成
            */
            Object.keys(source).forEach(date=>{
              let item = datePicker.parse(date);
                   if (datepickerUtil.diff(item, currDate) >= 0) {
                      params.dates.push(item)
                  } else {
                      delete source[date]
                  }      
            });
            params.data = source;
        });
```

* utils方法（不传入option）
```typescript
    const {diff,parse,format} =new DatePicker
   // diff   比較兩個日期相差幾天       const days= diff(new Date(2018,1,1),new Date(2018,1,5)) => 4
   // parse  把格式化后的日期反格式化   const  parsed  = parse("2018-02-01","YYYY-MM-DD");   =>  Thu Feb 01 2018 00:00:00 GMT+0800 (CST)
   // format 格式化日期                  const  formatted  = parse(new Date(),"YYYY-MM-DD");  =>    2018-02-01           
```    
            
	
* datePicker实例返回一个对象，对象包含以下

        diff
            type     [Function]
            desc     计算日期差，返回值为一个number类型
        
        parse
            type     [Function]
            desc     把格式化后的日期反格式化,返回一个Date对象
            example  `datePicker.parse("2018-02-10","YYYY-MM-DD")`
        
        format [Function]
            type     [Function]
            desc     格式化日期
            example  `datePicker.format(new Date,"YYYY-MM-DD") => 2018-02-10
                
        
        on  
            type     [Funtion]
            desc     事件监听器，目前支持 update[4] 和 data 事件
            
        
        data  
           type      [Function]
           desc      设置日历数据，需要和bindData配合使用
            
        
        setDates 
           type      [Function]
           desc      设置日期,接受一个数组，元素类型可以为Date或string
           example   datePicker.setDates([new Date,"2018-02-14"]) 
 
        disable [Function]



[0] language语言包,由以下构成
```json
	{
         "zh-cn": {
            "days": ["日", "一", "二", "三", "四", "五", "六"],
            "months": [
                "01月",
                "02月", 
                "03月", 
                "04月",
                "05月", 
                "06月", 
                "07月", 
                "08月", 
                "09月", 
                "10月", 
                "11月", 
                "12月"],
            "year":"年"    
            }
    }
```	

[4] 事件监听,`update`事件，获取日期选择更新,`data`事件，渲染日历数据
	
	
	
	
	
	


