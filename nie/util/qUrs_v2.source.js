nie.util.qUrs=nie.util.qUrs||function(options){
	$("head")
		.append($("<link>").attr({rel:"dns-prefetch",href:"//weburs.ku.163.com"}))
		.append($("<link>").attr({rel:"dns-prefetch",href:"//reg.nie.163.com"}));	
	var self=this,		
		/*
		 * 注册行为日志
		 * type:类别
		 * 1:被加载（统计价值注册接口）
		 * 2:触碰注册元素
		 * 100:163邮箱注册成功
		 * 101:外域注册成功
		 * 200:手机注册成功
		 */
		_now=function(){return new Date().getTime();},
		stats=new function(){
			var _self=this,
				_touched=false,
				_preType=0,				
				_time=_now();
			this.run=function(type){
				new Image().src="http://webdog.nie.163.com/urs_log/?"+getBindParams({
					"promark":promark,
					"type":type,
					"preType":_preType,
					"time":_now()-_time
				});
				_preType=type;
				_time=_now();
			};
			this.touch=function(){
				if(!_touched){
					_touched=true;
					_self.run(2);
				} 
			};
		},
		defaults={
			"activeIndex":1,//默认显示标签（0:邮箱注册，1:手机注册）
			"holder":"div.NIE-quickReg",
			"type":1,//类别 1:需要验证码;2:不需要验证码;3:手机注册
			"loginFn":null,//游戏登录(默认null)：用在检查用户名存在的时候调用，方便web游戏
			/*
			 * 显示信息框，只供提供表达返回结果显示
			 * data={
			 * 		regType:注册类型(1:邮箱注册;2:手机号码注册) 		 
					 reVer:是否需要二次验证(regType=1才出现)			 
					 is163Mail:是否网易邮箱(regType=1才出现)
					 mailUrl:外域帐号的邮箱网址(regType=1才出现)			 
					 username:用户名(regType=2时为主帐号)
					 m_username:手机帐号(regType=2时出现,手机号码不包含@163.com)
					 status:状态码			 
					 success:是否注册成功
					 msg:错误提示
					 url:注册成功后跳转地址	 
					 }
			 */
			"regComplete":null,//注册返回信息完成,
			"msgType":1,//信息类别 1:弹框(默认);2:切换层(iframe专用)
			"product":nie.config.site||window.location.href.replace(/^http:\/\/(.*)\.163\.com.*$/,'$1'),//产品(暂用在没有邮件的地址)
			"activity":[]//额外选项，只允许两项[{"name":"QQ号码","rule":function(val){return /^\d+$/.test(val)?true:"请正确输入qq号码。";},"defaultValue":""}]
		},		
		//serverPath="http://jq.163.com/nie/util/qUrs/",//"http://weburs.ku.163.com/quickReg/",
		serverPath="http://weburs.ku.163.com/quickReg/",
		settings = $.extend({}, defaults, options),		
		regComplete=function(data){			
			if(typeof data=="object"){
					var _holderName="";
					if(data.reVer) _holderName="reVer";
					else if(data.success) _holderName=(data.regType==1)?(data.is163Mail?"is163":"not163"):"mobile";
					else _holderName="error";
					layer.create(_holderName);			
					layer[_holderName].show(data);			
			}
			if($.isFunction(settings.regComplete)) settings.regComplete(data);
		},
		holder=$(settings.holder),
		promark=holder.find("input[name=promark]").val(),
		id=null,
		ot=new function(){//注册耗时
			var _self=this,
				_hasGot=false,
				_val=0;
			this.firstStart=function(){//只执行一次
				if(!_hasGot) _self.start();
			};
			this.start=function(){
				_hasGot=true;
				_val=_now();
			};
			this.end_and_get=function(){
				var result=parseInt((_now()-_val)/1000);
				_self.start();
				return result;
			};
		},
		/*
		需要记录日志的有下面五种情况：
account_type	1代表手机注册，2代表邮箱注册
fail_type		1 代表手机号已注册，2代表手机号已绑定，3代表邮箱已注册
		*/
		log=function(account_type,is_success,fail_type){
			var _account=allItems.currentItems.getVal(allItems.getCurrentUA());
			if((emailReg.test(_account)&&account_type==2)||(/^(13|14|15|18)\d{9}$/.test(_account)&&account_type==1)){
				var _params={account:_account,"account_type":account_type,"product":settings.product};
				if(typeof fail_type !="undefined") _params["fail_type"]=fail_type;
				if(typeof is_success !="undefined") _params["is_success"]=is_success;
				Img().attr("src","http://gad.netease.com/gad/register?"+getBindParams(_params));
				_params=null;
			}
		},
		/*
		 * 渲染结构
		 * namesData:[{cn:"邮箱帐号",name:"username",...}]
		 */
		render_and_getForm=function(namesData,formIndex){			
			var _getItemHTML=function(index,nameData){
					var _plusCode="";
					if(nameData.name=="captcha") _plusCode='<span class="captcha-wrap hideItem qr-loading"></span>';
					else if(nameData.name=="username") {
						_plusCode='<div class=suggestDomain><ul></ul></div>';
						_extraCode='<p class="qr-noEmail"><a href="javascript:void(0);">还没有邮箱？</a></p>';						
					}
					else if(nameData.name=="smscode") {
						_gotSmsCode=true;
						_plusCode='<input type="button" class="qr-smscode-btn" value="获取验证码"/>';						
					}
					return ('<dt class="qr-$name">$cn：</dt>\
							<dd class="qr-$name">\
							<ul>\
								<li class="qrCon">\
									<input class="qr-$name-inp qrInpTxt" type="'+(/password/.test(nameData.name)?"password":"text")+'" value="$defaultValue" name="$name" autocomplete="off" tabindex="$index" />\
									<input rel="$name" class="qr-$name-inp qr-inp-error qr-hide" readonly="readonly" tabindex="$index" />'
									+_plusCode+									
								'</li>\
								<li class="qrChk"><i class="qr-right"></i><i class="qr-error"></i><i class="qr-loading"></i></li>\
							</ul>\
							</dd>')
							.replace(/\$index/g,index)
							.replace(/\$name/g,nameData.name)
							.replace(/\$cn/g,nameData.cn)
							.replace(/\$defaultValue/g,nameData.defaultValue?nameData.defaultValue:"");
				},
				_plusTemp='<dt class="qr-agree"><input id="qr-agree" name="agree" type="checkbox" checked="checked" /></dt>\
						<dd class="qr-agree">\
						<label for="qr-agree">我同意"<a href="http://reg.163.com/agreement.shtml" target="_blank">服务条款</a>"和<br />"<a href="http://reg.163.com/agreement_game.shtml" target="_blank">隐私保护和个人信息利用政策</a>"</label>\
						</dd>\
						<dt class="qr-submit"></dt>\
						<dd class="qr-submit"><input type="submit" tabindex="$index" value=""/></dd>',
				_html="",
				_index=0,
				_gotSmsCode=false,
				_extraCode="",
				_form=$('<form>',{"class":"qr-form"+(formIndex+1)}).submit(function(){return false;});
			for(var i=0,l=namesData.length;i<l;i++){		
				_html+=_getItemHTML(++_index,namesData[i]);
			}
			_form.html((_extraCode+"<dl>"+_html+_plusTemp.replace("$index",_index+1)+"</dl>"));//.replace(/\$rand/g,new Date().getTime()));
			_form.find("p.qr-noEmail>a").click(function(){
				$(this).text("可在此注册新网易邮箱");
				allItems.currentItems.get("username").hiLine();
			});
			if(_gotSmsCode) {//获取手机验证码
				_form.find("input.qr-smscode-btn").click(function(){
					allItems.currentItems.get("smscode").none();
					var __self=$(this).attr("disabled","disabled"),
						__total=61,
						__org_val=__self.val();
					allItems.currentItems.get("m_username").chk(function(pass){						
						if(pass) remote("sendMobileCaptcha",{"m_username":allItems.currentItems.getVal("m_username")},function(json){										
						//if(pass) remote("getJSON.php",{"m_username":allItems.currentItems.getVal("m_username")},function(json){																
										if(json.success){															
											var __timer=setInterval(function(){
												if(--__total>0) __self.val(__total+"秒后可重新发送");
												else {
													clearInterval(__timer);
													__self.val(__org_val).attr("disabled",false);
												}
											},1000);
										}
										else{
											__self.val(__org_val).attr("disabled",false);
											if(json.uploadSMS){
												layer.create("uploadSMS");
												layer.uploadSMS.show(json);
											}
											else{												
												layer.create("error");
												layer.error.show(json);
												json.isReded?log(1,0,1):log(1,0,2);
											}
										}
								});
						else __self.attr("disabled",false);
					});
				});				
			}			
			_gotSmsCode=_getItemHTML=_plusTemp=_html=_index=null;
			return _form;
		},
		allItemRule={//全部填项规则
				"username":{
					"asy":true,
					"rule":function(val,asy_callback){
						var result=true,
							email_m=val.match(emailReg),
							pwVal=allItems.currentItems.getVal("password"),
							is163Email=false;
						if(val==""||val==tips.username.txt) result="请输入邮件地址";
						else if(!email_m) result="请输入正确的邮件地址";
						else if(val==pwVal||email_m[1]==pwVal) result="不能与密码相同";
						else{
							var domain=email_m[2].toLowerCase();
							if(mailDomain[domain]&&mailDomain[domain][1]){
								is163Email=true;
								result=chk163UserName(email_m[1]);
							}
						}
						if(result!=true) asy_callback(result);
						else{
							remote("checkUserName",{"userName":val},function(json){
								var result=0;
								switch(json.status) {
									case 104:										
										result = true;
										log(2);
										break;
									case 200:
										/*
									前端开发|林嘉玮|5776 -  说: (2013-09-13 12:41:23)
									奇怪 外域才统计 是否之前规定外域才统计的？
									商务|彭珺琳|6248 - 若发现系统问题，烦请附URL及截图，以便快速查找。 说: (2013-09-13 12:41:30)
									这个问题不是今天才有的。只是今天才发现，会不会是因为战歌换了域名，出现这种问题。。。
									前端开发|林嘉玮|5776 -  说: (2013-09-13 12:41:41)
									不会 统一的
									前端开发|林嘉玮|5776 -  说: (2013-09-13 12:42:19)
									印象中 好像之前规定外域才统计 确认下？
									无敌哥|李志健 - iZumi - http://busuncle.github.io/izumi.html 说: (2013-09-13 12:46:44)
									都统计的吧，老玩家来的
									商务|彭珺琳|6248 离开了多人会话。
									所有参与者已退出,您的多人会话已自动转变成双人会话。
									前端开发|林嘉玮|5776 -  说: (2013-09-13 12:50:06)
									这个无敌哥是你决定的吧？ 还是彭珺琳？
									无敌哥|李志健 - Renne - http://busuncle.github.io/renne/ 说: (2013-09-13 12:52:07)
									我是记得这个情况都是要发的，跟外域用的同一个代码，不知你那边有没有变
										*/
										unionStats(is163Email);
										if(is163Email){											
											result="该帐号可直接登录游戏";
											if($.isFunction(settings.loginFn)) settings.loginFn();															
										}
										else{
											result = "该邮件地址已被注册";							
										}
										log(2,0,3);
										log(2);
										break;
									default:
										result = json.info;
										break;
								}
								asy_callback(result);
							});
						}
					}
				},
				"password":{
					"rule":function(val){
						var result=true,
							userV=allItems.currentItems.getVal("username"),
							userR=userV.match(emailReg);
						if(val=="") result="请设置你的通行证登录密码";
						else if(val==userV||(userR&&userR[1]==val)) result="不能和用户名相同";
						else if(!/^[\S]{6,16}$/i.test(val)) result="请输入6到16个字符的密码";
						else if(allItems.currentItems.getVal("repassword")) allItems.currentItems.blur("repassword");
						return result;
					}						
				},
				"repassword":{
					"rule":function(val){
						var result=true;
						if(val=="") result="请再次输入你的设置密码";
						else if(val==allItems.currentItems.getVal("password")) result=true;
						else result="两次输入的密码不一致";
						return result;						  
					}
				},
				"captcha":{
					"asy":true,
					"rule":function(val,asy_callback){
						var result=true,txt=(settings.type==1)?["必填","不正确"]:["请输入验证码","请输入正确的验证码"];
						if(val=="") result=txt[0];
					 	else if(val.length<4||val.length>6) result=txt[1];
						if(result!=true)asy_callback(result);
						else remote("Verifier",{"val":val},function(json){										
								  var result=0;
								  switch(json.verCapResult){
									case 0:
									  result = true;							
									  break;
									case 1:
									  result=txt[1];
									  loadCaptcha();					  
									  break;
									case 2:
									  result="失败次数多，请稍候输入";											  
									  break;
								  }
								  asy_callback(result);
							  });		
					}
				},
				"m_username":{
					"rule":function(val){
						var result=(/^(13|14|15|18)\d{9}$/.test(val))?true:"请正确输入手机号码";
						if(result) log(1);
						return result;
					}
				},
				"m_password":{
					"rule":function(val){
						var result=true;
						if(val=="") result="请设置你的通行证登录密码";
						else if(val==allItems.currentItems.getVal("m_username")) result="不能和用户名相同";
						else if(!/^[\S]{6,16}$/i.test(val)) result="请输入6到16个字符的密码";
						else if(allItems.currentItems.getVal("m_repassword")) allItems.currentItems.blur("m_repassword");
						return result;
					}						
				},
				"m_repassword":{
					"rule":function(val){
						var result=true;
						if(val=="") result="请再次输入你的设置密码";
						else if(val==allItems.currentItems.getVal("m_password")) result=true;
						else result="两次输入的密码不一致";
						return result;
					}
				},
				"smscode":{
					"rule":function(val){
						return val==""?"必填":true;
					}
				}
		},
		/*
		 * 弹层
		 */
		layer={
			size:{//框尺寸
				"not163":{w:435,h:250},//外域框
				"is163":{w:300,h:155},//163邮箱框
				"reVer":{w:240,h:230},//二次验证
				"error":{w:280,h:160},//错误
				"mobile":{w:370,h:175},//手机帐号注册成功
				"uploadSMS":{w:320,h:200},//上行短信
				"sendEMail":{w:280,h:160}//发送注册验证邮件
			},
			is163:null,//163邮箱框容器
			not163:null,//外域容器
			error:null,//错误容器
			reVer:null,//二次验证容器
			mobile:null,//手机帐号注册成功
			uploadSMS:null,//上行短信
			sendEMail:null,//发送注册验证邮件
			bg:null,//背景容器			
			create:function(holderName){//holderName: not163|is163|reVer|error|uploadSMS
				var body =$(document.body);
				if(!layer[holderName]){
					layer[holderName]=new function(){
						var _self=this,
							_getCloseBtn=function(txt,className){
								return holderName=="not163"?null:
										$("<a>",{
											text:txt,
											"class":className,
											href:"javascript:void(0);",
											click:function(){_self.hide();}
										});
							},					
							_setClickClose=function(selector,plusClick){
								return _selfConHolder.find(selector).click(function(){
									_self.hide();
									if($.isFunction(plusClick)) plusClick();
								});
							},
							_selfConHolder=$("<div>",{"class":"NIE-quickReg-msg-con qr-con-"+("is163"==holderName?"right":holderName)}),//内容容器
							_size=layer.size[holderName];
						if(settings.msgType==1){
							var _selfHolder=$("<div>",{
									"class":"NIE-quickReg-msg",
									html:"<div class=NIE-quickReg-msg-title>注册游戏帐号</div>"								
								}).append(_getCloseBtn("X","NIE-quickReg-closeBtn")),
								_t_space=20,
								_time=250,
								_display=function(selfConHolderHTML,appendToSelfConHolder){//显示
									_selfConHolder.empty().html(selfConHolderHTML);
									if(appendToSelfConHolder) _selfConHolder.append(appendToSelfConHolder);
									layer.bg.show();//show bg layer
									var win=$(window),
										_t=win.height()-_size.h,
										_l=win.width()-_size.w;										
									_selfHolder
									.css({
										width:_size.w,
										height:_size.h,
										top:(_t<0?0:_t)/2+win.scrollTop()+_t_space,
										left:(_l<0?0:_l)/2+win.scrollLeft(),
										opacity:0
									})
									.append(_selfConHolder)								
									.show()
									.animate({opacity:1,top:parseInt(_selfHolder.css("top"))-_t_space},{duration:_time});
									win=_t=_l=null;									
								};								
							this.hide=function(){				
								_selfHolder
								.animate({
									opacity:0,
									top:parseInt(_selfHolder.css("top"))+_t_space
								},{
									duration:_time,
									complete:function(){$(this).hide();}
								});
								layer.bg.hide();
							};							
						}
						else{//iframe专用
							var _selfHolder=$("<div>",{
									"class":"NIE-quickReg-msg-iframe"								
								}),
								_display=function(selfConHolderHTML,appendToSelfConHolder){//显示
									holder.hide();
									_selfConHolder.empty().html(selfConHolderHTML);
									if(appendToSelfConHolder) _selfConHolder.append(appendToSelfConHolder);									
									var win=$(window);			
									_selfHolder
									.append(_selfConHolder)								
									.show();								
									win=null;
								};
							this.hide=function(){				
								_selfHolder.hide();
								holder.show();
							};
						}
						switch(holderName){							
							case "is163":								
								this.show=function(json){									
									_display('<p class="qr-info">注册成功！</p><p>你的网易通行证为 '+(json.m_username?json.m_username:json.username)+'</p><a href="'+json.url+'" target="_blank" class="btn">确 认</a>');
									_setClickClose("a");
								};								
								break;							
							case "not163":
								this.show=function(json){																		
									_display('<h1>感谢注册！请立即激活帐号。</h1>\
											<h3>请您登录邮箱 <b><a href="'+json.mailUrl+'" target="_blank">'+json.username+'</a></b> 根据确认邮件操作即可。</h3>\
											<h2><a class="btn" href="'+json.mailUrl+'" target="_blank">立即查看邮件</a></h2>\
											<ul class="tips">\
											<li>还没有收到验证邮件？\
											<ol>\
											<li>尝试到广告邮件、垃圾邮件里找找看；</li>\
											<li>再次<a href="javascript:void(0);" target="_self" class="sendMailBtn">发送注册验证邮件</a>；</li>\
											<li>如果重发注册验证邮件依然没有收到，请<a class="reReg" target="_self" href="javascript:void(0);">重新注册</a>。</li>\
											</ol>\
											</li>\
											</ul>');
									(function(){
										var _emailURL=json.mailUrl;
										_selfConHolder.find("a.sendMailBtn").click(function(){										
											remote("sendActiveMail",{userName:json.username},function(json){											
												if(json.status&&json.info){
													if(json.status==200){
														_selfHolder.hide();
														layer.create("sendEMail");
														layer["sendEMail"].show(json.info,_emailURL);
													}
													else alert(json.info);
												}
											});												
										});											
									})();
									
									_setClickClose("a.reReg",function(){
										allItems.currentItems.get("username").hiLine()
									});
									_setClickClose("a.btn");
								};
								break;
							case "mobile":
								this.show=function(json){
									_display('<h1>注册成功！</h1>\
											<h2>您的网易通行证为<b>'+json.m_username+'</b></h2>\
											<p><a href="'+json.url+'" target="_blank" class="btn">确 认</a></p>');
									_setClickClose("a");
								};								
								break;
							case "error":
								this.show=function(json){
									var resultHTML=""; 
									if((allItems.getCurrentRegType()==2&&(json.status==421||json.msg=='该手机号已被注册。'))){
										resultHTML='号码已被注册或与原有帐号关联，请直接登录或<a rel="emailReg" href="javascript:void(0);">邮箱注册</a>。';
										allItems.currentItems.get("m_username").error("号码已被注册或被关联");
									}
									else resultHTML=json.msg;																		
									_display('<p class="qr-info">出错了！</p><p class="qr-reason">'+resultHTML+"</p>",_getCloseBtn("确认","btn"));
									resultHTML=null;
									_setClickClose("a[rel=emailReg]").click(function(){
										allItems.active("邮箱注册");
									});									
								};								
								break;
							case "uploadSMS":
								this.show=function(json){
									_display('<p class="qr-info">编辑短信获取验证码</p><p class="qr-reason">请用手机 <span class="qr-f-hiKey">'
											+allItems.currentItems.getVal("m_username")
											+'</span> 编辑短信<span class="qr-f-hiKey">'+json.uploadSMS.content+'</span>，发送到 <span class="qr-f-hiKey">'+json.uploadSMS.No
											+'</span> 获取验证码信息<br><span class="qr-f-lowKey">短信费用由运营商收取（0.1元/条）</span></p>'
									,_getCloseBtn("确认","btn"));								
								};		
								break;
							case "reVer":
								this.show=function(json){									
									_display('<p class="reVer-l1">只差一步就完成了！<br>\
											请您再输入一次验证码以完成注册：<br>\
											<input class="NIE-reVerInp"><br>\
											<span class="NIE-reVerImg">\
											</span>\
											</p>\
											<p class="reVer-l2">看不清楚 \
											<a href="javascript:void(0);" class="NIE-reVerBtn">换一个</a>\
											</p>\
											<p class="reVer-l3">\
											<a href="javascript:void(0);" class="btn">完成注册</a>\
											</p>');
									var __loadCaptcha=function(){
										captcha.load(true,function(img){
											img.click(__loadCaptcha);											
											_selfConHolder.find("span.NIE-reVerImg").empty().append(img);												
										});
									};
									__loadCaptcha();
									_selfConHolder.find("a.NIE-reVerBtn").click(__loadCaptcha);
									_selfConHolder.find("a.btn").click(function(){
										var _itemVals=allItems.currentItems.getItemVals();
										_itemVals["captcha"]=$.trim(_selfConHolder.find("input.NIE-reVerInp").val());
										_itemVals["pAnti"]=1;
										submitFn(_itemVals,function(){
											_self.hide();
										});
										_itemVals=null;
									});
								};
								break;
							case "sendEMail":
								this.show=function(msg,emailURL){
									_display('<p class="qr-info">邮件发送成功！</p><p>马上去您的邮箱激活通行证。</p><a href="'+emailURL+'" target="_blank" class="btn">立即查看邮件</a>');
									_setClickClose("a");
								}
								break;
						}						
						_selfHolder.appendTo(body);
					};
					if(settings.msgType==1&&!layer.bg) layer.bg=new function(){
						var _selfHolder=$("<div>",{"class":"NIE-quickReg-msg-bg"}).appendTo(body),
							_bg_time=130;
						this.show=function(){	
							if(_selfHolder.css("opacity")==1){
								_selfHolder.css({
									width:$(document.body).width(),
									height:$(document).height(),
									opacity:0
								})
								.show()
								.animate({opacity:.5},{duration:_bg_time});		
							}
						};
						this.hide=function(){
							_selfHolder.animate({opacity:0},{
								duration:_bg_time,
								complete:function(){$(this).hide();}
							});
						};
					};
					body=null;
				}		
			}
		},
		submit_doing=false,//是否进行提交表达
		emailReg=/^([\w-\.]+)@([\w-]+(?:\.[\w-]+){1,3})$/,//邮箱正则
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
		mailDomain={
		  /*下拉框默认显示*/
		  "163.com":[2,1,1,1],
		  "qq.com":[2,0,1],
		  "sina.com":[2,0,1],
		  "126.com":[2,1,1,1],
		  "vip.qq.com":[2,0,1],   
		  /*下拉框扩展显示*/		
		  "yahoo.com":[2,0,0],
		  "yahoo.com.cn":[2,0,0],		  
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
	    },
	    maxDomain=6,
		tips={
			username:{
				"txt":"网易邮箱用户可直接登录",
				"class":"inp-tips"
			},
			password:{
				"txt":"6-16位字符，区分大小写",
				"class":"inp-tips"
			},
			m_username:{
				"txt":"请输入11位手机号",
				"class":"inp-tips"
			}
		},
		/*
		 * 提交表单
		 * itemVals:所有选择值集合
		 * callback:服务器返回回调
		 */
		submitFn=function(itemVals,callback){
			var _regType=allItems.getCurrentRegType();
			itemVals["ot"]=ot.end_and_get();
			if(_regType==1){//邮箱注册
				remote("submit",itemVals,function(json){
					ot.start();
					//json={num:200,is163Mail:true,mailUrl:"http://mail.qq.com",msg:"fuck.",redirecturl:"http://nie.163.com"}
					var _success=(json.num>=200&&json.num<=202),//注册成功
						_reVer=false,//调用regComplete的参数
						_UA=itemVals[allItems.getCurrentUA()];//
					if($.isFunction(callback)) callback(_success,json.is163Mail);
					if(_success) {							
						unionStats(json.is163Mail);//网盟统计
						allItems.currentItems.reset();
					}
					else{
						log(2,0,3);//注册失败
						switch(json.num){
							case 2://验证码错误								
								if(allItems.currentItems.get("captcha")){
									loadCaptcha();//request captcha again
									allItems.currentItems.get("captcha").none();//clear tips icon
								}
								log(2,0,5);
								break;
							case 107://需要二次验证码
								_reVer=true;
								break;
						}			
					}
					regComplete({
						regType:_regType,
						success:_success,
						reVer:_reVer,
						status:json.num,
						msg:(json.msg.indexOf("；")==0)?json.msg.replace("；",""):json.msg,
						url:json.reDirectUrl?((json.reDirectUrl.indexOf("?")==-1?json.reDirectUrl+"?":json.reDirectUrl+"&")+"username="+itemVals.username):"",							
						username:_UA,
						is163Mail:json.is163Mail,
						mailUrl:json.mailUrl
					});
					submit_doing=false;
				});
			}
			else{//手机注册
				remote("regMobile",itemVals,function(json){					
					if($.isFunction(callback)) callback(json.success);					
					regComplete({
						regType:_regType,
						success:json.success,
						msg:json.msg,
						status:json.status,
						url:json.reDirectUrl?((json.reDirectUrl.indexOf("?")==-1?json.reDirectUrl+"?":json.reDirectUrl+"&")+"username="+json.UA):"",							
						username:json.UA,//主帐号
						m_username:parseInt(json.mUA)//手机帐号
					});
					submit_doing=false;
					if(json.status==413){//验证码失败
						log(1,0,4);
					}
				},true);
			}
		},
		/*
		* 检查163帐号
		* 返回结果:true|error msg
		*/
		chk163UserName=function(val){
		  var result=true;
		  if (!/^[a-z]/i.test(val)) result = "请输入字母开头";			
		  else if (/[^a-z\d]$/i.test(val)) result = "请输入字母或数字结尾";
		  else if (/[^a-z\d_]/i.test(val)) result ="请输入字母、数字、下划线";
		  else if (!/^[a-z\d_]{6,18}$/i.test(val)) result = "请输入6到18个字符";
		  return result;
		},
		getBindParams=function(params){
			var arr=[];
			for(var k in params){
				arr.push(k+"="+params[k]);
			}
			return arr.join("&");
		},
		remote=function(file,params,callBack){			
			$.ajax({
				type : "get", //jquey是不支持post方式跨域的
				async:false,
				//url : (file=="submit"?"https://reg.nie.163.com/web/quick/":serverPath)+file+"?"+getBindParams($.extend({"promark":promark,"id":id,"output":"json","isTest":1,"isReActive":1},params)), //跨域请求的URL
				url : (/^(submit|regMobile)$/.test(file)?"https://reg.nie.163.com/web/quick/":serverPath)+file+"?"+getBindParams($.extend({"promark":promark,"id":id,"output":"json"},params)), //跨域请求的URL
				//url : "urs.php?file="+file+"&"+getBindParams($.extend({"promark":promark,"id":id,"output":"json"},params)), //跨域请求的URL
				dataType : "jsonp",				
				//传递给请求处理程序，用以获得jsonp回调函数名的参数名(默认为:callback)
				//jsonp: "jsoncallback",
				//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
				//jsonpCallback:"success_jsonpCallback",
				//成功获取跨域服务器上的json数据后,会动态执行这个callback函数
				success : function(json){
					callBack(json);
				}
			});
		},
		//网盟统计，统计已经存在的帐号
		unionStats=function(is163){
		  (function(){
			  var _is163=is163,
			  	  _username=allItems.currentItems.getVal(allItems.getCurrentUA());			  
			  setTimeout(function(){
				  $.include("http://union.netease.com/sys_js/pre_related.js",function(){					  
					  _is163?netease_union_pre_related(_username):netease_union_pre_related(_username,2);
				  });
			  },0);
		  })();
		},
		Img=function(){
		  var o = $(new Image());
		  o.bind('readystatechange',function(){					
			  // 如果图片已经存在于浏览器缓存
			  if(this.readyState=="complete"){						  
				  return;// 直接返回，不用再处理onload事件
			  }
		  }).bind("abort",function(){			  
			   return;					  
		  });
		  return o;
		},
		ID=new function(){
			var _self=this,
				_doing=false;
			this.got=false;
			this.load=function(callback){				
				if(!_self.got&&!_doing){
					_doing=true;
					remote("IdCreator",{},function(json){
						id=json.id;
						_self.got=true;
						_doing=false;
						if($.isFunction(callback)) callback();
					});
				}
			};
		},
		Captcha=function(){
			var _self=this;				
			this.doing=false;
			this.has=false;
			/*
			* 载入验证码
			* isReVer:是否二次验证
			* callback:参数为图片
			*/
			this.load=function(isReVer,callback){
				_self.has=true;
				if(!_self.doing){
					_self.doing=true;
					_size=isReVer?{w:205,h:30}:{w:100,h:30};
					var getImg=function(){						
						return Img().attr({
							height:_size.h,
							width:_size.w,
							src:serverPath+"Img?"+
								getBindParams({"id":id,
											"pAnti":isReVer?1:0,
											"promark":promark,
											"_r":new Date().getTime()
								})
						});
					};
					if(ID.got) {
						_self.doing=false;
						callback(getImg());
					}
					else ID.load(function(){
							_self.doing=false;
							callback(getImg());
						});
				}
			};
		},
		/*
		* 单个填选项对象
		* options参照_defaults
		*/
		Item=function(options){			
			var _self=this,
				_doing=false,
				_defaults={
					name:null,//选项名称
					asy:false,//需要异步调用次数			
					rule:null,//规则
					focusCallBack:null,//触发回调函数
					form:null//表单
				},
				_settings=$.extend({},_defaults, options),				
				_holder=_settings.form.find("dd.qr-"+_settings.name),//容器
				_chkHolder=_holder.find("li.qrChk"),//检查icon容器
				_resetBlur=function(plusFn){				
					_unbindBlur();
					_bindBlur(plusFn);
				},
				_bindBlur=function(plusFn){
					_inp.blur({f:plusFn},function(e,data){
						if($.isFunction(e.data.f)) e.data.f();
						_self.none();
						data&&$.isFunction(data.chkCallBack)?_self.chk(data.chkCallBack):_self.chk();
					});
				},
				_unbindBlur=function(){
					_inp.unbind("blur");
				},
				_inp=_holder.find("input[name="+_settings.name+"]"),							
				_info=_holder.find("input[rel="+_settings.name+"]"),
				_hiddenClass="qr-hide",//隐藏class name
				_classRight="qr-right",
				_classError="qr-error",
				_classLoading="qr-loading",
				_classErrorInp="qr-inp-error";
			//填选项值
			this.val= /password/.test(_settings.name) ? function(){return _inp.val();} : function(){return $.trim(_inp.val());};
			this.passStatus=false;//是否通过验证
			this.reset=function(){
				_self.none();
				_self.passStatus=false;
				_self.val("");
			};
			//显示错误信息
			this.error=function(errorMsg){
				_self.passStatus=false;
				_inp.addClass(_hiddenClass);
				_info.val(errorMsg).removeClass(_hiddenClass)
				if(/^(password|m_password)$/.test(_settings.name)) _info.removeClass(tips.password["class"]).addClass(_classErrorInp);				
				_self.none();
				_chkHolder.addClass(_classError);
			};
			//显示正确
			this.right=function(){
				_self.passStatus=true;
				_info.addClass(_hiddenClass);			
				_inp.removeClass(_hiddenClass);
				_self.none();
				if(!/^(smscode|m_username)$/.test(_settings.name)) _chkHolder.addClass(_classRight);
			};
			//显示加载中
			this.loading=function(){
				_self.none();
				_chkHolder.addClass(_classLoading);	
			};
			//无提示icon
			this.none=function(){
				_chkHolder.removeClass([_classLoading,_classError,_classRight].join(" "));
			};			
			/*
			* 检查
			* callback:返回结果的回调函数callback的参数为是否通过验证
			*/
			this.chk=function(callback){
				if($.isFunction(_settings.focusCallBack)) _settings.focusCallBack();	
				_doing=true;
				_self.loading();
				var _dealResult=function(result){
					if(result!=true) _self.error(result);
					else _self.right();
					_doing=false;
					if($.isFunction(callback)) callback(_self.passStatus);
				};
				if(_settings.asy&&_self.passStatus) _dealResult(true);//异步项目的本身已验证成功无需再验证,减少请求服务器次数
				else if($.isFunction(_settings.rule)){
					//异步操作
					if(_settings.asy) _settings.rule(_self.val(),_dealResult);
					//没有异步操作
					else _dealResult(_settings.rule(_self.val()));
				}
			};			
			this.blur=function(chkCallBack){
				_inp.trigger("blur",{"chkCallBack":chkCallBack});
			};
			this.passWordTips=function(){
				_inp.addClass(_hiddenClass);
				_info.val(tips.password.txt)
						.addClass(tips.password["class"])
						.removeClass(_hiddenClass)
						.removeClass(_classErrorInp)
						.focus(function(){//第一次focus取消默认tips内容和tips class
								if(_inp.val()=="") _info.val("").removeClass(tips.password["class"]).addClass(_classErrorInp);								
						});
				_self.none();
			};
			switch(_settings.name){//special
				case "username"://用户名专用
					this.hiLine=function(){//闪烁效果
						//_inp.focus();
						var __time=4,
							__class="qr-hiLine",
							__timer=setInterval(function(){
									if(__time==0) clearInterval(__timer);
									else if(__time%2==0) _inp.addClass(__class);
									else _inp.removeClass(__class);
									__time--;
							},150),
							__tips="如 name@163.com";
						_inp.val(__tips)
							.focus(function(){//第一次focus取消默认tips内容和tips class
								if(_inp.val()==__tips) _inp.val("").removeClass(__class);
								_inp.unbind("focus");
							});
					};
					var _suggestDomain=new function(){
							var __self=this,
								__defaultHTML='<li class="title">请选择或继续输入...</li>',								
								__selfHolder=_holder.find("div>ul").html(__defaultHTML),//建议帐号容器								
								__currentIndex=0,//当前选择建议的索引位置
								__total=0,//建议数量
								__getCurrent=function(){
									return __selfHolder.children(":eq("+(__currentIndex+1)+")");
								},
								__hoverCurrent=function(){//高亮当前									
									__getCurrent().triggerHandler("mouseover");
								},
								__hideOnly=function(){
									__selfHolder.parent().hide();
								},
								__resetInpBlur=function(){//重置blur事件，脱焦点后选择当前选择并隐藏，加上本身inp的事件验证
									_resetBlur(function(){										
										if(__total>0) _inp.val(__getCurrent().text());
										__hideOnly();
									});
								};							
							this.show=function(){								
								__selfHolder.parent().show();
								__resetInpBlur();
							};							
							this.hide=function(){
								_bindBlur();
								__hideOnly();
							};
							this.clear=function(){
								__total=0;
								__currentIndex=0;
								__selfHolder.empty().html(__defaultHTML);
							};
							this.add=function(v){								
								++__total;
								var hoverClass="hover";
								$("<li>",{
									text:v,
									"class":(__total-1==__currentIndex)?hoverClass:"",
									index:__total-1,
									click:function(e){
										_inp.val($(this).text());
										__self.hide();
										_self.blur();									
									}
								}).hover(function(){									
									__currentIndex=parseInt($(this).attr("index"));
									__selfHolder.children().removeClass(hoverClass);
									$(this).addClass(hoverClass);
								}).appendTo(__selfHolder);
							};
							this.down=function(){
								if(__total>1){
									__currentIndex=(__currentIndex==__total-1)?0:__currentIndex+1;
									__hoverCurrent();									
								}
								__resetInpBlur();
							};
							this.up=function(){
								if(__total>1){
									__currentIndex=(__currentIndex==0)?__total-1:__currentIndex-1;
									__hoverCurrent();									
								}
								__resetInpBlur();
							};
						};
					_inp.keyup(function(e){//键盘输入
						switch(e.which){
							case 38://上
								_suggestDomain.up();	
								break;
							case 40://下
								_suggestDomain.down();
								break;
							default://other word
								_suggestDomain.clear();
								var _v=$(this).val(),									
									_matchTotal=0;
								if(_v!=""){
									//var _m=_v.match(/^([\w-\.]+)@([^$]*)/);
									var _m=_v.match(/^([^@]+)@([^$]*)/);
									if(_m){
										var _typeDomain=_m[2].toLowerCase();
										for(var domain in mailDomain){
											if(domain.indexOf(_typeDomain)==0&&++_matchTotal<maxDomain){
												_suggestDomain.add(_m[1]+"@"+domain);
											}
										}
									}
									else{
										for(var domain in mailDomain){
											if(++_matchTotal<maxDomain){
												_suggestDomain.add(_v+"@"+domain);
											}								
										}
									}
								}
								if(_matchTotal==0) _suggestDomain.hide();
								else _suggestDomain.show();								
								break;
						}
					})
					.val(tips.username.txt)
					.addClass(tips.username["class"])
					.focus(function(){//第一次focus取消默认tips内容和tips class
						if(_inp.val()==tips.username.txt) _inp.val("").removeClass(tips.username["class"]);
						_inp.unbind("focus");
					});
					break;
				case "password":										
					this.passWordTips();
					break;
				case "m_password":										
					this.passWordTips();
					break;
				case "captcha"://验证码专用
					var _captchaHolder=_holder.find("span");//验证码容器
					this.showCaptchaLoading=function(){
						_captchaHolder.empty().show();
					};
					this.showCaptcha=function(img){
						_captchaHolder.append(img);
					};
					this.hideCaptcha=function(){
						_captchaHolder.empty().hide();
					};
					break;
				case "m_username"://手机帐号
					_inp.val(tips.m_username.txt)
					.addClass(tips.m_username["class"])
					.focus(function(){//第一次focus取消默认tips内容和tips class
						if(_inp.val()==tips.m_username.txt) _inp.val("").removeClass(tips.m_username["class"]);
						_inp.unbind("focus");
					});
					break;
			}
			/*
			*bind event
			*/
			//(function(){
				if(_settings.asy) _inp.keyup(function(){_self.passStatus=false;});//异步项目每次输入需重新检查
				_bindBlur();
				if($.isFunction(_settings.focusCallBack)) _inp.focus(_settings.focusCallBack);				
				_info.focus(function(){
					_self.none();
					_inp.removeClass(_hiddenClass).trigger("focus");
					_info.addClass(_hiddenClass);			
				});
			//})();
		},
		/*
		* 所在填选项对象
		*/
		Items=function(names,form,focusCallBack){
			var _self=this,				
				_data={},				
				_chkDoing=false,
				_total=names.length,//total item
				_focusCallBack=focusCallBack,
				_form=form;			
			this.get=function(name){				
				return _data[name];
			};
			this.blur=function(name){
				_self.get(name).blur();
			};
			this.getVal=function(name){				
				return _self.get(name).val();
			};
			//清除
			this.clear=function(){
				_total=0;
				_data={};
			};
			/*
			*检查全部填选项
			*参数callback
			*/
			this.chkAll=function(allPassCallback,notPassCallBack){
				if(!_chkDoing){
					_chkDoing=true;
					var passTotal=0,//通过项目数量
						chkTotal=0;//检查次数
					for(var name in _data){						
						_self.get(name).blur(function(pass){
							++chkTotal;
							if(pass) ++passTotal;
							if(chkTotal==_total) {
								_chkDoing=false;
								passTotal==_total? allPassCallback():notPassCallBack();
							}							
						});
					}
				}
			};
			/*
			 * 获取全部项目的值集合
			 */
			this.getItemVals=function(){
				var result={};
				for(var name in _data){
					if(!/repassword/.test(name))//dont send repassword
						result[name]=/^(password|activityid1|activityid2)$/.test(name)?encodeURIComponent(encodeURIComponent(_self.getVal(name))):_self.getVal(name);
				}				
				return result;
			};
			this.reset=function(){
				_form[0].reset();
				for(var name in _data){					
					_data[name].reset();
				}
			};
			for(var i=0,l=names.length;i<l;i++){				
				var _name=names[i].name,
					data=allItemRule[_name];				
				data["name"]=_name;
				data["form"]=_form;
				if($.isFunction(_focusCallBack)) data["focusCallBack"]=_focusCallBack;
				_data[_name]=new Item(data);
			}
		},
		/*
		 * 全部选填项集合,主要结合tab切换
		 * data:{holderName:items}
		 */
		ALLITEMS=function(data){
			var _self=this,
				_data=[],
				_UA=[],//用户帐号名称:username|m_username
				_activeIndex=settings.activeIndex,//默认显示的form			
				_tab=$("<ul class=qr-tab>").appendTo(holder),//tab标签
				_tabs=[],//标签数组集合
				_regType=[],//注册类型集合1:邮箱注册;2:手机号码注册
				_tabCurrentClass="qr-tab-current",				
				_display=function(_index){
					_activeIndex=_index;
					_self.currentItems=_data[_activeIndex].items;
					for(var i=0,l=_data.length;i<l;i++){
						if(i!=_activeIndex){
							_data[i].form.hide();
							_tabs[i].removeClass(_tabCurrentClass);
						}
					}
					_data[_activeIndex].form.show();
					_tabs[_activeIndex].addClass(_tabCurrentClass);
				};
			this.getCurrentRegType=function(){//获取当前注册类型 1:邮箱注册;2:手机号码注册
				return _regType[_activeIndex];
			};
			this.currentItems=null;//当前选项集
			this.getCurrentUA=function(){//获取当前用户名：手机号码或邮箱
				return _UA[_activeIndex].name;
			};
			this.getForm=function(){
				return _data[_activeIndex].form;
			};
			/*
			this.getItems=function(){
				return _data[_activeIndex].items;
			};*/	
			this.active=function(tabTxt){//激活
				for(var i=0,l=_tabs.length;i<l;i++){
					if(_tabs[i].text()==tabTxt){
						_display(i);
						break;
					}						
				}
			};		
			for(var i=0,l=data.length;i<l;i++){
				//额外项
				var _ac=settings.activity;				
				for(var j=0,k=_ac.length;j<k&&j<2;j++){
					var _name="activityid"+(j+1);
					data[i].names.push({"cn":_ac[j].name,"name":_name,"defaultValue":_ac[j].defaultValue});
					allItemRule[_name]={"rule":_ac[j].rule};
				}
				
				_UA.push(data[i].names[0]);
				_regType.push(data[i].regType);
				(function(){
					var __index=i;
					_tabs[i]=$("<li>",{						
								text:data[i].tabName,
								"class":("qr-tab-"+(i+1))+(_activeIndex==i?" "+_tabCurrentClass:"")
							}).appendTo(_tab)
							.click(function(){
								stats.touch();
								_display(__index);																	
							}).appendTo(_tab);
				})();
				var _form=render_and_getForm(data[i].names,i),
					_items=$.isFunction(data[i].focusCallBack)?new Items(data[i].names,_form,data[i].focusCallBack):new Items(data[i].names,_form);
				if(i==_activeIndex) _self.currentItems=_items;
				else _form.hide();
				//表达提交
				_form.submit({regCallback:data[i].regCallBack},function(e){
					stats.touch();
					if(!promark){					
						alert("注册失败，请联系客服。[1]");
						return;
					}
					else if(!$(e.target).find("input[name=agree]").is(":checked")){
						alert("必须接受服务条款才能注册。");
						return;
					}
					if(submit_doing) return;
					submit_doing=true;
					allItems.currentItems.chkAll(function(){
						submitFn(allItems.currentItems.getItemVals(),e.data.regCallback);
					},function(){
						submit_doing=false;
					});					
				});
				holder.append(_form);
				_data.push({"items":_items,"form":_form});
			}	
		},
		allItems=null;//全部填项		
	holder.empty();//clear 
	/*
	* 类型
	* type: 1:需要验证码;2:不需要验证码
	*/
	switch(settings.type){
	  case 1://需要验证码		  
		  	var captcha=new Captcha(),
		  		loadCaptcha=function(){			
				  var _o=allItems.currentItems.get("captcha"),
					  _clickFn=arguments.callee;				  
				  _o.showCaptchaLoading();
				  captcha.load(false,function(img){
					  img.click(_clickFn);
					  _o.showCaptcha(img);		
				  });
			  };
			allItems=new ALLITEMS([{
				tabName:"邮箱注册",
				names:[{cn:"邮件地址",name:"username"},{cn:"设置密码",name:"password"},{cn:"确认密码",name:"repassword"},{cn:"验证码",name:"captcha"}],
				focusCallBack:function(){
					stats.touch();
					ot.firstStart();
					if(!captcha.has&&!captcha.doing) loadCaptcha();
				},
				regCallBack:function(success,is163Mail){
					if(success) {
						captcha.has=false;
						allItems.currentItems.get("captcha").hideCaptcha();
						stats.run(is163Mail?100:101);
						log(2,is163Mail?1:0);						
					}
				},
				regType:1
			},
			{
				tabName:"手机注册",
				names:[{cn:"手机号码",name:"m_username"},{cn:"验证码",name:"smscode"},{cn:"设置密码",name:"m_password"},{cn:"确认密码",name:"m_repassword"}],				
				regType:2,
				regCallBack:function(success){
					if(success) {
						stats.run(200);
						log(1,1);					
					}
				}
			}
			]);			  
		  break;	 
	  case 2://不需要验证码
		  allItems=new ALLITEMS([{
				  tabName:"邮箱注册",
				  names:[{cn:"邮件地址",name:"username"},{cn:"设置密码",name:"password"},{cn:"确认密码",name:"repassword"}],
				  focusCallBack:function(){
					stats.touch();
					ot.firstStart();
				  	ID.load();
				  },
				  regCallBack:function(success,is163Mail){
					if(success) {
						stats.run(is163Mail?100:101);
						log(2,is163Mail?1:0);						
					}
				  },
				  regType:1
			  },			              
	          {
				  tabName:"手机注册",
				  names:[{cn:"手机号码",name:"m_username"},{cn:"验证码",name:"smscode"},{cn:"设置密码",name:"m_password"},{cn:"确认密码",name:"m_repassword"}],
			  	  regType:2,
				  regCallBack:function(success){
					if(success) {
						log(1,1);
						stats.run(200);
					}
				  }
			  }
			]);
		  break;
	}
	stats.run(1);
};