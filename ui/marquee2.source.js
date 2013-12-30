/**
*	ui
*	@module ui
**/
/**
*	走马花灯滚动。
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>ui.marquee2
*	<pre>
*	html结构符合：
*	&lt;tag1 id="marquee"&gt; &lt;!--可视框标记--&gt;
*	&nbsp;&nbsp;&lt;tag2&gt; &lt;!--内容框标记--&gt;
*	&nbsp;&nbsp;&nbsp;&nbsp;&lt;!--内容--&gt;
*	&nbsp;&nbsp;&lt;/tag2&gt;
*	&lt;/tag1&gt;<Br>
*	js例子：
*	//向左滚动
*	$.marquee2("#marquee","left");<br>
*	//向右滚动,并移动每像素10毫秒
*	$.marquee2("#marquee","right",{speed:10});
*	</pre>
*	@class marquee2
*	@namespace $
*	@static
*	@author Lam
**/
/**
*	@constructor marquee2
*	@param	{Jquery Object|String} dom 需要滚动的dom
*	@param	{String}	direction	滚动方向："left","right","top","bottom"
*	@param	{Object}	[data]	选填参数：有speed（速度 ms/px,移动每像素的毫秒数，<font color="red">默认值为40</font>）
**/
$.extend({
	marquee2:function(dom,direction,data){ 
	  var o,oW,oIn,v,speed,_direction=direction,timer;
	  /*
	  var repeat = function(dom,attr,endVal,callBack){
		  var selfVal = dom.attr(attr);
		  var temp = selfVal - 5;
		  if(temp>endVal){
			  dom.attr(attr,temp);
			  window.clearInterval(timer);
		  }
		  else callBack();
	  }
	  */
	  var run = function(){						
		  var time = ((oIn.css(_direction)=="auto")?v:v+parseInt(oIn.css(_direction)))*speed;
		  var data = {};
		  data[_direction]=-v;
		  oIn.animate(data,time,"linear",function(){oIn.css(_direction,0);run();});
		  //setInterval(function(){repeat(oIn,_direction,-v,function(){oIn.css(_direction,0);run();});},30);
	  }			
	  var chkData=function(name,defaultVal){
		  return (data&&data[name])?data[name]:defaultVal;
	  }
	  var bindBtnEvent = function(){
		  var evt = chkData("btnEvent","mouseover");
		  var btnChangeSpeed = chkData("btnChangeSpeed",5);
		  var bind = function(dom,dirct){
  			  var _speed = speed;
			  var _dirct = dirct;			 
			  dom.bind(evt,function(){
				  oIn.stop();
				  if(_direction!=_dirct){
					var v2=0;
					var d2 = "";
				    switch(_dirct){
					  case "top":
						  v2=parseInt(oIn.css("bottom"));
						  d2="bottom";
						  break;
					  case "bottom":
						  v2=parseInt(oIn.css("top"));
						  d2="top";
						  break;
					  case "left":
						  v2=parseInt(oIn.css("right"));
						  d2="right";
						  break;
					  case "right":
						  v2=parseInt(oIn.css("left"));
						  d2="left";
						  break;
					}
					//alert(v2);
					  if(isNaN(v2)) v2=-Math.abs(oW-v-parseInt(oIn.css(_dirct)));
					  _direction=_dirct;
					  var tmp = (oW-v2<0)?-Math.abs(oW-v-v2)+v:oW-v-v2;
					  oIn.css(_direction,tmp).css(d2,"");	
				  }
				  speed=btnChangeSpeed;
				  run();
				 }).mouseout(function(){
					 oIn.stop();
					 speed=_speed;
					 run();					 
				 });
		  }
		  if(data){
			  if(_direction=="left"||_direction=="right"){
				  if(data.leftBtn){
					  bind($(data.leftBtn),"left");
				  }
				  if(data.rightBtn){
					  bind($(data.rightBtn),"right");				  
				  }
			  }
			  else if(_direction=="top"||_direction=="bottom"){
				  if(data.topBtn){
					  bind($(data.topBtn),"top");
				  }	
				  if(data.bottomBtn){
					  bind($(data.bottomBtn),"bottom");
				  }
			  }
		  }
	  }
	  var init = function(){		  			
		o = $(dom);		
		oW=o.width();
		oIn = o.children();
		oIn.children().clone().appendTo(oIn);
		oIn.hover(function(){oIn.stop();},run);
		v = ((_direction=="left"||_direction=="right")? oIn.width(): oIn.height())/2;		
		speed = chkData("speed",40);
		bindBtnEvent();
		run();
	  }();
	}   
});