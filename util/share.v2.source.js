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
				var nameMap={"t163":5,"qzone":1,"tQQ":3,"tSina":2,"kaixin":7,"bai":9,"renren":8,"douban":11,/*"qq":1,*/"msn":17},
					site=[],
					shareData={
						type:6,
						fat:$(fat)
					};
				$.each(nameMap,function(){
					site.push(this)
				})
				if(data){
					if(data.site){
						site=[];
						$.each(data.site,function(){
							if(nameMap[this]) site.push(nameMap[this]);
						})
					}			
					if(data.url) shareData.url=data.url;
					if(data.title) shareData.title=data.title;
				}
				shareData.defShow=site;
				nie.util.share(shareData);
			}
		}
	}	
});