/**
*	var video=new nie.util.video("#videoBox",{
		width:"100%",//视频宽度
		height:"100%",//视频高度
		//wmode:"direct",//flash wmode值,默认direct
		movieUrl:"",//视频地址
		//mp4_movieUrl:"",mp4视频地址
		//autoPlay:false,//是否自动播放，默认false
		//startImg:null,//开始图片地址，默认false
		//loopTimes:0,//循环播放次数，默认0
		//maskImg:null,//整个flash顶部遮罩图片地址，默认null
		//bufferTime:5,//缓冲时间（秒）,默认5
		//playBtnArea:null,//不自动播放情况下，设置点击播放按钮区域，"0,0,100,100" (顶点x,顶点y,宽度,高度)默认null
		//playComplete_callBack:null//每次播放完回调函数,默认null
	});
	video.change(movieURL);//改变视频地址
	video.pause();//暂停视频
	video.stop();//停止视频
	video.play();//播放视频
	video.destroy();//清空并销毁视频
**/
//函数使用在http://nstool.netease.com/ip.js
/*
netdns:用户外网使用的dns服务器
gw:用户的网关出口ip
gwdns:用户网关与dns是否匹配正确
*/
/*
nie.util.videoGW={netdns:"",gw:"",gwdns:""};
ip=function(){
	var args=arguments;
	nie.util.videoGW={netdns:args[0],gw:args[2],gwdns:args[5]};
};
nie.util.getVideoGW=nie.util.getVideoGW||function(videoIndex){
	(function(){
		var _index=videoIndex;
		$.include("http://nstool.netease.com/ip.js",function(){
			var d=nie.util.videoGW;
			nie.util.videoData[videoIndex].flashObj.send_gwData(d.netdns,d.gw,d.gwdns);
		});
	})();
};
*/
(function($){
	nie.util.videoData=nie.util.videoData||[];
	nie.util.video=nie.util.video||function(fat,data){	
				//var self=this;
				this.fatDom=$(fat);
				if(this.fatDom.length>0){			
					var index=nie.util.videoData.length,
						params={
							width:["100%",1],
							height:["100%",1],
							wmode:["direct",0],
							bgcolor:["000000",0],
							movieUrl:[null,1],
							videoWidth:[null,1],
							videoHeight:[null,1],
							volume:[.8,1],
							autoPlay:[false,1],
							startImg:[null,1],
							loopTimes:[0,1],
							maskImg:[null,1],
							bufferTime:[5,1],
							videoIndex:[index,1],
							playBtnArea:[null,1],
							allowFullScreen:[true,1]
							/*,
							playComplete_callBack:[null,1]
							*/
						},
						_api=function(fn){},
						default_params={videoWidth:"width",videoHeight:"height"},
						_flashvars={},
						cb_valName="playComplete_callBack",
						ua=navigator.userAgent,
						isIOS=/i(Phone|Pad)/i.test(ua),
						isAndroid=/Android/i.test(ua),
						isMobile=(isIOS||isAndroid),
						html5VideoObj;


					nie.util.videoData.push({cb_valName:function(){}})
					if(typeof data[cb_valName]=="function"){
						nie.util.videoData[index][cb_valName]=data[cb_valName];
					}

					for(var i in params){
						if(typeof data[i]!="undefined"){
							params[i][0]=data[i];
						}
					}
					for(var i in default_params){
						if(params[i][0]==null){
							params[i][0]=params[default_params[i]][0];
						}
					}
					for(var i in params){
						if(params[i][1]==1) _flashvars[i]=params[i][0];
					}	
					//ios、android系统，通过noFlash提示实现				
					var isUseHtml5Video=((isMobile ||!$.flash.available)&& data.mp4_movieUrl);
					if (isUseHtml5Video){
						var tags=["video","source"];
						for(var i=0,l=tags.length;i<l;i++){
							document.createElement(tags[i]);
						}
						var html5_video=$("<video>",{
							controls:true,						
							autoplay:params.autoPlay[0],						
							poster:params.startImg[0],
							src:data.mp4_movieUrl,
							loop:params.loopTimes!=0
						}).attr({
							width:params.width[0],
							height:params.height[0]
						})
						//android平台需要点击播放
						if(isAndroid) html5_video.click(function(){this.play();});
						//html5_video.click(function(){this.play();});
						$("<source>",{
							src:data.mp4_movieUrl,
							type:'video/mp4'
						}).appendTo(html5_video);									
						this.fatDom.empty().append(html5_video);
						html5VideoObj=html5_video[0];
					}
					else{
						this.fatDom.flash({
							width:params.width[0],
							height:params.height[0],
							swf: 'http://res.nie.netease.com/comm/js/nie/util/player.swf',
							allowFullScreen:params.allowFullScreen[0],					
							allowscriptaccess:"always",						
							wmode:params.wmode[0],
							bgcolor:params.bgcolor[0],
							hasVersion:10.2,
							flashvars:_flashvars
						});										
						/*
						this.send_gwData=function(netdns,gw,gwdns){
							(function(){
								var _netdns=netdns,_gw=gw,_gwdns=gwdns;
								this.fatDom.flash(function(){
									this.send_gwData(_netdns,_gw,_gwdns);
								});
							})();
						}
						*/
						nie.util.videoData[index].flashObj=this;
					}
					//清空并销毁视频
					this.destroy=function(){
						this.stop();
						this.fatDom.empty();
					}
					this.change=function(movieUrl){
							if(isUseHtml5Video){
								html5VideoObj.src=movieUrl;
							}
							else{
								this.fatDom.flash(function(){
									this.change(movieUrl);
								});
							}
					}
						//from http://stackoverflow.com/questions/2879227/html5-video-stop-onclose
					this.stop=function(){
							if(isUseHtml5Video){
								html5VideoObj.pause();
								if($.browser.mozilla) html5VideoObj.mozSrcObject=null;
								else if($.browser.opera) html5VideoObj.src=null;
								else if($.browser.webkit) html5VideoObj.src="";
								else html5VideoObj.src="";
							}
							else {
								this.fatDom.flash(function(){
									this.stopVideo();
								});
							}
					}
					this.pause=function(){
							if(isUseHtml5Video){
								html5VideoObj.pause();
							}
							else{
								this.fatDom.flash(function(){
									this.pauseVideo();
								});
							}
					}
					this.play=function(){
							if(isUseHtml5Video){
								html5VideoObj.play();
							}
							else{
								this.fatDom.flash(function(){
									this.playVideo();
								});
							}
					}
				}		

	}
})(jQuery);