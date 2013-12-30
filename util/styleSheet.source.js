/**
* util
* @module util
**/
/**
*	样式表<br>
*	<font color="red">注意：因兼容性复杂（看参考yui解决方案），所以暂慎用。现只用于捆绑css到js。</font><br>
*   <a href="nie.use.html"><font color="red">nie.use模块</font></a>：util.styleSheet<br>
*	注：因为部分功能使用剪切板(qq msn) 依赖 util.clipBoard util.styleSheet
*	@class styleSheet
*	@static
*	@namespace $
**/
$.extend({
	styleSheet:{
		/**
		*	增加样式
		*	@method	add			
		*	@param {Object} rules 样式
		*	@param {Object} title 样式标题（方便管理）
		*	@param {Object} data 参数数据（暂时data={media:""})
		**/
		add:function(rules,title,data){
			var o = document.createElement("style");
			if(data&&data.media) o.media = data.media;
			o.type="text/css";
			o.setAttribute("name",title);
			document.getElementsByTagName("head")[0].appendChild(o);
			var style = document.styleSheets[document.styleSheets.length-1];
	 	  	if(style.addRule){
			   for(var i in rules){				 
			     style.addRule(i,rules[i]);
			   }
		    }
			else if(style.insertRule){
			   for(var i in rules){			
				style.insertRule(i+"{"+rules[i]+"}",style.cssRules.length);
			   }
	    	}    
      }    	  
	}
});