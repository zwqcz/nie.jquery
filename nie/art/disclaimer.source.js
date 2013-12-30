/**
* nie
* @module nie
**/
/**
*	文章页<br>
*	@class art
*	@static
*	@namespace nie
*	@author	Lam
**/
nie.art = nie.art || {}
/**
*	规范：文章页底部的免责声明<br>
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>nie.art.disclaimer<br>
*	注：依赖 util.share util.styleSheet util.scrollTo
*	<pre>
*	<p>&lt;div class=&quot;artDisclaimer&quot;&gt; </p>
*	<p>&lt;/div&gt;</p>
*	<p> &lt;script&gt;<br />
*		$(document).ready(function(){<br />
*			nie.use([&quot;nie.art.disclaimer&quot;],function(){<br />
*			<br />
*		//插入免责声明<br />
*		nie.art.disclaimer.appendTo($(&quot;.artDisclaimer&quot;));	<br />
*		<br />});<br />
*		})
*	<br />
*	&lt;/script&gt;</p>
*	</pre>
*	@uses $.util.styleSheet $.util.share $.util.scrollTo
*	@class disclaimer
*	@static
*	@namespace nie.art	
*	@author	Lam
**/
nie.art.disclaimer={
  /**	
  *	分享到的网站列表
  *	@property shareSites
  *	@type Array
  **/
  shareSites:["t163","qzone","tQQ","tSina","kaixin","bai","renren",,"douban","qq","msn"],
  /**	
  *	追加插入免责声明
  *	@method appendTo
  * @param {jquery Object||String} fat 父级对象
  **/
  appendTo:function(fat){
	 //add css
	 $.include("http://res.nie.netease.com/comm/js/nie/art/disclaimer/base.css");
	 //结构
	 var getSite = function(){
		 var site="y.163.com";
		 if(nie.config.site){
			 switch(nie.config.site){
			 	case "pk":
			 		site=nie.config.site+".163.com";
			 		break;
			 }
		 }
		 return site;
	 	},
	 	layout = '以上内容解释权归网易所有 | 您也可通过手机访问'+getSite()+' <span><a class="artDisclaimer-btn shareBtn" onclick="$(\'.artDisclaimer i\').show();" target="_self" href="javascript:void(0);">分享到..</a><i><a class="closeBtn" href="javascript:void(0);" onclick="$(\'.artDisclaimer i\').hide();" target="_self" title="关闭">关闭</a></i></span><a class="artDisclaimer-btn copyLinkBtn" href="javascript:void(0);" target="_self" onclick="$.clipBoard(window.location.href,\'复制成功！\');">复制网址</a><a class="artDisclaimer-btn goTopBtn" href="javascript:void(0);" target="_self" onclick="$.scrollTo($(document.body),500);">返回顶部</a>';
	 $(fat).html(layout);
	 $.share.appendTo(fat.find("i"),{site:this.shareSites});
  }
}