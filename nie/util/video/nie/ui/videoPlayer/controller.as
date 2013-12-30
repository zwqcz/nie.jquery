package nie.ui.videoPlayer
{
	import com.greensock.TweenLite;
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.utils.*;
	import flash.events.*;
	import fl.transitions.Tween;		
	import fl.transitions.easing.*;
	import flash.display.StageDisplayState;
	import com.greensock.TweenMax;
	public class controller extends Sprite
	{
		public var showed:Boolean = true;
		private var timer;
		private var time_hide:Number = 500;
		private var time_show:Number = 200;
		private var timeTips_showed:Boolean=false;
		private static var _w:Number=0;
		private static var _tmp:Number=0;
		private var _videoWidth:Number;
		private var _videoHeight:Number;
		private var _timeBar_clickEvent:MouseEvent=new MouseEvent("timeBar_clickEvent");
		private var _timeBar_moveEvent:MouseEvent=new MouseEvent("timeBar_moveEvent");
		private var _playBtn_clickEvent:MouseEvent=new MouseEvent("playBtn_clickEvent");
		private var _stopBtn_clickEvent:MouseEvent=new MouseEvent("stopBtn_clickEvent");
		private var _fullBtn_clickEvent:MouseEvent=new MouseEvent("fullBtn_clickEvent");
		//private var _tw:Tween,_tw2:Tween;
		public var twTime_show:Number=8;
		public var twTime_hide:Number=7;
		public var cirle_2w:Number=16.2;
		public var cirle_w:Number=cirle_2w/2;
		public var cirle_line_width:Number=0;
		public var autoPlay:Boolean;
		private var _defaultVolume:Number=.7;
		private var _tmp2:Number=0;
		private static var _self:controller=null;
		public var clickTime_precent:Number=0;
		private var _cricl_isShowed:Boolean=showed;
		private var _autoHide:Boolean=showed;		
		public function controller(defaultVolume:Number,_autoPlay:Boolean)
		{
			this.autoPlay = _autoPlay;
			if(_self==null){
				_self=this;
			}			
			addEventListener(Event.ADDED_TO_STAGE,added);
			main.volumeMC.precent = _defaultVolume = defaultVolume;						
			main.timeTips.visible=timeTips_showed;
			visible = showed;			
				
			if(autoPlay) showStopBtn();
			else showPlayBtn();
			timeBar.addEventListener(MouseEvent.MOUSE_MOVE,timeBar_mouseMove);
			timeBar.addEventListener(MouseEvent.ROLL_OUT,timeBar_mouseOut);
			timeBar.addEventListener(MouseEvent.ROLL_OVER,timeBar_mouseOver);
			timeBar.addEventListener(MouseEvent.CLICK,timeBar_click);			
			main.playBtn.addEventListener(MouseEvent.CLICK,playBtnClick);
			main.stopBtn.addEventListener(MouseEvent.CLICK,stopBtnClick);
			
			//main.fullBtn.x=_videoWidth-20-main.fullBtn.width;
			main.fullBtn.addEventListener(MouseEvent.CLICK,fullBtn_click);			
			//main.volumeMC.x=_videoWidth-50-main.volumeMC.width;
			main.volumeMC.addEventListener("voiceBtn_off_Event",function(evt:MouseEvent):void{				
					main.volumeMC.voiceBtn.goOn();
			});
			main.volumeMC.voiceBtn.addEventListener("offEvent",function(evt:MouseEvent):void{													
													main.volumeMC.setPrecent(0);													
													});
			main.volumeMC.voiceBtn.addEventListener("onEvent",function(evt:MouseEvent):void{													
													main.volumeMC.setPrecent(1);													
													});													
			 if(_autoHide){
				setTimeout(hide,5000);
			 }
		}
		
		/**
		 * 增加状态文字
		 * @param	str
		 */
		public function add_stautsTxt(str:String):void {
			main.statusTxt.text = str;
		}
		private function added(evt:Event):void{
			resize_items();
		}
		public function resize_items():void{
			visible = false;
			TweenLite.killTweensOf(_self, true);
			TweenLite.killTweensOf(_self.main, true);
			addEventListener(Event.ENTER_FRAME, resizeDelay);
		}
		private function resizeDelay(e:Event):void {
			removeEventListener(Event.ENTER_FRAME, resizeDelay);
			var sh=stage.stageHeight;
			var sw = stage.stageWidth;
		   visible=true;
			y=sh-height;
			_videoHeight=sh;
			_videoWidth=timeBar.width=main.timeBar_bg.width=main.bar_repeat.width=sw;
			cirle_line_width=_videoWidth-cirle_2w;			
			_w=main.timeTips.width/2;
			_tmp=_videoWidth-_w;
			_tmp2=_videoWidth-cirle_w;
			main.fullBtn.x=_videoWidth-20-main.fullBtn.width;
			main.volumeMC.x=_videoWidth-50-main.volumeMC.width;
			if(sw<300){
				main.volumeMC.visible=false;							
			}
			else{
				main.volumeMC.visible=true;
			}
		}
		private function fullBtn_click(evt:MouseEvent):void{				
			stage.displayState = StageDisplayState.FULL_SCREEN;
			//this.visible=false;			
			dispatchEvent(_fullBtn_clickEvent);
		}
		public function showStopBtn():void{
			main.playBtn.visible=false;
			main.stopBtn.visible=true;
		}
		public function showPlayBtn():void{
			main.playBtn.visible=true;
			main.stopBtn.visible=false;
		}
		private function playBtnClick(event:MouseEvent):void{			
			dispatchEvent(_playBtn_clickEvent);
		}
		private function stopBtnClick(event:MouseEvent):void{			
			dispatchEvent(_stopBtn_clickEvent);
		}
		public function move_playTimePoint(w:Number)
		{			
			playCricl.x=w;//cirle_w+cirle_line_width*w/this._videoWidth;			
		}
		public function move_preLoadTimePoint(precent:Number){
			preLoad_timePoint.width=precent*_videoWidth;
		}
		private function timeBar_click(event:MouseEvent):void{
			//_timeBar_clickEvent.localX=event.stageX;			
			_self.clickTime_precent=event.stageX/stage.stageWidth;
			dispatchEvent(_timeBar_clickEvent);
		}		
		private function move_timeTips(mX:Number){						
			if(mX>_w && mX<_tmp){
				main.timeTips.gotoAndStop("mid");
				main.timeTips.icon.x=-main.timeTips.icon.width/2;
				main.timeTips.x=mX;								
			}
			else if(mX<=_w){
				if(mX<_w*.5) main.timeTips.gotoAndStop("left");
				else main.timeTips.gotoAndStop("mid");
				main.timeTips.icon.x=-5.3-(_w-mX)*.6;
				main.timeTips.x=_w;
			}
			else if(mX>=_tmp){				
				if(mX>_tmp+_w*.5) main.timeTips.gotoAndStop("right");
				else main.timeTips.gotoAndStop("mid");
				main.timeTips.icon.x=-4-(_tmp-mX)*.6;
				main.timeTips.x=_tmp;
			}
		}
		private function timeBar_mouseMove(event:MouseEvent):void{
			var mX=event.stageX;						
			if(mX>cirle_w && mX<_tmp2){				
				_timeBar_moveEvent.localX=mX-cirle_w;
				dispatchEvent(_timeBar_moveEvent);				
			}
			else if(mX<=cirle_w) mX=0;
			else if(mX>=_tmp2) mX=_videoWidth;
			move_timeTips(mX);
		}
		private function timeBar_mouseOut(event:MouseEvent):void{
			main.timeTips.visible=false;
		}
		private function timeBar_mouseOver(event:MouseEvent):void{
			main.timeTips.visible=true;
			//move_timeTips(event.stageX);
		}
		private function actionCricl(isShow:Boolean){
			if(isShow){
				if(!_cricl_isShowed){
					_cricl_isShowed=true;
					_self.playCricl.gotoAndPlay("show");
				}
			}
			else{
				if(_cricl_isShowed){
					_cricl_isShowed=false;
					_self.playCricl.gotoAndPlay("hide");
				}
			}
		}
		public function show():void
		{						
				_self.showed = true;
				clearTimeout(_self.timer);
				_self.timer=setTimeout(function(){
					if(_self.showed){
						//new Tween(_self,"y",None.easeOut,_self.y,_self._videoHeight-_self.height,_self.twTime_show);						
						//new Tween(_self.main,"alpha",None.easeIn,_self.main.alpha,1,_self.twTime_show);						
						TweenLite.to(_self,0.5, { y:_self._videoHeight-_self.height});
						TweenLite.to(_self.main,0.5, { alpha:1});
						actionCricl(true);
					}
				 },_self.time_show);			
		}
		public function hide():void
		{			
				_self.showed = false;
				clearTimeout(_self.timer);				
				_self.timer=setTimeout(function(){
					if(!_self.showed){																		
						//new Tween(_self,"y",None.easeOut,_self.y,_self._videoHeight-33,_self.twTime_hide);
						//new Tween(_self.main,"alpha",None.easeIn,_self.main.alpha,0,_self.twTime_hide);						
						//TweenMax.to(_self,_self.twTime_hide, { y:_self._videoHeight-33, autoAlpha:0});
						TweenLite.to(_self,0.5, { y:_self._videoHeight-33});
						TweenLite.to(_self.main,0.5, { alpha:0});
						actionCricl(false);
					}
				 },_self.time_hide);			
		}
	}
}