/**
* util
* @module util
**/
/**
*	活动日历组件.
*	<pre>
*	<a href="nie.use.html"><font color="red">nie.use模块</font></a>：util.share
*	结合日历系统的数据，让日历方便地显示在页面上。
*	
*	</pre>
*	@uses 
*	@namespace $
*	@class calendarpicker
*	@static
*	@author GOVO
**/

(function($) { // hide the namespace

var calendarPickerBaseMethods={
	
	debug:true,
	/* Debug logging (if enabled). */
	log: function () {
		if (this.debug)
			console.log.apply('', arguments);
	},
	unique :function(a){
		var r = new Array();
		o:for(var i = 0, n = a.length; i < n; i++) {
			for(var x = i + 1 ; x < n; x++){
				if(a[x]==a[i]) continue o;
			}
				r[r.length] = a[i];
		 	}
			return r;
		},
	dataTemp:[],
	cycleType:{
		NONE:"none",
		DAY :"day",
		WEEK:"week",
		MONTH:"month"
	},
	dataItemTemplate:{
			name :'',       //活动名称
			kind :'',       //种类
			text :'',       //文字说明
			url  :'',       //链接

			type :0,        //循环类型
			week :null,    //第几周
			day  :null,    //星期几
			date :null,    //一个月中的日期值 1～31
			fullDate:null, //完整的日期值
/*			last :0,
			priority:0,
			flash   :0,*/
			weekEntity:[],
			dayEntity:[],
			dateEntity:[]
		},

	/** find the object list with n[k]==value */
	objectMatch:function( obj ,key , value ){
			return jQuery.grep(obj,function(n,i){
				if(n[key]==null||n[key]=="") return false;
				for(var j=0;j< n[key].length;j++){
					if(value==n[key][j]) return true;
				}
				return false;
			});
		},
	/** find the object list with n[k]==value */
	fullDateMatch:function( obj ,key , value ){
			return jQuery.grep(obj,function(n,i){
				if(n[key]==null) return false;
				for(var j=0;j< n[key].length;j++){
					var _d=new Date(value),_dt=new Date(n[key][j]);
					if(_d.getDate()==_dt.getDate() && _d.getMonth()==_dt.getMonth() && _d.getYear()==_d.getYear() ) return true;
				}
				return false;
			});
		},

	/** find the data match the type */
	searchByCycleType:function( obj , type ){
			return jQuery.grep(obj,function(n,i){
				return n.type==type;
			});
		},

	/** find the object list with n[k]=value.toString() */
	searchCycle:function(obj , key , value){
			return jQuery.grep(obj,function(n,i){
				if(n[key]==null) return false;
				return jQuery.inArray(""+value, n[key] )!=-1;
			});
		},

	/**
	* function(obj[,str1][,str2][...])
	* return array
	* 24=24日，3/24=3月24，3/24/2009=2009年3月24日
	* 可以用- 来分隔，但一个日期中必须统一
	* dd, mm/dd, mm-dd, mm/dd/yyyy, mm-dd-yyyy
	*/
	dateStringPaser:function(){
		var args=Array.prototype.slice.call(arguments,0),
			targetDayArray   = [],
			i=0;
		for(;i<args.length;i++){
			var str=args[i].toString();
			if(str.indexOf("+")>-1){
				targetDayArray=targetDayArray.concat(this.dateFromToPaser(str));
			}else{
				var dateSplit = str.split(/\/|-/g),targetDay=null;
				switch(dateSplit.length){
					case 3 :
						targetDay=new Date(dateSplit[2],parseInt(dateSplit[0])-1,dateSplit[1]);	
						targetDayArray.push(targetDay.getTime());
						break;
				}
			}
		}
		return targetDayArray;
	},
	
	/**
	* 把 3/24/2009to4/23/2009 转成具体的天
	*/
	dateFromToPaser:function(str){
		var _sep=/\/|-/g,
		sp=str.split("+"),
		fr=sp[0],to=sp[1],
		fsp = fr.split(_sep),tsp=to.split(_sep);
		targetDay=null,tArray=[];
		frDate=new Date(fsp[2],parseInt(fsp[0])-1,fsp[1]);
		toDate=new Date(tsp[2],parseInt(tsp[0])-1,tsp[1]);
		//tArray.push(frDate);
		var la=Math.round( (toDate.getTime()-frDate.getTime()) /86400000 )+1;
		curDate=new Date(frDate.getTime());
		for(var i=0;i<la;i++){
			tArray.push(curDate.getTime());
			curDate.setDate(curDate.getDate()+1)
		}
		return tArray;
	},

	/**
	* function(dateVal) dateVal is ms from 1970
	* return array
	* 把一个月以周为长度分区段
	*/
	serializeDateByWeek:function(dateVal){
		var tempDate=new Date(dateVal);
		tempDate.setDate(1);
		var firstDay=tempDate.getDay();
		tempDate.setMonth(tempDate.getMonth()+1);
		tempDate.setDate(0);
		var maxDate=tempDate.getDate();

		var _serialDates=[],_dayCounter=firstDay,_weekArryTemp=[];
		for(var i=1;i<=maxDate;i++){
			_weekArryTemp=_weekArryTemp.concat([i]);
			if(_dayCounter==0 || i==maxDate){
				_serialDates=_serialDates.concat([_weekArryTemp]);
				_weekArryTemp=[];
			}
			//_dayCounter++;
			if(++_dayCounter==7) _dayCounter=0;
		}
		return _serialDates;
	},

	/**
	* return -1 if not found
	* 返回当前日期处于当月的第几周
	*/
	indexWeekOfMonth:function(dateVal){
		var sdDates=this.serializeDateByWeek(dateVal);
		var tempDate=new Date(dateVal),theDate=tempDate.getDate();
		for(var i=0;i<sdDates.length;i++){
			for(var j=0;j<sdDates[i].length;j++){
				if(theDate==sdDates[i][j]) return i;
			}
		}
		return -1;
	},

	/** parse '1,2,3' to [1,2,3] */
	parseStringToArray:function(str,sep){
		var _arr=  str.split(sep || ",");
		return _arr;
	},

	/**
	* parse "1,2,3,4,odd" to [1,2,3,4,5,7,9,...] even=[2,4,6,8,...],all=[1,2,3,4,5,6,7,...]
	* 把字符描述全部专为具体的实体数值
	*/
	parseStringToEntity:function(str,max,start,sep){
		var _arr=  str.split(sep || ","),_data=[],i=0,_max=max || 7;
		if(jQuery.inArray("odd",_arr)!=-1) for(i=1;i<=_max;i+=2) _data=_data.concat([i]);
		else if(jQuery.inArray("even",_arr)!=-1) for(i=2;i<=_max;i+=2) _data=_data.concat([i]);
		else if(jQuery.inArray("all",_arr)!=-1) for(i=1;i<=_max;i++) _data=_data.concat([i]);
		_arr=_arr.concat(_data);
		_arr=jQuery.grep( _arr, function(n,i){
			if(/\d+/.test(n)) return true;
			else return false;
		});
		//_arr=_arr.unique();
		_arr=this.unique(_arr);
		jQuery.each(_arr,function(i){_arr[i]=parseInt(this);});
		return _arr.sort(function(a,b){return a-b;});
	},

	/**
	* function(dateVal1[,dateVal2][,dateVal3][,...]) 
	* params:Date.getTime();
	* return events match the date
	* 可以用- 来分隔，但一个日期中必须统一
	*/
	_searchByDate:function(){
			var args         = Array.prototype.slice.call(arguments,0),
				_data          = args[0],
				_dateArray     = args.slice(1),
				_matchedArray  = [],
				targetDayArray = _dateArray;//dateStringPaser.apply(null,_dateArray);
			//this.log(args);
			_matchedArray=_matchedArray.concat(this.searchByCycleType(_data,"day"));//每天
			for(var i=0,n=targetDayArray.length; i<n ;i++){
				var thisElem=targetDayArray[i];
						_matchedArray=_matchedArray.concat(this.fullDateMatch(_data,"fullDate",thisElem));//具体到的日期
						
				var thisDateObj = new Date(parseInt(thisElem)),
						weekIndex   = this.indexWeekOfMonth(thisElem);

				var _monthCycle=jQuery.grep(_data,function(n,i){
						if(n.type!="month") return false;
						if(
							 (n.week!=null && ( jQuery.inArray((weekIndex+1), n.weekEntity )!=-1 ) && ( jQuery.inArray(thisDateObj.getDay(), n.dayEntity )!=-1 ))
								||
							 (n.date!=null && ( jQuery.inArray(thisDateObj.getDate(), n.dateEntity )!=-1 ))
							 ) return true;
						return false;
					});
				var _weekCycle=jQuery.grep(_data,function(n,i){
					if(n.type!="week") return false;
					if(n.day!=null && (jQuery.inArray(thisDateObj.getDay(), n.dayEntity )!=-1)) return true;
					return false;
				});
				_matchedArray=_matchedArray.concat(_monthCycle,_weekCycle);
			}
			//return _matchedArray.unique();
			return this.unique(_matchedArray);
		},
	
	/**
	* 通过日期搜索活动，可以搜索多个日期。当同时搜索多个日期时，返回的活动不会区分到具体的天，如果要进行区分，请使用　subByDate()方法或者 slickByDate()方法。
	* function(dateVal1[,dateVal2][,dateVal3][,...]) 
	* params:Date.getTime();
	* return events match the date
	*/
	searchByDate:function(){
		var args = Array.prototype.slice.call(arguments,0);
		return this._searchByDate.apply(this,[this.dataTemp].concat(args));
	},
	
	/**
	* 搜索两个日期之间的活动.
	* function(start,end,callback) 
	* params:Date.getTime(),Date.getTime(),function
	* return array 每天的活动
	*/
	subByDate:function(start,end,callback){
		var la=Math.round( (end-start)/86400000 );
		la+=la>0?1:-1;
		return this.sliceByDate(start,la,callback);
	},
	
	/**
	* 搜索从指定日期起至指定天数之间的活动。当end为负数时，将向前搜索，向前搜索结果也将包含start所指的天
	* function(start,end,callback) 
	* params:Date.getTime(),int=7,function
	* return array 每天的活动
	*/
	sliceByDate:function(start,end,callback){
		var la=Math.abs(end || 7),
		dateEvents=[],
		cDate=new Date(start);
		if(la>365) alert("max date!");
		if(end<0) cDate.setDate(cDate.getDate()-la+1);
		for(var i=0;i<la;i++){
			var _events=null,_time=cDate.getTime();
			dateEvents.push(_events=this.searchByDate(_time));
			if(typeof(callback=="function")){
				callback(i,_events,_time);
			}
			cDate.setDate(cDate.getDate()+1);
		}
		return dateEvents;
		
	},
	/**
	* 把日期转化为中文的星期格式
	* function(start,end,callback) 
	* params:Date.getTime(),or Date
	* return string 日一二三四五
	*/
	toStringDay:function(time){
		var d=time.constructor==Date?time:new Date(time);
		return unescape("\u65E5\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D".charAt(d.getDay()));
	},
	/**
	* 把日期转化为中文格式：YYYY年MM月DD日
	* function(start,end,callback) 
	* params:Date.getTime(),or Date
	* return string YYYY年MM月DD日
	*/
	toStringDate:function(time){
		var d=time.constructor==Date?time:new Date(time);
		return d.getFullYear()+"\u5E74"+(d.getMonth()+1)+"\u6708"+d.getDate()+"\u65E5";
	},
	

	/** parse the data */
	parseData:function(data){
			for(var i=0,n=data.length ; i<n ; i++){
				var dataItem=data[i];
				if(dataItem.actived!=="1") continue;
				var dataItemTemp={};
				jQuery.extend(dataItemTemp,this.dataItemTemplate);
				jQuery.extend(dataItemTemp,dataItem);
				dataItemTemp._week=dataItemTemp.week;
				dataItemTemp._day=dataItemTemp.day;
				dataItemTemp._date=dataItemTemp.date;
				dataItemTemp._fullDate=dataItemTemp.fullDate;
				if(dataItemTemp.week != null){
					dataItemTemp.weekEntity = this.parseStringToEntity(dataItemTemp.week,5);
					dataItemTemp.week=this.parseStringToArray(dataItemTemp.week);
				}
				if(dataItemTemp.day != null){
					dataItemTemp.dayEntity = this.parseStringToEntity(dataItemTemp.day,6);
					if(dataItemTemp.day.indexOf("all")!=-1) dataItemTemp.dayEntity=dataItemTemp.dayEntity.concat([0]);
					dataItemTemp.day=this.parseStringToArray(dataItemTemp.day);
				}
				if(dataItemTemp.date != null){
					dataItemTemp.dateEntity = this.parseStringToEntity(dataItemTemp.date,31);
					dataItemTemp.date = this.parseStringToArray(dataItemTemp.date);
				}
				if(dataItemTemp.fullDate != null) dataItemTemp.fullDate=this.dateStringPaser.apply(this,this.parseStringToArray(dataItemTemp.fullDate));

				this.dataTemp = this.dataTemp.concat( [dataItemTemp] );
			}
			return this;
		},
	/** parse the data by XML*/
	parseXML:function(xml){
		var xmlData=jQuery(xml).find("item");
		for(var i=0,n=xmlData.size() ; i<n ; i++){
			var item=xmlData.eq(i);
			if(jQuery.trim(item.attr("actived"))!="1"){continue;}
			//console.log(item.find("name").text(),item.attr("actived"));
			var dataItem=({
				name :jQuery.trim(item.find("name").text()),
				kind :jQuery.trim(item.find("kind").text()),
				text :jQuery.trim(item.find("text").text()),
				url  :jQuery.trim(item.find("url").text()),
				type :jQuery.trim(item.attr("type")) || "none",
				week :jQuery.trim(item.attr("week")) || null,
				day  :jQuery.trim(item.attr("day")) || null,
				date :jQuery.trim(item.attr("date")) || null,
				fullDate :jQuery.trim(item.attr("fullDate")) || null
			});

			var dataItemTemp={};
			jQuery.extend(dataItemTemp,this.dataItemTemplate);
			jQuery.extend(dataItemTemp,dataItem);
			dataItemTemp._week=dataItemTemp.week;
			dataItemTemp._day=dataItemTemp.day;
			dataItemTemp._date=dataItemTemp.date;
			dataItemTemp._fullDate=dataItemTemp.fullDate;
			if(dataItemTemp.week != null){
				dataItemTemp.weekEntity = this.parseStringToEntity(dataItemTemp.week,5);
				dataItemTemp.week=this.parseStringToArray(dataItemTemp.week);
			}
			if(dataItemTemp.day != null){
				dataItemTemp.dayEntity = this.parseStringToEntity(dataItemTemp.day,6);
				if(dataItemTemp.day.indexOf("all")!=-1) dataItemTemp.dayEntity=dataItemTemp.dayEntity.concat([0]);
				dataItemTemp.day=this.parseStringToArray(dataItemTemp.day);
			}
			if(dataItemTemp.date != null){
				dataItemTemp.dateEntity = this.parseStringToEntity(dataItemTemp.date,31);
				dataItemTemp.date = this.parseStringToArray(dataItemTemp.date);
			}
			if(dataItemTemp.fullDate != null) dataItemTemp.fullDate=this.dateStringPaser.apply(this,this.parseStringToArray(dataItemTemp.fullDate));

			this.dataTemp = this.dataTemp.concat( [dataItemTemp] );
		}
			return this;
	},
	parseURL:function(_url,callback){
		$.ajax({
			url:_url,
			type:"get",
			dataType:"xml",
			success:(function(obj){
				var _self=obj;
				return function(xml,status){
					var calendar=_self.parseXML(xml);
					if(typeof(callback)=="function") callback(_self);
				};
			})(this)
		});
		return this;
	}
};

/**
* 创建一个日历，从url，xml，或json结构的数组中创建一个日历对象
* param: 1.URL(String);2.XML 对象；3.日历的JSON数组(Array)；
*/
var Calendarpicker=function(param,callback){
	var cons=param.constructor;
	switch(cons){
		case Array:
		this.parseData(param);
		break;
		case String:
		this.parseURL(param,callback);
		break;
		default:
		this.parseXML(param);
	}
};

$.extend(Calendarpicker.prototype,calendarPickerBaseMethods);
$.calendarpicker=function(data,callback){return new Calendarpicker(data,callback);};
$.calendarpicker.uuid = new Date().getTime();
$.calendarpicker.version = "1.2";
})(jQuery);