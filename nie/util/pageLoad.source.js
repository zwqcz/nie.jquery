nie.util.pageLoad=nie.util.pageLoad||function(options){
	$(function(){
	  var win=$(window),
		  ySpace=50,
		  imgs={},
		  bgs={},
		  hash=window.location.hash,
		  orgImgAttrName="data-src",
		  orgBgAttrName="data-bgUrl",
		  scrollFn=function(){
			var top=win.scrollTop()-ySpace,bot=top+win.height()+ySpace;	
			for(var i in imgs){
				var img=imgs[i],
					allow=false;
				if(img.b){
					if((img.y>=top  && img.y<=bot)||(img.b>=top&&img.b<=bot)) allow=true;
				}
				else if(img.y>=top && img.y<=bot) allow=true;
				if(allow){
					img.dom.attr("src",img.src);			
					//delete imgs[i];
				}
				//delete img;
			}
			for(var i in bgs){			
				var bg=bgs[i];
				if((bg.top>=top&&bg.top<=bot)||(bg.bot>=top&&bg.bot<=bot)){
					bg.dom.attr("style","background-image:url("+bg.src+")");
					//delete bgs[i];
				}
				//delete bg;			
			}
			//delete top;
			//delete bot;	
		  };
	  if(options.bgSelector){
		  $(options.bgSelector).each(function(index){
			 var self=$(this),attrVal=self.attr(orgBgAttrName);
			if(attrVal!=""){
				var top=self.offset().top+parseInt($.browser.msie?self.css("background-position-y"):self.css("background-position").split(" ")[1]);
		
				bgs[index]={
					dom:self,
					src:attrVal,
					"top":top,
					bot:top+self.height()
				};
				//delete top;
			}
			//delete self;
			//delete attrVal;
		  });
	  }
	  if(options.imgSelector){
		  $(options.imgSelector).each(function(index){
				var self=$(this),attrVal=self.attr(orgImgAttrName);
				if(attrVal!=""){
					imgs[index]={
						dom:self,
						src:attrVal,
						y:self.offset().top						
					};
					if(self.css("height")) imgs[index].b= imgs[index].y+parseInt(self.css("height"));
					else if(self.attr("height")) imgs[index].b=imgs[index].y+parseInt(self.attr("height"));
				}
				//delete self;
				//delete attrVal;
		  });  
	  }
	  win.scroll(scrollFn).resize(scrollFn);
	  if(hash==""||$("a#"+hash+"[name="+hash+"]").length==0) scrollFn();
	  //delete orgImgAttrName;  
	  //delete orgBgAttrName;
	  //delete hash;    
	});
};