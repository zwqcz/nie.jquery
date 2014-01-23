(function($){
/**
 *	nie 网易游戏
 *	@class nie
 *	@static
**/
nie=(typeof nie =="undefined" || !nie)?{
		site:function(){
			var hn=window.self.location.hostname,
				v = /^((?:[^\.]+\.)+)163\.com$/i.exec(hn);
			/*
			xyq中文域名
			www.xn--owt49tjseb46a.xn--fiqs8s	www.梦幻西游.中国
			www.xn--owt49tjseb46a.com	www.梦幻西游.com
			www.xn--owt49tjseb46a.cn	www.梦幻西游.cn
			*/
			return v?(v[1].substring(0,v[1].length-1)).toLowerCase():(/^(www\.)?(xn--owt49tjseb46a\.xn--fiqs8s|xn--owt49tjseb46a\.com|xn--owt49tjseb46a\.cn)$/i.test(hn)?"xyq":null);
		}(),
		/**
		*	开始时间（检查页面speed）
		**/
		speed:new function(){
			var now=function(){return new Date().getTime();},
   			start=now(),
   			stats=function(type,id,time){
				var _parmas="site="+nie.config.site
	   					+"&id="+id
   						+"&type="+type
   						+"&time="+time;
   				if (/^(nie|xyq|xy2)$/.test(nie.config.site)){
   					new Image().src="http://webdog.nie.163.com/pageSpeed/?"+_parmas
   				}
				new Image().src="http://123.58.173.180/?"+_parmas;
				_parmas=null;
   			},
   			_data={};
   		$(function(){
   			stats(1,0,now()-start);			
   		});
   		$(window).load(function(){
   			stats(2,0,now()-start);
			setTimeout(function(){
				if (window.performance&&window.performance.timing){
					var __count=function(startName,endName){
							var result=null;
							if(typeof window.performance.timing[startName]!="undefined"&&typeof window.performance.timing[endName]!="undefined"){
								var val=window.performance.timing[endName]-window.performance.timing[startName];
								result=(val>=0)?val:null;
								val=null;
							}
							return result;
						},
						__names={/*
							http://www.silverlightchina.net/html/HTML_5/study/2012/0323/14706.html
							http://www.html5rocks.com/en/tutorials/webperformance/basics/
							http://www.cnblogs.com/_franky/archive/2011/11/21/2257381.html
							*/
							redirect:["redirectStart","redirectEnd"],
							dns:["domainLookupStart","domainLookupEnd"],
							tcp:["connectStart","connectEnd"],
							request:["requestStart","responseStart"],
							response:["responseStart","responseEnd"],
							processing:["domLoading","domComplete"],
							onload:["loadEventStart","loadEventEnd"]
						},
						__params=[];
					for(var i in __names){
						__params.push(i+"="+__count(__names[i][0],__names[i][1]));
					}
					__params.push("site="+nie.config.site);
					new Image().src="http://webdog.nie.163.com/pagePerformance/?"+__params.join("&");
					__params=__names=__count=null;
				}
			},0);
		});
		window.onerror=function(){		
			var _data=[];
			for(var i=0,l=arguments.length;i<l;i++){
				_data.push("v"+i+"="+arguments[i]);
			}
			new Image().src="http://webdog.nie.163.com/pageError/?"+_data.join("&");
			_data=null;
		};
   		this._s=function(){
   			stats(3,0,now()-start);
   		};
   		this.start=function(id){
   			_data[id]=now();
   		};
   		this.end=function(id){
   			if (typeof _data[id]!="undefined") stats(4,id,now()-_data[id]);
   		};
   	}
}:nie;
	/**
	*	配置信息
	*	@namespace nie
	*	@class config
	*	@static
	**/
nie.config={
		/**
		*	当前页面的产品名（产品名：当前页面二级域名）
		*	@property site 
		*	@type string
		**/
		site:nie.site,
		/**		
		*	web统计配置信息
		*	@namespace nie.config
		*	@class stats
		*	@static
		**/
		stats:{
			loaded:false,//是否已加载章鱼js
			/**
			*	默认是否运行统计系统
			*	<pre>
			*	&lt;script src="http://res.nie.netease.com/comm/js/jquery(mixNIE).last.js"&gt;&lt;/script&gt;
			*	&lt;script&gt;
			*	//不运行nie.util.stats（统计系统）
			*	nie.config.stats.defaultRun=false;
			*	&lt;/script&gt;
			*	</pre>
			*	@property  defaultRun
			*	@type bool
			*	@default true
			**/
			defaultRun:function(){
				try{
					if(window.top!=window.self||window.top.location.hostname != window.self.location.hostname){
						return false;
					}
					else{
						return true;
					}
				}catch(e){
					return false;
				}
			}(),
			/**
			*	统计系统名称
			*	@property name 
			*	@type string
			*	@default "Devilfish"
			**/
			name:"Devilfish",
			/**
			*	是否执行点击统计（常用于fab页面或首页）<br>
			*	当为true值，<a href="nie.util.html#method_stats">nie.util.stats</a> 运行时执行点击统计
			*	<pre>
			*	&lt;script src="http://res.nie.netease.com/comm/js/jquery(mixNIE).last.js"&gt;&lt;/script&gt;
			*	&lt;script&gt;
			*	//nie.util.stats运行时执行点击统计
			*	nie.config.stats.clickStats=true;
			*	&lt;/script&gt;
			*	</pre>
			*	@property clickStats 
			*	@type bool
			*	@default false
			**/
			clickStats:false,
			/**
			取倒数作为采样比例
			neteaseClickStat(1); 1/1采样
			neteaseClickStat(2); 1/2采样
			neteaseClickStat(3); 1/3采样
			**/
			clickStatsPrecent:null,
			/**
			*	统计id(暂时为devifish统计_ntes_nacc值）
			*	当为null值，id自动辨别产品(注意：gs、sg统计id分别为gssumr、sgtx。）
			*	<pre>
			*	&lt;script src="http://res.nie.netease.com/comm/js/jquery(mixNIE).last.js"&gt;&lt;/script&gt;
			*	&lt;script&gt;
			*	//nie.util.stats运行时站点id
			*	nie.config.stats.id="xyq";
			*	&lt;/script&gt;
			*	</pre>
			*	@property id
			*	@type string
			*	@default null
			**/
			id:null,
			/*
			指定统计页面。用作封装neteaseTracker(true,"http://xxx");
			*/
			url:{
				_data:[],//地址库数组
				/*
				在xyq.163.com下
				nie.config.stats.url.add("pmid/trace.html");
				
				等于http://clickgame.163.com/xyq/pmid/trace.html
				
				xyq部分是自动判别产品好
				
				"pmid/trace.html"
				规则：项目id/统计类型
				项目id：pmid
				统计类型:click|mouseOver|mouseOut|etc....
				
				技术部|谭富佳|8447 -  说: (2013-05-22 16:28:14)
				neteaseTracker( refNull, url, title, nacc )
				neteaseTracker(true,"http://XXXX","大话首页左上按钮","clickgame")
				_ntes_nacc这个参数不要再做修改了
				*/
				add:function(url,title){//增加地址
					var	_url="http://clickgame.163.com/"+nie.config.site+"/"+url,
						_title=title||null;
					nie.config.stats.url._data.push({"url":_url,"title":_title});
					if(nie.config.stats.loaded) {
						nie.config.stats.url._run(_url,_title);
					}					
				},
				//加载章鱼统计后执行一次
				_cb:function(){
					var tmp=nie.config.stats.url._data;
					for(var i=0,l=tmp.length;i<l;i++){
						nie.config.stats.url._run(tmp[i].url,tmp[i].title);
					}					
				},
				_run:function(url,title){
					if($.isFunction(neteaseTracker)) neteaseTracker(true,url,title,"clickgame");
				}
			}
		},
		/**		
		*	顶部导航
		*	@namespace nie.config
		*	@class topBar
		*	@static
		**/
		topBar:{
			/**
			*	是否已经运行了顶部导航
			*	@property hasRun 
			*	@type bool
			*	@default false
			**/
			hasRun:false,
			/**
			*	顶部导航最迟运行时间（毫秒），因为顶部导航是window.onload才运行，所以这个时间是限制顶部导航最迟运行时间。如果超过这个时间还没运行，就运行。
			*	@property time 
			*	@type Int
			*	@default 5000
			**/
			time:2000
		},
		/**		
		*	底部版权
		*	@namespace nie.config
		*	@class copyRight
		*	@static
		**/
		copyRight:new function(){
				/**
				*	底部版权风格,暂时为logo的风格(1:正常版本，2:反白版本,3:灰色版本)
				*	@property style 
				*	@type int
				*	@default 1
				**/
				var _style=1,
					_diySetup=false,					
					_set=function(num,mustSet){
						if(mustSet||!_diySetup) {
							_style=num;
							_diySetup=true;
						}
					};
				this.product=nie.site;//显示对应的产品号的版权信息，默认是当前域名为产品号
				this.getStyle=function(){return _style;};
				this.setSiteDefaultStyle=function(_type){//全站默认style					
					if(!_diySetup){
						if(_type=="white") _set(2,true);
						else if(_type="gray") _set(3,true);
					}
				};
				this.setGray=function(){					
					_set(3);
				};
				this.setWhite=function(){					
					_set(2);
				};
				this.setNormal=function(){
					_set(1);
				};
			}
	};    
/**

*	jquery 1.4.2<br>
*	除了具备jquery本身用法外：<a href="http://docs.jquery.com/Main_Page" target="_blank">http://docs.jquery.com/Main_Page</a><Br>
*	还额外加了以下的用法。
*	@class $
*	@static
**/
/**
 * 计算md5<br>
 * Calculates the MD5 hash of str using the ? RSA Data Security, Inc. MD5 Message-Digest Algorithm, and returns that hash. <br>
 * MD5 (Message-Digest algorithm 5) is a widely-used cryptographic hash function with a 128-bit hash value. MD5 has been employed in a wide variety of security applications, and is also commonly used to check the integrity of data. The generated hash is also non-reversable. Data cannot be retrieved from the message digest, the digest uniquely identifies the data.<br>
 * MD5 was developed by Professor Ronald L. Rivest in 1994. Its 128 bit (16 byte) message digest makes it a faster implementation than SHA-1.<br>
 * This script is used to process a variable length message into a fixed-length output of 128 bits using the MD5 algorithm. It is fully compatible with UTF-8 encoding. It is very useful when u want to transfer encrypted passwords over the internet. If you plan using UTF-8 encoding in your project don't forget to set the page encoding to UTF-8 (Content-Type meta tag). <br>
 * This function orginally get from the WebToolkit and rewrite for using as the jQuery plugin.<br>
 * alias Muhammad Hussein Fattahizadeh < muhammad [AT] semnanweb [DOT] com ><br>
 * link http://www.semnanweb.com/jquery-plugin/md5.html<br>
 * see http://www.webtoolkit.info/<br>
 * license http://www.gnu.org/licenses/gpl.html [GNU General Public License]<br>
 * 	<pre> 		
 * 		$.md5("I'm Persian."); //结果：b8c901d0f02223f9761016cfff9d68df
 * 	</pre> 
 * @method md5
 * @param {string} 需要计算的字符串
 * @return {string} 返回md5字符串
 **/

	/*
	兼容高版本不支持$.browser
	*/
	$.browser=$.browser||function(){
		var ua=navigator.userAgent.toLowerCase(),
			rwebkit= /(webkit)[ \/]([\w.]+)/,
			ropera= /(opera)(?:.*version)?[ \/]([\w.]+)/,
			rmsie=/(msie) ([\w.]+)/,
			rmozilla= /(mozilla)(?:.*? rv:([\w.]+))?/,
			match = rwebkit.exec( ua ) ||
					ropera.exec( ua ) ||
					rmsie.exec( ua ) ||
					ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
					[];
			return { browser: match[1] || "", version: match[2] || "0" };
	}();
	
	var rotateLeft = function(lValue, iShiftBits) {
		return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
	}
	
	var addUnsigned = function(lX, lY) {
		var lX4, lY4, lX8, lY8, lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
		if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		if (lX4 | lY4) {
			if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
	}
	
	var F = function(x, y, z) {
		return (x & y) | ((~ x) & z);
	}
	
	var G = function(x, y, z) {
		return (x & z) | (y & (~ z));
	}
	
	var H = function(x, y, z) {
		return (x ^ y ^ z);
	}
	
	var I = function(x, y, z) {
		return (y ^ (x | (~ z)));
	}
	
	var FF = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};
	
	var GG = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};
	
	var HH = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};
	
	var II = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};
	
	var convertToWordArray = function(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWordsTempOne = lMessageLength + 8;
		var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
		var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
		var lWordArray = Array(lNumberOfWords - 1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while (lByteCount < lMessageLength) {
			lWordCount = (lByteCount - (lByteCount % 4)) / 4;
			lBytePosition = (lByteCount % 4) * 8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount - (lByteCount % 4)) / 4;
		lBytePosition = (lByteCount % 4) * 8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
		lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
		lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
		return lWordArray;
	};
	
	var wordToHex = function(lValue) {
		var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
		for (lCount = 0; lCount <= 3; lCount++) {
			lByte = (lValue >>> (lCount * 8)) & 255;
			WordToHexValueTemp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
		}
		return WordToHexValue;
	};
	
	var uTF8Encode = function(string) {
		string = string.replace(/\x0d\x0a/g, "\x0a");
		var output = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				output += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				output += String.fromCharCode((c >> 6) | 192);
				output += String.fromCharCode((c & 63) | 128);
			} else {
				output += String.fromCharCode((c >> 12) | 224);
				output += String.fromCharCode(((c >> 6) & 63) | 128);
				output += String.fromCharCode((c & 63) | 128);
			}
		}
		return output;
	};
	
	$.extend({
		md5: function(string) {
			var x = Array();
			var k, AA, BB, CC, DD, a, b, c, d;
			var S11=7, S12=12, S13=17, S14=22;
			var S21=5, S22=9 , S23=14, S24=20;
			var S31=4, S32=11, S33=16, S34=23;
			var S41=6, S42=10, S43=15, S44=21;
			string = uTF8Encode(string);
			x = convertToWordArray(string);
			a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
			for (k = 0; k < x.length; k += 16) {
				AA = a; BB = b; CC = c; DD = d;
				a = FF(a, b, c, d, x[k+0],  S11, 0xD76AA478);
				d = FF(d, a, b, c, x[k+1],  S12, 0xE8C7B756);
				c = FF(c, d, a, b, x[k+2],  S13, 0x242070DB);
				b = FF(b, c, d, a, x[k+3],  S14, 0xC1BDCEEE);
				a = FF(a, b, c, d, x[k+4],  S11, 0xF57C0FAF);
				d = FF(d, a, b, c, x[k+5],  S12, 0x4787C62A);
				c = FF(c, d, a, b, x[k+6],  S13, 0xA8304613);
				b = FF(b, c, d, a, x[k+7],  S14, 0xFD469501);
				a = FF(a, b, c, d, x[k+8],  S11, 0x698098D8);
				d = FF(d, a, b, c, x[k+9],  S12, 0x8B44F7AF);
				c = FF(c, d, a, b, x[k+10], S13, 0xFFFF5BB1);
				b = FF(b, c, d, a, x[k+11], S14, 0x895CD7BE);
				a = FF(a, b, c, d, x[k+12], S11, 0x6B901122);
				d = FF(d, a, b, c, x[k+13], S12, 0xFD987193);
				c = FF(c, d, a, b, x[k+14], S13, 0xA679438E);
				b = FF(b, c, d, a, x[k+15], S14, 0x49B40821);
				a = GG(a, b, c, d, x[k+1],  S21, 0xF61E2562);
				d = GG(d, a, b, c, x[k+6],  S22, 0xC040B340);
				c = GG(c, d, a, b, x[k+11], S23, 0x265E5A51);
				b = GG(b, c, d, a, x[k+0],  S24, 0xE9B6C7AA);
				a = GG(a, b, c, d, x[k+5],  S21, 0xD62F105D);
				d = GG(d, a, b, c, x[k+10], S22, 0x2441453);
				c = GG(c, d, a, b, x[k+15], S23, 0xD8A1E681);
				b = GG(b, c, d, a, x[k+4],  S24, 0xE7D3FBC8);
				a = GG(a, b, c, d, x[k+9],  S21, 0x21E1CDE6);
				d = GG(d, a, b, c, x[k+14], S22, 0xC33707D6);
				c = GG(c, d, a, b, x[k+3],  S23, 0xF4D50D87);
				b = GG(b, c, d, a, x[k+8],  S24, 0x455A14ED);
				a = GG(a, b, c, d, x[k+13], S21, 0xA9E3E905);
				d = GG(d, a, b, c, x[k+2],  S22, 0xFCEFA3F8);
				c = GG(c, d, a, b, x[k+7],  S23, 0x676F02D9);
				b = GG(b, c, d, a, x[k+12], S24, 0x8D2A4C8A);
				a = HH(a, b, c, d, x[k+5],  S31, 0xFFFA3942);
				d = HH(d, a, b, c, x[k+8],  S32, 0x8771F681);
				c = HH(c, d, a, b, x[k+11], S33, 0x6D9D6122);
				b = HH(b, c, d, a, x[k+14], S34, 0xFDE5380C);
				a = HH(a, b, c, d, x[k+1],  S31, 0xA4BEEA44);
				d = HH(d, a, b, c, x[k+4],  S32, 0x4BDECFA9);
				c = HH(c, d, a, b, x[k+7],  S33, 0xF6BB4B60);
				b = HH(b, c, d, a, x[k+10], S34, 0xBEBFBC70);
				a = HH(a, b, c, d, x[k+13], S31, 0x289B7EC6);
				d = HH(d, a, b, c, x[k+0],  S32, 0xEAA127FA);
				c = HH(c, d, a, b, x[k+3],  S33, 0xD4EF3085);
				b = HH(b, c, d, a, x[k+6],  S34, 0x4881D05);
				a = HH(a, b, c, d, x[k+9],  S31, 0xD9D4D039);
				d = HH(d, a, b, c, x[k+12], S32, 0xE6DB99E5);
				c = HH(c, d, a, b, x[k+15], S33, 0x1FA27CF8);
				b = HH(b, c, d, a, x[k+2],  S34, 0xC4AC5665);
				a = II(a, b, c, d, x[k+0],  S41, 0xF4292244);
				d = II(d, a, b, c, x[k+7],  S42, 0x432AFF97);
				c = II(c, d, a, b, x[k+14], S43, 0xAB9423A7);
				b = II(b, c, d, a, x[k+5],  S44, 0xFC93A039);
				a = II(a, b, c, d, x[k+12], S41, 0x655B59C3);
				d = II(d, a, b, c, x[k+3],  S42, 0x8F0CCC92);
				c = II(c, d, a, b, x[k+10], S43, 0xFFEFF47D);
				b = II(b, c, d, a, x[k+1],  S44, 0x85845DD1);
				a = II(a, b, c, d, x[k+8],  S41, 0x6FA87E4F);
				d = II(d, a, b, c, x[k+15], S42, 0xFE2CE6E0);
				c = II(c, d, a, b, x[k+6],  S43, 0xA3014314);
				b = II(b, c, d, a, x[k+13], S44, 0x4E0811A1);
				a = II(a, b, c, d, x[k+4],  S41, 0xF7537E82);
				d = II(d, a, b, c, x[k+11], S42, 0xBD3AF235);
				c = II(c, d, a, b, x[k+2],  S43, 0x2AD7D2BB);
				b = II(b, c, d, a, x[k+9],  S44, 0xEB86D391);
				a = addUnsigned(a, AA);
				b = addUnsigned(b, BB);
				c = addUnsigned(c, CC);
				d = addUnsigned(d, DD);
			}
			var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
			return tempValue.toLowerCase();
		}
	});

/** 加载 css, js, html<br>
 *	在原作基础上增加功能：<br>
 *	1.增加charset：在url加参数charset=xxx, 如$.include("http://nie.163.com/base.css?charset=gb2312")<br>
 *	注意：<br>
 *	1.加载不同类型文件是判断url末尾的字符（.css .js）而加载的<br>
 *		例如：js的url末尾不是.js <br>
 *			http://nie.163.com/css/base
 *			可改为 http://nie.163.com/css/base?.css
 *<br>
 <pre>
 //加载单个文件
 $.include('script1.js'); 
 //加载单个文件并回调
 $.include('script1.js',functionName);  
 //加载多个文件并回调同一个函数
 $.include( ['styles/css2.css','scripts/js2.js'] ,globalCallback);  
 //加载多个复杂情况
 $.include( 
{
'script1.js':function(){ },
'script2.js':function(){ },
'somecss.css:null,
'temp2.html':function(data){alert(data)}
}
,globalCallback
);
 </pre>
 *	includeMany 1.2.0<br>
 * 	Copyright (c) 2009 Arash Karimzadeh (arashkarimzadeh.com)<br>
 * 	Licensed under the MIT (MIT-LICENSE.txt)<br>
 * 	http://www.opensource.org/licenses/mit-license.php<br>
 * 	jQuery project: http://plugins.jquery.com/project/include<br>
 * 	Date: Mar 14 2009
 *	@method include
 * 	@param {String||Array||Object} 多参数模式,参考例子。
 */
$.chainclude = function(urls,finaly){
	var onload = function(callback,data){
						if(typeof urls.length!='undefined'){
							if(urls.length==0)
								return $.isFunction(finaly)
											?finaly(data)
											:null;
							urls.shift();
							return $.chainclude.load(urls,onload);
						}
						for(var item in urls){
							urls[item](data);
							delete urls[item];
							var count = 0;
							for(var i in urls)
								count++;
							return (count==0)
										?$.isFunction(finaly)?finaly(data):null
										:$.chainclude.load(urls,onload);
						}
					}
	$.chainclude.load(urls,onload);
};
$.chainclude.load = function(urls,onload){
	if(typeof urls=='object' && typeof urls.length=='undefined')
		for(var item in urls)
			return $.include.load(item,onload,urls[item].callback);
	urls = $.makeArray(urls);
	$.include.load(urls[0],onload,null);
};
$.include = function(urls,finaly){
	var luid = $.include.luid++;
	var onload = function(callback,data){
						if($.isFunction(callback))
							callback(data);
						if(--$.include.counter[luid]==0&&$.isFunction(finaly))
							finaly();
					}
	if(typeof urls=='object' && typeof urls.length=='undefined'){
		$.include.counter[luid] = 0;
		for(var item in urls)
			$.include.counter[luid]++;
		return $.each(urls,function(url,callback){$.include.load(url,onload,callback);});
	}
	urls = $.makeArray(urls);
	$.include.counter[luid] = urls.length;
	$.each(urls,function(){$.include.load(this,onload,null);});
}
$.extend(
	$.include,
	{
		luid: 0,
		counter: [],
		load: function(url,onload,callback){
			if($.include.exist(url))
				return onload(callback);
			var type=url.match(/\.([^\.]+)$/);
			if(type){
				switch(type[1]){
					case "css":
						$.include.loadCSS(url,onload,callback);
						break;
					case "js":						
						//$.include.loadJS(url,onload,callback);						
						var sp = /charset=([^&]+)/i.exec(url);					
						$.ajax({
							  "url": url,
							  scriptCharset:(sp&&sp[1])?sp[1]:"gbk",
							  dataType: 'script',
							  cache:true,
							  success: function(data){onload(callback,data);}							  
							});						
						break;
					default:
						$.get(url,function(data){onload(callback,data);});
						break;
				}
			}
			/*
			if(/.css$/.test(url))
				$.include.loadCSS(url,onload,callback);
			else if(/.js$/.test(url))
				$.include.loadJS(url,onload,callback);
			else
				$.get(url,function(data){onload(callback,data)});
				*/
		},
		loadCSS: function(url,onload,callback){
			var css=document.createElement('link');
			css.setAttribute('type','text/css');
			css.setAttribute('rel','stylesheet');
			css.setAttribute('href',url.toString());
			$('head').get(0).appendChild(css);
			$.browser.msie
				?$.include.IEonload(css,onload,callback)
				:onload(callback);//other browsers do not support it
		},
		/*
		loadJS: function(url,onload,callback){
			var js = document.createElement("script"),
				sp = /charset=([^&]+)/i.exec(url);			
			js.setAttribute("defer",true);
			js.setAttribute("charset",(sp&&sp[1])?sp[1]:"gbk");	//带参数charset=xxx 设置属性charset
			//js.setAttribute("src",url);
			js.src=url;
			$.browser.msie
				?$.include.IEonload(js,onload,callback)
				:js.onload = function(){onload(callback)};
			$('head').get(0).appendChild(js);
		},
		*/
		IEonload: function(elm,onload,callback){
			elm.onreadystatechange = 
					function(){
						if(this.readyState=='loaded'||this.readyState=='complete')
							onload(callback);
					}
		},
		exist: function(url){
			var fresh = false;
			$('head script').each(
								function(){
									if(/.css$/.test(url)&&this.href==url)
											return fresh=true;
									else if(/.js$/.test(url)&&this.src==url)
											return fresh=true;
								}
							);
			return fresh;
		}
	}
);
/**
* util
* @module util
**/
/**
*	创建cookie<br>
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>util.cookie<br>
*	原作者：Klaus Hartl/<a href="mailto:klaus.hartl@stilbuero.de">klaus.hartl@stilbuero.de</a><br>
*	作者网站：<a href="http://stilbuero.de" target="_blank">http://stilbuero.de</a><br>
*	<pre>
*	//Set the value of a cookie.
*	$.cookie('the_cookie', 'the_value');	
*	<br>
*	//Create a cookie with all available options.
*	$.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true }); 
*	<br>
*	//Create a session cookie.
*	$.cookie('the_cookie', 'the_value');
*	<br>
*	//Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain used when the cookie was set.
*	$.cookie('the_cookie', null);
*	</pre>
*	@namespace $
*	@class cookie
*	@static
**/
/**
*	@constructor cookie
*	@param {String} name The name of the cookie.
*	@param {String} value The value of the cookie.
*	@param {Object} options An object literal containing key/value pairs to provide optional cookie attributes.
*	@return	{Object} The value of the cookie.
**/
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
	
	/**
	*	nie.use当前加载js的URL（暂时用于捆绑图片在mhtml）
	*	@property useJsURL 
	*	@type string
	*	@default ""
	**/
	nie.useJsURL="";
	/**
	*	加载模块
	*	<pre>
	*	nie.use(["util.bjTime","util.swfobject"], function(){ alert("加载完成！"); });
	*	</pre>
	*	@namespace nie
	*	@class use
	*	@static
	*	@constructor
	*	@param  {Array} module 使用的模块
	*	@param  {Function} callBack 回调函数（加载模块完成后回调的函数）
	**/
	nie.use=function(module,callBack){	
		var modules = module.sort().toString(),
			url="http://res.nie.netease.com/comm/js/"+((window.self.location.href.indexOf("http")!=0)?"use.php?p="+modules+"&":"cache/"+$.md5(modules))+".js";
		//nie.useJsURL=url+"&charset=gb2312&.js";
		nie.useJsURL=url;
		$.include(url,callBack);
	};	
	/**
	*	常用应用<br>
	*	<font color="blue">默认运行：</font>$(window).load(stats、topBar和copyRight);
	*	@namespace nie
	*	@class util 
	*	@static
	**/
	nie.util = nie.util||{
		
		/**
		* 执行web统计<br>
		* 暂时为devifish统计系统，根据页面当前域名自动识别游戏产品。(因：gs、sg统计id分别为gssumr、sgtx，所以处理了下判断。）
		* @method stats
		**/
		stats:function(){
		  //白名单
		  var whiteList = {
				  "gamebase":1,
				  "gift":1,
				  "nb":"vipnb",
				  "esales":1,
				  "gs":"gssumr",
				  "ekey":1,
				  "nie":1,
				  "xy3":1,
				  "wy.xy3":"xy3",
				  "xy2":1,
				  "pk":"xyw",
				  "xdw":"xyw",
				  "dt":1,
				  "dt2":1,
				  "dtw":1,
				  "tx2":1,
				  "popogame":1,
				  "xyq":1,
				  "itown":1,
				  "xc":"itown",
				  //"itownsdk":1,
				  //"mc":1,
				  "jl":"mc",
				  "jlcs":"mc",
				  //"cs":"mc",			  
				  //"ysg":1,
				  "pet":"petkingdom",
				  "sg":"sgtx",
				  "zg":"zgfy",
				  "qn":"qnyh",
				  "qn2":"qnyh",
				  //"csxy":1,
				  //"xyc":1,
				  "st":1,
				  "fj":1,
				  "ball":1,
				  "ff":1,
				  "nieyx":1,
				  "ql":1,
				  //"xjc":1,
				  "cc":1,
				  "v.cc":"cc",//cc
				  "yx":"ipush",
				  "gameclient":1,//客户端嵌入页面
				  "t3":1,//预告站
				  "tx3":"tx2",//天下3使用tx2
				  "game.campus":"gamecampus",//校园招聘,
				  "zh":1,//斩魂
				  "wh":1,//武魂
				  "mg":1,//手机游戏
				  "niemh":1,//梦幻玩家专区
				  "niegamezq":1,//app.nie的游戏专区
				  "y3":"dota",//英雄三国
				  "cbg":1,//藏宝阁
				  "gamex":1,//龙剑
				  "lj":"gamex",//龙剑
				  //"titanic":"xxx",//
				  "newworld":1,//倩女子站
				  "bang.tx3":"tx2",
				  "mkey":1,//帐号安全
				  //"newx":"dt2",
				  "f":"f4",
				  "gamef":"f4",
				  "union":1,//网站联盟
				  "dtws2":"dt2",//1,//大唐无双2
				  "zd":"zdcq",//藏地传奇
				  "bl":1,//爆裂天空
				  "yxsg":"dota",
				  "esports":1,//电子竞技
				  "dj":"esports",//电子竞技
				  "xyq.baike":"xyq",//梦幻百科
				  "xy3.baike":"xy3",//大话3百科
				  "y3.baike":"dota",//英雄三国百科
 				  "xy2.baike":"xy2",//大话2百科
				  "xdw.baike":"xyw",//战歌百科
				  "x3":1,//新大话3
				  "x3.baike":"x3",
				  "mvip":1,//
				  "kanyouxi":1,//看游戏
				  "kyx":"kanyouxi",//看游戏 辅助域名,
				  "wst.webapp":"xyq",//武神坛之战，老头要求增加@2013.7.10
				  "wj":"f4",/*by 黎芷然@2013-08-06 14:19:18
				  h|小马|网站|黄耀文 -  说: (2013-08-08 10:07:56)
改成f4
h|小马|网站|黄耀文 -  说: (2013-08-08 10:08:17)
这个站点被他们映射父子频道关系了。*/
				  "xxx":1,
				  "next":1,//盘古-网站组|梁冲 -  说: (2013-08-13 10:27:12)
				  /*
				  "xy2zq.webapp":"xy2",//大话2玩家专区
				  "xyqzq.webapp":"xyq",//梦幻西游玩家专区
				  "xy3zq.webapp":"tx2"//天下3玩家专区
				  */
				   "dh":1,//关文浩|2895 - 13357103875 说: (2013-08-16 09:59:16)
				   "xym":1,
				   "tkzj":1,//关文浩|2895 - 13357103875 说: (2013-08-30 15:00:29)
				   "newwar":"xxx",//武魂国战悬疑页面
				   "tuku.xyq":"xyq",//梦幻图库
				   "so.xyq":"xyq",//梦幻搜索
				   "story":"xy2",//大话西游2故事会
				   "byy":1//网易代理手游
		  		},
		  		tmpID=null,
		  		getID=function(key){
			  		return whiteList[key]==1?key:whiteList[key];
		  		};
		  if(nie.config.stats.id==null){
			  if(nie.config.site!=null&&typeof whiteList[nie.config.site]!="undefined") tmpID=getID(nie.config.site);
		  }
		  else{
			  if(typeof whiteList[nie.config.stats.id]!="undefined") tmpID=getID(nie.config.stats.id);		  
		  }
		  if(tmpID!=null){
			  $.include("//analytics.163.com/ntes.js",function(){
				    nie.config.stats.loaded=true;
					_ntes_nacc = tmpID;
					if($.isFunction(neteaseTracker)) neteaseTracker();
					if(nie.config.stats.clickStats) nie.config.stats.clickStatsPrecent?neteaseClickStat(nie.config.stats.clickStatsPrecent):neteaseClickStat();
					nie.config.stats.url._cb();//指定页面统计
			  });	
		  }
		},
		/**
		* 插入顶部导航<br>
		* 根据html是否存在id="NIE-topBar",判断是否插入顶部导航
		* @method topBar
		**/
		topBar:function(){			
			if(!nie.config.topBar.hasRun&&document.getElementById("NIE-topBar")){			
				nie.config.topBar.hasRun = true;
				$.include("http://res.nie.netease.com/comm/nie.topBar/js/topBar.v2.last.js");			
			}
		},
		copyRight:function(){				
			var o = $("#NIE-copyRight");			
			if(o.length>0){
				var path="http://res.nie.netease.com/comm/NIE_copyRight/images/",
						html="",					
						t1="文网游备字",
						t2="文网备字",
						bcode="",
						wcode="粤网文[2011]0522-079号",//'文网文『2008』080号',
				        wcode_hanyan="文网文[2009]156号",//雷火
				        wcode_hanyan2="浙网文[2013]0332-034号",//雷火暂用在倩女官网（qn2.163.com）、藏宝阁（qn2.cbg.163.com）、知道（qn2.zhidao.163.com）、客服专区（qn2.gm.163.com）
						logo="",
						showPart1=true,
						age=16,
						sug='本游戏故事情节设置紧凑',
						agePermision='本游戏适合$age岁以上的玩家进入。<br />',
						suggestion='积极健康的游戏心态是健康游戏的开端，本游戏故事情节设置紧凑，请您合理控制游戏时间，避免沉溺游戏影响生活，注意自我保护，防范网络陷阱。<br />',
						infoStr=' <a href="http://nie.163.com/bs/ca_lianyun.html" target="_blank">联运推广</a> -',
						centerCode='<a href="http://www.cogcpa.org" target="_blank">中国网络游戏版权保护联盟举报中心</a>',
						addInfo=false,
						plusCode="",
						get_pngImg=function(width,height,imgUrl,linkUrl,notNeedSpace){
							var bgStyle = lteIE6 ? "_filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imgUrl+"')":"background:url("+imgUrl+") no-repeat",
								url=linkUrl,
								target="_blank";
							if(!linkUrl){
								url="javascript:void(0);";
								target="_self";
							}
							return '<a href='+url+' target="'+target+'" style="width:'+width+'px;height:'+height+'px;display:inline-block;cursor:pointer;'+bgStyle+'"></a>'+(notNeedSpace?'':'&nbsp;&nbsp;&nbsp;');
						},						
						defaultWhiteLogo=0,//是否默认反白logo
						lteIE6=$.browser.msie && parseInt($.browser.version)<=6;//是否小于等于ie6
			  switch(nie.config.copyRight.product){
			  	  case "xyq":					
			  		bcode=t1+"【2005】017号（2011）C-RPG042号";
			  		break;
			  	  case "xy2":
			  		//bcode=t1+'【2005】016号';
				  bcode=t1+'(2011)C-RPG088号';
			  		break;
			  	  case "xy3":
			  		bcode=t1+'(2011)C-RPG089号';
					break;
				  case "x3":
			  		bcode=t1+'(2011)C-RPG089号';
					break;				
				  case "xdw":
			    	bcode=t1+'(2011)C-RPG090号';
			    	addInfo=true;
					break;
			      case "pk"://原xyw
			    	bcode=t1+'(2011)C-RPG090号';
			    	addInfo=true;
					break;
			      case "dt":
			    	bcode=t1+'(2011)C-RPG096号';
			    	break;
				  case 'gamebase':
				    agePermision='';
					suggestion='';
					break;
				  case 'nie':
				    agePermision='';
					suggestion='';
					break;
				  case 'tx2':
					age=18;
					break;
				  case 'tx3':
					age=18;
					bcode=t1+"(2011)C-RPG151号";
					wcode=wcode_hanyan2;
					break;
				  case 'dt2':
					age=18;
					bcode=t1+"(2011)C-RPG049号";
					break;
				  case "dtws2":
					age=18;
					bcode=t1+"(2011)C-RPG049号";
					wcode=wcode_hanyan2;
					break;
				  case 'jl':
					sug='本游戏玩法多样，内容丰富';
					//age=12;
					agePermision="本游戏适合所有年龄玩家进入<br />";
					addInfo=true;
					break;
				  case 'ball':
					bcode=t1+'[2010]C-CSG005号';
					age=12;
					break;
				  case 'pet':
					age=12;
					break;
				  case 'zg':
					defaultWhiteLogo=1;
					bcode=t1+'[2010]W-SLG012号';				
					logo=get_pngImg(44,31,path+"leihuo.{s}.png");		
					break;
				  case 'sg':
					bcode=t1+'[2010]W-SLG013号';
					sug='本游戏为全地图PK区域游戏';
					break;
				  case "ff":
					bcode=t1+'[2010]C-RPG001号';
					age=14;				
					//logo='<a href="http://www.aeonsoft.co.kr" target="_blank"><img src="'+path+'AEONSOFT-logo.gif" /></a>';
					break;
				  case "popogame":
					  bcode=t2+'[2008]011号';
					  break;
				  case "gs":
					agePermision='';
					suggestion='';
					break;
				  case "fj":
					bcode=t1+'[2010]C-CSG002号';
					break;
				  case "rich":
					bcode=t1+'[2010]C-CSG002号';
					break;
				  case "st":
					bcode= t1+'[2010]C-CSG004号';
					break;
				  case "qn":			
					defaultWhiteLogo=1;					
				    logo=get_pngImg(44,31,path+"leihuo.{s}.png");
				    bcode= t1+'(2011)C-RPG007号';
					wcode=wcode_hanyan2;
					break;
				  case "qn2":			
					defaultWhiteLogo=1;					
				    logo=get_pngImg(44,31,path+"leihuo.{s}.png");
				    bcode= t1+'(2011)C-RPG007号';
					wcode=wcode_hanyan2;
					break;
				  case "f":
					wcode=wcode_hanyan;
					break;
				/*
				  case 'csxy':
					defaultWhiteLogo=1;
					bcode=t1+'(2011)C-RPG051号';				
					break;
					*/
				  /*停运
				  case "xjc":
					bcode=t1+"(2011)W-RPG149号";
					break;
				  */
				  case "zd":
					defaultWhiteLogo=1;
				  showPart1=false;
				    break;
				  case "wh"://武魂
					wcode=wcode_hanyan2;
					bcode= t1+'(2013)C-RPG001号';
					break;
				  case "y3":
					//defaultWhiteLogo=1;//范范要求 @2013.07.09					
					//showPart1=false;
					bcode= t1+'(2013)C-CSG008号';
					break;						  
				  case "zh":
					bcode= t1+'(2012)C-RPG099号';
					break;
				 case "ty":
					logo=get_pngImg(88,31,path+"pangu.{s}.png",false,1);
					showPart1=false;
					break;
				 case "lj":
					bcode=t1+'(2013)C-RPG081号';
					break;
				 default:
					showPart1=false;
					break;
			  }

			  if(defaultWhiteLogo==1) nie.config.copyRight.setSiteDefaultStyle("white");
			  var showMoreInfo=showPart1 && /^\/($|index.html|boot.html)/.test(window.self.location.pathname);
			  if(showMoreInfo){
				  plusCode='<br><span id="ncp-l3" style="display:inline-block;padding-top:10px;">'+agePermision.replace("$age",age)+suggestion+'全国文化市场统一举报电话：12318　文化部网络游戏举报和联系电子邮箱：<a href="mailto:wlwh@vip.sina.com">wlwh@vip.sina.com</a><br /><a target="_blank" href="http://nie.163.com/news/2010/6/9/442_216957.html">《网络游戏管理暂行办法》</a>'+bcode+'　《网络文化经营许可证》'+wcode+'</span>';
				  bcode=wcode="";
			  }
			  else{
				  centerCode='';
			  }
			  html+='<p id="NIE-copyRight-corp" style="'+(showMoreInfo?'width:'+(suggestion?800:730)+'px;text-align:left;':'width:100%;text-align:center;')+'margin:0 auto;padding:15px 0 0 0;line-height:20px;display:block;"><span style="position:relative;vertical-align:top;top:3px;display:inline-block;">'+get_pngImg(101,31,path+"netease.{s}.png","http://www.163.com")+''+get_pngImg(111,31,path+"nie.{s}.png","http://nie.163.com")+logo+'</span><span style="text-align:left;display:inline-block;padding-left:10px;"><span id="ncp-l1"><a href="http://gb.corp.163.com/gb/about/overview.html" target="_blank">公司简介</a> - <a href="http://help.163.com/" target="_blank">客户服务</a> - <a href="http://gb.corp.163.com/gb/legal.html" target="_blank">相关法律</a> - <a href="http://nie.163.com/about/about.html" target="_blank">网易游戏</a> - <a href="http://nie.163.com/about/contactus.html" target="_blank">联系我们</a> - <a href="http://nie.163.com/bs/business.html" target="_blank">商务合作</a> -'+(addInfo?infoStr:"")+' <a href="http://nie.163.com/job/" target="_blank">加入我们</a></span><br /><span id="ncp-l2">网易公司版权所有 &copy;1997-2014　'+bcode+'　'+wcode+'  '+centerCode+'</span></span>'+plusCode+'</p>';
			  o.html(html.replace(/{s}/g,nie.config.copyRight.getStyle()));
			}		
		},
		/*
		sEngine:{
				refer:document.referrer,
				cookie:{
					name:"nie.sEngine", //cookie name
					val:null,				
					domain:nie.config.site+".163.com",//cookie域名
					space:"^_*",   //cookie val分隔符
					url:window.self.location.href,
					refer:document.referrer,
					info:[],				
					currentTime:new Date().getTime(),
					expiresTime:60*60*1000,//cookie有效时间（从现在起）
					getInfo:function(){					
						this.info=this.val.split(this.space);
						//debug.pass("info:"+this.info);
					},				
					allowRefer:function(){					
						return this.refer==this.info[3] && new RegExp("^http://"+this.domain+"\\b[$/]","i").test(this.refer);
					},
					set:function(){					
						var t=(parseInt(this.info[1])-this.currentTime)/(24*60*60*1000);
						//debug.pass("设置cookie");
						//debug.pass("到期时间:"+this.info[1]);
						//debug.pass("到期时间:"+new Date(parseInt(this.info[1])).toString())
						//debug.pass("距离到期时间:"+Math.floor(t*24*60*60)+"秒");					
						$.cookie(this.name,this.info.join(this.space),{ expires:t, path: '/',domain:this.domain });
					},
					//创建cookie
					create:function(){
						//debug.pass("创建cookie");
						this.info=[
						          1,
						          this.currentTime + this.expiresTime,
						          this.refer,
						          this.url
						         ];					
						//debug.pass("途径页面数："+this.info[0]);
						this.set();						
					},
					stats:function(){					
						//增加途径页面数 & 改变来路
						//debug.pass("统计处理cookie");
						this.info[0]=1+parseInt(this.info[0]);			
						this.info[3]=this.url;
						//debug.pass("途径页面数："+this.info[0]);
						this.set();					
					}
				},	
				isEngineRefer:false,
				init:function(){				
					this.isEngineRefer=/^http[s]?:\/\/[^\/]+.(baidu.com|google.com.hk|google.com|soso.com|sogou.com|youdao.com|yahoo.com|bing.com)\//i.test(this.refer);
					if(window==top){
						this.cookie.val=$.cookie(this.cookie.name);				
						if(this.cookie.val){
							//debug.pass("监测到cookie");
							this.cookie.getInfo();					
							if(this.isEngineRefer){
								//debug.warn("不是线性来路，但是搜索引擎来路 ");		
								//创建cookie
								this.cookie.create();
							}
							else if(this.cookie.allowRefer()){
								//debug.warn("是线性来路");
								//增加途径页面数 & 改变来路
								this.cookie.stats();
							}
							
						}
						else if(this.isEngineRefer){
							//debug.warn("监测不到cookie，但是搜索引擎来路");
							//创建cookie
							this.cookie.create();
						}
						
					}
				}
		}
		,*/
		/*
		广告
		nie.util.abc.load({
			"promark":"",//广告更新器promark
			"callBack":function(){},//加载广告更新器完成后，异步调用
			"type":"js"//更新器类型，暂时有js
		});
		*/
		abc:{
			"data":{},//广告数据存储器
			"load":function(options){
				var params=["promark","type"],
					callBack=$.isFunction(options.callBack)?options.callBack:function(){};
				for (var i=0,l=params.length;i<l;i++){
					if(typeof(options[params[i]]) =="undefined") return;
				}
				switch(options.type){
					case "js":
						$.ajax({
							url:"http://webdog.nie.163.com/abc/updater/"+options.promark,
							success:function(){$(callBack);},
							dataType:"script",
							cache:true
						});
						break;
				}
			}
		}		
	};
	/*
	$(function(){
		nie.speed.stats(1);
	});
	*/
	$(function(){
		if(nie.config.stats.defaultRun) {	    
	        setTimeout(nie.util.stats,0);    
		}
	    /*
	    (function(){
	        var _timer=window.setInterval(function(){
	            if($("head").length!=0){
	                window.clearInterval(_timer);
	                nie.util.stats();
	            }
	        }, 30);
	    })();
	    */			
    });
	$(window).load(
	    function(){		
			//nie.speed.stats(2);
	        nie.util.topBar();        					
	    }
	);
	$(function(){setTimeout(nie.util.copyRight,0);});
	setTimeout(function(){
	    if(!nie.config.topBar.hasRun){		
	        nie.util.topBar();
	    }
	},nie.config.topBar.time);
	//处理搜索引擎
	//nie.util.sEngine.init();
})(jQuery);
nie.speed._s();
/*
//nie.util.stats();//主动执行章鱼统计
*/