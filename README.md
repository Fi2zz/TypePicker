# TypePicker

##### uh! naming project is the most difficult thing of the world

A date picker use in web and react-native

## OPTIONS

| OPTION    | REQUIRED | TYPE   | DESC                        | Default /Possible Value |
| --------- | -------- | ------ | --------------------------- | ----------------------- |
| size      | NO       | number | Display views of DatePicker | 1              |
| selection | NO       | number | Size of dates can be picked | 1                       |



## API

```typescript


   public apply={
   				select		:(date:Date)=>void
   				date		:(date:Date)=>void
   				dates   	:(dates:Date[])=>void
   				update  	:()=>void;
   				disableDate	:(date:Date)=>boolean
   				
   			};
   			
   public listen(({type,types,payload})=>void)
   
   
   
   
```

## HOW TO USE

### use build tools,like webpack




```typescript


	import TypePicker from "./src/index.ts";
	
	
	const config = {
			size:1,
			selection:1
	}
	
		interface TypePickerDate {
		  date: Date;
		  invalid: boolean;
		  disabled: boolean;
		  status?: {
		    isActive?: boolean;
		    isStart?: boolean;
		    isEnd?: Boolean;
		    inRange?: Boolean;
		  };
		}
	
	
	const typepicker= new TypePicker(config);
	
	const onSelectDate =(date:Date[])=>{
		
		// to disaplay selected values
	}
	const onDataUpdate =(data:[])=>{
	
	
			const renderData =data.map(item=>{
						return  {
							year: <number>item.year
							month: <number> item.month,
							dates: <TypePickerDate>item.dates						}	
			})


			//here goes how your datepicker ui render
			//example document.getElementById('picker') .innerHTML =template(renderData)		
			
	
	
	}
	
	//setup listeners of select date and data update;
	typepicker.listen(({type,payload})=>[
				if(type==='select'){onSelectDate(payload)}
				if(type==='update'){onDataUpdate(payload)}
	})
	
	
	// jump to some date		
	// typically use in switching ui display
	
	typePicker.apply.date(new Date(2019,7,1))
	
	//set initial dates , its length should euqal to `config.selection`,
	//do not care about the order, we sort them inside picker
	typepicker.apply.dates([someDateObject1,...res])
	
	//set disabled date
	typepicker.apply.disableDate(date=>{
			return date.getDate() ===31 || date.getDay()===4 //...more conditions
	})
	
	//call TypePicker update method to trigger rerender
	typepicker.apply.update()

	//select some date from picker data
	//it will trigger `typepicker.listen`
	typepicker.apply.select(someDateObject)	
	
	
	





```
