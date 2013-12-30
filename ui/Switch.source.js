/**
* ui
* @module ui
**/
/**
*	焦点图切换<br>
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>ui.Switch<br>
*	<pre>
*   可参考:<a href="http://sg.163.com/fab" target="_blank">三国fab</a>
*	<p>&lt;ul id=&quot;switch&quot;&gt; </p>
*	<p>
*	  &lt;li id=&quot;switch-btn&quot;&gt;<br />&lt;button&gt;按钮1&lt;/button&gt;<br />&lt;button&gt;按钮2&lt;/button&gt;<br />&lt;/li&gt; </p>
*	<p>
*	  &lt;li id=&quot;switch-img&quot;&gt;<br />
*	  &lt;a href=&quot;#&quot; target=&quot;_blank&quot;&gt;图片1&lt;/a&gt; <br />
*	  &lt;a href=&quot;#&quot; target=&quot;_blank&quot;&gt;图片2&lt;/a&gt;<br />
*	  &lt;/li&gt;</p>
*	<p>&lt;li id=&quot;switch-con&quot;&gt;<br />
*	  &lt;span&gt;内容1&lt;/span&gt; <br /> 
*	  &lt;span&gt;内容2&lt;/span&gt;<br />
*	  &lt;/li&gt;</p>
*	<p>
*	  &lt;/ul&gt;</p>
*	<p> &lt;script&gt;<br />
*		$(document).ready(function(){<br />
*		nie.use([&quot;ui.Switch&quot;],function(){<br /><br />
*		//简便方式
*		$.Switch("#switch-btn button","#switch-img a","#switch-con a");	<br />
*		//简便方式（不需要内容切换）
*		$.Switch("#switch-btn button","#switch-img a");	<br />
*	    //全参数方式
*		//默认情况下{btnDoms:null,imgDoms: null,conDoms: null,btnEvent: "mouseover","class": "current",time: 5000,index: 0,totalDom:0}
*		//btnDoms:按钮Doms，imgDoms：图片Doms，conDoms:其他内容Doms，btnEvent：按钮触发事件，class：全部doms激活的class，time：切换时间，index：默认激活doms索引
*		$.Switch({btnDoms:[$("#switch-btn button")],imgDoms:[$("#switch-img a")],conDoms:[$("#switch-con span")]});	<br />
*		<br />
});
*		})
*	<br />
*	&lt;/script&gt;</p>
*	</pre>
*	@class Switch
*	@static
*	@namespace $	
*	@author	Lam
**/
/**
* @constructor Switch
* @param {jquery Object||String} object 参数比较复杂，请看例子！
**/
$.extend({
	Switch: function(obj){
		//激活
		var _active = function(index){
			_data.index = index;
			if (_data.conDoms) 
				_activeDom(index, _data.conDoms);
			if (_data.imgDoms) 
				_activeImgDom(index, _data.imgDoms);
			if (_data.btnDoms) 
				_activeDom(index, _data.btnDoms);
		},
		//激活dom				
		_activeDom = function(index, dataObj){
			$.each(dataObj, function(){					
				$.each(this, function(j){
					if (j != index) 
						$(this).removeClass(_data["class"]);
					else 
						$(this).addClass(_data["class"]);
				});
			})
		},
		_activeImgDom = function(index, dataObj){
			$.each(dataObj, function(){
				$.each(this, function(j){
					if (j != index) 
						$(this).css("zIndex", 1).stop(true,true).fadeOut();
					else{
						$(this).css("zIndex", 2).stop(true,true).fadeIn();
						_data.callBack(j);
					}
				});					
			});
		},
		_play = function(){			
			_data.index = (_data.index + 1 >= _data.totalDom) ? 0 : _data.index + 1;
			timer = setTimeout(function(){
				_active(_data.index);
				_play();
			}, _data.time);
		},
		//bind event
		bindEvent=function(o){
			$.each(o, function(){
				$.each(this, function(i){
					$(this).hover(function(){
						clearTimeout(timer);
						_active(i);
					}, function(){
						_play();
					})
				})
			});
		},

		//默认值

		_data = {
			btnDoms: null,
			imgDoms: null,
			conDoms: null,
			//btnEvent: "mouseover",
			"class": "current",
			time: 5000,
			index: 0,
			totalDom: 0,
			btnTime:180,
			callBack:function(){}
		},
		btnTimer,
		timer;
		//init		
		if (typeof obj != "object") {
			var arg=arguments,
				chkArgs = function(index){
					return arg[index] ? [$(arg[index])] : null;				
				};
			_data.btnDoms = chkArgs(0);
			_data.imgDoms = chkArgs(1);
			_data.conDoms = chkArgs(2);
		}
		else {
			$.each(_data, function(i){				
				_data[i] = (obj && obj[i]) ? obj[i] : _data[i];
			});			
		}		 
		_data.totalDom = function(){
			if (_data.imgDoms != null) {
				return $(_data.imgDoms[0]).length;
			}
			else 
				if (_data.btnDoms != null) {					
					return $(_data.btnDoms[0]).length;
				}
				else  
					if (_data.conDoms != null) 
						return $(_data.conDoms[0]).length;
		}();		
			
		//bind img event
		if (_data.imgDoms) {			
			bindEvent(_data.imgDoms);
		}
		//bind btn event
		if (_data.btnDoms) {				
			$.each(_data.btnDoms, function(){
				$.each(this, function(i){
					var self = $(this);
						//href = self.attr("href");
					//if (self.tagName&&self.tagName.toString().toUpperCase()=="A"&&(href==null||href=="")) self.attr("href","javascript:void(0);");
					(function(){
						var overStatus=false;
						self.hover(function(){
								overStatus=true;
								clearTimeout(btnTimer);
								btnTimer=setTimeout(function(){
									//alert(overStatus)
									if(overStatus){
										clearTimeout(timer);
										_active(i);									
									}
								},_data.btnTime);
							},function(){
								overStatus=false;
								clearTimeout(btnTimer);
								clearTimeout(timer);
								_play();
							});
					})();
				})
			});
		}
		//bind con event
		if (_data.conDoms) {
			bindEvent(_data.conDoms);
		}
		//apply 		
		_active(_data.index);
		_play();
	}
});