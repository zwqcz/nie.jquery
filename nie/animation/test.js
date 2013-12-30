nie.animation=nie.animation||new function(){
	var _getStyle=function(attr,val){
		return "-webkit-$attr:$val;\
				-moz-$attr:$val;\
				-o-$attr:$val;\
				$attr:$val;"
		.replace(/$attr/g,attr)
		.replace(/$val/g,val);
	};
	this.go=function(selector,options){
		var _dom=$(selector);
		if(typeof options=="object"){
			var _styles="";
			for(var attr in options){
				_styles+=_getStyle(attr,options[attr]);
			}
			_dom.attr(style,_styles);
		}
	};
};