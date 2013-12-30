package nie.ui.videoPlayer{
	import flash.media.*;
	import flash.events.*;
	import flash.net.*;
	import flash.display.Sprite;
	import flash.utils.setTimeout;
	import flash.utils.clearTimeout;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;
	import nie.ui.videoPlayer.*;
	

	public class FLVPlayer extends EventDispatcher
	{
		private var video:Video;
		private var sv:StageVideo;
		private var stageVideoInUse:Boolean = false;
		private var classicVideoInUse:Boolean = false;
		private var playhead:Number=0;
		private var loaded:Boolean=false;
		private var loops:int;
		private var stream:NetStream;
		private var autoplay:Boolean=false;
		private var videoURL:String=null;
		private static var delayChk_control:Number=300;
		private var control_showed:Boolean=false;
		private var control_show_timer;
		public var contain:Sprite=new Sprite();
		private var sound:SoundTransform=new SoundTransform();
		private var Control=new control();
		private var client:CustomClient =new CustomClient();
		private var _width:uint;
		private var _height:uint;
		private var played:Boolean=false;
		private var url:String=null;
		private var _videoRect:Rectangle = new Rectangle(0, 0, 0, 0);
		public function FLVPlayer(videoWidth:Number,videoHeight:Number,loops:int=1,startTime:Number=0)
		{
			this._width=videoWidth;
			this._height=videoHeight;
			playhead=startTime;
			loops=loops;			
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);			
		}		
		private function onAddedToStage(event:Event):void
		{
			var connection:NetConnection=new NetConnection();
			connection.connect(null);
			stream=new NetStream(connection);					
			
			//控制器
			Control.time_line.width=videoWidth;
			Control.y=videoHeight-Control.height;			
			contain.addChildAt(Control,0);					

			// Screen 
			video = new Video();
			video.smoothing = true;

			// Video Events 
			// the StageVideoEvent.STAGE_VIDEO_STATE informs you whether 
			// StageVideo is available 
			stage.addEventListener(StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY, onStageVideoState);

			// in case of fallback to Video, listen to the VideoEvent.RENDER_STATE 
			// event to handle resize properly and know about the acceleration mode running 
			video.addEventListener(VideoEvent.RENDER_STATE, videoStateChange);
			//... 
			stage.addEventListener(MouseEvent.MOUSE_OVER,MOUSE_OVER_Handler);
			stage.addEventListener(Event.MOUSE_LEAVE,MOUSE_LEAVE_Handler);
		}
		private function onStageVideoState(event:StageVideoAvailabilityEvent):void
		{
			// Detect if StageVideo is available and decide what to do in toggleStageVideo 
			toggleStageVideo(event.availability== StageVideoAvailability.AVAILABLE);
		}
		private function videoStateChange(event:VideoEvent)
		{
			trace(event.status);
			video.width = _width;
			video.height = _height;
		}
		private function toggleStageVideo(on:Boolean):void
		{
			// To choose StageVideo attach the NetStream to StageVideo 
			if (on)
			{
				stageVideoInUse = true;
				if ( sv == null )
				{
					sv = stage.stageVideos[0];
					sv.addEventListener(StageVideoEvent.RENDER_STATE, stageVideoStateChange);
					sv.attachNetStream(stream);
				}

				if (classicVideoInUse)
				{
					// If you use StageVideo, remove from the display list the 
					// Video object to avoid covering the StageVideo object 
					// (which is always in the background) 
					stage.removeChild( video );
					classicVideoInUse = false;
				}
			}
			else
			{
				// Otherwise attach it to a Video object 
				if (stageVideoInUse)
				{
					stageVideoInUse = false;
				}
				classicVideoInUse = true;
				video.attachNetStream(stream);
				stage.addChildAt(video, 0);
			}
			/*
			if (! played)
			{
				played = true;
				stream.play(this.url);
			}
			*/
		}
		private function stageVideoStateChange(event:StageVideoEvent)
		{

			resize();
			trace("stageVideoStateChange:"+event.status);
			//testStr+="stageVideoStateChange:"+event.status+"\n";

		}
		private function resize():void
		{
			
			var rc = getVideoRect(sv.videoWidth,sv.videoHeight);
			sv.viewPort = rc;
		}
		/**
		 * 
		 * @param width
		 * @param height
		 * @return 
		 * 
		 */		
		private function getVideoRect(width:uint, height:uint):Rectangle
		{	
			var videoWidth:uint = width;
			var videoHeight:uint = height;
			var scaling:Number = Math.min ( _width / videoWidth, _height / videoHeight );
			
			videoWidth *= scaling, videoHeight *= scaling;
			//this.testStr+=scaling;
			var posX:Number = stage.stageWidth - videoWidth >> 1;
			var posY:Number = stage.stageHeight - videoHeight >> 1;
			
			_videoRect.x = posX;
			_videoRect.y = posY;
			_videoRect.width = videoWidth;
			_videoRect.height = videoHeight;
			
			return _videoRect;
		}
		public function load(url:String=null,autoplay:Boolean=false,bufferSeconds:Number=1):void
		{					
			if (this.url == null && percentLoaded == 0)
			{				
				this.url=url;
				autoplay=autoplay;				
				stream.bufferTime=bufferSeconds;//设置缓冲时间
				stream.addEventListener(NetStatusEvent.NET_STATUS,netStatusHandler);
				stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR,netAsyncErrorHandler);				
				stream.client=client;
			}
		}
		public function MOUSE_OVER_Handler(event:MouseEvent){
			trace("mouse over video!");
			if(!control_showed){
				clearTimeout(control_show_timer);
				control_showed=true;
				control_show_timer=setTimeout(showControl,delayChk_control);			
			}
		}
		public function MOUSE_LEAVE_Handler(event:Event){			 
			trace("mouse LEAVE video!");
			if(control_showed){
				clearTimeout(control_show_timer);
				control_showed=false;
				control_show_timer=setTimeout(hideControl,delayChk_control);			
			}
		}
		private function showControl(){
			if(control_showed){
				trace("show control");
				Control.alpha=1;
			}
		}
		private function hideControl(){
			if(!control_showed){
				trace("hide control");
				Control.alpha=0;
			}
		}
		//添加多视频,进行管理
		public function add(url:String):void
		{


		}
		private function netStatusHandler(event:NetStatusEvent):void
		{
			trace("netStatusHandler start!");
			switch (event.info.code)
			{
				case "NetConnection.Connect.Success" :
					trace("NetConnection.Connect.Success");
					break;
				case "NetStream.Play.StreamNotFound" :
					throw new Error("错误");
					break;
				case "NetStream.Play.Stop" :
					stream.seek(0);
					trace("NetStream.Play.Stop");
					break;
			}
			trace("event.info.code:"+event.info.code);
		}
		private function netAsyncErrorHandler(event:AsyncErrorEvent):void
		{
			trace("netAsyncErrorHandler");
		}
		/* 
		  @ buffertime设置缓冲时间
		  @ bufferLength 数据当前存在于缓冲区中的秒数。
		  @
		 */
		public function get bufferLength():Number
		{
			return stream.bufferLength;
		}
		public function set BufferTime(time:Number):void
		{
			stream.bufferTime=time;
		}
		public function get BufferTime():Number
		{
			return 0;
		}
		/*
		public function get FLVideo():StageVideo
		{
			return video;
		}
		*/
		//设置和返回视频播放位置(以时间为单位)
		public function get position():Number
		{
			return stream.time;
		}
		public function set position(time:Number):void
		{
			stream.seek(time);
		}
		/*
		   @设置和返回视频的声音大小
		 */
		public function get volume():Number
		{
			var volumes:Number=sound.volume;
			stream.soundTransform=sound;
			return volumes;
		}
		public function set volume(volumes:Number):void
		{
			sound.volume=volumes;
			stream.soundTransform=sound;
		}

		//获取返回视频的总的时间
		public function get totalTime():Number
		{
			return 0;
		}
		//检测是不是在播放
		public function get playing():Boolean
		{
			return true;
		}
		//返回加载进度
		public function get percentLoaded():Number
		{
			var percent:Number=stream.bytesLoaded / stream.bytesTotal;
			return isNaN(percent)?0:percent;
		}
		/*
		 @ 下面是视频播放相关控制的接口
		 @
		 @
		 @
		 */
		//播放视频
		public function play():void
		{
			if (this.url != null)
			{
				stream.play(this.url);
			}
		}
		//重新播放
		public function replay():void
		{
			
		}
		//暂停
		public function pause():void
		{
			stream.pause();
		}
		//关闭
		public function close():void
		{
			stream.close();
		}
		// 回放
		public function togglePause():void
		{
			stream.togglePause();
		}
		//清除视频
		public function clear():void
		{			
			//video.clear();
		}
		public function resume():void
		{
			stream.resume();
		}
		//设置视频是否平滑
		public function set smoothing(flag:Boolean):void
		{
			//video.smoothing=flag;
		}
		//设置视频高度和宽度
		public function get videoHeight():int
		{
			return video.videoHeight;
		}
		public function set videoHeight(height:int):void
		{
			//video.height=height;
		}
		public function get videoWidth():int
		{
			return video.videoWidth;
		}
		public function set videoWidth(width:int):void
		{
			//video.width=width;
		}
	}
}