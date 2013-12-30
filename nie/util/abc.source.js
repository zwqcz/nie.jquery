/*
广告
nie.util.abc({
	"promark":"",//广告更新器promark
	"callBack":"",//获取广告更新器后，异步调用
	"type":"js"//更新器类型，暂时有js
});
*/
nie.util.abc=nie.util.abc||function(options){
	var params=["promark","callBack","type"];
	for (var i=0,l=params.length;i<l;i++ ){
		if(typeof(options[params[i]) =="undefined") return;
	}
	switch(options.type){
		case "js":
			$.include("http://webdog.nie.163.com/abc/updater/"+options.promark,$(callBack));
			break;
	}

}