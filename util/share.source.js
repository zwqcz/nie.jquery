/**
* util
* @module util
**/
/**
*	分享链接到开心网 msn qq等等.
*	<pre>
*	<a href="nie.use.html"><font color="red">nie.use模块</font></a>：util.share
*	支持的平台：
*	<ul>
*	<li>网易微博</li>
*	<li>开心网</li>
*	<li>校内：暂停使用，被人人代替。</li>
*	<li>人人</li>
*	<li>豆瓣</li>
*	<li>Qzone</li>
*	<li>白社会</li>
*	<li>新浪微博</li>
*	<li>QQ</li>
*	<li>MSN</li>
*	</ul>
*	注：因为部分功能使用剪切板(qq msn) 依赖 util.clipBoard util.styleSheet
*	</pre>
*	@uses $.clipBoard $.styleSheet
*	@namespace $
*	@class share
*	@static
*	@author Lam
**/
$.extend({
	share:{
	
		/**
		*	当前页面的产品名（产品名：当前页面二级域名）
		*	@property product 
		*	@type string
		**/
		product:nie.config.site,
		
		size:{
			"tSina":[615,505],
			"t163":[550,330],
			"qzone":[650,530],
			"kaixin":[600,350],
			"renren":[600,450],
			"douban":[550,400],
			"bai":[1000,600],
			"tQQ":[600,500],
			"msn":[1000,750]
			
		},
		log:function(site,data){

			if(this.product){
				new Image().src=this.getUrl("http://click.ku.163.com/share.gif",{
										"site":site,
										"type":data&&data.logType?data.logType:0,
										"product":this.product,
										"url":encodeURIComponent(location.host+location.pathname),
										"r":new Date().getMilliseconds()
								});
			}
		},
		go:function(data,type){
			//$(dom).attr({"href":$.share[name+"Url"](data),target:"_blank"}).click();			
			this.log(type,data);
			var size=this.size[type],
				ustr=this.data({	
						'width':size[0],
						'height':size[1],
						'top':(screen.height - size[1]) / 4,
						'left':(screen.width - size[0]) / 2,
						'toolbar':'no',
						'menubar':'no',
						'scrollbars':'no',
						'resizable':'yes',
						'location':'no',
						'status':'no'
				});
			window.open(this[type+"Url"](data),"_blank",ustr.join(','));			
		},
		chk:function(args,index,name,defaultVal){			
			var str=(args&&args[index]&&args[index][name])?args[index][name]:defaultVal;							
			switch(name){
				case "url":					
					var param=[
						//"share="+((args&&args[index].img)?1:0),
						"share="+((args&&args[index].logType)?args[index].logType:0),
						"sys="+((args&&args[index].sys)?args[index].sys:"")
						].join("&");
					str+=((str.indexOf("?")==-1)?"?":"&")+param;
					break;
				case "img":
					//图片地址为间接路径转为http绝对路径
					if(str.indexOf("http://")==-1&&str!=""){						
						var div = document.createElement('div');
						div.innerHTML = '<a href="' + str.replace(/"/g, '%22') + '"/>';						 
						str=div.firstChild.href;
					}
					break;
			}
			return encodeURIComponent(str);
		},
		/**
		*	检查字符串，如果不存在字符串则输出当前页面链接
		*	@method	chkUrl
		*	@private
		*	@return {String} 返回url
		*	@param {Array} args 参数arguments
		*	@param {Int} index 参数的索引值
		**/
		chkUrl:function(args,index){
			return this.chk(args,index,"url",window.location.href);
			//return encodeURIComponent((args&&args[index]&&args[index]["url"])?args[index]["url"]:window.location.href);
			//return (args&&args[index])?args[index]:window.location.href;
		},
		/**
		*	检查字符串，如果不存在字符串则输出当前页面链接
		*	@method	chkUrl
		*	@private
		*	@return {String} 返回url
		*	@param {Array} args 参数arguments
		*	@param {Int} index 参数的索引值
		**/
		chkImg:function(args,index){
			return this.chk(args,index,"img","");
		},
		/**
		*	检查字符串，如果不存在字符串则输出当前页面title
		*	@method	chkTitle
		*	@private
		*	@return {String} 返回标题
		*	@param {Array} args 参数arguments
		*	@param {Int} index 参数的索引值
		**/
		chkTitle:function(args,index){
			return this.chk(args,index,"title",document.title);
			//return encodeURIComponent((args&&args[index]&&args[index]["title"])?args[index]["title"]:document.title);
			//return (args&&args[index])?args[index]:document.title;
		},
		/**
		*	检查字符串，如果不存在字符串则输出当前页面content
		*	@method	chkContent
		*	@private
		*	@return {String} 返回内容
		*	@param {Array} args 参数arguments
		*	@param {Int} index 参数的索引值
		**/
		chkContent:function(args,index){
			return this.chk(args,index,"content",document.title);
			//return encodeURIComponent((args&&args[index]&&args[index]["content"])?args[index]["content"]:document.title);
			//return (args&&args[index])?args[index]:document.title;
		},
		data:function(data){
			var result=[];			
			for (var i in data){
				result.push(i+"="+data[i]);
			}
			return result;
		},
		getUrl:function(url,data){
			return url+"?"+this.data(data).join("&");
		},
		dealSys:function(sys,args,index){
			if(args&&args[index]){
				args[index].sys=sys;
			}			
			return args;
		},
		/**
		*	腾讯微博的分享链接
		*	<pre>
		*	//根据当前页面的url、title、content，输出开心网的分享链接
		*	document.write( $.share.tQQUrl() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出开心网的分享链接
		*	document.write( $.share.tQQUrl({url:"http://tx2.163.com/2009/fly/"}) );
		*	<br>
		*	//根据当前页面的url、content和title="飞龙在天_天下贰官网"，输出开心网的分享链接
		*	document.write( $.share.tQQUrl({title:"飞龙在天_天下贰官网"}) );		
		*	<br>
		*	//根据当前页面的url、title和content="飞龙在天，天下贰资料片"，输出开心网的分享链接
		*	document.write( $.share.tQQUrl({content:"飞龙在天，天下贰资料片"}) );		
		*	<br>
		*	//url="http://tx2.163.com/2009/fly/"、title="飞龙在天_天下贰官网"、content="飞龙在天，天下贰资料片"，输出开心网的分享链接
		*	document.write( $.share.tQQUrl({url:"http://tx2.163.com/2009/fly/",title:"飞龙在天_天下贰官网",content:"飞龙在天，天下贰资料片"}) );		
		*	</pre>
		*	@method	tQQUrl
		*	@param	{Object} data 可为空，（url,title,content）
		*	@return {String} 腾讯微博的分享链接
		**/
		tQQUrl:function(data){
			var args=this.dealSys("tQQ",arguments,0);
			return this.getUrl("http://v.t.qq.com/share/share.php",{
								"url":this.chkUrl(args,0),
								"site":window.location.hostname,
								"title":this.chkTitle(args,0),								
								"pic":this.chkImg(args,0)
								//,"appkey":"fbd07fd7d5f849d08d8a9d24e364e5c7"
						});
		},		
		/**
		*	腾讯微博：激发click后，新开页面到腾讯微博的分享链接。
		*	<pre>
		*	$.share.tQQ("#share");
		*	$.share.tQQ("#share",{url:"http://tx2.163.com",title:"天下贰"});
		*	</pre>
		*	@method tQQ
		*	@param {Object} dom 需要注册click事件的dom
		*	@param {Object} [data] 可为空，（url,title）
		**/
		tQQ:function(dom,data){	
			$.share.go(data,"tQQ");
		},
		/**
		*	网易微博的分享链接
		*	<pre>
		*	//根据当前页面的url、title、content，输出开心网的分享链接
		*	document.write( $.share.t163Url() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出开心网的分享链接
		*	document.write( $.share.t163Url({url:"http://tx2.163.com/2009/fly/"}) );
		*	<br>
		*	//根据当前页面的url、content和title="飞龙在天_天下贰官网"，输出开心网的分享链接
		*	document.write( $.share.t163Url({title:"飞龙在天_天下贰官网"}) );		
		*	<br>
		*	//根据当前页面的url、title和content="飞龙在天，天下贰资料片"，输出开心网的分享链接
		*	document.write( $.share.t163Url({content:"飞龙在天，天下贰资料片"}) );		
		*	<br>
		*	//url="http://tx2.163.com/2009/fly/"、title="飞龙在天_天下贰官网"、content="飞龙在天，天下贰资料片"，输出开心网的分享链接
		*	document.write( $.share.t163Url({url:"http://tx2.163.com/2009/fly/",title:"飞龙在天_天下贰官网",content:"飞龙在天，天下贰资料片"}) );		
		*	</pre>
		*	@method	t163Url
		*	@param	{Object} data 可为空，（url,title,content）
		*	@return {String} 网易微博的分享链接
		**/
		t163Url:function(data){
			//var url = (data&&data["url"])?data["url"]:window.location.href;
			//return "http://t.163.com/article/user/checkLogin.do?link="+url+"&source="+encodeURIComponent("网易游戏")+"&info="+$.share.chkTitle(arguments,0)+"%20"+url+"&"+new Date().getTime();
			var args=this.dealSys("t163",arguments,0),
				url=this.chkUrl(args,0);
			return this.getUrl("http://t.163.com/article/user/checkLogin.do",{
								"link":url,
								"source":encodeURIComponent("网易游戏"),
								"info":this.chkTitle(args,0)+"%20"+url,
								"images":this.chkImg(args,0),
								"check1stImg":true,
								"togImg":true
						});
		},		
		/**
		*	网易微博：激发click后，新开页面到网易微博的分享链接。
		*	<pre>
		*	$.share.t163("#share");
		*	$.share.t163("#share",{url:"http://tx2.163.com",title:"天下贰"});
		*	</pre>
		*	@method t163
		*	@param {Object} dom 需要注册click事件的dom
		*	@param {Object} [data] 可为空，（url,title）
		**/
		t163:function(dom,data){	
			//var url=$.share.t163Url(data)+'&'+new Date().getTime();
			//window.open(url,'newwindow','height=330,width=550,top='+(screen.height-280)/2+',left='+(screen.width-550)/2+', toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no');
			//$(dom).attr({"href":$.share.neteaseUrl(data),target:"_blank"}).click();
			$.share.go(data,"t163");
		},
		/**
		*	开心网的分享链接
		*	<pre>
		*	//根据当前页面的url、title、content，输出开心网的分享链接
		*	document.write( $.share.kaixinUrl() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出开心网的分享链接
		*	document.write( $.share.kaixinUrl({url:"http://tx2.163.com/2009/fly/"}) );
		*	<br>
		*	//根据当前页面的url、content和title="飞龙在天_天下贰官网"，输出开心网的分享链接
		*	document.write( $.share.kaixinUrl({title:"飞龙在天_天下贰官网"}) );		
		*	<br>
		*	//根据当前页面的url、title和content="飞龙在天，天下贰资料片"，输出开心网的分享链接
		*	document.write( $.share.kaixinUrl({content:"飞龙在天，天下贰资料片"}) );		
		*	<br>
		*	//url="http://tx2.163.com/2009/fly/"、title="飞龙在天_天下贰官网"、content="飞龙在天，天下贰资料片"，输出开心网的分享链接
		*	document.write( $.share.kaixinUrl({url:"http://tx2.163.com/2009/fly/",title:"飞龙在天_天下贰官网",content:"飞龙在天，天下贰资料片"}) );		
		*	</pre>
		*	@method	kaixinUrl
		*	@param	{Object} data 可为空，（url,title,content）
		*	@return {String} 开心网的分享链接
		**/
		kaixinUrl:function(data){
			var args=this.dealSys("kaixin",arguments,0);
			return this.getUrl("http://www.kaixin001.com/repaste/share.php",{
					"rtitle":this.chkTitle(args,0),
					"rurl":this.chkUrl(args,0),
					"rcontent":this.chkContent(args,0)
				});
		},		
		/**
		*	开心网：激发click后，新开页面到开心网的分享链接。
		*	<pre>
		*	$.share.kaixin("#share");
		*	$.share.kaixin("#share",{url:"http://tx2.163.com",title:"天下贰"});
		*	</pre>
		*	@method kaixin
		*	@param {Object} dom 需要注册click事件的dom
		*	@param {Object} [data] 可为空，（url,title）
		**/
		kaixin:function(dom,data){	
			//$(dom).attr({"href":$.share.kaixinUrl(data),target:"_blank"}).click();
			$.share.go(data,"kaixin");
		},
		/**
		*	<font color="red">暂停使用：</font>校内网的分享链接
		*	<pre>
		*	//根据当前页面的url、title，输出校内网的分享链接
		*	document.write( $.share.xiaoneiUrl() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出校内网的分享链接
		*	document.write( $.share.xiaoneiUrl({url:"http://tx2.163.com/2009/fly/"}) );
		*	<br>
		*	//根据当前页面的url、content和title="飞龙在天_天下贰官网"，输出校内网的分享链接
		*	document.write( $.share.xiaoneiUrl({title:"飞龙在天_天下贰官网"}) );		
		*	<br>
		*	//url="http://tx2.163.com/2009/fly/"、title="飞龙在天_天下贰官网"，输出校内网的分享链接
		*	document.write( $.share.xiaoneiUrl({url:"http://tx2.163.com/2009/fly/",title:"飞龙在天_天下贰官网"}) );		
		*	</pre>
		*	@method xiaoneiUrl
		*	@param	{Object} data 可为空，（url,title）
		*	@return {String} 校内网的分享链接
		**/
		/*
		xiaoneiUrl:function(data){
			return $.share.renrenUrl(data);
		},		
		*/
		/**
		*	<font color="red">暂停使用：</font>校内网：激发click后，新开页面到人人网的分享链接。
		*	<pre>
		*	$.share.xiaonei("#share");
		*	$.share.xiaonei("#share",{url:"http://tx2.163.com",title:"天下贰"});
		*	</pre>
		*	@method xiaonei
		*	@param {Object} dom 需要注册click事件的dom
		*	@param {Object} [data] 可为空，（url,title）
		**/
		xiaonei:function(dom,data){	
			//$(dom).attr({"href":$.share.xiaoneiUrl(data),target:"_blank"}).click();
			$.share.go(data,"xiaonei");
		},		
		/**
		*	人人网的分享链接
		*	<pre>
		*	//根据当前页面的url、title，输出人人网的分享链接
		*	document.write( $.share.renrenUrl() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出人人网的分享链接
		*	document.write( $.share.renrenUrl({url:"http://tx2.163.com/2009/fly/"}) );
		*	<br>
		*	//根据当前页面的url、content和title="飞龙在天_天下贰官网"，输出人人网的分享链接
		*	document.write( $.share.renrenUrl({title:"飞龙在天_天下贰官网"}) );		
		*	<br>
		*	//url="http://tx2.163.com/2009/fly/"、title="飞龙在天_天下贰官网"，输出人人网的分享链接
		*	document.write( $.share.renrenUrl({url:"http://tx2.163.com/2009/fly/",title:"飞龙在天_天下贰官网"}) );		
		*	</pre>
		*	@method renrenUrl
		*	@param	{Object} data 可为空，（url,title）
		*	@return {String} 人人网的分享链接
		**/
		renrenUrl:function(data){
			var args=this.dealSys("renren",arguments,0);
			return this.getUrl("http://share.renren.com/share/buttonshare.do",{
					"title":this.chkTitle(args,0),
					"link":this.chkUrl(args,0)
				});
		},
		/**
		*	人人网：激发click后，新开页面到人人网的分享链接。
		*	<pre>
		*	$.share.renren("#share");
		*	$.share.renren("#share",{url:"http://tx2.163.com",title:"天下贰"});
		*	</pre>
		*	@method renren
		*	@param {Object} dom 需要注册click事件的dom
		*	@param {Object} [data] 可为空，（url,title）
		**/
		renren:function(dom,data){	
			//$(dom).attr({"href":$.share.renrenUrl(data),target:"_blank"}).click();
			$.share.go(data,"renren");
		},		
		/**
		*	豆瓣网的分享链接
		*	<pre>
		*	//根据当前页面的url、title，输出豆瓣网的分享链接
		*	document.write( $.share.doubanUrl() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出豆瓣网的分享链接
		*	document.write( $.share.doubanUrl({url:"http://tx2.163.com/2009/fly/"}) );
		*	<br>
		*	//根据当前页面的url、content和title="飞龙在天_天下贰官网"，输出豆瓣网的分享链接
		*	document.write( $.share.doubanUrl({title:"飞龙在天_天下贰官网"}) );		
		*	<br>
		*	//url="http://tx2.163.com/2009/fly/"、title="飞龙在天_天下贰官网"，输出豆瓣网的分享链接
		*	document.write( $.share.doubanUrl({url:"http://tx2.163.com/2009/fly/",title:"飞龙在天_天下贰官网"}) );		
		*	</pre>
		*	@method doubanUrl
		*	@param	{Object} data 可为空，（url,title）
		*	@return {String} 豆瓣网的分享链接
		**/
		doubanUrl:function(data){
			//return "http://www.douban.com/recommend/?url="+$.share.chkUrl(arguments,0)+"&title="+$.share.chkTitle(arguments,0);
			var args=this.dealSys("douban",arguments,0);
			return this.getUrl("http://www.douban.com/recommend/",{
				"url":this.chkUrl(args,0),
				"title":this.chkTitle(args,0),
				"image":this.chkImg(args,0)
			});
		},							
		/**
		*	豆瓣网：激发click后，新开页面到豆瓣网的分享链接。
		*	<pre>
		*	$.share.douban("#share");
		*	$.share.douban("#share",{url:"http://tx2.163.com",title:"天下贰"});
		*	</pre>
		*	@method douban
		*	@param {Object} dom 需要注册click事件的dom
		*	@param {Object} [data] 可为空，（url,title）
		**/
		douban:function(dom,data){	
			//$(dom).attr({"href":$.share.doubanUrl(data),target:"_blank"}).click();
			$.share.go(data,"douban");
		},		
		/**
		*	qzone网的分享链接
		*	<pre>
		*	//根据当前页面的url、title，输出qzone网的分享链接
		*	document.write( $.share.qzoneUrl() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出qzone网的分享链接
		*	document.write( $.share.qzoneUrl({url:"http://tx2.163.com/2009/fly/"}) );	
		*	</pre>
		*	@method qzoneUrl
		*	@param	{Object} data 可为空，（url）
		*	@return {String} qzone网的分享链接
		**/			
		qzoneUrl:function(data){
			//return "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url="+$.share.chkUrl(arguments,0)+"&title="+$.share.chkTitle(arguments,0);
			var args=this.dealSys("qzone",arguments,0);
			return this.getUrl("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",{
				"url":this.chkUrl(args,0),
				"title":this.chkTitle(args,0),
				"pics":this.chkImg(args,0)
			});
		},
		/**
		*	qzone：激发click后，新开页面到qzone的分享链接。
		*	<pre>
		*	$.share.qzone("#share");
		*	$.share.qzone("#share",{url:"http://tx2.163.com",title:"天下贰"});
		*	</pre>
		*	@method qzone
		*	@param {Object} dom 需要注册click事件的dom
		*	@param {Object} [data] 可为空，（url,title）
		**/
		qzone:function(dom,data){	
			//$(dom).attr({"href":$.share.qzoneUrl(data),target:"_blank"}).click();
			$.share.go(data,"qzone");
		},		
		/**
		*	白社会的分享链接
		*	<pre>
		*	//根据当前页面的url、title，输出白社会的分享链接
		*	document.write( $.share.baiUrl() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出白社会的分享链接
		*	document.write( $.share.baiUrl({url:"http://tx2.163.com/2009/fly/"}) );
		*	<br>
		*	//根据当前页面的url、content和title="飞龙在天_天下贰官网"，输出白社会的分享链接
		*	document.write( $.share.baiUrl({title:"飞龙在天_天下贰官网"}) );		
		*	<br>
		*	//url="http://tx2.163.com/2009/fly/"、title="飞龙在天_天下贰官网"，输出白社会的分享链接
		*	document.write( $.share.baiUrl({url:"http://tx2.163.com/2009/fly/",title:"飞龙在天_天下贰官网"}) );		
		*	</pre>
		*	@method baiUrl
		*	@param	{Object} data 可为空，（url,title）
		*	@return {String} 白社会的分享链接
		**/
		baiUrl:function(data){
			//return "http://bai.sohu.com/share/blank/addbutton.do?from=nie&link="+$.share.chkUrl(arguments,0)+"&title="+$.share.chkTitle(arguments,0);
			var args=this.dealSys("bai",arguments,0);
			return this.getUrl("http://bai.sohu.com/share/blank/add.do",{
				"from":"nie",
				"link":this.chkUrl(args,0),
				"title":this.chkTitle(args,0)				
			});
		},
		/**
		*	白社会：激发click后，新开页面到白社会的分享链接。
		*	<pre>
		*	$.share.bai("#share");
		*	$.share.bai("#share",{url:"http://tx2.163.com",title:"天下贰"});
		*	</pre>
		*	@method bai
		*	@param {Object} dom 需要注册click事件的dom
		*	@param {Object} [data] 可为空，（url,title）
		**/
		bai:function(dom,data){	
			//$(dom).attr({"href":$.share.baiUrl(data),target:"_blank"}).click();
			$.share.go(data,"bai");
		},
		/**
		*	新浪微博的分享链接
		*	<pre>
		*	//根据当前页面的url、title，输出新浪微博的分享链接
		*	document.write( $.share.tSinaUrl() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出新浪微博的分享链接
		*	document.write( $.share.tSinaUrl({url:"http://tx2.163.com/2009/fly/"}) );
		*	<br>
		*	//根据当前页面的url、content和title="飞龙在天_天下贰官网"，输出新浪微博的分享链接
		*	document.write( $.share.tSinaUrl({title:"飞龙在天_天下贰官网"}) );		
		*	<br>
		*	//url="http://tx2.163.com/2009/fly/"、title="飞龙在天_天下贰官网"，输出新浪微博的分享链接
		*	document.write( $.share.tSinaUrl({url:"http://tx2.163.com/2009/fly/",title:"飞龙在天_天下贰官网"}) );		
		*	</pre>
		*	@method tSinaUrl
		*	@param	{Object} [data] 可为空，（url,title）
		*	@return {String} 新浪微博的分享链接
		**/
		tSinaUrl:function(data){
			var args=this.dealSys("tSina",arguments,0);
			return this.getUrl("http://v.t.sina.com.cn/share/share.php",{
					"c":"nie",
					"content":"gb2312",
					"pic":this.chkImg(args,0),
					"source":"nie",
					"sourceUrl":encodeURIComponent("http://"+nie.config.site+".163.com"),
					"title":this.chkTitle(args,0),
					"url":this.chkUrl(args,0)
				});
		},						
		/**
		*	新浪微博：激发click后，新开页面到新浪微博的分享链接。
		*	<pre>
		*	$.share.tSina("#share");
		*	$.share.tSina("#share",{url:"http://tx2.163.com",title:"天下贰"});
		*	</pre>
		*	@method tSina
		*	@param {Object} dom 需要注册click事件的dom
		*	@param {Object} [data] 可为空，（url,title）
		**/
		tSina:function(dom,data){			
			//$(dom).attr({"href":$.share.tSinaUrl(data),target:"_blank"}).click();
			$.share.go(data,"tSina");
			//$.share.open($.share.tSinaUrl(data),615,505);
		},
		/**
		*	复制链接到剪切板，粘贴到QQ上。
		*	<pre>
		*	$.share.qq();
		*	$.share.qq({url:"http://tx2.163.com/",alertTxt:"复制成功！"});
		*   $.share.qq({clipBoardTxt:"周杰伦邀你玩梦幻，有演唱会门票等大奖送哦！详情请查看http://xyq.163.com/",alertTxt:"复制成功！"});
		*	</pre>
		*	@method qq
		*	@param {Object} [data] 可为空，（url,alertTxt,clipBoardTxt）alertTxt：复制完后alert的字符串,默认值：复制成功！请粘贴分享给朋友！clipBoardTxt：暂时为qq和msn复制到剪切板的文本（替代url）。
		**/
		qq:function(data){
			var sys="qq";
			this.copyClip(data,sys);
			this.log(sys);
		},	
		/**
		*	msn的分享链接
		*	<pre>
		*	//根据当前页面的url、title，输出新浪微博的分享链接
		*	document.write( $.share.msnUrl() );
		*	<br>
		*	//根据当前页面的title、content和url="http://tx2.163.com/2009/fly/"，输出新浪微博的分享链接
		*	document.write( $.share.msnUrl({url:"http://tx2.163.com/2009/fly/"}) );
		*	<br>
		*	//根据当前页面的url、content和title="飞龙在天_天下贰官网"，输出新浪微博的分享链接
		*	document.write( $.share.msnUrl({title:"飞龙在天_天下贰官网"}) );		
		*	<br>
		*	//url="http://tx2.163.com/2009/fly/"、title="飞龙在天_天下贰官网"，输出新浪微博的分享链接
		*	document.write( $.share.msnUrl({url:"http://tx2.163.com/2009/fly/",title:"飞龙在天_天下贰官网"}) );		
		*	</pre>
		*	@method msnUrl
		*	@param	{Object} [data] 可为空，（url,title）
		*	@return {String} 新浪微博的分享链接
		**/
		msnUrl:function(data){
			var args=this.dealSys("msn",arguments,0),
				chkLen=function(str){
					var len=450;
					return (str.length>len)?str.substring(0,len):str;
				};
			return this.getUrl("http://profile.live.com/badge",{
					"wa":"wsignin1.0",
					"url":this.chkUrl(args,0),		
					"screenshot":this.chkImg(args,0),								
					"title":chkLen(this.chkTitle(args,0)),
					"description":chkLen(this.chkContent(args,0))
				});
		},	
		/**
		*	复制链接到剪切板，粘贴到MSN上。
		*	<pre>
		*	$.share.msn();
		*	$.share.msn({url:"http://tx2.163.com/",alertTxt:"复制成功！"});
		*   $.share.msn({clipBoardTxt:"周杰伦邀你玩梦幻，有演唱会门票等大奖送哦！详情请查看http://xyq.163.com/",alertTxt:"复制成功！"});
		*	</pre>
		*	@method msn
		*	@param {Object} dom 需要注册click事件的对象dom
		*	@param {Object} [data] 可为空，（url,alertTxt,clipBoardTxt）alertTxt：复制完后alert的字符串,默认值：复制成功！请粘贴分享给朋友！clipBoardTxt：暂时为qq和msn复制到剪切板的文本（替代url）。
		**/
		msn:function(data){
			/*
			var sys="msn";
			this.copyClip(data,sys);
			this.log(sys);
			*/
			$.share.go(data,"msn");
		},	
		copyClip:function(data,sys){
			//clipBoardTxt：暂时为qq复制到剪切板的文本（替代url）
			var args=this.dealSys(sys,arguments,0),
				clipBoardTxt=(data.clipBoardTxt)?data.clipBoardTxt:decodeURIComponent(this.chkTitle(args,0)+" "+this.chkUrl(args,0)),
				alertTxt = (data&&data.alertTxt)?data.alertTxt:"复制成功！请粘贴分享给朋友！";
			$.clipBoard(clipBoardTxt,alertTxt);
		},
		/**
		*	插入全部分享网站链接的dom<br>
		*	<font color="blue">内附css：</font><a href="http://res.nie.netease.com/comm/js/util/share.css" target="_blank">http://res.nie.netease.com/comm/js/util/share.css</a>
		*	<pre>
		*	//在id="share"插入开心网 和 qq的 link
		*	$.share.appendTo("#share",{site:["kaixin","qq"]});
		*	<br>
		*	//在id="share"插入全部支持的平台。
		*	$.share.appendTo("#share");
		*	</pre>
		*	@method appendTo
		*	@param {Object|String} fat 插入的父级object 可字符串,如#id或者$("#fat span")
		*	@param {Object} [data] 可选填参数（site:[],url,title,clipBoardTxt,isHideTxt），site：只显示平台字符串数组,如["kaixin",tSina"],不填代表输出全部支持的平台,clipBoardTxt：暂时为qq和msn复制到剪切板的文本（替代url）,isHideTxt：默认为false,是否隐藏icon旁边的文字（如：icon旁边的文字-->新浪微博）。
		**/
		appendTo:function(fat,data){
			if(fat){
				var txtData={
						"t163":"网易微博",
						"kaixin":"开心网",
						"renren":"人人网",
						"douban":"豆瓣",
						"qzone":"QQ空间",
						"bai":"白社会",
						"tSina":"新浪微博",
						"qq":"QQ",
						"msn":"MSN",
						"tQQ":"腾讯微博"
					},
					defaultData={
						site:["t163","tSina","qzone","tQQ","renren","qq","msn","kaixin","douban","bai"],
						isHideTxt:false
					},
					add=function(isCopyClip,type,data,fat){		
						if (typeof $.share[type] != "undefined") {							
							$("<a>",{
									"class":"NIE-share NIE-share-" + type+(data.isHideTxt?" NIE-share-hideTxt":""),
									title:txtData[type]!="undefined"?txtData[type]:"",
									href:"javascript:void(0);",
									target: "_self",
									text:(!data.isHideTxt&&typeof txtData[type]!="undefined")?txtData[type]:"",
									click:isCopyClip?function(){$.share[type](data);}:function(){$.share.go(data,type);}
								}).appendTo(fat);
						}					
					};
				$.include("http://res.nie.netease.com/comm/js/util/share.css");
				fat=$(fat);
				data=data||{};
				for (var i in defaultData){
					if(typeof data[i]=="undefined") data[i]=defaultData[i];
				}										
				$.each(data.site,function(){
					var type=this.toString();
					add(type=="qq",type,data,fat);						
				});				
			}
		},
		shareImg:function(fat){			
			var id="NIE-share-img",
				shareObj=$("#"+id),
				imgs=$(fat).find("img");
			if(imgs.length>0&&shareObj.length==0){
				shareObj=$('<div>',{					
					html:'<b>分享到：</b><span></span>',
					"id":id
				});
				shareObj.mouseover(function(){
					overStatus=true;
				}).appendTo($(document.body));
				var con=shareObj.find("span"),
					shareObj_h=parseInt(shareObj.css("height")),
					space=10,
					outTime=180,
					overStatus=false;
				imgs.hover(function(){				    
					  overStatus=true;
					  var self=$(this),
						  pos=self.offset(),
						  h=parseInt(self.attr("height"));
					  con.empty();
					  $.share.appendTo(con,{logType:1,img:self.attr("src"),isHideTxt:true});
					  shareObj.css({
									  top:isNaN(h)?pos.top+space:pos.top+h-shareObj_h-space,
									  left:pos.left+space
					  }).show();
					},function(){
						overStatus=false;
						setTimeout(function(){
							if(overStatus==false){
								shareObj.hide();
							}
						},outTime);
				});
			}
		},
		shareTxt:function(fat){
			var id="NIE-share-txt",
				shareObj=$("#"+id),
				getTxt=function(){
					var t = '';
					if(window.getSelection){
						t = window.getSelection();
					}else if(document.getSelection){
						t = document.getSelection();
					}else if(document.selection){
						t = document.selection.createRange().text;
					}
					return $.trim(t);
				},
				fatDom=$(fat),
				selected_status=false;
			if(fatDom.length>0){
				$(document.body).click(function(){
					if(selected_status){
						selected_status=false;
						shareObj.hide();
					}
				});
				fatDom.mouseup(function(e){
					var str=getTxt();
					if(str!=""){
						selected_status=true;						
						if(shareObj.length==0){
							shareObj=$('<div>',{					
								html:'<b>分享到：</b><span></span>',
								"id":id
							});			
							shareObj.css({
								position:"absolute",
								zIndex:100
							}).appendTo($(document.body));
						}
						shareObj.css({
							left:e.pageX-50,
							top:e.pageY+15
						}).show();
						var con=shareObj.find("span");
						con.empty();
					    $.share.appendTo(con,{
												logType:2,
												isHideTxt:true,
												title:str,
												content:str
										});
					}
					else{
						selected_status=false;
						shareObj.hide();
					}
				});
			}
		}
	}	
});