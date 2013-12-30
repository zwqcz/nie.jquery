/*
发布系统标记规则
<a ts="<!--ShowTimeStamp-->" ch="栏目名" href="url链接">文本</a>
$(function(){
	nie.use(["nie.util.freshNews"],function(){
		var freshNews=nie.util.freshNews();
		freshNews.data//当前最新的文章数组：[{link:"url链接",txt:"文本",channel:"栏目名"}]
	}
});

*/
nie.util.freshNews=nie.util.freshNews||function(obj){		
		var o={
				data:[]
			},
			defaultArgs={
				tsName:"ts",
				newsDom:"a[ts][ch]",
				domain:location.hostname,
				cookieName:"__NIE_freshNews_"+location.pathname				
			},
			urls={};
		for(var i in obj){
			if(typeof defaultArgs[i]!="undefined"){
				defaultArgs[i]=obj[i];
			}
		}
		var cookie=$.cookie(defaultArgs.cookieName),			
			max_ts=cookie_ts=cookie?cookie:0,
			hostPath=location.pathname.split("/"),
			_path="/";
		$(defaultArgs.newsDom).each(function(){			
			var self=$(this),
				ts=self.attr(defaultArgs.tsName);
			if(!isNaN(ts)){
				ts=parseInt(ts);
				var url=self.attr("href");
				if(max_ts<ts) max_ts=ts;
				if(cookie_ts<ts && !urls[url]){	
					urls[url]=true;
					//self.css("text-decoration","underline");
					o.data.push({
						link:url,
						txt:self.text(),
						channel:self.attr("ch")
					});
				}
			}
		});
		urls=null;
		for(var i=1,l=hostPath.length-1;i<l;i++){
			_path+=hostPath[i]+"/";
		}
		//defaultArgs._tmp=_tmp;
		$.cookie(defaultArgs.cookieName,max_ts,{
			expires:7,
			path:_path,
			domain:defaultArgs.domain			
		});
		//o.__=defaultArgs;
		return o;
};