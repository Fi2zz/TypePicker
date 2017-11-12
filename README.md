
| api|    类型| 说明|
|----|----    |----|
|el|string|选择器|
|multiViews              |Boolean          |展示多个日历视图，目前支持两个日历横向展示|
|flatView              |Boolean          |展示多个日历视图，目前支持两个日历横向展示|
|from 	|Date|                             开始日期|
|to    |Date|                            结束日期|
|language<sup>[0]</sup>|Map                         | 语言包|
|defaultLanguage |String                |  当前选择日历语言，需要和language选项配合使用|
|format |string|                           日期格式|
|doubleSelect|Boolean|                      是否双选，对于酒店和车船票机票比较有用|
|limit   |Number|                          双选情况下，限制最大跨度,如果`doubleSelect=false`,则自动限制为`1`|
|update   |event|                          获取选择的日期|
|data   |event|                          渲染日历数据|
|data   |function|                       传入日历数据|


                  
                  
                  
*使用方法

        
    const date = new Date();
    const dist = {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate()
    };
    
    const calendar = <any>new DatePicker({
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
    calendar.on("update", (output: any) => {
        document.getElementById("layout").innerHTML = `选中的日期${output}`
    });
    
    //通过data事件来控制每个日期格子展示的数据
    calendar.on("data", (result: any) => {
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
    calendar.data(source);
    

	
* datePicker实例返回的以下方法

|Function|Desc|Example|
|---|---|---|
|diff <sup>[1]</sup>|计算日期差| `let diffs= datePicker.diff(d1,d2)`,返回一个number  |
|parse <sup>[2]</sup>|把格式化后的日期反格式化,返回一个Date对象| `let parsed= datePicker.parse(dateString)`  |
|format <sup>[3]</sup>|把格式化的日期,返回一个对象| `let parsed= datePicker.format(DateObject)`  |
|data|初始化日历数据，仅在初始化的时候需要调用 `datePicker.data(data)`  |
|on <sup>[4]</sup>|事件监听器| `datePicker.on("update",data=>{})`  |


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
	
	
	
	
	
	
	


