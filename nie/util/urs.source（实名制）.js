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
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>nie.util.urs<br>
*$(function(){
*	nie.use(["nie.util.urs"],function(){		
*		 var urs = nie.util.urs.create(); 
*		 urs.logStats=true;//是否需要注册log统计
*		 urs.pvStats=true; //是否需要pv统计
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
*				 confirmFn:function(){} //选择填写，点击信息框"确认"按钮触发的函数
*			 });
*			 urs.hideMsg();//隐藏封装好的信息框		 
*		 }
*		 
*		 urs.init();
*	});		
*});
* type:
* 0:创建session id
* 1:用户名.没有填写(为空)
* 2:用户名.已被注册
* 3:用户名.不是字母开头
* 4:用户名.不是字母或数字结尾
* 5:用户名.不是是字母、数字、下划线
* 6:用户名.不是6～18个字符
* 7:用户名.已选择推荐用户名
* 8:用户名.用户名与密码相同
* 10:密码.字符不合符要求
* 11:密码.用户名与密码相同
* 20:重复密码.字符不合符要求
* 30:真实姓名.字符不合符要求
* 40:证件号码.字符不合符要求
* 50:联系电话.字符不合符要求
* 60:验证码.不匹配
* 61:验证码.没有填写(为空）
* 62:验证码.不是4位字符
* 90:提交注册(点击注册按钮或回车)
* 100:前端页面验证全通过
* 101:后端完成数据注入.注册成功(state==200&&state==201)
* 102:注册成功后，已点击"确认"按钮
* 103:后端完成数据注入.注册不成功(state!=200&&state!=201)
* 104:后端完成数据注入.注册不成功(state<=10)
* 105:注册不成功后，已点击"确认"按钮
* 106:服务器端，验证码错误
* 107:服务器端，检查sid不存在
* 108:服务器端，检查get参数不合格
**/
nie.util.urs=nie.util.urs||{  
  data:[],
  create:function(){
	  var urs={}
	  urs.r = function(){return new Date().getTime()}	 
	  urs.server="http://weburs.ku.163.com/"
	  urs.serverPath=urs.server+"quickReg/"
	  urs.get=function(file,pamas,callBack){
		  $.include(urs.serverPath+file+"?charset=gb2312&output=js&ver=2&dataID="+urs.dataID+"&"+pamas+"&logStats="+urs.logStats+"&"+urs.r()+"&.js",callBack);
	  }
	  //记录数据
	  urs.log=function(type){
		  if(urs.logStats) new Image().src=urs.serverPath+"log?type="+type+"&promark="+urs.promark+"&logStats="+urs.logStats;
	  },
	  urs.id=""//session id
	  urs.dataID=nie.util.urs.data.length
	  nie.util.urs.data.push({})
	  urs.form=$(".NIE-quickReg")	
	  urs.reComUserName={}//推荐用户名
	  urs.showCaptcha=false;
	  urs.result={}//提交注册，返回服务器结果
	  urs.logStats=false//是否需要记录注册log
	  urs.pvStats=false//是否统计记录
	  urs.promark=""//promark值
	  urs.inpEvent="focusout"
	  urs.capWidth=100
	  urs.capHeight=32
	  urs.msgID={		  
		  msg:"NIE-quickReg-msg",//msg id			 
		  bg:"NIE-quickReg-msg-bg",//msg背景id			 
		  txt:"NIE-quickReg-msg-txt",//信息容器ID			 
		  action:"NIE-quickReg-msg-action"//动作容器id			   
	  }
	  //msg layer
	  urs.msgW=316
	  urs.msgH=136
	  urs.msgO={
		  msg:function(){return $("#"+urs.msgID.msg)},
		  bg:function(){return $("#"+urs.msgID.bg)},
		  txt:function(){return $("#"+urs.msgID.txt)},
		  action:function(){return $("#"+urs.msgID.action)}
	  }	 
	  //重置结果框
	  urs.clearMsg=function(){
		  urs.msgO.txt().empty();
		  urs.msgO.action().empty();
	  }
	  //获取注册成功后的跳转url地址
	  urs.getUrl=function(){
		  var url = nie.util.urs.data[urs.dataID].result.reDirectUrl;
		  if(url!=null){								 
			  url+=((url.indexOf("?")>0)?"&":"?")+"username="+urs.getVal("username");
		  }
		  return url;
	  }
	  urs.showMsg=function(args){
		if(typeof args=="object"){
		  var chk=function(name){return (typeof args[name]!="undefined")?args[name]:null},
		      regResult=chk("result"),
		      msgTxt=chk("msg"),			  
			  url=chk("url"),
			  confirmFn=chk("confirmFn"),
     		  //检查结果框是否存在
		 	  win=$(window),
			  w=win.width(),
			  h=win.height(),
			  //capO=urs.getO("captcha"),
			  target="_self";			
		  if(urs.msgO.msg().length==0){
			$("<div/>",{
				id:urs.msgID.msg,
				css:{
					top:(h-urs.msgH)/2+win.scrollTop()+"px",
					left:(w-urs.msgW)/2+win.scrollLeft()+"px"
				},
				html:'<i class="tl"></i><i class="tm"></i><i class="tr"></i><i class="ml"></i><i class="mm"><span id="'+urs.msgID.txt+'"></span><span id="'+urs.msgID.action+'"></span></i><i class="mr"></i><i class="bl"></i><i class="bm"></i><i class="br"></i>'
			}).appendTo($(document.body));		
		  }
		  //重置结果框
		  else urs.clearMsg();
		  if(urs.msgO.bg().length==0){
			$("<div/>",{
				id:urs.msgID.bg,
				css:{
					top:win.scrollTop()+"px",
					left:win.scrollLeft()+"px",
					width:w+"px",
					height:h+"px"
				}
			}).appendTo($(document.body));
		  }
		  else{
			urs.msgO.bg().fadeIn("fast");
		  }	 
		  urs.msgO.msg().fadeIn("fast");
	
		  //注册成功				
		  if(regResult&&url!=null){					
			  target="_blank";
			  url+=((url.indexOf("?")>0)?"&":"?")+"username="+urs.getVal("username");
		  }
		  else{  	
			  url="javascript:void(0)";
		  }
		  urs.showCaptcha=false;				
		  //capO.unbind(urs.inpEvent);
		  urs.msgO.txt().text(msgTxt);
		  if(regResult!=null){
			$("<a/>",{
				href:url,
				"target":target,
				text:"确认",
				click:function(){
					if(regResult) urs.log(102);
					else urs.log(105);
					urs.hideMsg();
					if($.isFunction(confirmFn)) confirmFn();
					//capO.bind(urs.inpEvent,inpFn);
				}
			}).appendTo(urs.msgO.action());
		  }
		}
	  }
	  urs.hideMsg=function(){
		//idTypeSel.show();
		urs.msgO.bg().hide();
		urs.msgO.msg().hide();
	  }
	  urs.regComplete=urs.showMsg
	  urs.$=function(o){return $(o,urs.form)}
	  //获取用户填写的object
	  urs.getO=function(name,mustGet){
		  var result = null,name=name.toLowerCase();
		  if(mustGet||!/^(password|repassword)$/.test(name)){
			var tag = (name=="idtype")?"select":"input";
			result=urs.$(tag+"[name="+name+"]");
		  }
		  return result;
	  }
	  //获取用户填写信息
	  urs.getVal=function(name,mustGet){
		  var o =urs.getO(name,mustGet);
		  return (o!=null)?$.trim(o.val()):null;
	  }	  	
	  urs.init=function(){	
	    //alert(urs.regComplete);			
		var idTypeSel,hideObj,capBox,list,	  	 
			//注册开始时间（获取session id开始)
			startTime=0,
			//提示信息消失时间			
			//time=2000,
			//已显示推荐用户名列表
			hasRecomUserName=false,		 
			//需要验证的input {val,pass,timer}
			inpData={username:{},password:{},repassword:{},promark:{},captcha:{},realname:{},idno:{},phone:{}},  		 
			sInps="",sInps2="",		 
			//用户名输入时提示
			userNameTips,userNameTipsTimer,
			//用户名输入时提示消失时间
			time2=2000,
			//mouseover用户名时提示消失时间
			time3=3000,
			//点击"注册"，超时弹出提示框显示"提交数据中，请稍后..."
			time4=2500,		 		  
			inpFn=function(e,asy_onComplete){			
				var self = $(this),
				    name=self.attr("name"),
					val=$.trim(self.val()),
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
				},
				  //验证身份证
	 			verifyIdCard=function(idcard) {
					var wi=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
					//17位数对应的加权因子，自左至右;
					
					var vi=['1','0','X','9','8','7','6','5','4','3','2'];
					//余数对应的校验码;
					
					
					var getCheckCode=function(eightcardid){
							var checkCodeIndex = 0;
							var checkCode = '';
							try {
								eightcardid = eightcardid.substring(0, 17);
								var sum = 0;
								for (var i = 0; i < 17; i++) {
									sum = sum + wi[i] * (eightcardid.charAt(i));
								}
								checkCodeIndex = sum % 11;
								checkCode = vi[checkCodeIndex];
					
							} catch (ex) {
								checkCode = '';
							} 
							return checkCode;
					}	
					var areaCodes =[];
					areaCodes['11'] = '1';//北京市
					areaCodes['12'] = '1';//天津市
					areaCodes['13'] = '1';//河北省
					areaCodes['14'] = '1';//山西省
					areaCodes['15'] = '1';//内蒙古
					areaCodes['21'] = '1';//辽宁省
					areaCodes['22'] = '1';//吉林省
					areaCodes['23'] = '1';//黑龙江
					areaCodes['31'] = '1';//上海市
					areaCodes['32'] = '1';//江苏省
					areaCodes['33'] = '1';//浙江省
					areaCodes['34'] = '1';//安徽省
					areaCodes['35'] = '1';//福建省
					areaCodes['36'] = '1';//江西省
					areaCodes['37'] = '1';//山东省
					areaCodes['41'] = '1';//河南省
					areaCodes['42'] = '1';//湖北省
					areaCodes['43'] = '1';//湖南省
					areaCodes['44'] = '1';//广东省
					areaCodes['45'] = '1';//广西
					areaCodes['46'] = '1';//海南省
					areaCodes['50'] = '1';//重庆市
					areaCodes['51'] = '1';//四川省
					areaCodes['52'] = '1';//贵州省
					areaCodes['53'] = '1';//云南省
					areaCodes['54'] = '1';//西藏自治区
					areaCodes['61'] = '1';//陕西省
					areaCodes['62'] = '1';//甘肃省
					areaCodes['63'] = '1';//青海省
					areaCodes['64'] = '1';//宁夏
					areaCodes['65'] = '1';//新疆
					areaCodes['71'] = '1';//台湾省
					areaCodes['81'] = '1';//香港
					areaCodes['82'] = '1';//澳门
					
					var validArea=function(areaCode){
						if(areaCodes[areaCode]){
							return true;
						} else {
							return false;
						}
					}
					var validDate=function(year,month,day){         
						var time=new Date(year,month-1,day);
						var e_year=time.getFullYear();
						var e_month=time.getMonth()+1;
						var e_day=time.getDate();
						if(year!=e_year||month!=e_month||day!=e_day){
							return false;
						}
						if(year.indexOf("19") == 0 || year.indexOf("20") == 0){
						}else{
							return false;
						}
						return true;
					}
					var verifyCode = ''; // 最后一位校验位
					
					if (!idcard) {
						return false;
					}
					if (idcard.length == 15) {		
						var eighteen = '';
						eighteen = idcard.substr(0,6)+"19"+idcard.substr(6);
						eighteen = eighteen + getCheckCode(eighteen);
						idcard=eighteen;
					}
					if (idcard.length != 18) {
						return false;
					}
					try {
				
						if (! /^\d{15}$|^\d{17}[\d|X|x]$/.test(idcard)) {
							return false;
						}
						var area = idcard.substring(0, 2);
						if(!validArea(area)){
							return false;
						}
						var birth = idcard.substring(6, 14);
						var year = birth.substring(0,4);
						var month = birth.substring(4,6);
						var day = birth.substring(6,8);
						//日期部分不合法
						if(!validDate(year, month, day)){
							return false;				
						}
						//小于等于当天
						if (new Date() <= new Date(year,month,day)) {
							return false;
						}
						//校验位
						verifyCode = idcard.substring(17);
						if (verifyCode != ''&& verifyCode == getCheckCode(idcard.substring(0, 17))) {
							return true;
						} else {
							return false;
						}
				
					} catch (ex) {
						return false;
					} 
				
				};
				//show loading		
				$(".loading",infoObj).show();
				switch(name){			
				  case "username":
					  userNameTips.hide();
					  if(hasRecomUserName) hasRecomUserName=false;
					  if(val==""){					  
						info="必填";
						urs.log(1);
					  }
					  else if(!/^[a-z]/i.test(val)){				
						info="必须字母开头";	
						urs.log(3);
					  }
					  else if(/[^a-z\d]$/i.test(val)){					
						info="字母或数字结尾";	
						urs.log(4);
					  }
					  else if(/[^a-z\d_]/i.test(val)){
						info="字母、数字、下划线";
						urs.log(5);
					  }
					  else if(!/^[a-z\d_]{6,18}$/i.test(val)){					
						info="6～18个字符";	
						urs.log(6);
					  }
					  else if(val==urs.getVal("password",true)){
						info="不能与密码相同";
						urs.log(8);
					  }
					  else if(!hasRecomUserName){
						  asy=true;//异步	  										  	 					  
						  list.html("<i></i><a class='close' target='_self' href='javascript:void(0);'>X</a>用户名已被注册，选择以下:").hide();
						  //bind close button 
						  urs.$(".recomUserName .close").click(function(){
							 urs.$(".recomUserName").hide();
						  });			  
						  				  						
						  urs.get("checkUserName","userName="+val,function(){
							var data=nie.util.urs.data[urs.dataID].reComUserName;
							switch(data.statusCode){
								case 200:
									if(data["163"].exist){
										urs.log(2);
										info="已被注册";
										if(typeof data["163"].name=="object"){
											$.each(data["163"].name,function(i){											
												var userName = this.toString();											
												$("<a/>",{
													Class:"choose",
													href:"javascript:void(0)",
													target:"_self",
													html:"<input type='radio' />"+userName,
													click:function(){
														urs.log(7);
														hasRecomUserName=false;
														list.hide();
														setTimeout(function(){
															self.val(userName).trigger(urs.inpEvent);
														},0);
													}
												}).appendTo(list);
											});	
											list.slideDown("fast");
											hasRecomUserName=true;											
										}				
									}
									else pass=true;
									break;
								default:
									info=data.info;
									break;
							}						
							inpData[name].pass=pass;
							Class=pass?"right":"error";
							showInfo(infoObj,Class,name);						
							asy_func();
						});
					  }
					  break;
				  case "password":
					  if(val==urs.getVal("username",true)){
						  urs.log(11);
						  info="不能与用户名相同";						  
					  }
					  else if(/^\S{6,16}$/.test(val)){						  				  	
						  pass=true;
						  var o=urs.getO("repassword",true);
						  if(o.val()!="") o.trigger(urs.inpEvent);
					  }
					  else{
						  urs.log(10);
						  info="必须6～16个字符";				
					  }
					  break;
				  case "repassword":				
					  if(val==urs.getVal("password",true)&&val!="") pass=true;
					  else{	
						  urs.log(20);
						  info="重复密码不一致";
					  }
					  break;				
				  case "captcha":
					  if(val==""){
						  info="必填";
						  urs.log(61);
					  }
					  else if(val.length!=4){
						  info="验证码不匹配";
						  urs.log(62);
					  }
					  else{
						asy=true;//异步	 										  
						urs.get("Verifier","promark="+urs.promark+"&id="+urs.id+"&val="+val,function(){						  
							switch(nie.util.urs.data[urs.dataID].verCapResult){
								case 0:
								  pass = true;							
								  break;
								case 1:
								  info="验证码不匹配";
								  break;
								case 2:
								  info="失败次数多，请稍候输入";
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
				  case "realname":
					  if(/^[^\|\+\)\(\*&\^%\$#@!~=\\\}\{\]\[:;\?\>\<\/]{1,26}$/.test(val)) pass=true;
					  else{
						  urs.log(30);						
						  info="不允许特殊字符";
					  }
					  break;				
				  case "idno":
					  switch(urs.getVal("idtype")){
					  	case "0":
						  if(verifyIdCard(val)) pass = true;
						  else{
							  urs.log(40);
							  info="不正确";
						  }
						  break;
					  	default:
						  if(val.length>=6&&val.length<=18) pass=true;						
						  else{
							  urs.log(40);
							  info="6-18位字符";
						  }
						  break;
					  }
					  break;
				  case "phone":
					  if(/^[\d-]{5,20}$/.test(val)) pass=true;						
					  else{
						  urs.log(50);
						  info='5-20位,数字或"-"';
					  }
					  break;
				}			
				if(!asy) showResult();
			},			
			loadCaptcha=function(obj){					
			  startTime=urs.r();			  
			  urs.get("IdCreator","promark="+urs.promark,function(){				  
				urs.id=nie.util.urs.data[urs.dataID].id;				
				var loadCapImg=function(){					
					var img = new Image(),
					loadImg=function(){
						urs.showCaptcha=true;
						capImg.show().attr("src",img.src);
					};
					img.src=urs.serverPath+"Img?id="+urs.id+"&"+urs.r();					
					// 如果图片已经存在于浏览器缓存
					if(img.complete) {
						loadImg();
						return;// 直接返回，不用再处理onload事件
					}
					img.onload = loadImg;
					img.onerror=function(){
						capImg.hide();
						capBox.removeClass("loading").text("刷新过多");
					}
					/*capImg.load(function(){
					  urs.showCaptcha=true;
					  capImg.show();
					}).attr("src",urs.serverPath+"Img?id="+urs.id+"&"+urs.r()).error(function(){
						capImg.hide();
						capBox.removeClass("loading").text("刷新过多");
					});			*/		
				}
				capImg.click(loadCapImg);
				urs.$("#captchaBtn").attr({href:"javascript:void(0)",target:"_self"}).click(function(){loadCapImg()});
				if(!urs.showCaptcha){			
					loadCapImg();
				}
				if(obj&&$.isFunction(obj.onComplete)) obj.onComplete();
			  });
			},
			allInpFocus=function(){	
			  if(!urs.showCaptcha) {
					hideObj.fadeIn("fast");
					loadCaptcha({onComplete:function(){				
						urs.showCaptcha=true;				  
					}});
				}
			},
			//2秒后消失信息
			showInfo=function(o,Class,name){			 
				var Class2=Class=="right"?"error":"right";
				$(".loading",o).hide();
				$("."+Class,o).show();
				$("."+Class2,o).hide();
				o.show();			 
			};			
			urs.promark=urs.getVal("promark");
			//统计pv
			if(urs.pvStats) new Image().src=urs.server+"stats/1.gif?promark="+urs.promark+"&"+urs.r();	 	
			$(".NIE-quickReg-loading").hide();
			urs.form.show();
			idTypeSel=urs.getO("idtype");
			//hideObj = urs.$(".realItem,.captchaItem");
			hideObj = urs.$(".hideItem");			
			capImg = $("<img />",{
					width:urs.capWidth,
					height:urs.capHeight
				}).hide();
			urs.$(".captcha-wrap").append(capImg);
			list=urs.$(".recomUserName");
			userNameTips=urs.$(".userName-tips");
			
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
		   
			//userName tips
			userNameTips.html('<i></i><a class="close" target="_self" href="javascript:void(0);">X</a>6~18位，包括字母、数字、下划线；以字母开头，字母或数字结尾。');
			$(".close",userNameTips).click(function(){
				userNameTips.hide();
			});
			//idtype bind		  		  
			$.each(["身份证","学生证","军人证","护照"],function(i){			 
				idTypeSel.append("<option value='"+i+"'>"+this+"</option>");
			});		    
			//bind urs.form event
			urs.form.attr("action","#").submit(function(){	
				urs.log(90);
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
					if(asy_done==asy_total){				 
						for(var i in inpData){							
							if(!inpData[i].pass){
								urs.getO(i,true).trigger("focus");							  
								return;
							}
						}
						//验证成功
						urs.log(100);
						var gotResult=false;
						//var hasShowLoading=false;						
						setTimeout(function(){							
							if(!gotResult){
								//hasShowLoading=true;							  						
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
								if(/^(realname|idno|activityid1|activityid2)$/.test(name)){
									v=encodeURIComponent(encodeURIComponent(v));
								}
								result +="&"+name+"="+v;
							};
							return result;
						}						
						urs.get("submit","id="+urs.id+params(["captcha","username","password","mobile","realname","idno","phone","promark","activityid1","activityid2","idtype"]),function(){
								if(startTime!=0) new Image().src=urs.serverPath+"regTime?time="+(urs.r()-startTime)+"&promark="+urs.promark;
								startTime=0;								
								gotResult=true;					  		
								urs.hideMsg();
								var Data=nie.util.urs.data[urs.dataID].result,
									 num=Data.num;						
								if($.isFunction(urs.regComplete)) urs.regComplete({
																	   result:(num==200||num==201),
																	   msg:Data.msg,
																	   url:Data.reDirectUrl,
																	   data:Data
																   });
							}
						);
					}
				}
				var chkAll=function(){
				  allInpFocus();
				  $.each(inpData,function(i){					
					  if(i!="promark"){
						  urs.getO(i,true).trigger(urs.inpEvent,[asy_onComplete]);	
					  }
				  });
				}			
				if(inpData["captcha"].pass==null) loadCaptcha({onComplete:chkAll});
				else chkAll();		
			});
	 
			//bind username event
			urs.getO("username").keypress(function(){
				clearTimeout(userNameTipsTimer);
				//idTypeSel.hide();
				userNameTips.show();
				userNameTipsTimer=setTimeout(function(){userNameTips.hide();},time2);
				if(hasRecomUserName){
					list.hide();				
					hasRecomUserName=false;
				}
			}).hover(function(){
				//idTypeSel.hide();
				userNameTips.show();
				clearTimeout(userNameTipsTimer);
				userNameTipsTimer=setTimeout(function(){userNameTips.hide();},time3);
			},function(){
				//idTypeSel.show();
				userNameTips.hide();
			});
			//bind input info event
			urs.$(sInps2).live("focusin",function(){	
				var self=$(this),name=self.attr("rel");			 
				self.hide();
				urs.getO(name,true).show().trigger("focus");
			}); 
			//bind each input event		 
			urs.$(sInps).focusin(allInpFocus).live(urs.inpEvent,inpFn);	
	}
	return urs;
  }
}