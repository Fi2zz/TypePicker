# TypePicker

A date picker use in web and react-native

## INSTALL

```bash

	npm install typepicker
	or
	yarn add typepicker

```

## OPTIONS

| OPTION    | REQUIRED | TYPE   | DESC                 | Default |
| --------- | -------- | ------ | -------------------- | ------- |
| size      | NO       | number | Size of data created | 1       |
| selection | NO       | number | Size of data picked  | 1       |

## API

```typescript


	apply.select(date:Date)=>void

	apply.date(date:Date)=>void

	apply.dates(dates:Date[])=>void

	apply.update()=>void;

	apply.disableDate((date:Date)=>boolean)

	listen(({type,types,payload})=>void)

```

### EXAMPLE

[Full Example](./example)

```typescript

	//if you are using typescript
	import TypePicker from "typepicker";

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
		//example
		//document.getElementById('picker') .innerHTML=template(renderData)



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
