/**
* util
* @module util
**/
/**
*	url相关应用<br>
*	<a href="nie.use.html"><font color="red">nie.use模块</font></a>：util.url
*	<br>
*	<pre>
*	
*	</pre>
*	@namespace $
*	@class url
*	@static
*	@author Lam
**/
$.extend({
	url:{
		/**
		*	a Dom或字符串转换为url字符串
		*	@method	o2url			
		*	@return {String} 返回url字符串
		*	@param {Object} url a Dom或字符串
		**/
		o2url:function(o){
			switch(typeof o){
				case "string":
					return $.url.str2url(o);
					break;
				case "object":
					return $.url.a2url(o);
					break;
			}
		},		
		/**
		*	a Dom转为为url字符串
		*	@method	a2url		
		*	@return {String} 返回url字符串
		*	@param {Object} url a Dom
		**/
		a2url:function(o){
			if (o.tagName && o.tagName.toLowerCase() == "a") {				
				return o.protocol + "//" + o.host.replace(/:[\d]+$/, "") + (($.browser.msie && o !== window.location) ? "/" : "") + o.pathname;
			}
			else return null;
		},
		/**
		*	字符串转换为url字符串
		*	@method	str2url		
		*	@return {String} 返回url字符串
		*	@param {Object} str 字符串
		**/
		str2url: function(str){		
			var div = document.createElement('div');
			div.innerHTML = '<a href="' + str.replace(/"/g, '%22') + '"/>';						 
			return $.url.a2url(div.firstChild);
			/*
			var a = document.createElement("a");
			a.setAttribute("href", str);
			return $.url.a2url(a);
			*/
		},
		o2a:function(o){
			if(typeof o =="string"){
			var div = document.createElement('div');
			div.innerHTML = '<a href="' + o.replace(/"/g, '%22') + '"/>';						 
			return div.firstChild;
			}
			else return o;
		},
		/**
		*	比较url是否一致
		*	@method	compareUrl		
		*	@return {Boolean} 两个对象url是否一致
		*	@param {Object} o1 比较对象1
		*	@param {Object} o2 比较对象2
		**/
		compareUrl:function(o1,o2){		
			var url1 = $.url.o2url(o1);			
			var url2 = $.url.o2url(o2);
			//alert(url1+"\n"+url2);
			return url1==url2;
		},
		/**
		*	检查是否同一文章或同一more页(nie同一篇文章有不同分页)
		*	@method	compareNieUrl		
		*	@return {Boolean} 是否同一文章或同一more页(nie同一篇文章有不同分页)
		*	@param {Object} o1 比较对象1
		*	@param {Object} o2 比较对象2
		**/
		compareNieUrl: function(o1, o2){
			 var url1 = $.url.o2url(o1),
				url2 = $.url.o2url(o2),
				arr1=url1.split("/"),
				arr2=url2.split("/"),
				file1=arr1[arr1.length-1],
				file2=arr2[arr2.length-1],
				file=(file1=="" || file2=="" )?"index":file1.replace("/\.html([\?#][^$]+)?$/",""),				
				r =new RegExp("^" + url1.replace(/.html$/, "") + "(("+file+")?(-\\d+|\\d)?.html([\?#][^$]+)?)?$", "i");				
			return r.test(url2);		
		},
		/**
		*	获取url参数值
		*	@method	getUrlParam
		*	@return {String} 参数值
		*	@param {String} name 参数名
		*	@param {String} url 可选填,没有填：为当前页面地址；有填写：为填写的地址。
		**/
		getUrlParam:function(name){
			var url = (arguments.length==1)?window.location.href:arguments[1];
			var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "gi");
			var r = reg.exec(url);
			if (r!=null) return r[2];
			else return null;
		}
	}
});