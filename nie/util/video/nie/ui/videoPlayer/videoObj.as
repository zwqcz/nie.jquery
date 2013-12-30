package nie.ui.videoPlayer
{
	import flash.media.*;
	import flash.events.*;
	import flash.net.*;
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;
	public class videoObj
	{
		private var sv:StageVideo;
		private var v:Video;
		public var stageVideoInUse:Boolean = false;
		public var classicVideoInUse:Boolean = false;
		public function videoObj()
		{
			// constructor code
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
		}
		private function onAddedToStage(event:Event):void
		{

			// Screen 
			v = new Video();
			v.smoothing = true;

			// Video Events 
			// the StageVideoEvent.STAGE_VIDEO_STATE informs you whether 
			// StageVideo is available 
			stage.addEventListener(StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY, onStageVideoState);

			// in case of fallback to Video, listen to the VideoEvent.RENDER_STATE 
			// event to handle resize properly and know about the acceleration mode running 
			v.addEventListener(VideoEvent.RENDER_STATE, videoStateChange);
			//... 
		}
		private function onStageVideoState(event:StageVideoAvailabilityEvent):void
		{
			// Detect if StageVideo is available and decide what to do in toggleStageVideo 
			toggleStageVideo(event.availability== StageVideoAvailability.AVAILABLE);
		}
		private function videoStateChange(event:VideoEvent)
		{
			trace(event.status);
			v.width = _width;
			v.height = _height;
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
					sv.attachNetStream(ns);
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
				video.attachNetStream(ns);
				stage.addChildAt(video, 0);
			}

			if (! played)
			{
				played = true;
				ns.play(FILE_NAME);
			}
		}
	}

}