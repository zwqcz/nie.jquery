/**
 * jquery pop plugin
 *
 * EXAMPLE:
 *	
	HTML:
	<a href="#popid">show the pop</a>
	
	Javascript:
 *	$('a.link-2-pop').pop();
 *
 *
 * @author mrhanta
 * @param config<Object>
 * @version 1.1215
 */
 
;(function($){
	
	/* set namespace */
	$.nie= $.nie||{};
	
	/* add pop function */
	$.nie.pop = function(config){
	
		var options = $.extend({
			el:'.pop',
			url:'',
			video:'',
			events:{},
			settings:{},
			padding:10,
			width:'auto',
			height:'auto',
			minTop:0,
			minLeft:0
		},config||{});
		
		var el=$(options.el);
		
		function close(){
			el.hide();
			$.nie.pop.overlay.hide();
		}
		
		function bindEvent(){
			el.find('.pop-close').click(close);
		}
		
		function show(){
			if(!$.nie.pop.overlay){
				$(document.body).append("<iframe id=\"NIE-overlay\" frameborder=\"0\" scrolling=\"no\"></iframe>");
				$.nie.pop.overlay = $('#NIE-overlay');
			}
			$.nie.pop.overlay.css({"height":$(document).height()});
			$.nie.pop.overlay.show();
			
			el.find('.pop-content').css({
				width:options.width,
				height:options.height
			});
			
			var newTop = $(window).height()/2-el.height()/2+$(window).scrollTop();
			if(newTop<options.minTop){
				newTop = options.minTop;
			}
			var newLeft = $(window).width()/2-el.width()/2+$(window).scrollLeft();
			if(newLeft<options.minLeft){
				newLeft = options.minLeft;
			}			
			el.show().animate({
				"top":newTop,
				"left":newLeft
			});
		}
		
		function initialize(){
			for(var p in options.settings){
				set(p,options.settings[p]);
			}
			bindEvent();
		}
		
		function set(comp,content){
			if(typeof(content) == 'string') el.find('.pop-'+comp).html(content);
			if(typeof(content) == 'object') el.find('.pop-'+comp).empty().append(content);
		}
		
		return (new function(){
			initialize();
			this.show = show;
			this.close = close;
			this.set = set;
			this.attr = function(key,value){
				if(typeof (key) == 'string' && value!=null){
					options[key]=value;
				}else if(typeof (key) == 'string' && value==null){
					return options[key];
				}else if(typeof (key) == 'object'){
					$.extend(options,key);
				}
			}
		});
		
	}
	/* set pop collection
	$.nie.pop.all = $.extend([],{
		getPopById:function(){},
		getFrontPop:function(){},
		getEndPop:function(){}
	});
	*/
	/* jquery element api */
	$.fn.pop = function(config){
		var pop = new $.nie.pop(config);
		function show(evt){
		
			if(this.tagName.toLowerCase()=='a'){
				
				var src = $(this).attr('source');
				
				if($(evt.target).attr('title')){
						pop.set('title',$(evt.target).attr('title'));
				}
				
				if(/#([0-9a-zA-Z-_]*)/.test(src)){
				
					pop.set('content',$(src).html());
					pop.show();
					
				}else if(/\.(jpg|png|gif)$/.test(src)){
					
					var img = new Image();
					img.onload=function(){
						pop.attr({
							'width':img.width,
							'height':img.height
						});
						pop.show();
						pop.set('content',img);
					}
					img.src=src;
					pop.set('content','');
					pop.show();
					
				}else{
					var w=(pop.attr('width')=='auto'?500:pop.attr('width')),
						h=(pop.attr('height')=='auto'?400:pop.attr('height'));
					pop.set('content','<iframe src="'+src+'" width="'+w+'" frameborder="0" height="'+h+'" allowtransparency="true"></iframe>');
					pop.show();
				}
				
			}
		}
		this.each(function(){
			var element = $(this);
			element.attr('source',element.attr('href')).attr('href','#nothing');
		});
		this.click(show);
		return pop;
	}
	
})(jQuery);