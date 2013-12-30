/**
* util
* @module util
**/
/**
* 复制到剪切板<br>
* <a href="nie.use.html"><font color="red">nie.use模块：</font></a>util.clipBoard<br>
* flash地址：<br>
* <a href="http://res.nie.netease.com/comm/js/util/clipBoard.swf" target="_blank">http://res.nie.netease.com/comm/js/util/clipBoard.swf</a>
* <br>
* <a href="http://res.nie.netease.com/comm/js/util/clipBoard(not4ie).swf" target="_blank">http://res.nie.netease.com/comm/js/util/clipBoard(not4ie).swf</a>
* <pre>
* $.clipBoard(window.location.href,"复制成功！");
* $.clipBoard(window.location.href,{callBack:function(){alert("复制成功！");}});
* </pre>
*	@class clipBoard
*	@static
*	@namespace $	
**/
/**
* @constructor clipBoard
* @param {String} str 复制的字符串
* @param {String} alertTxt 复制完成后alert。可为空，则不出现alert
**/
(function($){
	$.extend({	
		closeClipBoard:function(){
			$("#NIE-flashcopier").fadeOut();
		},
		clipBoard_callBack:function(){
			
		},
		clipBoard:function(str,data){
			switch(typeof data){
				case "object":
					if(typeof data.callBack=="function"){
						$.clipBoard_callBack=data.callBack;
					}
					break;
				case "string":
					$.clipBoard_callBack=function(){alert(data);};
					break;
			}
			//for ie
			if (window.clipboardData) {
				if(typeof str!=String) str=str.toString();
				var statusOK = window.clipboardData.setData("Text", str);
				if (statusOK) {
					$.clipBoard_callBack();
				}
			}
			//not for ie
			else {			
				var flashcopier = 'NIE-flashcopier',
					flashcopierStr="#"+flashcopier,
					flashId = 'NIE-flashcopier-flash',
					h=120,
					flashObj=$.flash.create({
						id:flashId,
						swf: 'http://res.nie.netease.com/comm/js/util/clipBoard(not4ie).swf',
						width:166,
						height:h,
						allowScriptAccess: "always",
						flashvars: {url:encodeURIComponent(str),callBack:"$.clipBoard_callBack"}
					}),
					win=$(window);
				if($(flashcopierStr).length==0){
					$("<div>",{
						id:flashcopier,
						html:flashObj
					}).appendTo($(document.body));
				}	
				else{
					$(flashcopierStr).html(flashObj).fadeIn();
				}
				$(flashcopierStr).css({
					position:"absolute",
					"zIndex":99,
					top:win.height()/2+win.scrollTop(),
					"width":"100%",
					"text-align":"center"
				});
			}
		}
	});
})(jQuery);