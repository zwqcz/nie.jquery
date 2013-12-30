/**
*	util
*	@module util
**/
/**
*	获取服务器北京时间<br>
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>util.bjTime
*	@namespace $
*	@class bjTime
*	@static
**/
$.extend({
   bjTime:{
	 /**
	 *	异步获取时间值，时间值返回到回调函数第个参数。
	 * <pre>
 	 * function showTime(t){ alert(t); }
	 * $.bjTime.getTime(showTime);
	 * </pre>
	 *	@method getTime 
	 *	@param {Function} callBack 回调函数（第一个参数为时间值）
	 **/
	 getTime:function(callBack){
		 var url = "http://api.ku.163.com/time.js?_"+new Date().getTime()+"&.js";
		 $.include(url,function(){callBack(_bjtime);});
	 },
	 /**
	 *	异步获取时间对象，时间对象返回到回调函数第个参数。
	 * <pre>
 	 * function showDate(o){
	 *		o.dateObj  		 //Date
	 *		o.year 	   		 //年
	 *		o.month	  		 //月
	 *		o.date	   		 //号
	 *		o.day	   		 //星期几 索引值（0 为星期日）
	 *		o.cnWeek  		 //星期几 中文
	 *		o.monthTotalDay  //本月总日数
	 *		o.firstDayCnWeek //本月1号 是星期几
	 *		o.weekNum		 //今天是本月第几周
	 * }
	 * $.bjTime.getDate(showDate);
	 * </pre>
	 *	@method getDate 
	 *	@param {Function} callBack 回调函数（第一个参数为时间对象）
	 **/
	 getDate:function(callBack){
		 function o(time){
		   var dateObj = new Date(time*1000);
		   var year = dateObj.getFullYear(); //年
		   var month = dateObj.getMonth()+1; //月
		   var date = dateObj.getDate();	//号
		   var day = dateObj.getDay(); //星期几 索引值（0 为星期日）
		   var weekName = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
		   var cnWeek = weekName[day]; //星期几 中文
		   var monthTotalDay; //本月总日数
		   var temp = new Date(year,month-1,1),temp2 = new Date(year,month,1);
		   monthTotalDay = (temp2.getTime()-temp.getTime())/(24*3600*1000);
		   var firstDayCnWeek = temp.getDay();//本月1号 是星期几
		   //本月第几周
		   var weekNum = (function(){
		   	var n=1,temp = firstDayCnWeek,result = 1,_date=dateObj;
		   	while(++n<=date){
				_date.setDate(n);				
				if(_date.getDay()==0) result++;				
		    }
			return result;
		   })(); 
		   callBack({"dateObj":dateObj,"year":year,"month":month,"date":date,"day":day,"cnWeek":cnWeek,"monthTotalDay":monthTotalDay,"firstDayCnWeek":firstDayCnWeek,"weekNum":weekNum});
		 }
		 $.bjTime.getTime(o);
	 }
   }
});