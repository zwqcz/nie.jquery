nie.util.captcha=nie.util.captcha||{
	id:{},
	create:function(obj){
		var o={
				id:null,
				progress:0,				
				loadClass:"NIE-captchaBox-loading",
				showCaptcha:false,
				$img:function(){
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
				},
				loadCapImg:function(){					
					var img=o.$img();
					img.click(function(){
						o.progress=0;
						o.loadCaptcha();								
					})
					.load(function(){
						o.progress=0;
						$(this).appendTo(o.captchaBox);
					})
					.error(function(){
						o.captchaBox.removeClass(o.loadClass).text("刷新过多，请稍候");
					})
					.attr({
						"src":o.getRemoteURL({					
							file:"captcha",
							params:{id:o.id}
						}),
						"width":o.width,
						"height":o.height
					});
				},
				loadCaptcha:function(){
					if(o.progress==0){						
						o.captchaBox.empty();
						o.progress=1;
						if(!o.showCaptcha){
							o.showCaptcha=true;
							o.captchaBox.addClass(o.loadClass);							
							o.getRemote({
								file:"IdCreator",
								callBack:function(){
									o.id=nie.util.captcha.id[o.appID];
									o.loadCapImg();
								}
							});
						}
						else{
							o.loadCapImg();
						}
					}
				},
				bindParams:function(dict){
					var result=[];
					for(var i in dict){
						result.push(i+"="+dict[i]);
					}
					return result.join("&");
				},
				getRemoteURL:function(obj){
					var serverPath="http://captcha.nie.163.com/",
					default_params={"appID":o.appID,
									"ts":new Date().getTime()};
					if(obj.params){
						for(var i in obj.params){
							default_params[i]=obj.params[i];
						}
					}
					return serverPath+obj.file+"?"+o.bindParams(default_params)+"&.js";
				},
				getRemote:function(obj){					
					$.include(o.getRemoteURL(obj),obj.callBack);
				}
		};
		o.init=function(){			
			if(o.fatDOM&&o.touchDOM&&o.appID){
				o.width=o.width||150;
				o.height=o.height||45;
				o.fatDOM=$(o.fatDOM);			
				o.captchaBox=o.fatDOM.find(".NIE-captchaBox");
				o.captchaInput=o.fatDOM.find("input[name=NIE-captchaInput]")
				o.touchDOM=$(o.touchDOM);
				o.touchDOM.focusin(function(){
					if(!o.showCaptcha){
						o.loadCaptcha();
					}
				});
			}
		};
		return o;
	}
};