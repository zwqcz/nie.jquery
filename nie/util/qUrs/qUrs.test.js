nie.util.qUrs=nie.util.qUrs||function(options){
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
	this.showMsg=function(data){		
		if(typeof data=="object"){
			var _holderName="";
			if(data.reVer) _holderName="reVer";
			else if(data.success) _holderName=(data.regType==1)?(data.is163Mail?"is163":"not163"):"mobile";
			else _holderName="error";
			layer.create(_holderName);			
			layer[_holderName].show(data);			
		}
	};	
	var self=this,
		defaults={
			"holder":"div.NIE-quickReg",
			"type":1,//类别 1:需要验证码;2:不需要验证码;3:手机注册
			"loginFn":null,//游戏登录：用在检查用户名存在的时候调用，方便web游戏
			"regComplete":self.showMsg,//注册返回信息完成,
			"msgType":1//信息类别 1:弹框(默认);2:切换层(iframe专用)
		},		
		settings = $.extend({}, defaults, options);
	this.holder=$(settings.holder).find("p.NIE-quickReg-loading").hide();//隐藏loading	
	var serverPath="http://weburs.ku.163.com/quickReg/",
		promark=self.holder.find("input[name=promark]").val(),
		id=null,
		ot=new function(){//注册耗时
			var _self=this,
				_hasGot=false,
				_val=0,
				_now=function(){return new Date().getTime();};
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
		 * 渲染结构
		 * namesData:[{cn:"邮箱帐号",name:"username",...}]
		 */
		render_and_getForm=function(namesData){			
			var _getItemHTML=function(index,nameData){
					var _plusCode="";
					if(nameData.name=="captcha") _plusCode='<span class="captcha-wrap hideItem loading"></span>';
					else if(nameData.name=="username") _plusCode='<div class=suggestDomain><ul></ul></div>';
					else if(nameData.name=="smscode") {
						_gotSmsCode=true;
						_plusCode='<input type="button" class="qr-smscode-btn" value="获取验证码"/>';						
					}
					return ('<dt class="qr-$name">$cn：</dt>\
							<dd class="qr-$name">\
							<ul>\
								<li class="qrCon">\
									<input class="qr-$name-inp qrInpTxt" type="'+(/password/.test(nameData.name)?"password":"text")+'" name="$name" autocomplete="off" tabindex="$index$rand" />\
									<input rel="$name" class="qr-$name-inp qrError qrHide" readonly="readonly" tabindex="$index$rand" />'
									+_plusCode+									
								'</li>\
								<li class="qrChk"><i class=right></i><i class=error></i><i class=loading></i></li>\
							</ul>\
							</dd>').replace(/\$index/g,index).replace(/\$name/g,nameData.name).replace(/\$cn/g,nameData.cn);
				},
				_plusTemp='<dt class="qr-agree"><input id="qr-agree$rand" name="agree" type="checkbox" checked="checked" /></dt>\
						<dd class="qr-agree">\
						<label for="qr-agree$rand">我同意"<a href="http://reg.163.com/agreement.shtml" target="_blank">服务条款</a>"和<br />"<a href="http://reg.163.com/agreement_game.shtml" target="_blank">隐私保护和个人信息利用政策</a>"</label>\
						</dd>\
						<dt class="qr-submit"></dt>\
						<dd class="qr-submit"><input class="arSubmitInp" type="submit" tabindex="$index$rand"  onmouseover="this.className=\'arSubmitInp arSubmitInp2\'" onmouseout="this.className=\'arSubmitInp\'" value=""/></dd>',
				_html="",
				_index=0,
				_gotSmsCode=false,
				_form=$('<form onsubmit="return false;">');
			for(var i=0,l=namesData.length;i<l;i++){		
				_html+=_getItemHTML(++_index,namesData[i]);
			}
			_form.html(("<dl>"+_html+_plusTemp.replace("$index",_index+1)+"</dl>").replace(/\$rand/g,new Date().getTime()));			
			if(_gotSmsCode) {//获取手机验证码
				_form.find("input.qr-smscode-btn").click(function(){
					allItems.currentItems.get("smscode").none();
					var __self=$(this).attr("disabled","disabled"),
						__total=61,
						__org_val=__self.val();
					allItems.currentItems.get("m_username").chk(function(pass){						
						if(pass) remote("sendMobileCaptcha",{"m_username":allItems.currentItems.getVal("m_username")},function(json){										
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
											layer.create("error");
											layer.error.show(json);
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
										break;
									case 200:
										if(is163Email){											
											result="该帐号可直接登录游戏";
											if($.isFunction(settings.loginFn)) settings.loginFn();															
										}
										else{
											result = "该邮件地址已被注册";
											unionStats(false);
										}
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
						return (/^(13|14|15|18)\d{9}$/.test(val))?true:"请正确输入手机号码";
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
				"not163":{w:460,h:250},//外域框
				"is163":{w:250,h:150},//163邮箱框
				"reVer":{w:240,h:230},//二次验证
				"error":{w:280,h:160},//错误
				"mobile":{w:350,h:190}//手机帐号注册成功
			},
			is163:null,//163邮箱框容器
			not163:null,//外域容器
			error:null,//错误容器
			reVer:null,//二次验证容器
			mobile:null,//手机帐号注册成功
			bg:null,//背景容器			
			create:function(holderName){//holderName: not163|is163|reVer|error
				var body =$(document.body);
				if(!layer[holderName]){
					layer[holderName]=new function(){
						var _self=this,
							_getCloseBtn=function(txt,className){
								return $("<a>",{
									text:txt,
									"class":className,
									href:"javascript:void(0);",
									click:function(){_self.hide();}
								});
							},							
							_selfConHolder=$("<div>",{"class":"NIE-quickReg-msg-con "+{"error":holderName,"is163":"right","reVer":holderName,"not163":"not163Mail","mobile":"mobileMail"}[holderName]}),//内容容器
							_size=layer.size[holderName];
						if(settings.msgType==1){
							var _selfHolder=$("<div>",{
									"class":"NIE-quickReg-msg",
									html:"<div class=NIE-quickReg-msg-title>注册游戏帐号</div>"								
								}).append(_getCloseBtn("X","NIE-quickReg-closeBtn")),
								_display=function(selfConHolderHTML,appendToSelfConHolder){//显示
									_selfConHolder.empty().html(selfConHolderHTML);
									if(appendToSelfConHolder) _selfConHolder.append(appendToSelfConHolder);
									layer.bg.show();//show bg layer
									var win=$(window);			
									_selfHolder
									.css({
										width:_size.w,
										height:_size.h,
										top:(win.height()-_size.h)/2,
										left:(win.width()-_size.w)/2
									})
									.append(_selfConHolder)								
									.show();								
									win=null;									
								};								
							this.hide=function(){				
								_selfHolder.hide();
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
									_display('<p class="info">注册成功！</p><a href="'+json.url+'" target="_blank" class="btn">确 认</a>');
								};
								break;							
							case "not163":
								this.show=function(json){																		
									_display('<h1>感谢注册！请立即激活帐号。</h1>\
											<h3>请您登录邮箱 <b>'+json.username+'</b> 根据确认邮件操作即可。</h3>\
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
									_selfConHolder.find("a.sendMailBtn").click(function(){										
										remote("sendActiveMail",{userName:json.username},function(json){											
											if(json.status&&json.info) alert(json.info);
										});												
									});
									_selfConHolder.find("a.reReg").click(function(){
										_self.hide();
									});
								};
								break;
							case "mobile":
								this.show=function(json){
									_display('<h1>注册成功！</h1>\
											<h2>您的网易通行证为<b>'+json.m_username+'</b><h2>\
											<h3>自动为您分配了一个邮箱帐号：<br>'+json.username+'</h3>\
											<p><a href="'+json.url+'" target="_blank" class="btn">确 认</a></p>');
								};
								break;
							case "error":
								this.show=function(json){
									var resultHTML=(allItems.getCurrentRegType()==2&&json.status==421)?'号码已被注册或与原有账号关联，请直接登录或<a rel="emailReg" href="javascript:void(0);">邮箱注册</a>。':json.msg;									
									_display('<p class=info>出错了！</p><p class=reason>'+resultHTML+"</p>",_getCloseBtn("确认","btn"));
									resultHTML=null;
									_selfConHolder.find("a[rel=emailReg]").click(function(){
										allItems.active("邮箱注册");
										_self.hide();
									});									
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
						}						
						_selfHolder.appendTo(body);
					};
					if(settings.msgType==1&&!layer.bg) layer.bg=new function(){
						var _selfHolder=$("<div>",{"class":"NIE-quickReg-msg-bg"}).appendTo(body);
						this.show=function(){
							var doc=$(document);
							_selfHolder.css({width:doc.width(),height:doc.height()}).show();
							doc=null;
						};
						this.hide=function(){
							_selfHolder.hide();
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
	    },
	    maxDomain=5,
		tips={
			username:{
				"txt":"如 name@example.com",
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
					if(_success) {		
						unionStats(json.is163Mail);//网盟统计
						allItems.currentItems.reset();											
					}
					else{
						switch(json.num){
							case 2://验证码错误
								if(allItems.currentItems.get("captcha")){
									loadCaptcha();//request captcha again
									allItems.currentItems.get("captcha").none();//clear tips icon
								}
								break;
							case 107://需要二次验证码
								_reVer=true;
								break;
						}			
					}				
					if($.isFunction(callback)) callback();					
					if($.isFunction(settings.regComplete)) settings.regComplete({
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
					if($.isFunction(callback)) callback();					
					if($.isFunction(settings.regComplete)) settings.regComplete({
						regType:_regType,
						success:json.success,
						msg:json.msg,
						status:json.status,
						url:json.reDirectUrl?((json.reDirectUrl.indexOf("?")==-1?json.reDirectUrl+"?":json.reDirectUrl+"&")+"username="+json.UA):"",							
						username:json.UA,//主帐号
						m_username:json.mUA//手机帐号
					});
					submit_doing=false;
				},true);
			}
		},
		/*
		* 检查163帐号
		* 返回结果:true|error msg
		*/
		chk163UserName=function(val){
		  var result=true,
			  tmp=(settings.type==2)?null:'字母开头，6到18个字符。包括字母、数字、下划线';
		  if (!/^[a-z]/i.test(val)) result = tmp?tmp:"请输入字母开头";			
		  else if (/[^a-z\d]$/i.test(val)) result =tmp?tmp: "请输入字母或数字结尾";
		  else if (/[^a-z\d_]/i.test(val)) result = tmp?tmp:"请输入字母、数字、下划线";
		  else if (!/^[a-z\d_]{6,18}$/i.test(val)) result =tmp?tmp: "请输入6到18个字符";
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
				url : (file=="submit"?"https://reg.nie.163.com/web/quick/":serverPath)+file+"?"+getBindParams($.extend({"promark":promark,"id":id,"output":"json"},params)), //跨域请求的URL
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
			var _self=this;
			this.got=false;
			this.load=function(callback){
				if(!_self.got)
					remote("IdCreator",{},function(json){
						id=json.id;
						_self.got=true;
						if($.isFunction(callback)) callback();
					});
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
				_hiddenClass="qrHide",//隐藏class name
				_chkHolder=_holder.find("li.qrChk"),//检查icon容器
				_resetBlur=function(plusFn){				
					_unbindBlur();
					_bindBlur(plusFn);
				},
				_bindBlur=function(plusFn){
					_inp.blur({f:plusFn},function(e){
						if($.isFunction(e.data.f)) e.data.f();						
						_self.none();
						_self.chk();			
					});
				},
				_unbindBlur=function(){
					_inp.unbind("blur");
				},
				_inp=_holder.find("input[name="+_settings.name+"]"),							
				_info=_holder.find("input[rel="+_settings.name+"]");
			switch(_settings.name){//special
				case "username"://用户名专用
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
								_self.passStatus=false;
								_suggestDomain.clear();
								var _v=$(this).val(),									
									_matchTotal=0;
								if(_v!=""){
									var _m=_v.match(/^([\w-\.]+)@([^$]*)/);
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
				case "captcha"://验证码专用
					var _captchaHolder=_holder.find("span");//验证码容器
					this.showCaptchaLoading=function(){
						_captchaHolder.empty().show();
					};
					this.showCaptcha=function(img){
						_captchaHolder.append(img);
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
				_info.val(errorMsg).removeClass(_hiddenClass);				
				_self.none();
				_chkHolder.addClass("error");
			};
			//显示正确
			this.right=function(){
				_self.passStatus=true;
				_info.addClass(_hiddenClass);			
				_inp.removeClass(_hiddenClass);
				_self.none();
				if(_settings.name!="smscode")_chkHolder.addClass("right");
			};
			//显示加载中
			this.loading=function(){
				_self.none();
				_chkHolder.addClass("loading");	
			};
			//无提示icon
			this.none=function(){
				_chkHolder.removeClass("loading error right");
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
			this.blur=function(){
				_inp.triggerHandler("blur");
			};
			/*
			*bind event
			*/
			//(function(){
				_bindBlur();				
				if($.isFunction(_settings.focusCallBack)) _inp.focus(_settings.focusCallBack);				
				_info.focus(function(e){
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
						_self.get(name).chk(function(pass){
							if(++chkTotal==_total) _chkDoing=false;
							if(++passTotal==_total) pass?allPassCallback():notPassCallBack();
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
		ALLITEMS=function(qUrs,data){
			var _self=this,
				_data=[],
				_UA=[],//用户帐号名称:username|m_username
				_activeIndex=0,//默认显示的form			
				_tab=$("<ul class=qr-tab>").appendTo(qUrs.holder),//tab标签
				_tabs=[],//标签数组集合
				_regType=[],//注册类型集合1:邮箱注册;2:手机号码注册
				_tabCurrentClass="qr-tab-current",
				_time=180,
				_timer=null,//tab切换定时器
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
			this.getItems=function(){
				return _data[_activeIndex].items;
			};	
			this.active=function(tabTxt){//激活
				for(var i=0,l=_tabs.length;i<l;i++){
					if(_tabs[i].text()==tabTxt){
						_display(i);
						break;
					}						
				}
			};
			for(var i=0,l=data.length;i<l;i++){
				_UA.push(data[i].names[0]);
				_regType.push(data[i].regType);
				(function(){
					var __index=i,
						__over=false;
					_tabs[i]=$("<li>",{						
								text:data[i].tabName,
								"class":_activeIndex==i?_tabCurrentClass:""
							}).appendTo(_tab)
							.hover(function(){
								__over=true;
								clearTimeout(_timer);						
								_timer=setTimeout(function(){
									if(__over) _display(__index);
								},_time);						
							},function(){
								__over=false;
								clearTimeout(_timer);
							}).appendTo(_tab);
				})();
				var _form=render_and_getForm(data[i].names),
					_items=$.isFunction(data[i].focusCallBack)?new Items(data[i].names,_form,data[i].focusCallBack):new Items(data[i].names,_form);				
				if(i==_activeIndex) _self.currentItems=_items;
				else _form.hide();
				//表达提交
				_form.submit(function(e){					
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
						submitFn(allItems.currentItems.getItemVals());
					},function(){
						submit_doing=false;
					});					
				});
				qUrs.holder.append(_form);
				_data.push({"items":_items,"form":_form});
			}			
		},
		allItems=null;//全部填项	
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
			allItems=new ALLITEMS(self,[{
				tabName:"邮箱注册",
				names:[{cn:"邮件地址",name:"username"},{cn:"设置密码",name:"password"},{cn:"确认密码",name:"repassword"},{cn:"验证码",name:"captcha"}],
				focusCallBack:function(){
					ot.firstStart();
					if(!captcha.has&&!captcha.doing) loadCaptcha();
				},
				regType:1
			},
			{
				tabName:"手机注册",
				names:[{cn:"手机号码",name:"m_username"},{cn:"验证码",name:"smscode"},{cn:"设置密码",name:"m_password"},{cn:"确认密码",name:"m_repassword"}],				
				regType:2
			}
			]);			  
		  break;	 
	  case 2://不需要验证码
		  allItems=new ALLITEMS(self,[{
				  tabName:"邮箱注册",
				  names:[{cn:"邮件地址",name:"username"},{cn:"设置密码",name:"password"},{cn:"确认密码",name:"repassword"}],
				  focusCallBack:function(){
					ot.firstStart();
				  	ID.load();
				  },
				  regType:1
			  },			              
	          {
				  tabName:"手机注册",
				  names:[{cn:"手机号码",name:"m_username"},{cn:"验证码",name:"smscode"},{cn:"设置密码",name:"m_password"},{cn:"确认密码",name:"m_repassword"}],
			  	  regType:2
			  }
			]);
		  break;
	}
};

