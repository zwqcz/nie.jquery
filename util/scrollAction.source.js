/**
* util
* @module util
**/
/**
*	当滚动条滚动，缓动对象style.top。<font color="blue">应用：滚动bar、banner</font><br>
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>util.scrollAction
*	<font color="blue">默认设置dom的position="absolute"</font>
*	<pre>
*	//当滚动条滚动使bar.style.top缓动到scrollTop 
*	$("#bar").scrollAction();
*	<br>
*	//当滚动条滚动时，bar.style.top缓动到scrollTop，最大值为100
*	$("#bar").scrollAction({topMax:100});
*	<br>
*	//当滚动条滚动时，bar.style.top缓动到scrollTop，最小值为20
*	$("#bar").scrollAction({topMin:20});
*	<br>
*	//当滚动条滚动时，bar.style.top缓动到scrollTop，最小值为20、最大值为100，
*	$("#bar").scrollAction({topMin:20,topMax:100});
*	<br>
*	//
*	$("#bar").scrollAction({topMin:20,topMax:100,xAlign:"right",yAlign:"bottom",animate:false});
*	</pre>
*	@author Lam
*	@namespace $
*	@class scrollAction
*	@static
**/
$.fn.extend({
	/**
	*	@constructor scrollAction
	*	@param {Object} data 可为空（topMax：style.top最大值，topMin：style.top最小值，animate：是否缓动默认ture，xAlign：水平对齐方向"left","right"默认值left，yAlign：垂直对齐"top","bottom"默认值top）
	**/
	scrollAction: function(data){
		var self = this,topMax=null,topMin=null,animate=true,func=function(){return $(window).scrollTop();};
		self.css("position","absolute");
		if(data){
			if (typeof data.animate !="undefined") animate = data.animate;
			if (data.topMax) topMax = data.topMax;
			if (data.topMin) topMin = data.topMin;
			if (data.xAlign){
				switch(data.xAlign){
					case "left":
						self.css("left",0);
						break;
					case "right":
						self.css("right",0);
						break;
				}
			}
			if (data.yAlign){
				switch(data.yAlign){
					case "top":
						self.css("top",func);
						break;
					case "bottom":
						func = function(){return $(window).scrollTop()+$(window).height()-self.outerHeight();}
						self.css("top",func());
						break;
				}
			}
		}
		$(window).scroll(function(e){
			var topVal = func();
			if (topMin && topVal < topMin){
				topVal = topMin;
			}
			else if (topMax && topVal > topMax){ 
				topVal = topMax;
			}
			if(animate) self.stop().animate({"top": topVal});
			else self.css("top",topVal);
		});
	}
});