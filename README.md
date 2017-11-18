
| api|    类型| 说明|
|----|----    |----|
|el|string|选择器,用于挂载日历|
|multiViews<sup>*</sup>              |Boolean          |展示多个日历视图，目前支持两个日历横向展示|
|flatView<sup>*</sup>              |Boolean          |单个日历视图|
|from<sup>**<sup> 	|Date|                             开始日期|
|to    |Date|                            结束日期|
|language<sup>[0]</sup>|Map                         | 语言包|
|defaultLanguage |String                |  当前选择日历语言，需要和language选项配合使用|
|format |string|                           日期格式|
|doubleSelect|Boolean|                      是否双选，对于酒店和车船票机票比较有用|
|bindData<sup>***</sup>   |Boolean|                      绑定数据到日历，|
|limit   |Number|                          双选情况下，限制最大跨度,如果`doubleSelect=false`,则自动限制为`1`|


    *    multiViews和flatView都为true的情况下，自动转换成multiviews
    *    multiViews和flatView都为false的情况下，垂直展示多个月份，移动端会比较有用
    **   from默认是new Date(),to默认为new Date()往后推6个月
    ***  bindData,如果不想显示价格，开启此项即可，同时将移除data事件,此时再调用data相关的事件和方法无法生效
                
*使用方法

        
    const date = new Date();
    const dist = {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate()
    };
    
    const datePicker = <any>new DatePicker({
        el: '.calendar-container',
        from: new Date(dist.year, dist.month, dist.date),
        to: new Date(dist.year, dist.month + 4, dist.date),
        language: languages,
        format: "YYYY-MM-DD",
        doubleSelect: true,
        limit: 7,
        defaultLanguage: "en-us",
        multiViews: true,
        flatView: false,
    });
    datePicker.on("update", (output: any) => {
        document.getElementById("layout").innerHTML = `选中的日期${output}`
    });
    
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
                if (itemData.highlight) {
                    addClass(node, "highlight")
                }
                let placeholder: HTMLElement = node.querySelector(".placeholder");
                placeholder.innerHTML = itemData.value
            } else {
                addClass(node, "disabled")
            }
        }
    });
    
    //初始化后，需要手动调用一下data方法，把日历数据传入日历
    calendar.data((params: any) => {
        //params为calendar.data的callback 的参数
        //包含两个key， data 和dates
        const keys = Object.keys(source);
        const currDate = new Date(dist.year, dist.month, dist.date);
        for (let i = 0; i < keys.length; i++) {
            let item = datePicker.parse(keys[i]);
            //筛选有效日期
            if (datePicker.diff(item, currDate) >= 0) {
                params.dates.push(keys[i])
            } else {
                delete source[keys[i]]
            }
        }
        params.data = source;
        return params
    });
        
        

	
* datePicker实例返回一个对象，对象包含以下

|api|type |Desc|Example|
|---|---|---|---|
|diff[1]|Function|计算日期差，返回值为一个number类型|`datePicker.diff(d1,d2)` |
|parse <sup>[2]</sup>|Function|把格式化后的日期反格式化,返回一个Date对象| `datePicker.parse(dateString)`  |
|format <sup>[3]</sup>|Function| 把格式化的日期,返回一个对象| `datePicker.format(DateObject)`  |
|on <sup>[4]</sup>|Function|事件监听器|  `datePicker.on("update",data=>{})`  |
|update   |event| 更新日历数据|`datePicker,on("update",data=>{ })`|
|data   |event|  获取日历数据 | `datePicker.on("data",data=>{ })`|
|data|Function|初始化日历数据，仅在初始化的时候需要调用 `datePicker.data(data)`  |


[0] language语言包,由以下构成
	
	{
         "zh-cn": {
            days: ['日', '一', '二', '三', '四', '五', '六'],
            months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
            year: "年"
            },
        "jp": {
            days: ['日', '月', '火', '水', '木', '金', '土'],
            months: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
            year: "年"
        },
    }
		

[1] 目前仅支持计算两个日期差，不支持月份差，参数类型是`Date`类型；
[2] 日期格式和`option.format`相同，不需要传入format,返回Date对象，如；

		datePicker.parse("2017-11-11") // new Date(2017,10,11)
[3] 日期格式和`option.format`相同，不需要传入format,返回如下对象

	{
		origin:<Date> //传入的Date对象
		date:<String>	//日期
		month:<String>//月份
		year:<String>//年份
		value:<String>//格式化后的日期,如 2017-11-11
	}	
[4] 事件监听,`update`事件，获取日期选择更新,`data`事件，渲染日历数据
	
	
	
	
	
	
	


