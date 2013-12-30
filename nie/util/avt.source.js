/**
* 激活组件使用说明 
* //1.html/css/js参考http://lj.163.com/jihuo/index.html
	HTML Structure:
		<div class="NIE-avt">
			<dl>
				<dt><label>网易通行证</label></dt>
				<dd>
					<span class="inp">
						<span class="inp-res" tabindex="1"></span>
						<input type="text" class="inpTxt ursIni" id="urs" autocomplete="off" tabindex="1">
					</span>
					<span class="tip"><a class="quickreg" target="_blank" href="http://reg.163.com/reg/reg0_new.jsp">15秒轻松注册</a></span>
				</dd>
				
				<dt><label>重复通行证</label></dt>
				<dd>
					<span class="inp">
						<span class="inp-res inp-err" tabindex="2"></span>
						<input type="text" class="inpTxt ursIni" id="urs_a" value="" autocomplete="off" tabindex="2">
					</span>
					<span class="tip"></span>
				</dd>
				
				<dt><label>激活码</label></dt>
				<dd>
					<span class="inp">
						<span class="inp-res inp-err" tabindex="3"></span>
						<input type="text" class="inpTxt" id="activate_code" value="" tabindex="3">
					</span>
					<span class="tip">激活码前两位为字母，之后均为数字，输入时请包括“-”</span>
				</dd>
				
				<dt><label>手机号码</label></dt>
				<dd>
					<span class="inp">
						<span class="inp-res inp-err" tabindex="4"></span>
						<input type="text" class="inpTxt" id="mobile" value="" tabindex="4">
					</span>
					<span class="tip"></span>
				</dd>
			</dl>
			<p class="NIE-avt-added">还没有邮箱地址？<a target="_blank" href="http://reg.163.com/reg/reg0_new.jsp">15秒轻松注册</a></p>
			<p class="NIE-avt-added"><input class="button NIE-avt-submit" type="submit" value="立即激活" tabindex="5"></p>
			<div id="NIE-avt-msg"></div>
		</div>

* 使用说明 
* 2.引用nie.util.Avt;
* var Avt = nie.util.Avt;

* 3.自定义设置
* 
 * 对话框 *
 1.有三种对话框的样式和结构（Avt.SuccessView, Avt.ErrorView, Avt.ProgressingBar）;
 2.对话框默认会覆盖整个激活组件区域;
 3.可以重写对话框的结构和行为：
	 重写对话框的方式有两种，如果仅仅是显示不需要js交互可以直接写html，例如：
		Avt.SuccessView = '<div class="success">激活成功</div>';
	 
	 如果需要交互，可以使用DialogView.extend扩展:
	 1.必须有onCreate函数，默认生成对话框时会执行这个函数；
	 2.必须将html DOM的根节点负值给this.el;
 
	 代码如下：

		//重写激活成功对话框
		Avt.SuccessView = Avt.DialogView.extend({
			onCreate:function(eParent){
				this.el = $('<div class="successview"><p><a style="cursor:pointer;">立刻下载客户端体验《龙剑》</a></p></div>');
				var eDialogView = this.el;
				this.el.find('a').click(function(){
					displayBoard(1);
					eDialogView.parent().hide();
					eDialogView=null;
				});
			}
		});

		//重写错误提示对话框
		Avt.ErrorView = Avt.DialogView.extend({
			onCreate:function(){
				
			}
		});

		//重写等待对话框
		Avt.ProgressingBar = Avt.DialogView.extend({
			onCreate:function(){
				
			}
		});



* 4.初始化激活组件
* Avt.create({
* 	element : ".NIE-avt", //base class name
* 	baseUrl : 'http://app.nie.163.com/game_active/app/active', //接口地址
* 	gameid : 'ds' //游戏id
* });
**/
(function(){
			
	"use strict";
	
	function Avt(settings){
	
		var settings = {
			element : ".NIE-avt", /**base class name*/
			baseUrl : 'http://game-active.webapp.163.com/app/active', /**接口地址*/
			hasMobile : true, /**是否显示手机项*/
			gameid : ''
		}
		
		var messages = {
			'ArgErr':'参数格式错误',
			'UrsUnEqual':'两次输入的通行证不一致',
			'SysBusy':'系统繁忙，稍后再试',
			'NeedRegister':'尚未注册通行证',
			'MobileUrs':'手机邮箱，需要输入主账号',
			'UnExistentCode':'激活码不存在',
			'UsedCode':'激活码已经被用掉',
			'AccountActivated':'账号已激活过，无需再次激活',
			'DuplicateMobile':'该手机号已经激活账号，无法再次使用',
			'Success':'激活成功'
		}
		
		/**
		 * root element;
		 */
		var el = null;
		
		/**
		 * 工作繁忙提示
		 */
		var mProgressingDialog = null;
		
		/**
		 *消息对话框
		 */
		var mDialog = null;

		
		/**
		 * 验证函数组
		 */
		var inpValidateFunctions = {
		
			'urs':function(data){
				
				if(data.urs==''){
					return result(false,"通行证不能为空");
				}
				if(/^([0-9A-Za-z_\-\.])+@([0-9A-Za-z_\-\.])+$/.test(data.urs) == false){
					return result(false,"通行证格式错误");
				}
				return result(true);
			},
			
			'urs_a':function(data){
				if(data.urs!=data.urs_a){
					return result(false,"通行证输入不一致");
				}
				return result(true);
			},
			
			'activate_code' : function(data){
				if(data.activate_code==""){
					return result(false,"激活码不能为空");
				}
				return result(true);					
			},
			
			'mobile':function(data){
				if(data.mobile==""){
					return result(false,"手机号码不能为空");
				}
				if(/^1[0-9]{10}$/.test(data.mobile)==false){
					return result(false,"手机号码格式错误");
				}
				return result(true);
			}
		}
						
		//构造验证结果
		function result(status, message){
			return {
				'status':status,
				'message':message
			}
		}
		
		//显示验证结果
		function showResult(key,res){
			var thisElement = el.find('#'+key);
			thisElement.hide();
			thisElement.prev('.inp-res').addClass('inp-err').html(res.message).show();
		}
		
		//验证输入内容
		function validate(data){
			var res = null, retVal = true;
			for(var key in data){
				if(inpValidateFunctions[key]){
					res = inpValidateFunctions[key](data);
					if(!res.status){
						showResult(key,res);
						retVal = retVal && false;
					}
				}
			}
			return retVal;
		}
		
		//显示Progressing
		function startProgressing(){
			if(mProgressingDialog==null){
				mProgressingDialog = new Avt.Dialog.create(el);
				mProgressingDialog.setContent(Avt.ProgressingBar);
			}
			mProgressingDialog.show();
		}
		
		//隐藏Progressing
		function stopProgressing(){
			if(mProgressingDialog!=null)
				mProgressingDialog.hide();
		}
		
		function onKeyup(e){}

		function onBlur(e){
			var ele = e.target;
			setTimeout(function(){
				var validateMap = {};
				if(ele.id=='urs_a'){
					validateMap.urs = el.find('#urs').val();
				}
				validateMap[ele.id] = $(ele).val();
				validate(validateMap);
			},200);
		}
		
		function onChange(e){
			
		}
		
		function showDialog(res){
			if(mDialog == null){
				mDialog = new Avt.Dialog.create(el);
			}
			
			if(res.status){
				mDialog.setContent(new Avt.SuccessView());
				mDialog.show();
			}else{
				mDialog.setContent(new Avt.ErrorView(res.message));
				mDialog.show();
			}
		}
		
		function hideDialog(){
			if(mDialog!=null){
				mDialog.hide();
			}
		}
		
		function onSubmit(){
			
			if($.isFunction(settings.onSubmit)){
				if(!eval('('+settings.onSubmit.toString()+')();')){
					return;
				}
			}
			
			var data = {
				'urs':el.find('#urs').val(),
				'urs_a':el.find('#urs_a').val(),
				'activate_code':el.find('#activate_code').val(),
				'mobile':el.find('#mobile').val()
			};
			
			var valiResult = validate(data);
							
			if(!valiResult) return;
			
			startProgressing();
			
			$(this).attr('disabled','disabled');
			
			/*生成请求连接*/
			var url=settings.baseUrl+'?game={gameid}&urs={urs}&urs_a={urs_a}&activate_code={activate_code}&mobile={mobile}'
				.replace('{gameid}',settings.gameid)
				.replace("{urs}",data.urs)
				.replace("{urs_a}",data.urs_a)
				.replace("{activate_code}",data.activate_code)
				.replace("{mobile}",data.mobile);
				
			$.ajax({
				url:url,
				dataType:'jsonp'
			});
		}
		
		function callback(msg,code){
			stopProgressing();
			el.find(settings.element+"-submit").removeAttr('disabled');
			
			if($.isFunction(settings.callback)){
				if(!eval('('+settings.callback.toString()+')(msg);')){
					return;
				}
			}
			
			switch(code){
			case 'Success':
				showDialog(result(true));
				break;
			case 'UrsUnEqual':	
				showResult('urs_a',result(false,msg));
				break;
			case 'NeedRegister':
			case 'MobileUrs':
			case 'AccountActivated':
				showResult('urs',result(false,msg));
				break;
			case 'UnExistentCode':
			case 'UsedCode':
				showResult('activate_code', result(false, msg));
				break;
			case 'DuplicateMobile':
				showResult('mobile', result(false, msg));
				break;
			case 'SysBusy':
			case 'ArgErr':
			default:
				showDialog(result(false,msg));
				break;
			}
		}
		
		function onInput(e){
			$(e.target).hide();
			$(e.target).next('.inpTxt').show().focus();
		}
		
		this.onCreate = function(opts){
			$.extend(settings,opts);
			el = $(settings.element);
			el.find('.inpTxt').keyup(onKeyup).blur(onBlur);
			el.find(settings.element+"-submit").click(onSubmit);
			el.find('.inp-res').click(onInput).focus(function(e){
				$(e.target).next('.inpTxt').show().focus();
				$(e.target).hide();
			});
			window.func=callback;
		}
	
	}
	
	Avt.create = function(opts){
		var mAvt = new Avt();
		mAvt.onCreate(opts);
		return mAvt;
	}
	
	Avt.DialogView = function(){
		var proto = function(){
			this.el = null;
			this.getRootElement = function(){
				if($.isArray(this.el)){
					return this.el.get(0) || this.el[0];
				}
				return this.el;
			}
			this.onCreate.apply(this,arguments);
		}
		return proto;
	}
	
	Avt.DialogView.extend = function(o){
		var newProto = new Avt.DialogView();
		$.extend(newProto.prototype ,o);
		return newProto;
	}
	
	Avt.ProgressingBar = '<div class="progressingbar"></div>';
	
	Avt.SuccessView = '<div class="successview"></div>';
	
	Avt.ErrorView = Avt.DialogView.extend({
		onCreate:function(msg){
			var el = $('<div class="errorview"><p>{msg}</p><p><a>返回</a></p></div>'.replace('{msg}',msg));
			this.el = el;
			this.el.find('a').click(function(){
				el.parent().hide();
			});
		}
	});
	
	Avt.Dialog = function(){
		var id = 0;
		var parent = null;
		var el = null;
		var html = '<div class="dialog" id="dialog-{id}"></div>';
		
		this.onCreate = function(eParent){
			id = Avt.Dialog.id;
			parent = $(eParent);
			parent.append(html.replace("{id}",id));
			el = parent.find('#dialog-'+id);
		}
		
		this.getId = function(){
			return id;
		}
		
		this.show = function(){
			el.show();
		}
		
		this.hide = function(){
			el.hide();
		}
		
		this.setContent = function(view){
			if(typeof view == 'string'){
				el.html(view);
			}
			if(typeof view == 'function' || typeof view == 'object'){
				el.empty();
				el.append(view.getRootElement());
			}
		}
	}
	
	Avt.Dialog.id = 0;
	
	Avt.Dialog.create = function(eParent){
		Avt.Dialog.id++;
		var mDialog = new Avt.Dialog();
		mDialog.onCreate(eParent);
		return mDialog;
	}

	//创建命名空间
	if(!nie){nie={};}
	if(!nie.util){nie.util = {};}
	
	nie.util.Avt = Avt;

})(jQuery);