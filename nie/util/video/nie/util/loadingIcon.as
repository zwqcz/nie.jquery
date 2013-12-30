package nie.util
{
	import flash.display.MovieClip;
	import flash.utils.*;
	import flash.events.*;
	import flash.events.Event;
	import flash.text.TextField;

	public class loadingIcon extends MovieClip
	{
		public var _txt:TextField=new TextField();
		private var _dis:int=15;
		public function loadingIcon()
		{
			addEventListener(Event.ADDED_TO_STAGE,addtoStageHander);
		}
		private function addtoStageHander(evt:Event):void{
			x=stage.stageWidth / 2
			y = stage.stageHeight / 2;
			var total = 0;
			var timer;
			var cen_x = 0;
			var cen_y = 0;
			var dis = _dis;
			var totalcon = 8;
			timer=setInterval(function(){
			if(total++<totalcon){
			var m:loadingMC=new loadingMC();
			var r=2*Math.PI*total/totalcon;			
			m.x=Math.cos(r)*dis+cen_x;
			m.y=Math.sin(r)*dis+cen_y;
				addChild(m);
			}
			else{
				clearInterval(timer);
			}
			},100);			
			_txt.height=20;
			_txt.width=_dis;
			_txt.x=-_dis/2;
			_txt.y=-_dis/2-3;
			_txt.textColor=0xffffff;
			_txt.autoSize ="center";
			_txt.backgroundColor=0x000000;
			addChild(_txt);
			
		}

	}

}