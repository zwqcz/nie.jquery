/**
 * video quick insert

 *@author mrhanta
 *@version v1.0727
 */
 (function($){
	$.fn.insertVideo=function(){
		var config=$.extend({
			flv:'',
			width:290,
			height:253,
			title:'',
			autoplay:true,
			time:false,
			loop:true,
			mainBtColor:'#2FB33E',
			volume:0.3,
			startimage:''
		},arguments[0]||{});
		$(this).each(function(){
			$(this).html('<object id="player" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' 
			+'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,28,0" '
			+'width="'+config.width+'" height="'+config.height+'" >'
			+'<param name="movie" value="http://v.nie.netease.com/com/player/player.swf" />'
			+'<param name="quality" value="high" /><param name="allowScriptAccess" value="always" />'
			+'<param name="allowFullScreen" value="true" /><param name="wmode" value="opaque" />'
			+'<param name="FlashVars" value="'+$.param(config)+'" />'
			+'<embed wmode="opaque" src="http://v.nie.netease.com/com/player/player.swf" '
			+'quality="high" bgcolor="#000000" allowscriptaccess="always" allowFullScreen="true" '
			+'FlashVars="'+$.param(config)+'" '
			+'pluginspage="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash"'
			+'type="application/x-shockwave-flash" width="'+config.width+'" height="'+config.height+'"></embed>'
			+'</object>');
		
		});
	}
})(jQuery);
;