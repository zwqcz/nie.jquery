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
*		 var bigUrs = nie.util.bigUrs.create();
*		 bigUrs.logStats=true;//是否需要注册log统计
*		 bigUrs.pvStats=true;//是否需要pv统计
*		 
*		 //	点击注册系统返回信息触发的函数
*		 //	默认为bigUrs.regComplete=urs.showMsg;*		 
*		 bigUrs.regComplete=function(o){

*			 o.result;//注册是否成功，值为：true, false
*			 o.msg;//服务器返回注册或失败的文字描述，如"您输入的信息不符合标准，如：用户名和密码不能相同，用户名包括不允许的字符，用户名和密码长度应大于6位等"
*			 o.url;//注册成功后需要跳转页面的url。如果没有跳转页，值为null*			 
*			 o.data;//服务器返回的完整数据

*			 bigUrs.getVal("username");//获取用户填写的信息。参数为input name值。
*			 bigUrs.getUrl();//获取注册成功后需要跳转页面的url。如果没有跳转页，值为null。
*			 bigUrs.clearMsg();//清楚已封装好的信息框里面的信息
*			 //显示封装好的信息框
*			 bigUrs.showMsg(o);
*			 //或者自定义
*			 bigUrs.showMsg({
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
*		 bigUrs.init();
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
* 200:需要二次验证码的
* 201:需要二次验证码，提交注册的
**/
(function($){
	nie.util.bigUrs=nie.util.bigUrs||{ 
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
		  //网盟统计，统计已经存在的帐号
		  urs.unionStats=function(is163){
			  (function(){
				  var username=urs.getVal("username"),
					  js="http://union.netease.com/sys_js/pre_related.js";
				  if(is163){
					  $.include(js,function(){
						  netease_union_pre_related(username);
					  });
				  }else{
					  $.include(js,function(){
						  netease_union_pre_related(username,2);
					  });
				  }
			  })();
		  };
		  urs.aHref="javascript:void(0);";
		  urs.aData={href:urs.aHref,target:"_self"};
		  urs.tips={
			  username:{
				  txt:"如 name@example.com",
				  "class":"inp-tips"
			  }
		  };
		  /*
		   * 类别
		   * 1：专题页面：短板
		   * 2：reg长版
		   */
		  urs.type=1;
		  /*
		   * 用户名类别
		   * 0：常用用户名
		   * 1：创建网易账户
		   */
		  //是否默认显示验证码图片
		  urs.isShowCap=false;	 
		  urs.userNameType=0;
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
	  	  
		  /* 数组[a,b,c,d]
		   * a:mail url字符串
		   * 	1:self
		   * 	2:"mail."+self
		   * b:是否网易产品
		   * 	0:否
		   * 	1:是 
		   * c:是否显示下拉框
		   * 	0:否
		   * 	1：是	  
		   * d:注册建新邮件显示的下拉
		   */
		  urs.mail={
				  /*下拉框默认显示*/
				  "163.com":[2,1,1,1],
				  "qq.com":[2,0,1],
				  "sina.com":[2,0,1],
				  "126.com":[2,1,1,1],
				  "vip.qq.com":[2,0,1],   
				  /*下拉框扩展显示*/		
				  "yahoo.com.cn":[2,0,0],
				  "yahoo.com":[2,0,0],
				  "yahoo.cn":[2,0,0],
				  "sohu.com":[2,0,0],
	  			  "gmail.com":[1,0,0],			 
				  "hotmail.com":[1,0,0],
				  "yeah.net":[2,1,0,1],
				  "sina.cn":[2,0,0],
				  "live.com":[2,0,0],
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
			  	  urs.get("sendActiveMail","userName="+data.username,function(){
			  		var resultData=nie.util.bigUrs.data[urs.dataID].sendMailResult;
			  		if(resultData && resultData.status && resultData.info){
			  			alert(resultData.info);
			  		}
			  	  });
			  }		  
		  };

		  urs.r = function(){return new Date().getMilliseconds();};	 
		  urs.server="http://weburs.ku.163.com/";
		  urs.serverPath=urs.server+"quickReg/";
		  urs.get=function(file,pamas,callBack){
			  $.include(urs.serverPath+file+"?output=js&ver=3&dataID="+urs.dataID+"&id="+urs.id+"&promark="+urs.promark+"&"+pamas+"&"+urs.r()+"&.js",callBack);
		  };
		  urs.get_ssl=function(file,pamas,callBack){
			  $.include("https://reg.nie.163.com/web/quick/"+file+"?output=js&ver=3&dataID="+urs.dataID+"&id="+urs.id+"&promark="+urs.promark+"&"+pamas+"&"+urs.r()+"&.js",callBack);
		  };
		  urs.id=null;//session id
		  urs.dataID=nie.util.bigUrs.data.length;
		  nie.util.bigUrs.data.push({});
		  urs.form=$(".NIE-quickReg");
		  urs.showCaptcha=false;
		  urs.hasTouch=false;
		  urs.result={};//提交注册，返回服务器结果
	      
		  urs.stats={
			  regTime:false,    //是否记录注册过程耗时时间
			  monitor:false,   //是否监控，侦测快速注册是否正常运行
			  log:true,		//是否需要记录注册log
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
					  //urs.$img().attr("src",urs.serverPath+"stats?3|"+urs.stats.uvID+"|"+urs.promark+"|"+_type+"|"+(typeof _code!="undefined"?_code:0)+"|"+urs.r());				  
					  urs.$img().attr("src","http://click.ku.163.com/urs_stats?"+[
																					"promark="+urs.promark,
																					"type="+_type,
																					"code="+_code,
																					"r="+urs.r()
																					].join("&"));				  
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
		  urs.capSize={
			  //width:100,
			  height:32
		  };
		  urs.msgID={		  
			  msg:"NIE-quickReg-msg",//msg id			 
			  title:"NIE-quickReg-msg-title",//msg标题
			  closeBtn:"NIE-quickReg-closeBtn",//关闭按钮
			  bg:"NIE-quickReg-msg-bg",//msg背景id			 
			  con:"NIE-quickReg-msg-con",//信息容器ID
			  reVerCap:"NIE-reVerImg",//二次输入验证码容器
			  reVerInp:"NIE-reVerInp"//二次输入验证码的输入框
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
			//再次验证的
			"reVer":{
				w:240,
				h:230
			},
			current:{}
		  };	  
		  urs.msgO={		  
			  msg:function(){return $("#"+urs.msgID.msg);},
			  title:function(){return $("#"+urs.msgID.title);},
			  closeBtn:function(){return $("#"+urs.msgID.closeBtn);},
			  bg:function(){return $("#"+urs.msgID.bg);},
			  con:function(){return $("#"+urs.msgID.con);},
			  reVerCap:function(){return $("#"+urs.msgID.reVerCap);},
			  reVerInp:function(){return $("#"+urs.msgID.reVerInp);}
		  };
		  //切换用户名类别（0：常用邮箱；1：网易邮箱）必须init前执行
		  urs.setUserType=function(type){
			  var type0Class=".qr-username",
			  	  type1Class=".qr-createEmail",
			  	  hideClass="qrHide";
			  urs.userNameType=type;
			  urs.$(type?type0Class:type1Class).addClass(hideClass);
			  urs.$(type?type1Class:type0Class).removeClass(hideClass);
		  };
		  /*
			  搜索引擎来源处理
			  返回是否搜索引擎来路
		  */	
		  /*
		  urs.fromSearch=false;	  
		  urs.engineInit=function(refer){		 
			var	allow=false,//允许搜索引擎监测
				pages=0,//途径页面数
				type=1,			
				engineReg=[
					//1:gbk,2:utf-8
	              //1:baidu
	              ["^http://[^/]+.baidu.com\/s\?","wd",1,1],
	            //1:baidu知道、新闻
	              ["^http://(?:news|zhidao).baidu.com\/q\?","word",1,1],
	              //2:google
	              ["^http[s]?://[^/]+.google.com(.hk)?/search","q",2,2],
	              //3:soso
	              ["^http://[^/]+.soso.com/q","w",1,3],
	              //4:sogou
	              ["^http://[^/]+.(sogou|sogo).com/web","query",1,4],
	              //5:youdao
	              ["^http://[^/]+.youdao.com/search","q",2,5],
	              //6:yahoo
	              ["^http://[^/]+.yahoo.com/(s\?|search)","p",2,6],
					//7:bing
					["^http://[^/]+.bing.com/search\?","q",2,7]
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
			              var r=a.search.match(new RegExp("[&\?]"+engine[1]+"=([^&]+)","i"));						  				  
			              if(r&&r.length==2){
							  var encode=engine[2];
							  switch(i){
								  //baidu 
								  case 0:
									  if(/[&\?]ie=utf-8/i.test(refer)) encode=2;
									  break;
									//baidu 
								  case 1:
									  if(/[&\?]ie=utf-8/i.test(refer)) encode=2;
									  break;
								  //google 
								  case 2:
									  if(/[&\?]ie=(gbk|gb2312)/i.test(refer)) encode=1;
									  break;
								  //soso
								  case 3:
									  if(/[&\?]ie=utf-8/i.test(refer)) encode=2;
									  break;
								  //youdao
								  case 5:
									  if(/[&\?]ue=(gbk|gb2312)/i.test(refer)) encode=1;								  
									  break;
								  //yahoo
								  case 6:
									  //中国雅虎
									  if(/^http:\/\/one.cn.yahoo.com\//i.test(refer)){
										  
									  }
									  //国际雅虎
									  else{								 
										  if(/[&\?]ei=(gbk|gb2312)/i.test(refer)) encode=1;									  
									  }							  						      
									  break;

							  }
			                  nie.util.bigUrs.data[urs.dataID].engine={					  
								   keyWord:encodeURIComponent(r[1]),//关键字
								   "encode":encode,//关键字编码
						 		   engineID:engineReg[i][3],//搜索引擎ID		  
								   "refer":encodeURIComponent(refer),//来路
								   "type":type,//搜索引擎来路类别 1：直接来路，2：间接来路
								   "pages":pages//途径页面数								   
							  };
							  return true;
			              }
			          }
				    }
				}
		        //return false;
	      };
		  */
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
			  			+((data.mailUrl)?"<h2><a class='btn' href='"+data.mailUrl+"' target='_blank'>立即查看邮件</a></h2>":"<h2>请立即查收验证邮件</h2>")
			  			+"<ul class='tips'><li>还没有收到验证邮件？"
			  			+"<ol>"
			  			+"<li>尝试到广告邮件、垃圾邮件目录里找找看；</li>"
			  			+"<li>再次<a href='"+urs.aHref+"' target='_self' class='sendMailBtn'>发送注册验证邮件</a>；</li>"
			  			+"<li>如果重发注册验证邮件依然没有收到，请<a class='reReg' target='_self' href='"+urs.aHref+"'>重新注册</a>。</li>"
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
				  closeBtnFn=chk("closeBtnFn"),
				  username=chk("username"),
				  is163Mail=chk("is163Mail"),
				  mailUrl=chk("mailUrl"),
				  msg=chk("msg"),
				  status=chk("status"),
				  reVer=chk("reVer"),
	     		  //检查结果框是否存在
			 	  win=$(window),
				  wWidth=win.width(),
				  wHeight=win.height(),
				  target="_self",
				  msgCss={
							top:(wHeight-urs.msgSize.current.h)/2+win.scrollTop(),
							left:(wWidth-urs.msgSize.current.w)/2+win.scrollLeft(),
							width:urs.msgSize.current.w
				  };
			  //背景
			  if(urs.msgO.bg().length==0){
				$("<div>",{
					id:urs.msgID.bg,
					css:{					
						top:0,
						left:0,
						width:wWidth,
						height:$(document).height()
					}
				}).appendTo($(document.body));
			  }
			  else urs.msgO.bg().show();
			  //信息框
			  if(urs.msgO.msg().length==0){
				$("<div>",{
					id:urs.msgID.msg,
					css:msgCss,
					html:'<div id="'+urs.msgID.title+'">注册游戏帐号</div><a id="'+urs.msgID.closeBtn+'" href="'+urs.aHref+'">X</a><div id="'+urs.msgID.con+'"></div>'
				}).appendTo($(document.body));			
				urs.msgO.closeBtn().live("click",function(){
					urs.runStats("log", 111);
					urs.hideMsg();
					if($.isFunction(closeBtnFn)) closeBtnFn();		
				});
			  }
			  //重置结果框
			  else {
				  urs.msgO.msg().css(msgCss);
				  urs.clearMsg();
			  }
			  urs.t=0;//注册时间
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
				var tmpCon=urs.msgO.con();
				tmpCon.removeClass("right error reVer");
				if(regResult && !is163Mail && status==202){
					tmpCon.html(urs.getMsgHTML());
					$(".not163MailBox").attr("id","not163Mail");
				}
				else{
					var addBtn=function(){
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
						}).appendTo(tmpCon);
					};
					if(regResult){
						tmpCon.addClass("right").html("<p class='info'>注册成功！</p>");
						addBtn();
					}		
					//需要二次输入验证码
					else if(reVer){		
						var submitID="NIE-reVerSubmit",
							btnID="NIE-reVerBtn";
						tmpCon.addClass("reVer").html("<p class='reVer-l1'>只差一步就完成了！<br>请您再输入一次验证码以完成注册：<br><input id='"+urs.msgID.reVerInp+"' /><br><span id='NIE-reVerImg'></span></p><p class='reVer-l2'>看不清楚 <a href='"+urs.aHref+"' id='"+btnID+"'>换一个</a></p><p class='reVer-l3'><a id='"+submitID+"' href='"+urs.aHref+"' class='btn'>完成注册</a></p>");
						urs.load_reVerCap();
						$("#"+btnID).click(urs.load_reVerCap);
						$("#"+submitID).click(function(){
							urs.send(true);
							urs.runStats("log",201);
						});
						urs.runStats("log",200);
					}
					else{						
						tmpCon.addClass("error").html("<p class='info'>出错了！</p><p class='reason'>"+msg+"</p>");
						addBtn();
					}					
				}
			  }
			}
		  };
		  //获取二次输入验证码图片
		  urs.load_reVerCap=function(){
			  urs.msgO.reVerCap().empty();
			  urs.$img().css({"width":205,"height":30})
			  .click(urs.load_reVerCap)
			  .load(function(){		
				  urs.msgO.reVerCap().append($(this));
			  })
			  .error(function(){
				  
			  })						  
			  .attr("src",urs.serverPath+"Img?pAnti=1&id="+urs.id+"&promark="+urs.promark+"&"+urs.r());
		  };
		  /*
		   * 游戏登录：用在检查用户名存在的时候调用，方便web游戏
		   */
		  urs.loginFn=function(){		  
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
			  var result = null;
			  if(mustGet||!/^(password|repassword)$/.test(name)){
				var tag = (name=="idtype")?"select":"input";
				result=urs.$(tag+"[name="+name+"]");
			  }
			  return result;
		  };
		  //urs.hkhc=false;
		  //urs.u="khc?r=";
		  //获取用户填写信息
		  urs.getVal=function(name,mustGet){	  	  	  	  
			  var o = urs.getO(name,mustGet);
			  return o?$.trim(o.val()):null;
		  };  
		  
		  //放刷备案
		  /*
		  urs.khc=function(){
			  //clearTimeout(urs.khcT);		  
			  //urs.khcT=setTimeout(function(){
			  setTimeout(function(){
				  if(urs.id){
					  new Image().src=urs.serverPath+urs.u+new Date().getMilliseconds()+"C8"+urs.id;				  
				  }
			  },3000);  
		  };
		  */
		  urs.expVer={};
		  urs.init=function(){
		  	var inpData={username:{},createEmail:{},password:{},repassword:{},promark:{},captcha:{}/*,realname:{},idno:{},phone:{}*/},
		  		/*idTypeSel,*/hideObj = urs.$(".hideItem"),capBox=urs.$(".captcha-wrap"),list=urs.$(".suggestEmail"),listCon=list.find("ul"),
				//注册开始时间（获取session id开始)
				startTime=0,
				//提示信息消失时间			
				//time=2000,					 
				//需要验证的input {val,pass,timer}
				//已显示推荐用户名列表
				hasSuggestEmail=false,
				itemHoverClass="qrHover",
				sInps=[],sDD=[],		 
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
				getInfoObj,
				showResult,			
				domainSel,			
				getUserNameVal,
				changeUserNameType,			
				chk163UserName=function(val){
					var info,result=false,
						tmp=(urs.type==1)?null:'字母开头，6到18个字符。包括字母、数字、下划线。';
					if (!/^[a-z]/i.test(val)) {
						info = tmp?tmp:"请输入字母开头。";
						urs.runStats("log", 3);
					}
					else if (/[^a-z\d]$/i.test(val)) {
						info =tmp?tmp: "请输入字母或数字结尾。";
						urs.runStats("log", 4);
					}
					else if (/[^a-z\d_]/i.test(val)) {
						info = tmp?tmp:"请输入字母、数字、下划线。";
						urs.runStats("log", 5);
					}
					else if (!/^[a-z\d_]{6,18}$/i.test(val)) {
						info =tmp?tmp: "请输入6到18个字符。";
						urs.runStats("log", 6);
					}
					else result=true;
					return [result,info];
				};
				for(var i in urs.expVer){
					inpData[i]={};
				};
				/*
				 * mustAsy:是否强制执行异步函数。（优先执行于urs.progress，暂时用于表达提交必须优先执行）
				 */
				inpFn=function(e,asy_onComplete,mustAsy){				
					var self = (typeof e=="string")?urs.getO(e,true):$(this),
					    name=self.attr("name"),
						val=(name=="password"||name=="repassword")?self.val():$.trim(self.val()),					
						pass=false,
						asy=false,
						info,
						//异步时，完成执行函数
						asy_func = function(){					
							showResult(name,self,pass,info,infoObj);
							if ($.isFunction(asy_onComplete))asy_onComplete();						
						},	
						infoObj=getInfoObj(name);					
						//debug.pass(e.type+":"+name+" inpFn");
						//show loading		
						infoObj.removeClass("error right").addClass("loading");									
					switch(name){
						case "activityid1":
							if($.isFunction(urs.expVer[name])){
								var expResult=urs.expVer[name](urs.getVal(name));
								pass=expResult["pass"];
								info=expResult["info"];
							}
							break;
						case "createEmail":
							if(hasSuggestEmail) list.hide();
							var pwV=urs.getVal("password",true);						
							if (val == "") {
								info = "请输入邮件地址。";
								urs.runStats("log",1);
							}
							else if(val==pwV){
								info="不能与密码相同。";	
								urs.runStats("log",8);
						  	}
							else{
								var chk163Result=chk163UserName(val);
								if(chk163Result[0]){
									if (mustAsy || urs.progress.chkUser == 0) {
										asy=true;//异步
										urs.get("checkCreateEmail", "userName=" + val, function(){
											urs.progress.chkUser = 0;
											var data=nie.util.bigUrs.data[urs.dataID].suggestEmail;
											switch(data.statusCode){
												case 200:
													listCon.html("<li class='title'><i></i>该邮件地址已被注册,请选择或重新输入...</li>");
													var domainData={"@163.com":163,"@126.com":126,"@yeah.net":"yeah"},
														currentDomain = domainData[domainSel.val()],
														exitsTotal=0,
														exitsMax=3,
														addChooseTotal=0,
														addChoose=function(userName,domainVal){
															addChooseTotal++;
															$("<li>",{
																Class:"choose",
																href:urs.aHref,
																target:"_self",
																html:"<span><input type='radio' />"+userName+"</span><em>"+domainVal+"</em><i>(可以注册)</i>",
																click:function(){
																	urs.runStats("log",7);
																	hasSuggestEmail=false;
																	list.hide();
																	setTimeout(function(){
																		domainSel.val(domainVal);
																		self.val(userName).trigger("blur");
																	},0);
																}
															}).hover(function(){$(this).addClass("hover");},function(){$(this).removeClass("hover");})
															.appendTo(listCon);
														};
													if(data[currentDomain].exist){
														urs.runStats("log",2);
														info="该邮件地址已是网易通行证帐户，请直接登录。";											
														$.each(domainData,function(i){														
															if(data[ this.toString()].exist) exitsTotal++;														
														});													
														//全部存在
														if(exitsTotal<exitsMax){
															$.each(domainData,function(i){
																var _domain = this.toString();
																if(data[_domain].exist) exitsTotal++;
																if(currentDomain!=_domain&&data[_domain]){																
																	var userName = (data[_domain]&& !data[_domain].exist)?val:data[_domain].name[0];																	
																	addChoose(userName,i);																
																}
															});
														}
														else{
															$.each(domainData,function(i){
																var _domain = this.toString();															
																if(data[_domain].name){
																	for(var j=0,l=data[_domain].name.length;j<l;j++){																
																		addChoose(data[_domain].name[j],i);
																	}
																}
															});
														}
														if(addChooseTotal!=0) {														
															var li=$("<li>").addClass("other");
															$("<a>",urs.aData)
																.text("使用其他常用电子邮箱>>")
																.click(function(){
																	changeUserNameType(0);
																}).appendTo(li);
															li.appendTo(listCon);
															list.slideDown("fast");
															hasSuggestEmail=true;
														}
													}
													else pass=true;
													break;
												default:
													info=data.info;
													urs.runStats("log", 13);
													break;
											}
											asy_func();
										});
									}
								}
								else info=chk163Result[1];
							}
							break;	
						case "username":
						  //debug.pass("检查username");
						  var hasChk=true,
						  	  pwV=urs.getVal("password",true),
					  	  	  uR=val.match(urs.domainReg),
					  	  	  is163Email=false;
						  if(val==""||val==urs.tips.username.txt){					  
							info="请输入邮件地址。";
							urs.runStats("log",1);
						  }
						  else if(!urs.domainReg.test(val)){
							  info="请输入正确的邮件地址。";
							  urs.runStats("log",9);
						  }
						  else if(val==pwV||(uR&&uR[1]&&uR[1]==pwV)){
							  info="不能与密码相同";
							  urs.runStats("log",8);
						  }
						  //检查是否网易通行证
						  else{
						  	  if(pwV!="") urs.getO("password",true).triggerHandler("blur");		  
							  var r=val.match(urs.domainReg);
							  if(r && r.length==3 && urs.mail[r[2]] && urs.mail[r[2]][1]==1){							  
								  var tmpVal = val.replace("@"+r[2],""),
								  	  chk163Result=chk163UserName(tmpVal); 
								  if(chk163Result[0]) {
									  hasChk=false;
									  is163Email=true;
								  }
								  else info = chk163Result[1];
							  }				 
							  else hasChk=false;
							  /*
							  var r=val.match(urs.domainReg);
							  if(r && r.length==3 && urs.mail[r[2]] && urs.mail[r[2]][1]==1){	
								  info="网易邮箱直接登录游戏";
							  }
							  else hasChk=false;
							  */
						  }
						  if(!hasChk&&(mustAsy||urs.progress.chkUser==0)){
							  	  urs.progress.chkUser=1;
								  asy=true;//异步
								  urs.get("checkUserName", "userName=" + val, function(){
								  	urs.progress.chkUser = 0;
								  	////debug.warn("username异步获取完成");
									var result = nie.util.bigUrs.data[urs.dataID].checkUserName;
									switch (result.status) {
										case 104:
											/*
											if (result.subStatus == 0) pass = true;
											else {
												info = "该邮箱已被注册，待激活中。";
												urs.runStats("log", 10);
											}
											*/
											pass = true;
											if (result.subStatus== 1){
												urs.runStats("log", 10);
											}
											break;
										case 200:
											if(is163Email){
												switch(urs.type){
												  	case 1:
												  		info="该帐号可直接登录游戏。";
												  		urs.loginFn();
														urs.unionStats(true);
												  		break;
												  	case 2:
												  		info="该邮件地址已是网易通行证帐户，请直接登录。";
														urs.unionStats(true);
												  		break;
												}											
												urs.runStats("log",14);
											}
											else{
												info = "该邮件地址已被注册。";//result.info;
												urs.runStats("log", 12);
												urs.unionStats(false);
											}
											break;
										default:
											info = result.info;
											urs.runStats("log", 11);
											break;
									}
									asy_func();
								});							
						  }
						  break;
					  case "password":
						  var userV=getUserNameVal(),//urs.getVal("username"),
						  	  uR=userV.match(urs.domainReg);
						  if(val==""){
							  info="请设置你的通行证登录密码。";
							  urs.runStats("log",22);
						  }
						  else if(val==userV||(uR&&uR[1]&&val==uR[1])){
							  urs.runStats("log",21);
							  info="不能和用户名相同。";						  
						  }
						  else if(/^[\S]{6,16}$/i.test(val)){						  				  	
							  pass=true;
							  var o=urs.getO("repassword",true);
							  if(o.val()!="") o.triggerHandler("blur");
						  }
						  else{
							  urs.runStats("log",20);
							  info="请输入6到16个字符的密码。";				
						  }
						  break;
					  case "repassword":				
						  if(val==""){
							  urs.runStats("log",31);
							  info="请再次输入你的设置密码。";
						  }
						  else if(val==urs.getO("password",true).val()) pass=true;
						  else{	
							  urs.runStats("log",30);
							  info="两次输入的密码不一致。";
						  }
						  break;				
					  case "captcha":	
						  var txt=["请输入验证码。","请输入正确的验证码。"];
						  if(urs.type==1){
							  txt=["必填","不正确"];
						  }
						  if(val==""){
							  info=txt[0];
							  urs.runStats("log",71);
						  }
						  else if(val.length<4||val.length>6){
							  info=txt[1];
							  urs.runStats("log",72);
						  }
						  else if(mustAsy||urs.progress.verCap==0){
								asy=true;//异步	 	
								urs.progress.verCap=1;
								urs.get("Verifier","val="+val,function(){
										urs.progress.verCap=0;
										//debug.warn("captcha异步获取完成");								
										switch(nie.util.bigUrs.data[urs.dataID].verCapResult){
											case 0:
											  pass = true;							
											  break;
											case 1:
											  info=txt[1];
											  loadCapImg();
											  urs.runStats("log",70);
											  break;
											case 2:
											  info="失败次数多，请稍候输入。";
											  urs.runStats("log",73);
											  break;
										}
										/*
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
										*/
										asy_func();		
										//alert(name+",asy_func")					
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
					if(!asy) showResult(name,self,pass,info,infoObj);
				},			
				loadCapImg=function(){
				  if(urs.progress.loadCap==0){				  
					  urs.progress.loadCap=1;
					  //if(urs.hkhc) urs.khc();
					  var ClassVal ="error right loading";
					  urs.getO("captcha").removeClass(ClassVal);
					  urs.$(".qr-captcha .qrChk").removeClass(ClassVal);
					  capBox.empty();
					  urs.$img().css(urs.capSize)
								  .click(function(){
									  loadCapImg();
									  urs.runStats("log",74);
								  })
								  .load(function(){			
									  urs.progress.loadCap=0;
									  urs.showCaptcha=true;								  
									  $(this).hide().appendTo(capBox).fadeIn("fast");					  
								  })
								  .error(function(){
									  capBox.removeClass("loading").text("刷新过多，请稍候");
								  })
								  /*
								  .bind('readystatechange',function(){					
									  // 如果图片已经存在于浏览器缓存
									  if(this.readyState=="complete"){
										  $(this).trigger("load").unbind("load");
										  return;// 直接返回，不用再处理onload事件
									  }
								  })*/
								  .attr("src",urs.serverPath+"Img?id="+urs.id+"&promark="+urs.promark+"&"+urs.r());
				  }
				},
				loadCaptcha=function(obj){
				  if(urs.progress.loadID==0){
					urs.progress.loadID=1;
					startTime=urs.r();			  
					urs.get("IdCreator","",function(){				  
					  urs.progress.loadID=0;
					  urs.t=new Date().getTime();
					  urs.id=nie.util.bigUrs.data[urs.dataID].id;
					  //urs.khc();
					  urs.$(".qrChangeCapBtn").attr(urs.aData).click(function(){
						  loadCapImg();
						  urs.runStats("log", 75);
					  });
					  if(!urs.showCaptcha)loadCapImg();
					  if(obj&&$.isFunction(obj.onComplete)) obj.onComplete();				  
					});
				  }
				},
				allInpFocus=function(e){
				  //debug.pass("allInpFocus");				
				  if(!urs.showCaptcha) {
						hideObj.show();
						loadCaptcha({onComplete:function(){				
							urs.showCaptcha=true;
							//urs.runStats("log",0);
						}});
				  }			  
				  if(typeof e!="undefined"){
					  var self =$(this),
					  //debug.error(typeof e);
					  	   tips=urs.tips[self.attr("name")];
					  //debug.pass("allInpFocus:"+e.type+self.attr("name"));
					  if(tips&&self.val()==tips.txt) self.val("").removeClass(tips["class"]);
					  //debug.pass(e.type+":"+self.attr("name"));
				  }
				  if(!urs.hasTouch){
					  urs.hasTouch=true;
					  urs.runStats("log",0);
				  }
				};
				var key=urs.promark=urs.getVal("promark"),
					get_keyIndex=function(num){
						return Math.floor(Math.random()*num);
					},
					makeKey=$.md5;
				switch(urs.type){
					case 1:	
						 urs.capSize.height=30;
						var hideClass="qrHide",
							//注册完成返回的页面
							finishPage={
								xyq:"http://xyq.163.com/download/index.html",
								tx2:'http://tx2.163.com/reg/finish.html',
								//pet:'http://pet.163.com/download/',
								csxy:'http://csxy.163.com/reg/client/',
								//dt:"http://dt.163.com/download/",			
								//dt2:"http://dt2.163.com/download/",
								dtw:'http://dtw.163.com/download.html',
								//xy2:"http://xy2.163.com/download/",
								xy3:"http://xy3.163.com/download/download.html",
								//pk:"http://pk.163.com/download/",
								//ff:"http://ff.163.com/download/",
								//qn:"http://qn.163.com/reg/client/",
								//mc:"http://mc.163.com/download/",
								fj:'http://fj.163.com/download.html',
								st:'http://st.163.com/yxxz/yxxz01.html',
								ball:'http://ball.163.com/',
								xyc:'http://xyc.netease.com/viewthread.php?tid=7666',
								rich:'http://rich.163.com/',
								//ysg:"http://ysg.163.com/download/",
								zg:'http://server.zg.163.com/serverlist.php?from=niebar',
								sg:'http://client.sg.163.com/server_list.html',
								xjc:"http://game.xjc.163.com/"
							},
							//大网易product对应值,如果没有则返回域名
							regProduct={
								pet:"cwwg",
								mc:"jlmc",
								dt2:"dtws",
								sg:"sgtx_web",
								zg:"ch",
								ff:"newff",
								pk:"xyw",
								tx3:"tx2",
								qn2:"qn"
							},
							regLink={
								//qn:"http://qn.163.com/reg/"
							},
							isDefined = function(){
								var args =arguments;
								for(var i=0,l=args.length;i<l;i++){
									if(typeof args[i]=="undefined") return false;
								}
								return true;
							},
							productName = urs.product?urs.product:(nie.config.site?nie.config.site:window.location.href.replace(/^http:\/\/(.*)\.163\.com.*$/,'$1')),
							regProductID = isDefined(regProduct[productName])?regProduct[productName]:productName,
							regUrl = encodeURIComponent(isDefined(finishPage[productName])?finishPage[productName]:"http://"+productName+".163.com/download/"),
							regPage=regLink[regProductID]? regLink[regProductID]:"http://reg.163.com/reg/reg2.jsp?product="+regProductID+"&url="+regUrl+"&loginurl="+regUrl;
						urs.$(".createEmailBtn").attr("href",regPage);
						urs.$("input.qrError").focus(function(e){		
							var self=$(this),
								name=self.attr("rel");
							//debug.pass("错误提示框:"+name+e.type+"事件");
							self.addClass(hideClass);//.hide();
							urs.getO(name,true).removeClass(hideClass).trigger("focus");//.triggerHandler("select");
						});		
						getInfoObj=function(name){return urs.$(".qr-"+name+" .qrChk");};			
						getUserNameVal = function(){
							return urs.getVal("username");
						};
						showResult=function(name,self,pass,info,infoObj){						
							inpData[name].pass=pass;						
							var o = urs.$("input[rel="+name+"]"),
								Class1="right",
								Class2=Class1;						
							if(!pass){
								Class2="error";	
								self.addClass(hideClass);	
								o.removeClass(hideClass).val(info);
							}
							else{
								Class1="error";
								self.removeClass(hideClass);
								o.addClass(hideClass);				
							}
							infoObj.removeClass("loading "+Class1).addClass(Class2);
							//o.addClass(Class);
						};
						if(urs.isShowCap){
							hideObj.show();
							loadCaptcha();		
						}
						break;
					case 2:
						changeUserNameType = function(type){
								urs.userNameType=type;							
								var createUserNameClass=".qr-createEmail",
									userNameClass=".qr-username",
									hideClass="qrHide",
									show_className=type?createUserNameClass:userNameClass,
									hide_className=type?userNameClass:createUserNameClass;								
								urs.$(show_className).removeClass(hideClass);
								urs.$(hide_className).addClass(hideClass);
							};
						domainSel = urs.$("select[name=domain]");
						domainSel.change(function(){
							inpFn("createEmail");
						})
						for(var i in urs.mail){						
							if ( urs.mail[i][3]) {							
								var tmpV = "@" + i;
								$("<option>").val(tmpV).text(tmpV).appendTo(domainSel);
							}
						}					
						urs.$(".qrReg163Btn").attr(urs.aData).click(function(){
							changeUserNameType(1);
						}).focus(function(){this.blur();})
						urs.$(".qrRegOtherBtn").attr(urs.aData).click(function(){
							changeUserNameType(0);
						}).focus(function(){this.blur();})					
						getCurrentName=function(){
							return urs.userNameType?"createEmail":"username";
						}
						getInfoObj=function(name){						
							if(name=="username"||name=="createEmail") name=getCurrentName();
							return urs.$(".qr-"+name+" .qrChk");
						}
						getUserNameVal = function(){
							return urs.getVal(getCurrentName());
						}
						showResult=function(name,self,pass,info,infoObj){						
							inpData[(name=="username"&&urs.userNameType)?"createEmail":name].pass=pass;
							var Class1=Class2="right";
							if (pass) Class1 = "error";
							else {
								if(info){
									var span =infoObj.find("em span"),
										txtLen=info.length;
									span.text(info);	
									if(txtLen*12>130) span.css("width",txtLen+"em");
								}
								Class2 = "error";
							}
							self.removeClass(Class1).addClass(Class2);
							infoObj.removeClass("loading "+Class1).addClass(Class2);
						}
						hideObj.show();
						loadCaptcha();					
						break;					
				}
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
				/*
				urs.engineInit(refer);
				if(typeof nie.util.bigUrs.data[urs.dataID].engine!="undefined") {
					var engine =nie.util.bigUrs.data[urs.dataID].engine;
					urs.get("fromSearch","type="+engine.type+"&pages="+engine.pages+"&keyWord="+engine.keyWord+"&encode="+engine.encode+"&engineID="+engine.engineID+"&refer="+engine.refer,
							function(){
								urs.fromSearch=true;
					});
				}			
				*/
				$(".NIE-quickReg-loading").hide();
				urs.form.show();
				//idTypeSel=urs.getO("idtype");			
				suggestDomain=urs.$(".suggestDomain");
				suggestDomainCon=suggestDomain.find("ul");
	
				//input灰色tips
				for(var i in urs.tips){
					urs.getO(i,true).addClass(urs.tips[i]["class"]).val(urs.tips[i].txt);
				}
				//
				$.each(inpData,function(i){
					this.val =null;
					this.pass = null;
					sInps.push("input[name="+i+"]");
					sDD.push(".qr-"+i);				
					urs.$(".qr-"+i+" .qrChk").html('<i class="right"></i><i class="error"></i><i class="loading"></i><em><b></b><span></span></em>');
				});			
				//idtype bind		  		  
				/*
				$.each(["身份证","学生证","军人证","护照"],function(i){			 
					idTypeSel.append("<option value='"+i+"'>"+this+"</option>");
				});		    
				*/			
				urs.send=function(isReVer){
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
					var getParamsStr=function(arr){
							var result="";
							for(var i=0,l=arr.length;i<l;i++){
								var name=arr[i],
									o =((isReVer&&name=="captcha")?urs.msgO.reVerInp():urs.getO(name,true)),
									v=(o.length==0)?"":o.val();							  
								if(v!=""){
									if(/^(password|realname|idno|activityid1|activityid2)$/.test(name)){
										v=encodeURIComponent(encodeURIComponent(v));
									}
									result +="&"+name+"="+v;
								}
							};
							return result;
						},
						username=urs.userNameType?urs.getVal("createEmail")+domainSel.val():urs.getVal("username"),						
						str="username="+username+getParamsStr(["captcha","password","mobile"/*,"realname","idno","phone","idtype"*/,"activityid1","activityid2"]);
					/*
					if(urs.fromSearch){
						var engine =nie.util.bigUrs.data[urs.dataID].engine;								
						str += "&type="+engine.type+"&pages="+engine.pages+"&keyWord="+engine.keyWord+"&encode="+engine.encode+"&engineID="+engine.engineID;//+"&refer="+engine.refer;
					}
					*/
					//加入参数fUrl前一页的来路
					//if(refer) str+="&fUrl="+encodeURIComponent(refer);
					//添加二次输入验证
					if(isReVer) str+="&pAnti=1";
					if(urs.progress.submit==0){
						urs.progress.submit=1;												
						nie.util.bigUrs.data[urs.dataID].result={};
						urs.msgSize.current={};
						urs.t=new Date().getTime()-urs.t;
						str+="&ot="+parseInt(urs.t/1000);
						urs.get_ssl("submit",str,function(){
								urs.t=new Date().getTime();
								urs.progress.submit=0;
								if(startTime!=0) urs.runStats("regTime", urs.r()-startTime);//urs.logImg("regTime?time="+(urs.r()-startTime)+"&promark="+urs.promark);
								startTime=0;								
								gotResult=true;					  		
								urs.hideMsg();															
								var Data=nie.util.bigUrs.data[urs.dataID].result,
									 num=Data.num,
								 	 result=(num==200||num==201||num==202);								
								if(result) {
									urs.unionStats(num==200||num==201);//网盟统计																	
								}

								urs.runStats("log",result?101:102);
								if(num==2) loadCapImg();
								
								if(hasWating){
									urs.clearMsg();		
									urs.hideMsg();
								}										
								urs.regData={
										"username":username,
										is163Mail:Data.is163Mail,
										mailUrl:Data.mailUrl
								};
								var reVer=(Data.num==107);//是否需要输入二次验证码
								urs.msgSize.current=urs.msgSize[(!Data.is163Mail&&result)?"large":(reVer?"reVer":"small")];
								if($.isFunction(urs.regComplete)){
									urs.regComplete({
											"result":result,
											"reVer":reVer,
											status:num,
											msg:(Data.msg.indexOf("；")==0)?Data.msg.replace("；",""):Data.msg,//(Data.msg.indexOf("；")==0)?Data.msg.substring(1,Data.msg.length):Data.msg,
											url:Data.reDirectUrl,
											data:Data,
											"username":username,
											is163Mail:Data.is163Mail,
											mailUrl:Data.mailUrl
									});
									urs.runStats("monitor",1);
								}
								if(result) urs.form[0].reset();
							}
						);
				  }
				};
				//bind urs.form event
				urs.form.attr("action","#").submit(function(){
					//debug.pass("form提交："+((allowSubmit)?"允许":"不允许"));
					if(!allowSubmit) return false;				
					else urs.reBindEvt(urs.getO("username"),inpFn);
					urs.runStats("log",90);
					var asy_done=0,//异步完成数量
						asy_total = 2;//需要完成异步的数量 暂时异步检查有：用户名、验证码。						
					inpData["promark"].pass=(urs.promark!="");//判断promark是否符合标准
					if(!inpData["promark"].pass){
	
						alert("注册失败，promark不存在");
						return;
					}			  
					else if(!urs.getO("agree").is(':checked')){
						alert('必须接受服务条款才能注册。');
						return;
					}				
					var asy_onComplete=function(){
						asy_done++;					
						if(asy_done==asy_total){							
							var noChkName=urs.userNameType?"username":"createEmail";
							//alert("noChkName:"+noChkName)									 
							for(var i in inpData){		
								if(i!=noChkName&&!inpData[i].pass){
									//alert(i)
									urs.getO(i,true).triggerHandler("focus");							  
									return;
								}
							}
							urs.send(false);							
						}
					};
					var chkAll=function(){
					  //debug.pass("chkAll");
					  allInpFocus();
					  $.each(inpData,function(i){
						  //debug.pass("chkAll:"+i);
						  if(i!="promark"&&i!=(urs.userNameType?"username":"createEmail")){
						  	//alert(i)
							//debug.pass(i+":blur");
							urs.getO(i, true).triggerHandler("blur", [asy_onComplete, true]);						
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
	                  	  suggestDomainCon.find("li.hover").triggerHandler("click");
	                	  suggestDomain.hide();
	                	  allowSubmit=true;               	  
	                	  //debug.pass("直接执行inpFn检查username");           		  
	            		  inpFn("username");
						},
						keyUp:function(e){
							  var num=e.which;						  
							  if(num!=40&&num!=38&&num!=13){
								  userNameData.total=0;
						          suggestDomain.show();
								  suggestDomainCon.empty().html("<li class='title'>请选择或继续输入...</li>");
				                  var self=$(this),
				                  	  selfVal=self.val(),
				                      reg = selfVal.match(new RegExp("^([\\w-\\.]+)@?")),
				                      domains={},
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
				                          .appendTo(suggestDomainCon);						
				                      };
				                  if(reg){
				                	  userNameData.currentIndex=1;
				                	  userNameData.total=0;
				                	  for(var i in urs.mail){
				                		  if(urs.mail[i][2]==1) domains[reg[1]+"@"+i]=true;
				                		  //domains.push(reg[1]+"@"+i);
				                		  //else break;
				                      }
				                	  for(var i in domains){			                		  
				                		  if(i.toLowerCase().indexOf(selfVal.toLowerCase())==0){			                			  
				                			addSuggest(i,userNameData.total);
				                		  	userNameData.total++;
				                		  }
			                		  }
				                  }
				                  if(userNameData.total<5){			                	  
				                	  reg = selfVal.match(new RegExp("^([\\w-\\.]+)@([\\S]+)"));			                	  
				                	  if(reg){			                		  
				                		  for(var i in urs.mail){
				                			  var vv = i.toLowerCase();			                			  
					                		  if(vv.indexOf(reg[2].toLowerCase())==0 && !domains[reg[1]+"@"+vv]){				                			  
					                			addSuggest(reg[1]+"@"+i,userNameData.total);
					                		  	userNameData.total++;
					                		  }
				                		  }
				                	  }			                	  
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
				                      suggestDomainCon.find("li:eq(1)").addClass("hover");
				                  }	  
							  }
				        }, 
			            keyDown:function(e){	
			            	////debug.pass("keyDown事件,exist:"+userNameData.exist+",total:"+userNameData.total);
			            	if(userNameData.exist){
				            	 var num=e.which,
					            	 selSuggest=function(){	        
					         		 	suggestDomainCon.find("li").removeClass("hover");
					         	 	 	suggestDomainCon.find("li:eq("+userNameData.currentIndex+")").addClass("hover");			         	 	 	
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
				                             suggestDomainCon.find("li.hover").triggerHandler("click");
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
	
				//bind each input event		 
				urs.$(sInps.join(",")).focus(allInpFocus).blur(inpFn);
				//bind each dd event
				urs.$(sDD.join(",")).focusin(function(){
					$(this).addClass(itemHoverClass);
				}).focusout(function(){
					$(this).removeClass(itemHoverClass);
				});
				urs.getO("username").keyup(userNameData.keyUp).keydown(userNameData.keyDown);
		};
		return urs;
	  }
	};
})(jQuery);