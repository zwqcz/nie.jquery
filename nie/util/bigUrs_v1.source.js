/**
* nie
* @module nie
**/
/**
*	快速注册<br>
*	@class urs
*	@static
*	@namespace nie.util
*	@author	Lam
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>nie.util.bigUrs<br>
*$(function(){
*	nie.use(["nie.util.bigUrs"],function(){		
*		 var urs = nie.util.bigUrs.create();
*		 urs.logStats=true;//是否需要注册log统计
*		 urs.pvStats=true;//是否需要pv统计
*		 
*		 //	点击注册系统返回信息触发的函数
*		 //	默认为urs.regComplete=urs.showMsg;*		 
*		 urs.regComplete=function(o){

*			 o.result;//注册是否成功，值为：true, false
*			 o.msg;//服务器返回注册或失败的文字描述，如"您输入的信息不符合标准，如：用户名和密码不能相同，用户名包括不允许的字符，用户名和密码长度应大于6位等"
*			 o.url;//注册成功后需要跳转页面的url。如果没有跳转页，值为null*			 
*			 o.data;//服务器返回的完整数据

*			 urs.getVal("username");//获取用户填写的信息。参数为input name值。
*			 urs.getUrl();//获取注册成功后需要跳转页面的url。如果没有跳转页，值为null。
*			 urs.clearMsg();//清楚已封装好的信息框里面的信息
*			 //显示封装好的信息框
*			 urs.showMsg(o);
*			 //或者自定义
*			 urs.showMsg({
*				 result:o.result,         //必填
*				 msg:o.msg,         	  //必填
*				 url:o.url,               //必填
*				 data:o.Data,             //必填
*				 confirmFn:function(){}, //选择填写，点击信息框"确认"按钮触发的函数
* 				 username:o.username,	  //用户名
*				 is163Mail:o.is163Mail,   //是否非网易邮箱
*				 mailUrl:o.mailUrl		  //邮箱登陆url
*			 });
*			 urs.hideMsg();//隐藏封装好的信息框		 
*		 }
*		 
*		 urs.init();
*	});		
*});
* monitor:
* 1:服务器反馈信息，并执行js返回函数regComplete
* 
* log:
* 0:创建session id
* 1:用户名.没有填写(为空)
* 2:用户名.已被注册
* 3:用户名.不是字母开头
* 4:用户名.不是字母或数字结尾
* 5:用户名.不是是字母、数字、下划线
* 6:用户名.不是6～18个字符
* 7:用户名.已选择推荐用户名
* 8:用户名.用户名与密码相同
* 9:用户名.不是邮箱地址
* 10:用户名.帐号处于待激活状态
* 11:用户名.帐号其他问题，不允许注册
* 12:帐号存在，不允许注册
* 20:密码.字符不合符要求（用户名.帐号处于待激活状态）
* 21:密码.用户名与密码相同
* 30:重复密码.字符不合符要求（重复密码不一致）
* 40:真实姓名.字符不合符要求
* 50:证件号码.字符不合符要求
* 60:联系电话.字符不合符要求
* 70:验证码.不匹配
* 71:验证码.没有填写(为空）
* 72:验证码.不是4位字符
* 73:验证码.失败次数多，请稍候输入
* 74:验证码.点击换一张验证码.点击验证码图片
* 75:验证码.点击换一张验证码.点击文字
* 90:提交注册(点击注册按钮或回车)
* 100:前端页面验证全通过
* 101:服务器返回结果,注册成功
* 102:服务器返回结果,注册失败
**/

nie.util.bigUrs={ 
  /*
	  服务器返回数据
	  data:[{
		  id:String,//session id
		  engine:{			
			  keyWord:Sring,//关键字
			  encode:int,//关键字编码
			  engineID:int,//搜索引擎ID
			  refer:String//来路
		  },
		  reComUserName:{
		  },
		  verCapResult:String,
		  result:{
			  reDirectUrl:String			  
		  }
	  }]
  */
  data:[],
  create:function(){
	  var urs={};
	  urs.aHref="javascript:void(0);";
	  urs.tips={
		  username:{
			  txt:"您的邮箱将成为登录帐号",
			  "class":"inp-tips"
		  }
	  };
	  /*
	   * 进度 
	   * 0：闲
	   * 1:进行中
	   */
	  urs.progress={
		      loadID:0,
			  loadCap:0,
			  chkUser:0,
			  verCap:0,
			  "submit":0
	  };
	  urs.domainReg=new RegExp("^([\\w-\\.]+)@([\\w-]+(?:\\.[\\w-]+){1,3})$");	 
	  urs.regData={
			  username:String,
			  mailUrl:String,
			  is163Mail:false
	  };	  
	  /*
	  urs.total163mail=6;
	  urs.domain=["163.com","126.com","yeah.net","vip.163.com","vip.126.com","188.com",
	              "qq.com","gmail.com","sina.com","sohu.com","sogou.com","139.com","wo.com.cn",
	              "21cn.com","hotmail.com","foxmail.com","yahoo.cn","yahoo.com.cn"];
	  urs.mailUrl=["mail.163.com","mail.126.com","mail.yeah.net","vip.163.com","vip.126.com","mail.188.com",
	               "mail.qq.com","gmail.com","mail.sina.com.cn","mail.sohu.com","mail.sogou.com","139.com","mail.wo.com.cn",
	               "mail.21cn.com","hotmail.com","foxmail.com","mail.yahoo.cn","mail.yahoo.cn"];
	  */
	  /*
	  urs.domain=["163.com","qq.com","gmail.com","hotmail.com","sina.com","sohu.com","yahoo.com.cn"];
	  urs.mailUrl=["mail.163.com","mail.qq.com","gmail.com","hotmail.com","mail.sina.com.cn","mail.sohu.com","mail.yahoo.com.cn"];
	  urs.total163mail=1;
	  */	    
  	  
	  /* 数组[a,b,c]
	   * a:mail url字符串
	   * 	1:self
	   * 	2:"mail."+self
	   * b:是否网易产品
	   * 	0:否
	   * 	1:是 
	   * c:是否显示下拉框
	   * 	0:否
	   * 	1：是	  
	   */
	  urs.mail={
			  /*下拉框显示*/
			  "163.com":[2,1,1],
			  "qq.com":[2,0,1],
			  "vip.qq.com":[2,0,1],
			  "gmail.com":[1,0,1],
			  "hotmail.com":[1,0,1],
			  "sina.com":[2,0,1],
			  "sohu.com":[2,0,1],
			  "yahoo.com.cn":[2,0,1],
			  /*下拉框不显示*/			  
			  "126.com":[2,1,0],			  
			  "yeah.net":[2,1,0],
			  "sina.cn":[2,0,0],
			  "live.com":[2,0,0],
			  "yahoo.cn":[2,0,0],
			  "sogou.com":[2,0,0],
			  "139.com":[1,0,0],
			  "wo.com.cn":[2,0,0],
			  "21cn.com":[2,0,0],
			  "vip.163.com":[1,1,0],
			  "vip.126.com":[1,1,0],
			  "188.com":[2,1,0],			  
			  "foxmail.com":[1,0,0]			  
	  };
	  urs.sendMail=function(){
		  var data=urs.regData;
		  if(!data.is163Mail){		  	  
		  	  urs.get("sendActiveMail","userName="+data.username+"&promark="+urs.promark,function(){
		  		var resultData=nie.util.bigUrs.data[urs.dataID].sendMailResult;
		  		if(resultData && resultData.status && resultData.info){
		  			alert(resultData.info);
		  		}
		  	  });
		  }		  
	  };
	  urs.r = function(){return new Date().getTime();};	 
	  urs.server="http://weburs.ku.163.com/";
	  urs.serverPath=urs.server+"quickReg/";
	  urs.get=function(file,pamas,callBack){
		  //$.include(urs.serverPath+file+"?output=js&ver=3&dataID="+urs.dataID+"&promark="+urs.promark+"&"+pamas+"&logStats="+urs.logStats+"&"+urs.r()+"&.js",callBack);
		  $.include(urs.serverPath+file+"?output=js&ver=3&dataID="+urs.dataID+"&promark="+urs.promark+"&"+pamas+"&"+urs.r()+"&.js",callBack);
	  };
	  urs.id="";//session id
	  urs.dataID=nie.util.bigUrs.data.length;
	  nie.util.bigUrs.data.push({});
	  urs.form=$(".NIE-quickReg");
	  urs.showCaptcha=false;
	  urs.result={};//提交注册，返回服务器结果
      
	  urs.stats={
		  regTime:false,    //是否记录注册过程耗时时间
		  monitor:false,   //是否监控，侦测快速注册是否正常运行
		  log:false,		//是否需要记录注册log
		  pv:false,			//是否统计记录
		  clickSugRegBtn:false,	//是否统计 --> 没有邮箱？马上注册的按钮
		  //for uv
		  uvID:(function(){
				  var cn="nie.util.bigUrs.uvID",
			  	  	  cv=$.cookie(cn);
				  if(cv) return cv;
				  else {
					  var val = urs.r();
					  $.cookie(cn,val,{ expires: 1, path: '/', domain:nie.config.site+".163.com"});
					  return val;
				  }
		  })()		  
	  };	
	  urs.$img=function(){
		  var img = $(new Image());
		  img.bind('readystatechange',function(){					
			  // 如果图片已经存在于浏览器缓存
			  if(this.readyState=="complete"){						  
				  return;// 直接返回，不用再处理onload事件
			  }
		  }).bind("abort",function(){			  
			   return;					  
		  });
		  return img;
	  }
	  //统计函数
	  urs.runStats=function(type,code){			  
		  if(urs.stats[type]) {			  
			  var run=function(_type,_code){				  
				  urs.$img().attr("src",urs.serverPath+"stats?3|"+urs.stats.uvID+"|"+urs.promark+"|"+_type+"|"+(typeof _code!="undefined"?_code:0)+"|"+urs.r());				  
			  };
			  switch(type){
			  	case "clickSugRegBtn":
			  		urs.form.find(".sugRegBtn").click(function(){run("clickSugRegBtn");});
			  		break;			  	
			  	default:
			  		run(type,code);
			  		break;
			  }
		  }
	  };
	  urs.promark="";//promark值	  
	  urs.capWidth=100;
	  urs.capHeight=32;
	  urs.msgID={		  
		  msg:"NIE-quickReg-msg",//msg id			 
		  title:"NIE-quickReg-msg-title",//msg标题
		  closeBtn:"NIE-quickReg-closeBtn",//关闭按钮
		  bg:"NIE-quickReg-msg-bg",//msg背景id			 
		  con:"NIE-quickReg-msg-con"//信息容器ID			 	   
	  };
	  //msg layer
	  urs.msgSize={
		"large":{
			w:490,
			h:270
		},
		"small":{
			w:320,
			h:160
		},
		current:{}
	  };	  
	  urs.msgO={		  
		  msg:function(){return $("#"+urs.msgID.msg);},
		  title:function(){return $("#"+urs.msgID.title);},
		  closeBtn:function(){return $("#"+urs.msgID.closeBtn);},
		  bg:function(){return $("#"+urs.msgID.bg);},
		  con:function(){return $("#"+urs.msgID.con);}		  
	  };
	  /*
		  搜索引擎来源处理
		  返回是否搜索引擎来路
	  */	  
	  urs.fromSearch=false;	  
	   urs.engineInit=function(refer){
		 
		var	allow=false,//允许搜索引擎监测
			pages=0,//途径页面数
			type=1,			
			engineReg=[
				//1:gbk,2:utf-8
              //1:baidu
              ["^http://[^/]+.baidu.com\/s\?","wd",1],
              //2:google
              ["^http[s]?://[^/]+.google.com(.hk)?/search","q",2],
              //3:soso
              ["^http://[^/]+.soso.com/q","w",1],
              //4:sogou
              ["^http://[^/]+.(sogou|sogo).com/web","query",1],
              //5:youdao
              ["^http://[^/]+.youdao.com/search","q",2],
              //6:yahoo
              ["^http://[^/]+.yahoo.com/(s\?|search)","p",2],
				//7:bing
				["^http://[^/]+.bing.com/search\?","q",2]
              ],
              se = nie.util.sEngine,
              info=se.cookie.info;	
			if(se.isEngineRefer){
				allow=true;
			}
			else if(info.length>3 && info[0]>1){
				allow=true;
				//搜索引擎来路类别 1：直接来路，2：间接来路
				type=2;				
				refer = info[2];
				pages = info[0];
			}
			if(allow){	
		        for(var i=0,l=engineReg.length;i<l;i++){
			      var engine = engineReg[i];
		          if(new RegExp(engine[0],"i").test(refer)){
		              var a = document.createElement("a");
		              a.href=refer;
		              var r=a.search.match(new RegExp("[&\?]"+engine[1]+"=([^&]+)","i")),
						  chkTCN=1;				  
		              if(r.length==2){
						  var encode=engine[2];
						  switch(i){
							  //baidu 
							  case 0:
								  if(/[&\?]ie=utf-8/i.test(refer)) encode=2;
								  break;
							  //google 
							  case 1:
								  if(/[&\?]ie=(gbk|gb2312)/i.test(refer)) encode=1;
								  break;
							  //soso
							  case 2:
								  if(/[&\?]ie=utf-8/i.test(refer)) encode=2;
								  break;
							  //youdao
							  case 4:
								  if(/[&\?]ue=(gbk|gb2312)/i.test(refer)) encode=1;
								  chkTCN=0;
								  break;
							  //yahoo
							  case 5:
								  //中国雅虎
								  if(/^http:\/\/one.cn.yahoo.com\//i.test(refer)){
									  
								  }
								  //国际雅虎
								  else{								 
									  if(/[&\?]ei=(gbk|gb2312)/i.test(refer)) encode=1;
									  chkTCN=0;
								  }							  						      
								  break;
							  //bing
							  case 6:
							  	  chkTCN=0;
		             		  	  break;
						  }
		                  nie.util.bigUrs.data[urs.dataID].engine={					  
							   keyWord:encodeURIComponent(r[1]),//关键字
							   "encode":encode,//关键字编码
					 		   engineID:i+1,//搜索引擎ID		  
							   "refer":encodeURIComponent(refer),//来路
							   "type":type,//搜索引擎来路类别 1：直接来路，2：间接来路
							   "pages":pages//途径页面数
							   //"chkTCN":chkTCN//是否检查繁体字编码 1:true 0:false（如：%EFw）
						  };
						  //return true;
		              }
		          }
			    }
			}
	        //return false;
      }
	  //获取注册成功后的跳转url地址
	  urs.getUrl=function(){
		  var url = nie.util.bigUrs.data[urs.dataID].result.reDirectUrl;
		  if(url!=null){								 
			  url+=((url.indexOf("?")>0)?"&":"?")+"username="+urs.getVal("username");
		  }
		  return url;
	  };
	  urs.getMsgHTML=function(){		  
		  var data = urs.regData,
		  	  html ="<div class='not163MailBox'>"
		  		  	+"<h1>感谢注册！请立即激活帐号。</h1>"
		  			+"<h3>请您登录邮箱 <b>"+data.username+"</b> 根据确认邮件操作即可。</h3>"
		  			+((data.mailUrl)?"<h2><a class='btn' href='"+data.mailUrl+"' target='_blank'>立即查看邮件</a></h2>":"<h2>请立即查收确认邮件</h2>")
		  			+"<ul class='tips'><li>还没有收到确认邮件？"
		  			+"<ol>"
		  			+"<li>尝试到广告邮件、垃圾邮件目录里找找看；</li>"
		  			+"<li>再次<a href='#' target='_self' class='sendMailBtn'>发送注册确认邮件</a>；</li>"
		  			+"<li>如果重发注册确认邮件依然没有收到，请<a class='reReg' target='_self' href='#'>重新注册</a>。</li>"
		  			+"</ol></li></ul>"
		  			+"</div>";	
		  $(".not163MailBox a.sendMailBtn").live("click",urs.sendMail);
		  $(".not163MailBox a.reReg").live("click",function(){
			  window.location.reload();
		  });
		  return html;		  			
	  };
	  //重置结果框
	  urs.clearMsg=function(){
		  urs.msgO.con().empty();
	  };
	  urs.showMsg=function(args){
		if(typeof args=="object"){
		  var chk=function(name){return (typeof args[name]!="undefined")?args[name]:null;},
		      regResult=chk("result"),		      			  
			  url=chk("url"),
			  confirmFn=chk("confirmFn"),
			  username=chk("username"),
			  is163Mail=chk("is163Mail"),
			  mailUrl=chk("mailUrl"),
			  msg=chk("msg"),
			  status=chk("status"),
     		  //检查结果框是否存在
		 	  win=$(window),
			  w=win.width(),
			  h=win.height(),
			  target="_self";			
		  urs.msgSize.current=(!is163Mail&&regResult)?urs.msgSize["large"]:urs.msgSize["small"];
		  //背景
		  if(urs.msgO.bg().length==0){
			$("<div>",{
				id:urs.msgID.bg,
				css:{					
					top:0,
					left:0,
					width:w,
					height:$(document).height()
				}
			}).appendTo($(document.body));
		  }
		  else urs.msgO.bg().show();
		  //信息框
		  if(urs.msgO.msg().length==0){
			$("<div>",{
				id:urs.msgID.msg,
				css:{
					top:(h-urs.msgSize.current.h)/2+win.scrollTop(),
					left:(w-urs.msgSize.current.w)/2+win.scrollLeft(),
					width:urs.msgSize.current.w
				},
				html:'<div id="'+urs.msgID.title+'">注册游戏帐号</div><a id="'+urs.msgID.closeBtn+'" href="'+urs.aHref+'">X</a><div id="'+urs.msgID.con+'"></div>'
			}).appendTo($(document.body));			
			urs.msgO.closeBtn().live("click",function(){
					urs.runStats("log", 111);
					urs.hideMsg();
				});
		  }
		  //重置结果框
		  else urs.clearMsg();
		  urs.msgO.msg().show();
		  //注册成功
		  if(regResult&&url!=null){					
			  target="_blank";
			  url+=((url.indexOf("?")>0)?"&":"?")+"username="+username;
		  }
		  else{ 	
			  url=urs.aHref;
		  }
		  urs.showCaptcha=false;		  
		  if(regResult!=null){
			if(regResult && !is163Mail && status==202){
				urs.msgO.con().html(urs.getMsgHTML());
				$(".not163MailBox").attr("id","not163Mail");
			}
			else{				
				if(regResult){
					urs.msgO.con().addClass("right").html("<p class='info'>注册成功！</p>");
				}				
				else{
					urs.msgO.con().addClass("error").html("<p class='info'>出错了！</p><p class='reason'>"+msg+"</p>");
				}
				$("<a>",{					
					href:url,
					"target":target,
					text:"确 认",
					"class":"btn",
					click:function(){
						urs.runStats("log",110);
						//if(regResult) urs.runStats("log",102);
						//else urs.runStats("log",105);
						urs.hideMsg();
						if($.isFunction(confirmFn)) confirmFn();				
					}
				}).appendTo(urs.msgO.con());
			}
		  }
		}
	  };
	  urs.reBindEvt=function(o,fn){
		  o.unbind("blur").blur(fn);
	  };
	  urs.hideMsg=function(){
		//idTypeSel.show();
		urs.msgO.bg().hide();
		urs.msgO.msg().hide();
	  };
	  urs.regComplete=urs.showMsg;
	  urs.$=function(o){return urs.form.find(o);};
	  //获取用户填写的object
	  urs.getO=function(name,mustGet){
		  var result = null,name=name.toLowerCase();
		  if(mustGet||!/^(password|repassword)$/.test(name)){
			var tag = (name=="idtype")?"select":"input";
			result=urs.$(tag+"[name="+name+"]");
		  }
		  return result;
	  };
	  //获取用户填写信息
	  urs.getVal=function(name,mustGet){
		  var o =urs.getO(name,mustGet);
		  return (o!=null)?$.trim(o.val()):null;
	  };	
	  urs.init=function(){	
	    //alert(urs.regComplete);			
		var idTypeSel,hideObj,capBox=urs.$(".captcha-wrap"),list,
			//注册开始时间（获取session id开始)
			startTime=0,
			//提示信息消失时间			
			//time=2000,					 
			//需要验证的input {val,pass,timer}
			inpData={username:{},password:{},repassword:{},promark:{},captcha:{}/*,realname:{},idno:{},phone:{}*/},  		 
			sInps="",sInps2="",		 
			//用户名输入时提示
			//userNameTips,userNameTipsTimer,
			//用户名域名推荐
			suggestDomain,
			//用户名输入时提示消失时间
			//time2=2000,
			//mouseover用户名时提示消失时间
			//time3=3000,
			//点击"注册"，超时弹出提示框显示"提交数据中，请稍后..."
			time4=3000,			
			allowSubmit=true,//是否允许提交 （协调username enter）
			/*
			 * mustAsy:是否强制执行异步函数。（优先执行于urs.progress，暂时用于表达提交必须优先执行）
			 */
			inpFn=function(e,asy_onComplete,mustAsy){				
				var self = (typeof e=="string")?urs.getO(e,true):$(this),
				    name=self.attr("name"),
					val=(/^(password|repassword)$/.test(name))?self.val():$.trim(self.val()),
					infoObj=urs.$("label[for="+name+"]"),
					pass=false,
					asy=false,
					Class="",
					info="",
				//异步时，完成执行函数
				asy_func = function(){
					if($.isFunction(asy_onComplete)){			
						asy_onComplete();
					}	
					showResult();			
				},	
				showResult=function(){
					Class=pass?"right":"error";
					inpData[name].pass=pass;
					var o = urs.$("input[rel="+name+"]");
					if(!pass){					
						self.hide();
						o.show().val(info);
					}
					else{
						self.show();
						o.hide();					
					}
					showInfo(infoObj,Class,name);
					o.addClass(Class);
				};
				//debug.pass(e.type+":"+name+" inpFn");
				//show loading		
				infoObj.removeClass("error right").addClass("loading");
				switch(name){			
					case "username":
					  //debug.pass("检查username");
					  var hasChk=true,
					  	  //pwO=urs.getO("password",true),
					  	  pwV=urs.getVal("password",true),
				  	  	  uR=val.match(urs.domainReg);					  
					  if(val==""){					  
						info="必填";
						urs.runStats("log",1);
					  }
					  else if(!urs.domainReg.test(val)){
						  info="必须是邮箱地址";
						  urs.runStats("log",9);
					  }
					  else if(val==pwV||(uR&&uR[1]&&uR[1]==pwV)){
						  info="不能与创建密码相同";
						  urs.runStats("log",8);						  
						//  if(pwV!="") pwO.triggerHandler("blur");
					  }
					  //检查是否网易通行证
					  else{						  
						  var r=val.match(urs.domainReg);
						  if(r && r.length==3 && urs.mail[r[2]] && urs.mail[r[2]][1]==1){
							  var tmpVal = val.replace("@"+r[2],"");
						  	  if(!/^[a-z]/i.test(tmpVal)){
								info="必须字母开头";	
								urs.runStats("log",3);
							  }
							  else if(/[^a-z\d]$/i.test(tmpVal)){					
								info="字母或数字结尾";	
								urs.runStats("log",4);
							  }
							  else if(/[^a-z\d_]/i.test(tmpVal)){
								info="字母、数字、下划线";
								urs.runStats("log",5);
							  }
							  else if(!/^[a-z\d_]{6,18}$/i.test(tmpVal)){					
								info="6～18个字符";	
								urs.runStats("log",6);
							  }
							  else hasChk=false;
						  }						 
						  else hasChk=false;
					  }
					  if(!hasChk&&(mustAsy||urs.progress.chkUser==0)){
						  	  urs.progress.chkUser=1;
							  asy=true;//异步 				
	                          urs.get("checkUserName","userName="+val+"&promark="+urs.promark+"&id="+urs.id+"&val="+val,function(){
	                        	  urs.progress.chkUser=0;
	                        	  ////debug.warn("username异步获取完成");
	                        	  var result=nie.util.bigUrs.data[urs.dataID].checkUserName;
	                              switch(result.status){
	                                  case 104:
	                                	if(result.subStatus==0) pass = true;
	                                	else {
	                                		info="该帐号已注册，待激活中。";
	                                		urs.runStats("log",10);
	                                	}
	                                    break;
	                                  case 200:
	                                	info=result.info;
		                                urs.runStats("log",12);
	                                	break;
	                                  default:
	                                	info=result.info;
	                                    urs.runStats("log",11);
	                                    break;
	                              }
	                              inpData[name].pass=pass;					  
	                              Class=pass?"right":"error";					  
	                              var o = urs.$("input[rel="+name+"]");
	                              if(!pass){					
	                                  self.hide();
	                                  o.show().val(info);
	                              }
	                              else{
	                                  self.show();
	                                  o.hide();					
	                              }
	                              showInfo(infoObj,Class,name);
	                              o.addClass(Class);
	                              asy_func();
	                          });						  					  
					  }
					  break;
				  case "password":
					  var userV=urs.getVal("username",true),
					  	  uR=userV.match(urs.domainReg);
					  if(val==""){
						  info="必填";
						  urs.runStats("log",22);
					  }
					  else if(val==userV||(uR&&uR[1]&&val==uR[1])){
						  urs.runStats("log",21);
						  info="不能与常用邮箱相同";						  
					  }
					  else if(/^[\S]{6,16}$/i.test(val)){						  				  	
						  pass=true;
						  var o=urs.getO("repassword",true);
						  if(o.val()!="") o.triggerHandler("blur");
					  }
					  else{
						  urs.runStats("log",20);
						  info="必须6～16个字符";				
					  }
					  break;
				  case "repassword":				
					  if(val==urs.getO("password",true).val()&&val!="") pass=true;
					  else{	
						  urs.runStats("log",30);
						  info="与创建密码不一致";
					  }
					  break;				
				  case "captcha":
					  if(val==""){
						  info="必填";
						  urs.runStats("log",71);
					  }
					  else if(val.length!=4){
						  info="验证码不匹配";
						  urs.runStats("log",72);
					  }
					  else if(mustAsy||urs.progress.verCap==0){
							asy=true;//异步	 	
							urs.progress.verCap=1;
							urs.get("Verifier","promark="+urs.promark+"&id="+urs.id+"&val="+val,function(){
									urs.progress.verCap=0;
									//debug.warn("captcha异步获取完成");								
									switch(nie.util.bigUrs.data[urs.dataID].verCapResult){
										case 0:
										  pass = true;							
										  break;
										case 1:
										  info="验证码不匹配";
										  loadCapImg();
										  urs.runStats("log",70);
										  break;
										case 2:
										  info="失败次数多，请稍候输入";
										  urs.runStats("log",73);
										  break;
									}
									inpData[name].pass=pass;					  
									Class=pass?"right":"error";					  
									var o = urs.$("input[rel="+name+"]");
									if(!pass){					
										self.hide();
										o.show().val(info);
									}
									else{
										self.show();
										o.hide();					
									}
									showInfo(infoObj,Class,name);
									o.addClass(Class);
									asy_func();							
							});
					  }					  
					  break;
				  /*
				  case "realname":
					  if(/^[^\|\+\)\(\*&\^%\$#@!~=\\\}\{\]\[:;\?\>\<\/]{1,26}$/.test(val)) pass=true;
					  else{
						  urs.runStats("log",30);						
						  info="不允许特殊字符";
					  }
					  break;				
				  case "idno":
					  switch(urs.getVal("idtype")){
					  	case "0":
						  if(verifyIdCard(val)) pass = true;
						  else{
							  urs.runStats("log",40);
							  info="不正确";
						  }
						  break;
					  	default:
						  if(val.length>=6&&val.length<=18) pass=true;						
						  else{
							  urs.runStats("log",40);
							  info="6-18位字符";
						  }
						  break;
					  }
					  break;
				  case "phone":
					  if(/^[\d-]{5,20}$/.test(val)) pass=true;						
					  else{
						  urs.runStats("log",50);
						  info='5-20位,数字或"-"';
					  }
					  break;
				  */
				}			
				if(!asy) showResult();
			},			
			loadCapImg=function(){
			  if(urs.progress.loadCap==0){
				  urs.progress.loadCap=1;
				  capBox.empty();
				  urs.$img().css({width:urs.capWidth,height:urs.capHeight})
							  .click(function(){
								  loadCapImg();
								  urs.runStats("log", 74);
							  })
							  .load(function(){			
								  urs.progress.loadCap=0;
								  urs.showCaptcha=true;					  
								  capBox.append($(this));					  
							  })
							  .error(function(){
								  capBox.removeClass("loading").text("同一个IP刷新过多");
							  })
							  .bind('readystatechange',function(){					
								  // 如果图片已经存在于浏览器缓存
								  if(this.readyState=="complete"){
									  $(this).trigger("load").unbind("load");
									  return;// 直接返回，不用再处理onload事件
								  }
							  })
							  .attr("src",urs.serverPath+"Img?id="+urs.id+"&"+urs.r());
			  }
			},
			loadCaptcha=function(obj){
			  if(urs.progress.loadID==0){
				urs.progress.loadID=1;
				startTime=urs.r();			  
				urs.get("IdCreator","promark="+urs.promark,function(){				  
				  urs.progress.loadID=0;
				  urs.id=nie.util.bigUrs.data[urs.dataID].id;
				  urs.$("#captchaBtn").attr({href:urs.aHref,target:"_self"}).click(function(){
					  loadCapImg();
					  urs.runStats("log", 75);
				  });
				  if(!urs.showCaptcha){			
					  loadCapImg();
				  }
				  if(obj&&$.isFunction(obj.onComplete)) {				
					  obj.onComplete();
				  }
				});
			  }
			},
			allInpFocus=function(e){	
			  //debug.pass("allInpFocus");			  			  
			  if(!urs.showCaptcha) {
					hideObj.fadeIn("fast");
					loadCaptcha({onComplete:function(){				
						urs.showCaptcha=true;
						urs.runStats("log",0);
					}});
			  }			  
			  if(typeof e!="undefined"){
				  var self =$(this);
				  //debug.error(typeof e);
				  var tips=urs.tips[self.attr("name")];
				  //debug.pass("allInpFocus:"+e.type+self.attr("name"));
				  if(tips&&self.val()==tips.txt){
					 self.val("").removeClass(tips["class"]);
				  }	
				  //debug.pass(e.type+":"+self.attr("name"));
			  }			  
			},
			showInfo=function(o,Class,name){			 
				var Class2=((Class=="right")?"error":"right");
				o.removeClass("loading "+Class2).addClass(Class);
				//$(".loading,."+Class2,o).hide();
				//$("."+Class,o).show();
				//o.show();			 
			};			
			urs.promark=urs.getVal("promark");
			//预载入loading图片
			/*
			(function(){
				var v=arguments;
				for(var i=0,l=v.length;i<l;i++){
					//new Image().src="http://res.nie.netease.com/comm/js/nie/util/urs/"+v[i];
					urs.$img().attr("src","http://res.nie.netease.com/comm/js/nie/util/urs/"+v[i]);
				}
			})("loading.gif","loading2.gif","icon."+($.browser.msie?"gif":"png"));
			*/
			//统计pv
			urs.runStats("pv");
			//统计pv
			urs.runStats("clickSugRegBtn");
			//统计搜索引擎来源
			var refer=document.referrer;
			urs.engineInit(refer);
			if(typeof nie.util.bigUrs.data[urs.dataID].engine!="undefined") {
				var engine =nie.util.bigUrs.data[urs.dataID].engine;
				urs.get("fromSearch","type="+engine.type+"&pages="+engine.pages+"&keyWord="+engine.keyWord+"&encode="+engine.encode+"&engineID="+engine.engineID+"&refer="+engine.refer,
						function(){
							urs.fromSearch=true;
				});
			}			
			$(".NIE-quickReg-loading").hide();
			urs.form.show();
			//idTypeSel=urs.getO("idtype");
			hideObj = urs.$(".hideItem");
			suggestDomain=urs.$(".suggestDomain");

			//input灰色tips
			for(var i in urs.tips){
				urs.getO(i,true).addClass(urs.tips[i]["class"]).val(urs.tips[i].txt);
			}
			//
			$.each(inpData,function(i){
				this.val =null;
				this.pass = null;
				sInps+="input[name="+i+"],";
				sInps2+="input[rel="+i+"],";
				//add label for input
				urs.$("label[for="+i+"]").html("<i class='loading'></i><i class='error'></i><i class='right'></i>");
			});
			sInps=sInps.substring(0,sInps.length-1);
			sInps2=sInps2.substring(0,sInps2.length-1);
	
			//idtype bind		  		  
			/*
			$.each(["身份证","学生证","军人证","护照"],function(i){			 
				idTypeSel.append("<option value='"+i+"'>"+this+"</option>");
			});		    
			*/			
			//bind urs.form event
			urs.form.attr("action","#").submit(function(){
				//debug.pass("form提交："+((allowSubmit)?"允许":"不允许"));
				if(!allowSubmit){
					return false;
				}
				else{
					urs.reBindEvt(urs.getO("username",true),inpFn);
				}
				urs.runStats("log",90);
				var asy_done=0,//异步完成数量
					asy_total = 2;//需要完成异步的数量 暂时异步检查有：用户名、验证码。						
				inpData["promark"].pass=(urs.promark!="");//判断promark是否符合标准
				if(!inpData["promark"].pass){
					alert("注册失败，promark不存在");
					return;
				}			  
				else if(!urs.getO("agree").attr("checked")){
					alert("请同意《网易服务条款》和《隐私权保护和个人信息利用政策》");
					return;
				}				
				var asy_onComplete=function(){
					asy_done++;
					//debug.warn("异步完成数:"+asy_done+",需要完成数："+asy_total);
					if(asy_done==asy_total){				 
						for(var i in inpData){							
							if(!inpData[i].pass){
								urs.getO(i,true).triggerHandler("focus");							  
								return;
							}
						}
						//验证成功
						urs.runStats("log",100);
						
						var gotResult=hasWating=false;
						//var hasShowLoading=false;						
						setTimeout(function(){							
							if(!gotResult){								
								//hasShowLoading=true;
								hasWating=true;
								urs.showMsg({									
									msg:"提交数据中，请稍后...",
									url:null
								});
								//msgO.txt().text("提交数据中，请稍后...");							 
							}
						},time4);						
						var params=function(arr){
								var result="";
								for(var i=0,l=arr.length;i<l;i++){
									var name=arr[i],
										o =urs.getO(name,true),
										v=(o.length==0)?"":o.val();							  
									if(/^(password|realname|idno|activityid1|activityid2)$/.test(name)){
										v=encodeURIComponent(encodeURIComponent(v));
									}
									result +="&"+name+"="+v;
								};
								return result;
							},
							username=urs.getVal("username",true),
							str="id="+urs.id+"&username="+username+params(["captcha","password","mobile"/*,"realname","idno","phone","idtype"*/,"promark","activityid1","activityid2"]);
						//if(typeof nie.util.bigUrs.data[urs.dataID].engine!="undefined"){
						if(urs.fromSearch){
							var engine =nie.util.bigUrs.data[urs.dataID].engine;
							//str += "&keyWord="+engine.keyWord+"&encode="+engine.encode+"&engineID="+engine.engineID+"&chkTCN="+engine.chkTCN+"&refer="+engine.refer;
							str += "&type="+engine.type+"&pages="+engine.pages+"&keyWord="+engine.keyWord+"&encode="+engine.encode+"&engineID="+engine.engineID+"&refer="+engine.refer;
						}			
						if(urs.progress.submit==0){
							urs.progress.submit=1;
							nie.util.bigUrs.data[urs.dataID].result={};
							urs.msgSize.current={};
							urs.get("submit",str,function(){
									urs.progress.submit=0;
									if(startTime!=0) urs.runStats("regTime", urs.r()-startTime);//urs.logImg("regTime?time="+(urs.r()-startTime)+"&promark="+urs.promark);
									startTime=0;								
									gotResult=true;					  		
									urs.hideMsg();
									urs.regData={
											"username":username,
											is163Mail:false,
											mailUrl:null
									};									
									var Data=nie.util.bigUrs.data[urs.dataID].result,
										 num=parseInt(Data.num),
									 	 result=(num==200||num==201||num==202);									
									urs.runStats("log",result?101:102);
									if(num==2) loadCapImg();
									
									if(hasWating){
										urs.clearMsg();		
										urs.hideMsg();
									}
									var r=username.match(urs.domainReg);
									if(r && r.length==3 && urs.mail[r[2]]){
										var userName_mail=urs.mail[r[2]];
										//是否网易产品
										if(userName_mail[1]==1){
											urs.msgSize.current=urs.msgSize.is163;
											urs.regData.is163Mail=true;		
										}
										else urs.msgSize.current=urs.msgSize.not163;									
										urs.regData.mailUrl="http://"+((userName_mail[0]==1)?"":"mail.")+r[2].toLowerCase();
									}
									if($.isFunction(urs.regComplete)){
										urs.regComplete({									
												"result":result,
												status:num,
												msg:Data.msg,
												url:Data.reDirectUrl,
												data:Data,
												username:username,
												is163Mail:urs.regData.is163Mail,
												mailUrl:urs.regData.mailUrl
										});
										urs.runStats("monitor",1);
									}
								}
							);
					  }
					}
				};
				var chkAll=function(){
				  //debug.pass("chkAll");
				  allInpFocus();
				  $.each(inpData,function(i){
					  //debug.pass("chkAll:"+i);
					  if(i!="promark"){
						  //debug.pass(i+":blur");
						  urs.getO(i,true).triggerHandler("blur",[asy_onComplete,true]);	
					  }
				  });
				};
				chkAll();
			});
			//bind username event
			var userNameData={
					exist:false,//是否有用户名域名提示
					currentIndex:1,//当前选择的
					total:0,//推荐数量		
					blur:function(e){		                    	  
                  	  $("li.hover",suggestDomain).triggerHandler("click");
                	  suggestDomain.hide();
                	  allowSubmit=true;               	  
                	  //debug.pass("直接执行inpFn检查username");           		  
            		  inpFn("username");
					},
					keyUp:function(e){
						  var num=e.which;					  
						  if(num!=40&&num!=38&&num!=13){
							  userNameData.total=0;
					          suggestDomain.show().empty().html("<li class='title'>请选择邮箱类别</li>");
			                  var self=$(this),
			                  	  selfVal=self.val(),
			                      reg = selfVal.match(new RegExp("^([\\w-\\.]+)[@]?")),
			                      domains=[],
			                      addSuggest=function(text,index){
			                          $("<li>",{
			                              click:function(){	                            	 	 
			                            	  self.val($(this).text());	                                  
			                                  suggestDomain.hide();	                               
			                              },
			                              "text":text
			                          }).hover(function(){	                        	  
			                        	  var self=$(this);
			                        	  userNameData.currentIndex=index;
			                        	  $("li",self.parent()).removeClass("hover");
			                        	  self.addClass("hover");	                        	  
			                            })
			                          .appendTo(suggestDomain);						
			                      };
			                  if(reg){
			                	  userNameData.currentIndex=1;
			                	  userNameData.total=0;
			                	  for(var i in urs.mail){
			                		  if(urs.mail[i][2]==1) domains.push(reg[1]+"@"+i);
			                		  else break;
			                      }
			                	  for(var i=0,l=domains.length;i<l;i++){
			                		  var v=domains[i];
			                		  if(v.toLowerCase().indexOf(selfVal.toLowerCase())==0){
			                			addSuggest(v,userNameData.total);
			                		  	userNameData.total++;
			                		  }
		                		  }
			                	  /*
			                	  if(reg[2]){
			                		  for(var i in urs.mail){		
			                			  var v = reg[1]+"@"+i;
			                			  if(urs.mail[i][2]==1&& v.indexOf(selfVal)==0){
			                				  addSuggest(v,userNameData.total);
				                              userNameData.total++;
			                			  }
			                			  else break;
			                		  }
			                	  }
			                	  else{
			                		  for(var i in urs.mail){		                			  
			                			  if(urs.mail[i][2]==1){
			                				  addSuggest(reg[1]+"@"+i,userNameData.total);
				                              userNameData.total++;
			                			  }
			                			  else break;
			                		  }
			                	  }
			                	  */
			                	  /*
			                	  if(reg[1]){
			                		  for(var i=0;i<l;i++){						
				                          domains.push(reg[1]+"@"+urs.domain[i]);				
				                      }
				                      for(var i=0;i<l;i++){	
				                          var r = new RegExp("^"+selfVal,"i");
				                          if(r.test(domains[i])){	                        	  
				                              addSuggest(domains[i],userNameData.total);
				                              userNameData.total++;
				                          }
				                      }			  
			                	  }
			                	  else{
				                	  for(var i=0;i<l;i++){
				                    	  userNameData.total++;
				                          addSuggest(selfVal+"@"+urs.domain[i],i);						
				                      }
			                	  }
			                	  */
			                  }
			                  if(userNameData.total==0) {
			                	  allowSubmit=true;
			                	  ////debug.pass("因为有推荐域名，设置form提交：允许");
			                	  userNameData.exist=false;
			                	  urs.reBindEvt(self,userNameData.blur);
			                      suggestDomain.hide();
			                  }
			                  else{			
			                	  allowSubmit=false;
			                	  ////debug.pass("因为没有推荐域名，设置form提交：不允许");
			                	  userNameData.exist=true;
			                      //self.unbind("blur");
			                      self.triggerHandler("focus");
			                      urs.reBindEvt(self,userNameData.blur);
			                      $("li:eq(1)",suggestDomain).addClass("hover");
			                  }	  
						  }
			        }, 
		            keyDown:function(e){	
		            	////debug.pass("keyDown事件,exist:"+userNameData.exist+",total:"+userNameData.total);
		            	if(userNameData.exist){
			            	 var num=e.which,
				            	 selSuggest=function(){	        
				         		 	$("li",suggestDomain).removeClass("hover");
				         	 	 	$("li:eq("+userNameData.currentIndex+")",suggestDomain).addClass("hover");			         	 	 	
				                 };
		                     switch(num){
	                             case 40:	                            	 
	                                 if(userNameData.currentIndex+1<=userNameData.total)userNameData.currentIndex++;
	                                 selSuggest();
	                                 break;
	                             case 38:
	                                 if(userNameData.currentIndex!=1) userNameData.currentIndex--;
	                                 selSuggest();
	                                 break;
	                             //enter
	                             case 13:
	                            	 //debug.pass("enter事件");
	                            	 //debug.pass("suggestDomain display："+suggestDomain.css("display"));
	                            	 if(suggestDomain.css("display")=="block"){
	                            		 var self=$(this);
			                             //self.unbind("blur");
			                             //debug.pass("取消username blur事件");
			                             $("li.hover",suggestDomain).triggerHandler("click");
			                             suggestDomain.hide();      
			                             allowSubmit=false;		                             
			                             //debug.pass("设置form提交：不允许");
	                            	 }
	                            	 else{
	                            		 allowSubmit=true;		                             
			                             //debug.pass("设置form提交：允许"); 
	                            	 }
	                            	 break;	                             
	                         }	                         
		            	}
		            }
			};
			//bind input info event
			urs.$(sInps2).focus(function(e){				
				var self=$(this),
					name=self.attr("rel");
				//debug.pass("错误提示框:"+name+e.type+"事件");
				self.hide();
				urs.getO(name,true).show().trigger("focus");//.triggerHandler("select");
			});
			//bind each input event		 
			urs.$(sInps).focus(allInpFocus).blur(inpFn);
			urs.getO("username").keyup(userNameData.keyUp).keydown(userNameData.keyDown);
	};
	return urs;
  }
};