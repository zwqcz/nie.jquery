/**
* ui
* @module ui
**/
/**
*	tab切换<br>
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>ui.tab<br>
*	<pre>
*	&lt;ul id=&quot;tab&quot;&gt;
*	&lt;li&gt;按钮1&lt;/li&gt;&lt;li&gt;按钮2&lt;/li&gt;
*	&lt;/ul&gt;
*	&lt;div id=&quot;con&quot;&gt;
*	&lt;p&gt;内容1&lt;/p&gt;
*	&lt;p&gt;内容2&lt;/p&gt;
*	&lt;/div&gt;
*	
*	&lt;script&gt;
*	$(document).ready(
*		nie.use([&quot;ui.tab&quot;],function(){
*	$.tab(&quot;#tab li&quot;,&quot;#con p&quot;);
*	//鼠标需要停留2000毫秒，然后激活
*	$.tab(&quot;#tab li&quot;,&quot;#con p&quot;,{time:2000});
*	//鼠标需要停留2000毫秒，然后激活；默认激活第二个
*	$.tab(&quot;#tab li&quot;,&quot;#con p&quot;,{time:2000,index:1});
*	//鼠标需要停留2000毫秒，然后激活；默认激活第二个；激活按钮和内容的activeClass=&quot;on&quot;
*	$.tab(&quot;#tab li&quot;,&quot;#con p&quot;,{time:2000,index:1,activeClass:&quot;on&quot;});
*	//参数fn（切换成功后激发的函数）,函数固定传入index（tab索引值）
*	$.tab(&quot;#tab li&quot;,&quot;#con p&quot;,{fn:function(index){ alert(index);} });
*	});
*	)
*	&lt;/script&gt;
*	</pre>
*	@class tab
*	@static
*	@namespace $	
*	@author	Lam
**/
/**
* @constructor tab
* @param {jquery Object||String} btnObj 按钮对象
* @param {jquery Object||String||Array} conObj 内容对象,如多个可为Array（如：["#more li","#con li"]）
* @param {[Objecj]} params 选填参数，（time，index，activeClass）。time：鼠标需要停留的时间然后激活（默认值为180毫秒）；index：先打开的索引值（默认值为0）；activeClass：激活按钮和内容的class（默认值为current）；
**/
(function($){
	$.extend({
		tab:function(btnObj,conObj,params){
			function chk(val,defaultVal){
				return (typeof params!="undefined" &&typeof params[val]!="undefined")?params[val]:defaultVal;
			}
			function activeBtn(btnObj){
				$(btnCurrent).removeClass(activeClass);
				btnCurrent = btnObj;
				$(btnObj).addClass(activeClass);
			}
			function activeFun(num){
				if($.isFunction(fn)) fn(num);
			}
			function activeCons(num){			
				if (typeof conObj != "string") {
					$.each(cons, function(i){										
						$(conCurrent[i]).removeClass(activeClass);					
						conCurrent[i] = this[num];
						$(this[num]).addClass(activeClass);
					});
				}
				else {			
					if(conCurrent) $(conCurrent).removeClass(activeClass);
					conCurrent = cons[num];
					$(cons[num]).addClass(activeClass);
				}
			}		
			var btns = $(btnObj),
				btnCurrent,
				conCurrent,
				cons,
				fn = chk("fn",null),
				status,
				timer,
				time = chk("time","180"),
				index = chk("index",0),
				currentIndex,
				activeClass = chk("activeClass","current");								
			if (typeof conObj != "string") {
				cons = [],conCurrent=[];
				$.each(conObj, function(){
					cons.push($(this.toString()));
					conCurrent.push({});
				});
				conCurrent = [];
			}
			else {			
				cons = $(conObj);
				conCurrent={};
			}		
			$.each(btns,function(i){			
				$(this).bind("mouseenter",{"i":i,"o":btns[i]}, function(e){
					overStatus=true;
					(function(){
						var btn = e.data.o,
							index = e.data.i;
						timer = setTimeout(function(o){
							if (overStatus&&currentIndex!=index) {
								currentIndex=index;
								activeBtn(btn);
								activeCons(index);
								activeFun(index);
							}}, time);
					})();
				}).bind("mouseleave",{"i":i},function(e){
					clearTimeout(timer);				
					overStatus=false;
				});
			});
			activeBtn(btns[index]);
			activeCons(index);
			activeFun(index);
		}
	});
})(jQuery);