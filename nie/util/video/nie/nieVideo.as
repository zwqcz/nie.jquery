package nie
{
	import flash.display.MovieClip;
	import org.bytearray.video.*;
	import flash.net.NetStream;
	import flash.net.NetConnection;
	import org.bytearray.video.events.SimpleStageVideoEvent;
	import flash.events.*;
	import flash.display.Sprite;
	import flash.text.TextField;
	import nie.ui.videoPlayer.CustomClient;
	import flash.media.SoundTransform;
	import flash.external.ExternalInterface;
	import flash.utils.setTimeout;
	import nie.util.img;
	import nie.util.loadingIcon;
	import nie.ui.videoPlayer.controller;
	import flash.ui.ContextMenu;
	import flash.ui.ContextMenuItem;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
//import flash.system.Security;

	public class nieVideo extends Sprite
	{
		private var _sv:SimpleStageVideo;
		//private var _ns:NetStream;
		private var _ns:nieVideo_NetStream;
		private var _nc:NetConnection;
		private var _videoUrl:String = null;
		private var _preLoad_precent:Number = 0;		
		private var _ld_icon:loadingIcon=null;
		private var _txt:TextField=new TextField();
		private var _cc:controller;
		private var _client:Object=new Object();
		private var _stopBtn_big:stopBtn_big= new stopBtn_big();
		private var _loopTimes:Number = 0;//重播次数 -1:无限次
		private var _playComplete:Boolean = false;//是否播放完毕
		private var _Width:Number;
		private var _Height:Number;
		private var _tf:SoundTransform;
		private var _autoPlay:Boolean = true;
		private var _videoIndex:int = 0;
		private var _hideController:Boolean = false;
		private var _1stTime_hideController:Boolean = false;		
		private static var _autoPlay_click2play:Boolean = false;
		private static var _bufferTime:int = 5;//缓冲时间
		private static var _self:nieVideo = null;
		private var _volumeVal:Number = .7;
		private var _sw:uint,_sh:uint;
		private var playerLastEvent:String = "";
		private var _clickAreaLayer:Sprite;//默认下等待播放的点击区域
		private var _needClickArea:Boolean = false;//默认下等待播放的点击区域
		private var _clickArea:Array;//默认下等待播放的点击区域
		//private var _logTimes:int=0;
		public function nieVideo()
		{
			//Security.allowDomain("*");
			if (_self==null)
			{
				_self = this;
			}
			_client.onMetaData = function(info:Object):void {
				if (info["videodatarate"]) {					
					_ns.videodatarate = info["videodatarate"];
				}			
				_client.duration=info.duration;
				_client.width=info.width;
				_client.height=info.height;
				_client.framerate=info.framerate;
				_cc.main.txt_totalTime.text="/ "+num(Math.round(info.duration/60))+":"+num(Math.round(info.duration%60)); 
			};			
			if (ExternalInterface.available)
			{
				setTimeout(function(){
				   ExternalInterface.addCallback("change",function(videoUrl){
				  if(_playComplete){  
						_playComplete=false;
				  }
				  _cc.showStopBtn();
				  _stopBtn_big.visible=false;
				  _videoUrl=videoUrl;
				  _ns.play(_videoUrl);
				 });
				ExternalInterface.addCallback("pauseVideo", stopFn);				
				ExternalInterface.addCallback("playVideo", playFn);
				ExternalInterface.addCallback("stopVideo",function(){
				 _ns.close();
				 });
				},10);
		    }
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			menuInit();			
		}
		private function menuInit():void
		{
			//定义菜单项
			var menuItem1:ContextMenuItem = new ContextMenuItem("NetEase GameDep.");
			var menuItem2:ContextMenuItem = new ContextMenuItem("NIE Video Player v1.19.4");
			var menuItem3:ContextMenuItem = new ContextMenuItem("by Lam");
			//添加菜单事件侦听
			menuItem1.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,reg);
			//定义并声名菜单;
			var myMenu:ContextMenu = new ContextMenu();
			//隐藏默认菜单
			myMenu.hideBuiltInItems();
			//添加定义的菜单项;
			myMenu.customItems.push(menuItem1);
			myMenu.customItems.push(menuItem2);
			myMenu.customItems.push(menuItem3);
			//替代系统的默认菜单;
			this.contextMenu = myMenu;
			//响应菜单单击事件
			function reg(e:ContextMenuEvent)
			{
				var tagetURL:URLRequest = new URLRequest("http://nie.163.com/");
				navigateToURL(tagetURL);
			}			
		}
		/*
		private function log(obj:Object)
		{
			var txtName = "statusTxt";
			if (! this.getChildByName(txtName))
			{
				_txt.name = txtName;
				_txt.backgroundColor = 0x000000;
				_txt.textColor = 0xffffff;
				_txt.width = 200;
				_txt.height =300;
				addChild(_txt);
			}
			_txt.text=(obj.toString());
			
			
		}
		*/
		/*
		private function log(str:String):void {
			flash.external.ExternalInterface.call("console.log", str+"@"+new Date().getTime());
		}
		*/
		private function onAddedToStage(evt:Event):void
		{
			var re = new RegExp("^http://(?:[^\.]+\.){1,3}(?:163|netease)\.com/","ig");
			//var _tmp = "http://v.zh.netease.com/gw/11v1/featrue_750x422.f4v";
			var _tmp = root.loaderInfo.parameters["movieUrl"];
			if (_tmp && re.test(_tmp))
			{
				_videoUrl = _tmp;
			}
			else
			{
				return;
			}
			if (root.loaderInfo.parameters["loopTimes"])
			{
				_loopTimes = root.loaderInfo.parameters["loopTimes"];
			}
			if (root.loaderInfo.parameters["width"])
			{
				_Width = root.loaderInfo.parameters["width"];
			}
			if (root.loaderInfo.parameters["height"])
			{
				_Height = root.loaderInfo.parameters["height"];
			}
			if (root.loaderInfo.parameters["volume"])
			{
				_volumeVal = root.loaderInfo.parameters["volume"];
			}
			if (root.loaderInfo.parameters["autoPlay"] && root.loaderInfo.parameters["autoPlay"] == "false")
			{
				_autoPlay = false;
			}
			if (root.loaderInfo.parameters["bufferTime"])
			{
				_bufferTime = root.loaderInfo.parameters['bufferTime'];
			}
			if (root.loaderInfo.parameters["videoIndex"])
			{
				_videoIndex = root.loaderInfo.parameters['videoIndex'];
			}			
			if (root.loaderInfo.parameters["playBtnArea"]&&!_autoPlay)
			{				
				_clickArea = root.loaderInfo.parameters['playBtnArea'].split(",");//x,y,width,height
				for (var i = 0, l = _clickArea.length; i < l; i++) {
					_clickArea[i] = uint(_clickArea[i]);
				}
				_needClickArea = true;
			}
			

			//createStageVideo();
			stage.addEventListener(Event.MOUSE_LEAVE,stage_mouseLeave);
			stage.addEventListener(FullScreenEvent.FULL_SCREEN, fullScreenHandler);
			stage.addEventListener(Event.RESIZE,resizeHandler);
			addEventListener(MouseEvent.ROLL_OVER,self_mouseOver);
			addEventListener(Event.ENTER_FRAME,preLoad_enterFrame);
			addEventListener(Event.ENTER_FRAME,play_enterFrame);
			//netConnect
			_nc=new NetConnection();
			_nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			_nc.connect(null);
			//controller
			_cc = new controller(_volumeVal,_autoPlay);			
			_cc.addEventListener("timeBar_clickEvent",function(evt:MouseEvent){
				if(_playComplete){
					_cc.showStopBtn();
					_stopBtn_big.visible=false;
					_playComplete=false;
				}
				//log(_cc.clickTime_precent+","+_client.duration*_cc.clickTime_precent);
				var gotoTime:Number=_client.duration*_cc.clickTime_precent;
				_ns.seek(gotoTime);
			});
			_cc.addEventListener("timeBar_moveEvent",function(evt:MouseEvent){ 
				var seconds:Number=_client.duration*evt.localX/_cc.cirle_line_width;
				if(_client.duration>=seconds&&seconds>=0){
				_cc.main.timeTips.txt.text=num(int(seconds/60))+":"+num(Math.round(seconds%60));
				}
			});
			_cc.addEventListener("playBtn_clickEvent",function(evt:MouseEvent){
				playFn();
			});
			_cc.addEventListener("stopBtn_clickEvent",function(evt:MouseEvent){
				 stopFn();
			 });
			_cc.addEventListener("fullBtn_clickEvent",function(evt:MouseEvent){ 
				//_sv.resize(stage.fullScreenWidth,stage.fullScreenHeight);
			 //_sv.resizeImg();
			 });
			_cc.main.volumeMC.addEventListener("changeVolumeEvent",function(evt:MouseEvent):void{
				_ns.soundTransform =  new SoundTransform(evt.localX);
			 });			
			addChild(_cc);
			
			 //stop btn
			_stopBtn_big= new stopBtn_big();
			_stopBtn_big.visible = false;
			_stopBtn_big.addEventListener(MouseEvent.CLICK,function(evt:MouseEvent):void{  
			_sv.addEventListener(MouseEvent.CLICK,svClick);
			_cc.showStopBtn();
			playFn();
			});
			addChild(_stopBtn_big);
		}
		private function resizeHandler(evt:Event):void
		{
			//log(stage.stageWidth);
			addEventListener(Event.ENTER_FRAME, resizeBar);
			_cc.resize_items();
		}
		private function resizeBar(evt:Event):void {
			removeEventListener(Event.ENTER_FRAME, resizeBar);
			_sw = stage.stageWidth;
			_sh = stage.stageHeight;
			_sv.resize(_sw,_sh);
			_sv.reszieImg();
			//_sv.resizeImg();
			_self._Width = _sw;
			_stopBtn_big.x = _sw / 2;
			_stopBtn_big.y = _sh / 2;
		}
		private function createStageVideo():void
		{
			//netStream
			//_ns = new NetStream(_nc);
			_ns = new nieVideo_NetStream(_nc);
			_ns.client = _client;
			_ns.bufferTime = _bufferTime;
			//SoundTransform
			_tf = new SoundTransform(_volumeVal);
			_ns.soundTransform = _tf;
			//stageVideo
			_sv = new SimpleStageVideo(_autoPlay);
			_sv.addEventListener(Event.INIT, onInit);
			_sv.addEventListener(SimpleStageVideoEvent.STATUS,onStatus);
			if (_autoPlay)
			{
				_sv.addEventListener(MouseEvent.CLICK,svClick);
			}
			_ns.addEventListener(NetStatusEvent.NET_STATUS,onNetStatus);
			_ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR,netAsyncErrorHandler);
			_ns.addEventListener(IOErrorEvent.NETWORK_ERROR,stream_error);			
			_sv.attachNetStream(_ns);
			addChild(_sv);
		}
		private function fullScreenHandler( evt:FullScreenEvent ):void
		{
			/*
			if (event.fullScreen == false)
			{
				//如果当前是一般模式
				//_sv.resize(_sv.width,_sv.height);
				_cc.hide();
			}
			*/
			addEventListener(Event.ENTER_FRAME, resetBar);
			_cc.resize_items();
		}
		private function resetBar(evt:Event):void {
			removeEventListener(Event.ENTER_FRAME, resetBar);
			_sw = stage.stageWidth;
			_sh = stage.stageHeight;
			_sv.resize(_sw,_sh);
			//_sv.resizeImg();
			_stopBtn_big.x = _sw / 2;
			_stopBtn_big.y = _sh / 2;
		}
		
		private function svClick(evt:MouseEvent):void
		{
			//log("svClick");
			stopFn();
			_sv.removeEventListener(MouseEvent.CLICK,svClick);
		}
		private function showClickArea():void {			
			_clickAreaLayer = new Sprite();
			_clickAreaLayer.buttonMode = true;
			_clickAreaLayer.graphics.beginFill(_clickArea[0],_clickArea[1]);
			_clickAreaLayer.graphics.drawRect(_clickArea[0],_clickArea[1],_clickArea[2],_clickArea[3]);
			_clickAreaLayer.graphics.endFill();
			_clickAreaLayer.alpha = 0;
			_clickAreaLayer.addEventListener(MouseEvent.CLICK, function(evt:MouseEvent):void {
				playFn();
			});
			addChild(_clickAreaLayer);
		}
		private function hideClickArea():void {
			_needClickArea = false;
			removeChild(_clickAreaLayer);			
			_sv.addEventListener(MouseEvent.CLICK,svClick);
		}
		private function playFn():void
		{
			trace("playFn");
			if (_needClickArea) {
				hideClickArea();				
			}
			_sv.hideStartImg();
			_cc.showStopBtn();
			_stopBtn_big.visible = false;

			//禁止自动播放第一次点击播放时
			if (! _autoPlay && ! _autoPlay_click2play)
			{
				_autoPlay_click2play = true;
				_ns.play(_videoUrl);
			}
			else
			{
				_sv.addEventListener(MouseEvent.CLICK,svClick);
				if (_playComplete)
				{
					_ns.seek(0);
					_playComplete = false;
				}
				else
				{
					_ns.togglePause();
				}
			}
			if (ExternalInterface.available) {
				ExternalInterface.call("nie.util.videoData[" + this._videoIndex + "].play_callBack");
			}
		}		
		private function stopFn():void
		{
			_cc.showPlayBtn();
			_stopBtn_big.visible = true;
			_ns.pause();
			hideLoading();
		}
		private function netAsyncErrorHandler(evt:AsyncErrorEvent):void
		{
			//log_test(evt.text);
			_cc.add_stautsTxt("链接同步错误");
		}
		private function self_mouseOver(evt:MouseEvent)
		{
			_cc.show();
		}
		private function stage_mouseLeave(evt:Event)
		{
			_cc.hide();
		}
		private function num(num:uint):String
		{
			return num<10?"0"+num:num.toString();
		}
		private function preLoad_enterFrame(event:Event):void
		{
			_preLoad_precent = _ns.bytesLoaded / _ns.bytesTotal;
			_cc.move_preLoadTimePoint(_preLoad_precent);
			if (_preLoad_precent>=1)
			{
				removeEventListener(Event.ENTER_FRAME,preLoad_enterFrame);
			}
		}
		private function play_enterFrame(event:Event):void
		{
			var time:Number = _ns.time;
			if (! isNaN(time))
			{
				_cc.move_playTimePoint(_cc.cirle_line_width*time/_client.duration);

				_cc.main.txt_currentTime.text=num(time/60)+":"+num(time%60);
			}
			//log_test(Math.round((_ns.bufferLength/_ns.bufferTime)*100));
		}
		private function showLoading():void
		{
			_cc.add_stautsTxt("缓冲中,请稍后...");			
			if(_ld_icon==null){
				_ld_icon = new loadingIcon();			
				addChild(_ld_icon);
			}
			else {
				_ld_icon.visible = true;
			}
			_ld_icon.addEventListener(Event.ENTER_FRAME,loadingFn);						
		}
		private function loadingFn(evt:Event):void {
			var precent = Math.round(_ns.bufferLength / _ns.bufferTime * 100);
			if(precent<=100){
				_ld_icon._txt.text = precent.toString();
			}
		}
		private function hideLoading():void
		{
			_cc.add_stautsTxt("");
			_ld_icon.visible = false;
			_ld_icon.removeEventListener(Event.ENTER_FRAME, loadingFn);
			
			//_self.removeChild(_ld_icon);
		}		
		private function videoStoped():void{
			if (_loopTimes==-1)
			{	//log(1.1);
					_playComplete=false;
					_ns.seek(0);
			}
			else if (_loopTimes>0)
			{				
					//log(1.2);
					_playComplete=false;
					_loopTimes--;
					_ns.seek(0);
			}
			else
			{				
					//log(1.3);
					_playComplete = true;
					_stopBtn_big.visible = true;
					_cc.showPlayBtn();
			}
			if (ExternalInterface.available) {
				ExternalInterface.call("nie.util.videoData["+this._videoIndex+"].playComplete_callBack");
			}
		}
		//http://codingrecipes.com/detecting-the-end-of-flv-stream-in-actionscript-3
		//http://miss4813.iteye.com/blog/659936
		//http://wangguorui89.iteye.com/blog/771725
		private function onNetStatus(evt:NetStatusEvent):void
		{
			var code = evt.info.code;		
			//log(code);
			if (playerLastEvent == "NetStream.Buffer.Flush" && code == "NetStream.Buffer.Empty") { 				
				videoStoped();
				return;
			} else if (playerLastEvent == "NetStream.Buffer.Flush" && code != "NetStream.Buffer.Empty"){				
				playerLastEvent = ""; // Sometimes it throws the Flush event 
			}
			else if (code== "NetStream.Buffer.Flush"){				
				playerLastEvent = "NetStream.Buffer.Flush";
			}
			switch(code) {	
				case "NetConnection.Connect.Success":
					createStageVideo();
					//_cc.add_stautsTxt("连接中,请稍后...");
					break;
				//数据的接收速度不足以填充缓冲区。 数据流将在缓冲区重新填充前中断，此时将发送 NetStream.Buffer.Full 消息，并且该流将重新开始播放。
				case "NetStream.Buffer.Empty" :
					if(!_playComplete){
						showLoading();
					}
					break;
				//缓冲区已满并且流将开始播放。
				case "NetStream.Buffer.Full" :
					hideLoading();
					break;
				case "NetStream.Play.Start" :
					showLoading();
					break;
				case "NetStream.Play.Stop"://log(8);
					videoStoped();
					break;
				default:
					break;
			}
			
			/*switch (evt.info.level)
			{
			case "status" :
			switch (evt.info.code)
			{
			case "NetStream.Buffer.Flush":
			playerLastEvent =evt.info.code;
			break;
			case "NetConnection.Connect.Success" :
			createStageVideo();
			break;
			case "NetStream.Seek.Notify" :
			//showLoading();
			break;
			case "NetStream.Play.StreamNotFound" :
			throw new Error("错误");
			break;
			//数据的接收速度不足以填充缓冲区。 数据流将在缓冲区重新填充前中断，此时将发送 NetStream.Buffer.Full 消息，并且该流将重新开始播放。
			case "NetStream.Buffer.Empty" :
			if(!_playComplete){
			showLoading();
			}
			break;
			//缓冲区已满并且流将开始播放。
			case "NetStream.Buffer.Full" :
			hideLoading();
			break;
			case "NetStream.Play.Stop":
			if (_loopTimes==-1)
			{
			
			_playComplete=false;
			_ns.seek(0);
			}
			else if (_loopTimes>0)
			{
			
			_playComplete=false;
			_loopTimes--;
			_ns.seek(0);
			}
			else
			{
			
			_playComplete = true;
			_stopBtn_big.visible = true;
			_cc.showPlayBtn();
			}
			break;
			case "NetStream.Play.Start" :
			showLoading();
			break;
			
			}
			break;
			case "error" :
			log("error:"+evt.info.code);
			break;
			}*/

		}
		private function stream_error(evt:IOErrorEvent):void
		{
			_cc.add_stautsTxt("链接错误");
			//log_test(evt.text);
		}

		private function onInit(evt:Event):void
		{
			/*log_test("onInit");
			log_test("_sv.available:"+_sv.available);*/
			//log("_sv.available:"+_sv.available);
			/*
			if (_sv.available)
			{
			
			}
			else
			{
			
			}
			*/
			//log(_sv.available);
			//log_test("stage onInit");
			_stopBtn_big.x = stage.stageWidth / 2;
			_stopBtn_big.y = stage.stageHeight / 2;


			if (! _autoPlay)
			{
				if (_needClickArea) {//默认下等待播放的点击区域
					showClickArea();					
				}
				else{
					_stopBtn_big.visible = true;
				}
				//_ns.pause();
			}
			else
			{
				_ns.play(_videoUrl);
			}
		}
		private function onStatus(evt:Event):void
		{
			//log("onStatus:"+evt.toString());
			//log_test("_sv.onStatus:"+evt.toString());
		}

	}

}