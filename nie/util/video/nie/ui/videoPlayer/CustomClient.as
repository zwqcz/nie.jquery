package nie.ui.videoPlayer
{
	import flash.events.Event;
	import flash.display.DisplayObject;
	import flash.text.TextField;
	import flash.net.NetStream;

	public class CustomClient
	{
		public var duration:Number=0;
		public var width:Number=0;
		public var height:Number=0;
		public var time:Number=0;
		public var name:String=null;
		public var type:String=null;
		public var framerate:Number=0;		
		public var totalTime_obj:TextField;
		public var ns:NetStream;
		public function CustomClient()
		{
			// constructor code
		}
		private function num(num:uint):String
		{
			return num<10?"0"+num:num.toString();
		}
		public function onMetaData(info:Object):void
		{
			duration=info.duration;
			width=info.width;
			height=info.height;
			framerate=info.framerate;
			trace("metadata: duration=" + info.duration + " width=" + info.width + " height=" + info.height + " framerate=" + info.framerate);			
			totalTime_obj.text="/ "+num(Number(duration/60))+":"+num(duration%60); 
		}
		public function onCuePoint(info:Object):void
		{
			time=info.time;
			name=info.name;
			type=info.type;			
			trace("cuepoint: time=" + info.time + " name=" + info.name + " type=" + info.type);
		}
		public function onPlayStatus(info:Object):void{
			ns.pause();
			switch(info.code){
				case "NetStream.Play.Complete":
					ns.pause();
					break;
				case "NetStream.Play.Switch":
					break;
			}
		}
	}

}