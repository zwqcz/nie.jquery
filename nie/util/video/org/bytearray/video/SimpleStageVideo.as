
package org.bytearray.video
{
	import flash.display.BitmapData;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.StageVideoAvailabilityEvent;
	import flash.events.StageVideoEvent;
	import flash.events.VideoEvent;
	import flash.external.ExternalInterface;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;
	import flash.media.StageVideo;
	import flash.media.StageVideoAvailability;
	import flash.media.Video;
	import flash.media.VideoStatus;
	import flash.net.NetStream;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	
	import org.bytearray.video.events.SimpleStageVideoEvent;
	import org.bytearray.video.events.SimpleStageVideoToggleEvent;

	import nie.util.img;
	import flash.events.NetStatusEvent;
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.display.MovieClip;

	/**
	 * The SimpleStageVideo class allows you to leverage StageVideo trough a few lines of ActionScript.
	 * SimpleStageVideo automatically handles any kind of fallback, from StageVideo to video and vice versa.
	 * 
	 * @example
	 * To use SimpleStageVideo, use the following lines :
	 * <div class="listing">
	 * <pre>
	 *
	 * // specifies the size to conform (will always preserve ratio)
	 * sv = new SimpleStageVideo(500, 500);
	 * // dispatched when the NetStream object can be played
	 * sv.addEventListener(Event.INIT, onInit);
	 * // informs the developer about the compositing, decoding and if full GPU states
	 * sv.addEventListener(SimpleStageVideoEvent.STATUS, onStatus);
	 * </pre>
	 * </div>
	 * 
	 * 
	 * @author Thibault Imbert (bytearray.org)
	 * @version 1.1
	 */
	public class SimpleStageVideo extends Sprite
	{		
		private var _available:Boolean;
		private var _stageVideoInUse:Boolean;
		private var _classicVideoInUse:Boolean;
		private var _played:Boolean;
		private var _rc:Rectangle;
		
		private var _videoRect:Rectangle = new Rectangle(0, 0, 0, 0);
		private var _reset:Rectangle = new Rectangle(0, 0, 0, 0);
		
		private var _initEvent:Event = new Event(Event.INIT);
		private var netStream_status:NetStatusEvent=new NetStatusEvent("stageVideo_netStatus");
		private var netStream_netAsyncErrorHandler:AsyncErrorEvent=new AsyncErrorEvent("stageVideo_netAsyncErrorHandler");
		private var netStream_IOErrorEvent:IOErrorEvent=new IOErrorEvent("stageVideo_stream_error");
		private var _topLayer:MovieClip;		
		//private var forTest=new Event("forTest");
		
		private var _ns:NetStream;
		private var _video:Video;
		private var _sv:StageVideo;
		
		public var _width:uint;
		public var _height:uint;
		private var _maskImgUrl:String=null;
		private var _added_maskImg:Boolean=false;
		private var _startImgUrl:String=null;		
		private var _added_startImg:Boolean=false;
		private var _startImg_mc:nie.util.img;
		private var _autoPlay:Boolean=false;		
		private var _org_width:int,_org_height:int;
		private var imgMC:nie.util.img;
		private var _self:SimpleStageVideo;
		private var widthTmp:int;
		private var heightTmp:int;
		/**
		 * 
		 * @param width The width of the screen, the video will fit this maximum width (while preserving ratio)
		 * @param height The height of the screen, the video will fit this maximum height (while preserving ratio)
		 * 
		 */		
		public function SimpleStageVideo(autoPlay:Boolean)
		{
			if(_self==null){
				_self=this;
			}
			trace("SimpleStageVideo");
			_autoPlay=autoPlay;
			init();
		}
		
		/**
		 * Forces the switch from Video to StageVideo and vice versa. 
		 * You should not have to use this API but can be useful for debugging purposes.
		 * @param on
		 * 
		 */		
		public function toggle(on:Boolean):void
		{			
			//trace("toggle");
			//ExternalInterface.call('console.log', 'here'+on+'_'+_available);
			//if (on && _available) 
			//{
				//_stageVideoInUse = true;
				//if ( _sv == null && stage.stageVideos.length > 0 )
				//{
					//_sv = stage.stageVideos[0];
					//_sv.addEventListener(StageVideoEvent.RENDER_STATE, onRenderState);
				//}
				//_sv.attachNetStream(_ns);
				//dispatchEvent( new SimpleStageVideoToggleEvent ( SimpleStageVideoToggleEvent.TOGGLE, SimpleStageVideoToggleEvent.STAGEVIDEO ));
				//if (_classicVideoInUse)
				//{
					//stage.removeChild ( _video );
					//_classicVideoInUse = false;
				//}
			//} else 
			//{
				if (_stageVideoInUse)
					_stageVideoInUse = false;
				_classicVideoInUse = true;
				_video.attachNetStream(_ns);
				dispatchEvent( new SimpleStageVideoToggleEvent ( SimpleStageVideoToggleEvent.TOGGLE, SimpleStageVideoToggleEvent.VIDEO ));
				stage.addChildAt(_video, 0);
			//}			
			if ( !_played ) 
			{
				_played = true;
				dispatchEvent(_initEvent);
			}
		}
		
		/**
		 * Resizes the video surfaces while always preserving the image ratio.
		 */		
		public function resize (w:uint=0, h:uint=0):void
		{
			widthTmp = w;
			heightTmp = h;
			addEventListener(Event.ENTER_FRAME, delayResize);
		}
		private function delayResize(e:Event):void {
			removeEventListener(Event.ENTER_FRAME, delayResize);
			_topLayer.width=_width = widthTmp, _topLayer.height=_height = heightTmp;
			if ( _stageVideoInUse )	{
				_sv.viewPort = getVideoRect(_sv.videoWidth, _sv.videoHeight);
			}else 
			{
				_rc = getVideoRect(_video.videoWidth, _video.videoHeight);
				_video.width = _rc.width;
				_video.height = _rc.height;
				_video.x = _rc.x, _video.y = _rc.y;
			}
		}
		public function reszieImg():void{
			if(_added_startImg){
				this._startImg_mc.resizeImg();
			}			
			if(this._added_maskImg){
				this.imgMC.resizeImg();
			}			
		}
		
		
		/**
		 * 
		 * @param stream The NetStream to use for the video.
		 * 
		 */		
		public function attachNetStream(stream:NetStream):void
		{
			trace("SimpleStageVideo.attachNetStream");
			_ns = stream;
			_ns.addEventListener(NetStatusEvent.NET_STATUS,netStream_onStatus);
			_ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR,netAsyncErrorHandler);			
			_ns.addEventListener(IOErrorEvent.IO_ERROR, stream_error);
		}
		private function netAsyncErrorHandler(evt:AsyncErrorEvent):void{
			dispatchEvent(netStream_netAsyncErrorHandler);			
		}
		private function stream_error(evt:IOErrorEvent):void{
			dispatchEvent(netStream_IOErrorEvent);			
		}
		private function netStream_onStatus(evt:NetStatusEvent):void{
			dispatchEvent(netStream_status);			
		}
		
		/**
		 * 
		 * @return Returns the internal StageVideo object used if available.
		 * 
		 */		
		public function get stageVideo():StageVideo
		{
			return _sv;
		}
		
		/**
		 * 
		 * @return Returns the internal Video object used as a fallback.
		 * 
		 */		
		public function get video():Video
		{
			return _video;
		}
	
		/**
		 * 
		 * @return Returns the Stage Video availability.
		 * 
		 */		
		public function get available():Boolean
		{
			return _available;
		}

		/**
		 * 
		 * 
		 */		
		private function init():void
		{
			trace("SimpleStageVideo.init");
			addChild(_video = new Video());
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStageView);			
			addEventListener(Event.REMOVED_FROM_STAGE, onRemovedFromStage);						
		}

		/**
		 * 
		 * @param event
		 * 
		 */		
		private function onAddedToStage(event:Event):void
		{				
			dispatchEvent(netStream_status);			
			trace("SimpleStageVideo.onAddedToStage");
			removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			
			
			_width=root.loaderInfo.parameters["videoWidth"];
			_height=root.loaderInfo.parameters["videoHeight"];	
			if(root.loaderInfo.parameters["maskImg"]&&root.loaderInfo.parameters["maskImg"]!=""){
				_maskImgUrl=root.loaderInfo.parameters["maskImg"];
			}
			_topLayer=new MovieClip();
			
			_topLayer.graphics.beginFill(0,0);
			_topLayer.graphics.drawRect(0,0,_width,_height);
			_topLayer.graphics.endFill();
			addChild(_topLayer);
			//开始时的图片
			if(!_autoPlay&&root.loaderInfo.parameters["startImg"]&&root.loaderInfo.parameters["startImg"]!=""){
				_startImgUrl=root.loaderInfo.parameters["startImg"];				
			}						
			trace("StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY");
			stage.addEventListener(StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY, onStageVideoAvailable);
			_video.addEventListener(VideoEvent.RENDER_STATE, onRenderState);
		}
		
		/**
		 * 
		 * @param event
		 * 
		 */		
		private function onAddedToStageView(event:Event):void
		{				
			trace("SimpleStageVideo.onAddedToStageView,_classicVideoInUse:"+_classicVideoInUse+",_stageVideoInUse:"+_stageVideoInUse);			
			if (_classicVideoInUse){
				trace("_classicVideoInUse");
				addChildAt(_video, 0);				
			}
			else if ( _stageVideoInUse ){
				trace("_stageVideoInUse");
				_sv.viewPort = _videoRect;
			}						
			if(!_added_maskImg && _maskImgUrl!=null){
				_added_maskImg=true;
				imgMC=new nie.util.img(_maskImgUrl,_width);				
				addChildAt(imgMC,0);
			}
			if(!_added_startImg && _startImgUrl!=null){
				_added_startImg=true;
				_startImg_mc=new nie.util.img(_startImgUrl,_width);				
				addChildAt(_startImg_mc,0);				
			}
		}
		public function hideStartImg():void{			
			if(_added_startImg){
				_added_startImg=false;
				removeChild(_startImg_mc);
			}
		}
		/**
		 * 
		 * @param event
		 * 
		 */		
		private function onRemovedFromStage(event:Event):void
		{
			trace("SimpleStageVideo.onRemovedFromStage");
			if ( !contains ( _video ) )				
				addChild(_video);
			if ( _sv != null )
				_sv.viewPort = _reset;								
		}
		

		/**
		 * 
		 * @param event
		 * 
		 */		
		private function onStageVideoAvailable(event:StageVideoAvailabilityEvent):void
		{
			trace("SimpleStageVideo.onStageVideoAvailable");
			toggle(_available = (event.availability == StageVideoAvailability.AVAILABLE));
		}

		/**
		 * 
		 * @param event
		 * 
		 */		
		private function onRenderState(event:Event):void
		{
			trace("SimpleStageVideo.onRenderState");
			var hwDecoding:Boolean;
			
			if ( event is VideoEvent )
			{
				hwDecoding = (event as VideoEvent).status == VideoStatus.ACCELERATED;
				dispatchEvent( new SimpleStageVideoEvent ( SimpleStageVideoEvent.STATUS, hwDecoding, false, false ) );
			}else 
			{
				hwDecoding = (event as StageVideoEvent).status == VideoStatus.ACCELERATED;
				dispatchEvent( new SimpleStageVideoEvent ( SimpleStageVideoEvent.STATUS, hwDecoding, true, hwDecoding && true ));
			}
				
			resize(stage.stageWidth,stage.stageHeight);
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
			
			var posX:Number = stage.stageWidth - videoWidth >> 1;
			var posY:Number = stage.stageHeight - videoHeight >> 1;
			
			_videoRect.x = posX;
			_videoRect.y = posY;
			_videoRect.width = videoWidth;
			_videoRect.height = videoHeight;
			
			return _videoRect;
		}
	}
}
