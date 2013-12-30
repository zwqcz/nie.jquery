nie.util.debug={
	total:0,
	create:function(){	  
	  var debug={}
	  var id="NIE-debug"+nie.util.debug.total;
	  var createDOM=function(){
		  $("<div>",{
			  		  "id":id,
					  "class":"NIE-debug zoom-big",
					  html:'<h3>'+debug.title+'</h3>'
					  	   +'<button class="zoomBtn">缩小</button>'
						   +'<ol class="content showpass showerror showwarn">'
						   +'</ol>'
						   +'<p class="type">'
						   +'<label class="pass"><input type="checkbox" checked="checked" />Pass</label>'
						   +'<label class="warn"><input type="checkbox" checked="checked" />Warn</label>'
						   +'<label class="error"><input type="checkbox" checked="checked" />Error</label>'
						   +'<button class="clear">clear</button>'
						   +'</p>'
				  }
			 ).appendTo($(document.body));
	  }	 
	  var output=function(type,text){
		  var content =$("#"+id+" ol.content");		  
		  content.append($("<li>",{
			  "class":type,
			  html:"<i>"+type.toUpperCase()+":</i>"+text
		  })).scrollTo(content[0].scrollHeight);
	  }
	  debug.pass=function(text){
		  output("pass",text);
	  }
	  debug.warn=function(text){
		  output("warn",text);
	  }
	  debug.error=function(text){		 
		  output("error",text);
	  }
	  debug.title="jQuery mix NIE Debug";
	  debug.init=(function(){
		if(nie.util.debug.total==0) $.include("http://res.nie.netease.com/comm/js/nie/util/debug/base.css");		
		createDOM();
		
		setTimeout(function(){
			$("#"+id).show().scrollAction({xAlign:"right",yAlign:"bottom"});
		},100);
		
		$("#"+id+" .type button.clear").click(function(){
			$("#"+id+" ol.content").empty();
		})
		$("#"+id+" .type label").each(function(){
			var self =$(this),
				 type = self.attr("class"),
				 id="debug"+nie.util.debug.total+"-"+type;
			self.attr("for",id);
			$("input",self).attr("id",id);
		}).click(function(){
			var self =$(this),
				 type=self.attr("class"),
				 className = "show"+type,
				 chk=$("input",self).attr("checked"),
				 content=$("ol",self.parent().parent());
			if(chk) content.addClass(className);
			else content.removeClass(className);	
		});
		$("#"+id+" button.zoomBtn").click(function(){
			var self=$(this),
				content=$("#"+id);
			if(content.hasClass("zoom-small")){
				content.removeClass("zoom-small").addClass("zoom-big");
				self.text("缩小");				
			}
			else{
				content.removeClass("zoom-big").addClass("zoom-small");
				self.text("放大");
			}
		})
		//$("#"+id+" h3").drag();
		/*
		$("#"+id).keypress(function(){
			alert(1);
			var self = $(this);
			self.mousemove(function(e){
				self.css({
					left:e.pageX,
					top:e.pageY
				});
			})
		}).keyup(function(){
			$(this).unbind("mousemove");
		})
		*/
	  })() 
	  return debug;
	}
};