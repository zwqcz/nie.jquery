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
nie.art = nie.art || {};
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
(function($){
	nie.art.disclaimer=nie.art.disclaimer||{
	  /**	
	  *	分享到的网站列表
	  *	@property shareSites
	  *	@type Array
	  **/
	  //shareSites:["t163","qzone","tQQ","tSina","kaixin","bai","renren","douban","qq","msn"],
	  /**	
	  *	追加插入免责声明
	  *	@method appendTo
	  * @param {jquery Object||String} fat 父级对象
	  **/
	  appendTo:function(fat,type){
		 //add css
		 $.include("http://res.nie.netease.com/comm/js/nie/art/disclaimer/base.css");
		 /*
		  * 特殊处理：文章日期后加分享信息		   
		  */
		 /*
		 （先把文案改成以下的，其他的需求暂时不管） 
斩魂
“读取文章标题”，推荐你也看看。#斩魂#有点意思，果然是有态度的横版。甭管喜不喜欢，看起来都值得一战！ 文章地址 
武魂
“读取文章标题”，强烈推荐！游戏就要#武魂#这样才激情嘛，有战斗！才爽快！这才是真正的动作武侠！  文章地址 
战歌
“读取文章标题”推荐你也看看。#战歌#2.0公测好爽啊，不仅送千元基金，还有N多活动N多大奖，真是让人无法淡定啊！我刚领了一只绝版宝宝，你也来吧!  文章地址 
英雄三国
“读取文章标题”，推荐你也看看。原来除了5V5，还可以10V10和5V5V5呀，#英雄三国#还真是跟dota、lol不一样哦，中国原创竞技应该试一试。 文章地址 
龙剑
“读取文章标题”，推荐你也看看。原来次世代效果是这样子啊~真心碉堡了！#龙剑#这次仇恨拉得有点深……继续埋头求码去。文章地址 
大唐无双
“读取文章标题”，推荐你也看看。#大唐无双#的PK爽爆了，好多战场随便打。我最爱干劫镖打群架这事，嘿嘿~~你懂的！打架赚声望还能换装备，哥们一起来玩吧！文章地址 
精灵传说
“读取文章标题”，推荐你也看看。没萌过这么Q版的网游你就奥特了！上百只精灵！这么多漂亮mm！“萌”不是卖出来，是天生的！赶紧进游戏带一个去！#精灵传说# 文章地址 
大话3
大叔、正太？女王、萌妹纸？各种你想看的类型通通一网打尽。#大话西游3#比非诚勿扰成功率还高的网游，你懂的！猛戳：文章地址 
大话2
这篇“文章标题”对玩游戏的人还有点用，果断收藏了！#大话西游2#最近弄了个“双战斗模式”，听起来碉堡了！文章地址 
梦幻西游
“读取文章标题”，推荐你也看看。大家和我一起来玩#梦幻西游#吧，她是中国第一网游，不仅人气超级火爆，而且创新玩法层出不穷，不用充值就能任玩75小时哦，真是太给力
啦！文章地址 
NIE
“读取文章标题”，推荐你也看看。#网易游戏门户#里有好多最新的游戏资讯啊，还有各种有关网易游戏的趣闻轶事，八卦美女，我经常来这里逛，你也来吧。” 文章地址 
游戏星城
“读取文章标题”，推荐你也看看。体验自由百变的人生，我有我复式新主张！定居在#游戏星城#，跟我一起来玩吧！文章地址 
天下3：
“读取文章标题”，推荐你也看看。玄幻的世界！极致的3D！情义的天下！玩游戏我只玩#天下3# ！来自网易的重磅推荐，你怎能错过！ 文章地址
		 */
		 var artInfo=$("#NIE-art>p.artInfo"),
		 	 id="NIE-art-info-share",
		 	 artInfo_shareObj=$("#"+id),
			 title=$("h1").text(),
		 	 productName=nie.util.siteName(),
			 share_content="";
		 switch(nie.config.site){
			 case "zh":
				share_content="“"+title+"”，推荐你也看看。#"+productName+"#有点意思，果然是有态度的横版。甭管喜不喜欢，看起来都值得一战！";
				break;
			 case "wh":
				share_content="“"+title+"”，强烈推荐！游戏就要#"+productName+"#这样才激情嘛，有战斗！才爽快！这才是真正的动作武侠！";
				break;
			 case "pk":
				share_content="“"+title+"”推荐你也看看。#"+productName+"#2.0公测好爽啊，不仅送千元基金，还有N多活动N多大奖，真是让人无法淡定啊！我刚领了一只绝版宝宝，你也来吧!";
				break;
			case "dota":
				share_content="“"+title+"”，推荐你也看看。原来除了5V5，还可以10V10和5V5V5呀，#"+productName+"#还真是跟dota、lol不一样哦，中国原创竞技应该试一试。";
				break;
			case "lj":
				share_content="“"+title+"”，推荐你也看看。原来次世代效果是这样子啊~真心碉堡了！#"+productName+"#这次仇恨拉得有点深……继续埋头求码去。";
				break;
			case "dt2":
				share_content="“"+title+"”，推荐你也看看。#"+productName+"#的PK爽爆了，好多战场随便打。我最爱干劫镖打群架这事，嘿嘿~~你懂的！打架赚声望还能换装备，哥们一起来玩吧！";
				break;
			case "jl":
				share_content="“"+title+"”，推荐你也看看。没萌过这么Q版的网游你就奥特了！上百只精灵！这么多漂亮mm！“萌”不是卖出来，是天生的！赶紧进游戏带一个去！#"+productName+"#";
				break;
			case "xy3":
				share_content="大叔、正太？女王、萌妹纸？各种你想看的类型通通一网打尽。#"+productName+"#比非诚勿扰成功率还高的网游，你懂的！猛戳：";
				break;
			case "xy2":
				//share_content="这篇“"+title+"”对玩游戏的人还有点用，果断收藏了！#"+productName+"#最近弄了个“双战斗模式”，听起来碉堡了！";
				share_content="#"+productName+"#这是绝对要火的节奏啊，又有刘镇伟，又是完爆小龙女的李冰冰，看这篇文章“"+title+"”，我真心感觉这次大话2太给力了！";
				break;
			case "xyq":
				share_content="“"+title+"”，推荐你也看看。大家和我一起来玩#"+productName+"#吧，她是中国第一网游，不仅人气超级火爆，而且创新玩法层出不穷，不用充值就能任玩75小时哦，真是太给力啦！";
				break;
			case "nie":
				share_content="“"+title+"”，推荐你也看看。#"+productName+"#里有好多最新的游戏资讯啊，还有各种有关网易游戏的趣闻轶事，八卦美女，我经常来这里逛，你也来吧。";
				break;
			case "xc":
				share_content="“"+title+"”，推荐你也看看。体验自由百变的人生，我有我复式新主张！定居在#"+productName+"#，跟我一起来玩吧！";
				break;
			case "tx3":
				share_content="“"+title+"”，推荐你也看看。玄幻的世界！极致的3D！情义的天下！玩游戏我只玩#"+productName+"# ！来自网易的重磅推荐，你怎能错过！";
				break;
			 default:
				share_content="好文分享：“"+title+"”。来自网易"+(productName?"《"+productName+"》":"")+"的官网，值得一看~ #"+productName+"#";
				break;
		 }
		 if(artInfo.length>0 && artInfo_shareObj.length==0){
			 artInfo_shareObj=$("<span>",{"id":"NIE-art-info-share"});
			 if(artInfo.text()!=""){artInfo.append(" | ")}
			 artInfo.append(artInfo_shareObj);			
			 nie.util.share({
					fat:artInfo_shareObj,					
					type:1,
					defShow:[22,2,1,8],					
					title:share_content
					//append_title:" #"+productName+"#"
			 });
		 }		 
		var typeStr="";
		if(type){
			switch(type){
				case 1:
					break;
				case 2:
					typeStr="<br />立即分享：";
					break;
			}
		}
		
		//bugReporter
		window.nieBugReporter = window.nieBugReporter || function(){
			var conf = {
				refer : window.location.href,
				title : document.title,
				site : nie.config.site
			}
			window.open('http://page-bug-report.webapp.163.com/app/report?site={$site}&title={$title}&refer={$refer}'.replace('{$site}',conf.site)
						.replace('{$title}',encodeURIComponent(conf.title)).replace('{$refer}', conf.refer), 'bugReportWindow', 
						"height=469,width=605,scrollbars=0,location=no,menubar=no,resizable=1,status=no,toolbar=no");
		}
		var bugReporter = '';
		if(/nie|dt2|zh|pk|xy2|xyq|xy3|tx3|qn|dt|dtws2|jl|st|pet|xc|ff|lj|dota|wh|y3|x3|xdw|zd/.test(nie.config.site)){
			bugReporter = '<a class="artDisclaimer-btn bugReporter" href="javascript:void(0);" onclick="nieBugReporter();">页面纠错</a>';
		}
		
		
		//var	layout = '<span class="share-intro">以上内容解释权归网易所有 '+(has_mobileSite?'| 您也可通过手机访问'+getSite():'')+'</span>'+typeStr+' <span class="NIE-shareBox"></span><a class="artDisclaimer-btn copyLinkBtn" href="javascript:void(0);" target="_self" onclick="jQuery.clipBoard(window.location.href,\'复制成功！\');">复制网址</a><a class="artDisclaimer-btn goTopBtn" href="javascript:void(0);" target="_self" onclick="jQuery.scrollTo(jQuery(document.body),500);">返回顶部</a>';
		//var	layout = '<span class="share-intro">'+(has_mobileSite?'您也可通过手机访问'+getSite():'')+'</span>'+typeStr+' <span class="NIE-shareBox"></span><a class="artDisclaimer-btn copyLinkBtn" href="javascript:void(0);" target="_self" onclick="jQuery.clipBoard(window.location.href,\'复制成功！\');">复制网址</a>'+bugReporter+'<a class="artDisclaimer-btn goTopBtn" href="javascript:void(0);" target="_self" onclick="jQuery.scrollTo(jQuery(document.body),500);">返回顶部</a>';
		var	layout = typeStr+' <span class="NIE-shareBox"></span><a class="artDisclaimer-btn copyLinkBtn" href="javascript:void(0);" target="_self" onclick="jQuery.clipBoard(window.location.href,\'复制成功！\');">复制网址</a>'+bugReporter+'<a class="artDisclaimer-btn goTopBtn" href="javascript:void(0);" target="_self" onclick="jQuery.scrollTo(jQuery(document.body),500);">返回顶部</a>';
		 $(fat).html(layout);
		 //$.share.appendTo(fat.find("i"),{site:this.shareSites});
		 nie.util.share({
				fat:$(".NIE-shareBox"),					
				type:1,
				title:share_content
		 });
	  }
	};
})(jQuery);