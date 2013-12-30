/*
__NIE_copyRight_siteName="产品号";//如大唐无双2:dtws2
__NIE_copyRight_whiteStyle=true;//是否使用反白模式,默认全站反白模式有:qn倩女、qn2倩女2、zd藏地传奇、csxy创世西游、zg战国、dota英雄三国

*/
(function(){
  var path="http://res.nie.netease.com/comm/NIE_copyRight/images/",
			html="",					
			t1="文网游备字",
			t2="文网备字",
			bcode="",
			wcode="粤网文[2011]0522-079号",
		    wcode_hanyan="文网文[2009]156号",
			logo="",
			showPart1=true,
			age=16,
			sug='本游戏故事情节设置紧凑',
			agePermision='本游戏适合$age岁以上的玩家进入。<br />',
			suggestion='积极健康的游戏心态是健康游戏的开端，本游戏故事情节设置紧凑，请您合理控制游戏时间，避免沉溺游戏影响生活，注意自我保护，防范网络陷阱。<br />',
			infoStr=' <a href="http://nie.163.com/bs/ca_lianyun.html" target="_blank">联运推广</a> -',
			centerCode='<a href="http://www.cogcpa.org" target="_blank">中国网络游戏版权保护联盟举报中心</a>',
			addInfo=false,
			plusCode="",
			get_pngImg=function(width,height,imgUrl,linkUrl){
				var bgStyle = lteIE6 ? "_filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imgUrl+"')":"background:url("+imgUrl+") no-repeat",
					style='width:'+width+'px;height:'+height+'px;display:inline-block;'+bgStyle;
				if(!linkUrl) style+=";cursor:default";
				return '<a href='+(linkUrl?linkUrl:"javascript:void(0);")+' target="_blank" style="'+style+'"></a>&nbsp;&nbsp;&nbsp;&nbsp;';
			},						
			ua=navigator.userAgent,			
			copyRight_style=1,
		    site=function(){
				var v = /^((?:[^\.]+\.){1,3})163\.com$/i.exec(window.self.location.hostname);
				return (v!=null&&v.length==2)?(v[1].substring(0,v[1].length-1)).toLowerCase():null;
			}(),
			lteIE6=/msie/i.test(ua)&& 6>=parseInt(ua.match(/.+ie[\/: ]([\d.]+)/i) [1]);//是否小于等于ie6
  if(typeof __NIE_copyRight_siteName=="undefined"){
	if(site==null) site="nie";
  }else{
	site=__NIE_copyRight_siteName;
  }
  switch(site){
	  case "xyq":		  		
		bcode=t1+"【2005】017号（2011）C-RPG042号";
		break;
	  case "xy2":
		bcode=t1+'【2005】016号';
		break;
	  case "xy3":
		bcode=t1+'(2011)C-RPG089号';
		break;
	  case "xyw":
		bcode=t1+'[2010]C-RPG026号';
		break;
	  case "pk"://原xyw
		bcode=t1+'(2011)C-RPG090号';
		addInfo=true;
		break;
	  case "dt":
		bcode=t1+'(2011)C-RPG096号';
		break;
	  case 'gamebase':
		agePermision='';
		suggestion='';
		break;
	  case 'nie':
		agePermision='';
		suggestion='';
		break;
	  case 'tx2':
		age=18;
		break;
	  case 'tx3':
		age=18;
		bcode=t1+"(2011)C-RPG151号";
		wcode=wcode_hanyan;
		break;
	  case 'dt2':
		age=18;
		bcode=t1+"(2011)C-RPG049号";
		break;	  
	  case "dtws2":
		age=18;
		bcode=t1+"(2011)C-RPG049号";
		wcode=wcode_hanyan;
		break;
	  case 'jl':
		sug='本游戏玩法多样，内容丰富';
		//age=12;
		agePermision="本游戏适合所有年龄玩家进入<br />";
		addInfo=true;
		break;
	  case 'ball':
		bcode=t1+'[2010]C-CSG005号';
		age=12;
		break;
	  case 'pet':
		age=12;
		break;
	  case 'zg':
		copyRight_style=2;
		bcode=t1+'[2010]W-SLG012号';				
		logo=get_pngImg(44,31,path+"leihuo.{s}.png");		
		break;
	  case 'sg':
		bcode=t1+'[2010]W-SLG013号';
		sug='本游戏为全地图PK区域游戏';
		break;
	  case "ff":
		bcode=t1+'[2010]C-RPG001号';
		age=14;				
		break;
	  case "popogame":
		  bcode=t2+'[2008]011号';
		  break;
	  case "gs":
		agePermision='';
		suggestion='';
		break;
	  case "fj":
		bcode=t1+'[2010]C-CSG002号';
		break;
	  case "rich":
		bcode=t1+'[2010]C-CSG002号';
		break;
	  case "st":
		bcode= t1+'[2010]C-CSG004号';
		break;
	  case "qn":			
		copyRight_style=2;					
		logo=get_pngImg(44,31,path+"leihuo.{s}.png");
		bcode= t1+'(2011)C-RPG007号';
		wcode=wcode_hanyan;
		break;
	  case "qn2":			
		copyRight_style=2;					
		logo=get_pngImg(44,31,path+"leihuo.{s}.png");
		bcode= t1+'(2011)C-RPG007号';
		wcode=wcode_hanyan;
		break;
	  case "f":
		wcode=wcode_hanyan;
		break;
	  case 'csxy':
		copyRight_style=2;
		bcode=t1+'(2011)C-RPG051号';				
		break;			
	  case "xjc":
		bcode=t1+"(2011)W-RPG149号";
		break;
	  case "zd":
		copyRight_style=2;
	  showPart1=false;
		break;
	  case "wh"://武魂
		wcode=wcode_hanyan;
		break;
	  case "dota"://英雄三国
		defaultWhiteLogo=1;
		showPart1=false;
		break;
	  default:
		showPart1=false;
		break;
  }  
  var showMoreInfo=showPart1 && /^\/($|index.html|boot.html)/.test(window.self.location.pathname);
  if(typeof __NIE_copyRight_whiteStyle!="undefined") copyRight_style=(__NIE_copyRight_whiteStyle?2:1);//设置反白模式
  if(showMoreInfo){
	  //plusCode='<br><span id="ncp-l3" style="display:inline-block;padding-top:10px;">'+agePermision.replace("$age",age)+suggestion+'全国文化市场统一举报电话：12318　文化部网络游戏举报和联系电子邮箱：<a href="mailto:wlwh@vip.sina.com">wlwh@vip.sina.com</a><br /><a target="_blank" href="http://nie.163.com/news/2010/6/9/442_216957.html">《网络游戏管理暂行办法》</a>'+bcode+'　《网络文化经营许可证》'+wcode+'</span>';
	  plusCode='<br><span id="ncp-l3" style="display:inline-block;padding-top:10px;">'+agePermision.replace("$age",age)+suggestion+'全国文化市场统一举报电话：12318　文化部网络游戏举报和联系电子邮箱：<a href="mailto:wlwh@vip.sina.com">wlwh@vip.sina.com</a><br /><a target="_blank" href="http://nie.163.com/news/2010/6/9/442_216957.html">《网络游戏管理暂行办法》</a>'+bcode+'　《网络文化经营许可证》'+wcode+'</span>';
	  bcode=wcode="";
  }
  else{
	  centerCode='';
  }			  
  //html+='<p id="NIE-copyRight-corp" style="width:100%;line-height:20px;text-align:center;display:inline-block;padding-top:15px;"><span style="position:relative;vertical-align:top;top:3px;display:inline-block;">'+get_pngImg(101,31,path+"netease.{s}.png","http://www.163.com")+''+get_pngImg(111,31,path+"nie.{s}.png","http://nie.163.com")+logo+'</span><span style="text-align:left;display:inline-block;padding-left:10px;"><span id="ncp-l1"><a href="http://gb.corp.163.com/gb/about/overview.html" target="_blank">公司简介</a> - <a href="http://help.163.com/" target="_blank">客户服务</a> - <a href="http://gb.corp.163.com/gb/legal.html" target="_blank">相关法律</a> - <a href="http://nie.163.com/about/about.html" target="_blank">网易游戏</a> - <a href="http://nie.163.com/about/contactus.html" target="_blank">联系我们</a> - <a href="http://nie.163.com/bs/business.html" target="_blank">商务合作</a> -'+(addInfo?infoStr:"")+' <a href="http://nie.163.com/job/" target="_blank">加入我们</a></span><br /><span id="ncp-l2">网易公司版权所有 &copy;1997-2013　'+bcode+'　'+wcode+'  '+centerCode+'</span></span>'+plusCode+'</p>';
  html+='<p id="NIE-copyRight-corp" style="'+(showMoreInfo?'width:'+(suggestion?800:730)+'px;text-align:left;':'width:100%;text-align:center;')+'font-family:simSun,Arial;margin:0 auto;line-height:20px;display:block;padding:15px 0 0 0;"><span style="position:relative;vertical-align:top;top:3px;display:inline-block;">'+get_pngImg(101,31,path+"netease.{s}.png","http://www.163.com")+''+get_pngImg(111,31,path+"nie.{s}.png","http://nie.163.com")+logo+'</span><span style="text-align:left;display:inline-block;padding-left:10px;"><span id="ncp-l1"><a href="http://gb.corp.163.com/gb/about/overview.html" target="_blank">公司简介</a> - <a href="http://help.163.com/" target="_blank">客户服务</a> - <a href="http://gb.corp.163.com/gb/legal.html" target="_blank">相关法律</a> - <a href="http://nie.163.com/about/about.html" target="_blank">网易游戏</a> - <a href="http://nie.163.com/about/contactus.html" target="_blank">联系我们</a> - <a href="http://nie.163.com/bs/business.html" target="_blank">商务合作</a> -'+(addInfo?infoStr:"")+' <a href="http://nie.163.com/job/" target="_blank">加入我们</a></span><br /><span id="ncp-l2">网易公司版权所有 &copy;1997-2013　'+bcode+'　'+wcode+'  '+centerCode+'</span></span>'+plusCode+'</p>';
  document.write(html.replace(/{s}/g,copyRight_style));
})();