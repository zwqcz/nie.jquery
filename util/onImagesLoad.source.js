if(!window.jQuery){throw("jQuery must be referenced before using the 'onImagesLoad' plugin.");}
/**
* util
* @module util
**/
/**
*	Fires callback functions when images have loaded within a particular selector.<br>
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>util.onImagesLoaded<br>
*	作者网站：<a href="http://includes.cirkuit.net/includes/js/jquery/plugins/onImagesLoad/1.1/documentation/" target="_blank">http://includes.cirkuit.net/includes/js/jquery/plugins/onImagesLoad/1.1/documentation/</a><br>
*	@namespace $
*	@class onImagesLoad
*	@static
**/
/**
*	@constructor onImagesLoaded	
**/
(function($){
    $.fn.onImagesLoad = function(options){
        var self = this;
        self.opts = $.extend({}, $.fn.onImagesLoad.defaults, options);

        self.bindEvents = function($imgs, container, callback){
            if ($imgs.length === 0){ //no images were in selection. callback based on options
                if (self.opts.callbackIfNoImagesExist && callback){ callback(container); }
            }
            else {
                var loadedImages = [];
                if (!$imgs.jquery){ $imgs = $($imgs); }
                $imgs.each(function(i, val){
                    $(this).bind('load', function(){
                        if (jQuery.inArray(i, loadedImages) < 0){ //don't double count images
                            loadedImages.push(i); //keep a record of images we've seen
                            if (loadedImages.length == $imgs.length){
                                if (callback){ callback(container); }
                            }
                        }
                    }).each(function(){
                        if (this.complete || this.complete === undefined){ this.src = this.src; } //needed for potential cached images
                    });
                });
            }
        };

        var imgAry = []; //only used if self.opts.selectorCallback exists
        self.each(function(){
            if (self.opts.itemCallback){
                var $imgs;
                if (this.tagName == "IMG"){ $imgs = this; } //is an image
                else { $imgs = $('img', this); } //contains image(s)
                self.bindEvents($imgs, this, self.opts.itemCallback);
            }
            if (self.opts.selectorCallback){
                if (this.tagName == "IMG"){ imgAry.push(this); } //is an image
                else { //contains image(s)
                    $('img', this).each(function(){ imgAry.push(this); });
                }
            }
        });
        if (self.opts.selectorCallback){ self.bindEvents(imgAry, this, self.opts.selectorCallback); }

        return self.each(function(){}); //dont break the chain
    };

	//DEFAULT OPTOINS
    $.fn.onImagesLoad.defaults = {
        selectorCallback: null,        //the function to invoke when all images that $(yourSelector) encapsultaes have loaded (invoked only once per selector. see documentation)
        itemCallback: null,            //the function to invoke when each item that $(yourSelector) encapsultaes has loaded (invoked one or more times depending on selector. see documentation)
        callbackIfNoImagesExist: false //if true, the callbacks will be invoked even if no images exist within $(yourSelector).
                                       //if false, the callbacks will not be invoked if no images exist within $(yourSelector).
    };
})(jQuery);