/**
* util
* @module util
**/
/**
*	swfobject：插入flash<br>
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>util.swfobject<br>
*	原作者网站：<a href="http://jquery.thewikies.com/swfobject/" target="_blank">http://jquery.thewikies.com/swfobject/</a><br>
*	版本: 1.1.1
*	<pre>
*	//例子1
*	$('#flashTest1').flash(
*			{
*				// test.swf is the flash document
*				swf: 'test.swf'
*			}
*		);
*	//例子2
*	$('#flashTest2').flash({
*		// test_flashvars.swf is the flash document
*		swf: 'test_flashvars.swf',
*		// these arguments will be passed into the flash document
*		flashvars: {
*			name1: 'jQuery',
*			name2: 'SWFObject',
*			name3: 'Plugin'
*		}
*	});
*	//例子3
*	$('#flash-example-5 .movie').flash(
*			{
*				swf: 'javascript-flash-interaction.swf',
*				params: {
*					play: false
*				},
*				flashvars: {
*					message: 'I come from Flash.'
*				},
*				height: 86,
*				width: 481
*			}
*		);
*	</pre>
*	@class swfobject
*	@static
*	@namespace $	
**/
/**
* @constructor swfobject
* @param {Object} params 参数(参考例子）
**/
// jQuery SWFObject v1.1.1 MIT/GPL @jon_neal
// http://jquery.thewikies.com/swfobject

(function($, flash, Plugin) {
	var OBJECT = 'object',
		ENCODE = true,
		noFlashTips='<div><h4>页面需要新版Adobe Flash Player.</h4><p><a href="http://www.adobe.com/go/getflashplayer" target="_blank"><img width="112" height="33" alt="获取新版Flash" src="http://res.nie.netease.com/comm/js/util/swfobject/get_flash_player.gif"></a></p></div>';

	function _compareArrayIntegers(a, b) {
		var x = (a[0] || 0) - (b[0] || 0);

		return x > 0 || (
			!x &&
			a.length > 0 &&
			_compareArrayIntegers(a.slice(1), b.slice(1))
		);
	}

	function _objectToArguments(obj) {
		if (typeof obj != OBJECT) {
			return obj;
		}

		var arr = [],
			str = '';

		for (var i in obj) {
			if (typeof obj[i] == OBJECT) {
				str = _objectToArguments(obj[i]);
			}
			else {
				str = [i, (ENCODE) ? encodeURI(obj[i]) : obj[i]].join('=');
			}

			arr.push(str);
		}

		return arr.join('&');
	}

	function _objectFromObject(obj) {
		var result="";
		for (var i in obj) {
			if (obj[i]) {
				switch(i){
					case "type":
						/*
						if($.browser.msie) {
							result+=" classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'"
								//  +" codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=11,5,0,0'";
						}*/
						result+=($.browser.msie?" classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'":i+"="+obj[i]);
						break;
					case "data":
						if(!$.browser.msie) result+=' '+i+'="'+obj[i]+'"';
						break;
					default:
						result+=' '+i+'="'+obj[i]+'"';
						break;

				}				
			}
		}
		return result;
	}	
	function _paramsFromObject(obj) {
		var arr = [];
		for (var i in obj) {
			arr.push([
				'<param name="', i,
				'" value="', _objectToArguments(obj[i]), '" />'
			].join(''));
		}		
		return arr.join('');
	}
	/*
	function _paramsFromObject(obj){
		var html ="";
		for (var i in obj) {
			html+="<param name='"+i+"' value='"+_objectToArguments(obj[i])+"' />";
		}
		return html;
	}
	*/
	
	try {
		var flashVersion = Plugin.description || (function () {
			return (
				new Plugin('ShockwaveFlash.ShockwaveFlash')
			).GetVariable('$version');
		}())
	}
	catch (e) {
		flashVersion = 'Unavailable';
	}
	
	/*
	参考：http://blog.csdn.net/chenee543216/article/details/5827120
		http://www.mockte.com/rewrite.php/read-275.html
		http://mutongwu.iteye.com/blog/1633581
	*/
	/*
	var flashVersion=null;
	if($.browser.msie){
		var _swfObj=new ActiveXObject('ShockwaveFlash.ShockwaveFlash'); 
		if(_swfObj) flashVersion=_swfObj.GetVariable("$version");					
	}
	else{
		if (navigator.plugins && navigator.mimeTypes.length){
			var _swfObj=navigator.plugins["Shockwave Flash"];  
			if(_swfObj&&_swfObj.description){

			}
		}
	}
	*/
	var flashVersionMatchVersionNumbers = flashVersion.match(/\d+/g) || [0];

	$[flash] = {
		available: flashVersionMatchVersionNumbers[0] > 0,

		activeX: Plugin && !Plugin.name,

		version: {
			original: flashVersion,
			array: flashVersionMatchVersionNumbers,
			string: flashVersionMatchVersionNumbers.join('.'),
			major: parseInt(flashVersionMatchVersionNumbers[0], 10) || 0,
			minor: parseInt(flashVersionMatchVersionNumbers[1], 10) || 0,
			release: parseInt(flashVersionMatchVersionNumbers[2], 10) || 0
		},

		hasVersion: function (version) {
			var versionArray = (/string|number/.test(typeof version))
				? version.toString().split('.')
				: (/object/.test(typeof version))
					? [version.major, version.minor]
					: version || [0, 0];

			return _compareArrayIntegers(
				flashVersionMatchVersionNumbers,
				versionArray
			);
		},

		encodeParams: true,

		expressInstall: 'http://res.nie.netease.com/comm/js/util/expressInstall.swf',
		expressInstallIsActive: false,

		create: function (obj) {
			var instance = this,_noFlashHTML;
			if (typeof obj.noFlashTips!="undefined")
			{
				_noFlashHTML=obj.noFlashTips;
				delete obj.noFlashTips;
			}
			else _noFlashHTML=noFlashTips;
			if (
				!obj.swf ||
				instance.expressInstallIsActive /*||
				(!instance.available && !obj.hasVersionFail)*/
			) {
				return _noFlashHTML;
			}			 
			if (!instance.hasVersion(obj.hasVersion || 1)) {
				instance.expressInstallIsActive = true;

				if (typeof obj.hasVersionFail == 'function') {
					if (!obj.hasVersionFail.apply(obj)) {
						return _noFlashHTML;
					}
				}

				obj = {
					swf: obj.expressInstall || instance.expressInstall,
					height: 137,
					width: 214,
					quality:"high",
					flashvars: {
						MMredirectURL: location.href,
						MMplayerType: (instance.activeX)
							? 'ActiveX' : 'PlugIn',
						MMdoctitle: document.title.slice(0, 47) +
							' - Flash Player Installation'
					}
				};
			}

			attrs = {
				data: obj.swf,
				type: 'application/x-shockwave-flash',
				id: obj.id || 'flash_' + Math.floor(Math.random() * 999999999),
				width: obj.width || 320,
				height: obj.height || 180,
				style: obj.style || ''
			};

			ENCODE = typeof obj.useEncode !== 'undefined' ? obj.useEncode : instance.encodeParams;

			obj.movie = obj.swf;
			obj.wmode = obj.wmode || 'opaque';
			/*
			start embed 
			*/
			/*var _embed=($.browser.msie)?"":(function(){					
						var embed_attrs={
								src:obj.swf,
								type:"application/x-shockwave-flash",
								pluginspage:"http://www.macromedia.com/go/getflashplayer",
								width:attrs.width,
								height:attrs.height,
								wmode:obj.wmode,
								quality:"high"				
							},
							embed_params=["FlashVars","allowScriptAccess"],
							arr=[];
						for(var p=0,l=embed_params.length;p<l;p++){
							var _key=embed_params[p].toLowerCase();
							for (var _o in obj){
								if(_key==_o.toLowerCase()){
									embed_attrs[_key]=obj[_o];
									break;
								}
							}
						}						
						for(var i in embed_attrs ){			
							arr.push(i+"="+_objectToArguments(embed_attrs[i]));
						}
						return  "<embed "+arr.join(" ")+" />";
					})();
			*/
			/*
			end embed 
			*/
			delete obj.fallback;
			delete obj.hasVersion;
			delete obj.hasVersionFail;
			delete obj.height;
			delete obj.id;
			delete obj.swf;
			delete obj.useEncode;
			delete obj.width;
			/*
			var flashContainer = document.createElement('div');

			flashContainer.innerHTML = [
				'<object ', _objectFromObject(attrs), '>',
				_paramsFromObject(obj),
				'<param name="quality" value="high" />',
				'<div><h4>页面需要新版Adobe Flash Player.</h4><p><a href="http://www.adobe.com/go/getflashplayer"><img width="112" height="33" alt="获取新版Flash" src="http://res.nie.netease.com/comm/js/util/swfobject/get_flash_player.gif"></a></p></div>',
				'</object>'
			].join('');

			return flashContainer.firstChild;
			*/
			return "<object "+ _objectFromObject(attrs)+">"
						+_paramsFromObject(obj)						
						//+_embed
						+_noFlashHTML
						+'</object>';
			
		}
	};

	$.fn[flash] = function (options) {
		var $this = this.find(OBJECT).andSelf().filter(OBJECT);

		if (/string|object/.test(typeof options)) {
			this.each(
				function () {
					var $this = $(this),
						flashObject;

					options = (typeof options == OBJECT) ? options : {
						swf: options
					};

					options.fallback = this;
					
					flashObject = $[flash].create(options);
					
					//if (flashObject) {
						//$this.children().remove();
						$this.empty().html(flashObject);
					//}
				}
			);
			/*
			var count=function(promark){new Image().src="http://webdog.nie.163.com/email?promark="+promark+"&ts="+new Date().getTime();};
			if($.flash.available) count("rp2si");//统计支持flash
			else count("h3rc7");//统计不支持flash
			*/
		}

		if (typeof options == 'function') {
			$this.each(
				function () {
					var instance = this,
					jsInteractionTimeoutMs = 'jsInteractionTimeoutMs';

					instance[jsInteractionTimeoutMs] =
						instance[jsInteractionTimeoutMs] || 0;

					if (instance[jsInteractionTimeoutMs] < 660) {
						if (instance.clientWidth || instance.clientHeight) {
							options.call(instance);
						}
						else {
							setTimeout(
								function () {
									$(instance)[flash](options);
								},
								instance[jsInteractionTimeoutMs] + 66
							);
						}
					}
				}
			);
		}

		return $this;
	};
}(
	jQuery,
	'flash',
	navigator.plugins['Shockwave Flash'] || window.ActiveXObject
));