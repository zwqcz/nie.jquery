/*
var gameKey=nie.util.gameKey.create();
		//gameKey.appID=3;//默认值3
		gameKey.fatDOM="form";
		gameKey.touchDOM="form";
		gameKey.pid=1;//激活码项目id
	gameKey.callBack=function(result){
			alert(result.success+":"+result.msg);
		}
		gameKey.init();
*/
nie.util.gameKey=nie.util.gameKey||{
	created:0,
	result:{},
	create:function(){
		var o={
				resultIndex:nie.util.gameKey.created,
				captcha:null,
				appID:null,
				fatDOM:null,
				touchDOM:null,
				callBack:null,
				pid:null
			};
		o.init=function(){
			if(o.fatDOM&&o.touchDOM&&o.pid){				
				nie.util.gameKey.created+=1;
				nie.util.gameKey.result[o.resultIndex]=null;
				o.captcha=nie.util.captcha.create();
				o.captcha.appID=o.appID||3;
				o.captcha.fatDOM=o.fatDOM;
				o.captcha.touchDOM=o.touchDOM;				
				o.captcha.init();				
				$(o.captcha.fatDOM).submit(function(){				
					var str_params=o.captcha.bindParams({
							mobile:o.captcha.fatDOM.find("input[name=NIE-gameKey-tel]").val(),
							capVal:o.captcha.captchaInput.val(),
							id:o.captcha.id,
							pid:o.pid,
							ri:o.resultIndex
						});				
					$.include("http://api.ku.163.com/app/gameKey/sms?"+str_params+"&.js",function(){						
						var result=nie.util.gameKey.result[o.resultIndex];
						if(typeof o.callBack =="function"){							
							o.callBack(result);
						}
						else{
							alert(result.msg);
						}
						o.captcha.loadCaptcha();
					});
				});
			}
		}
		return o;
	}
};