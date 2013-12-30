package  nie.ui.videoPlayer{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	public class nieVolume extends Sprite{
		private var allowPointMove:Boolean=false;		
		public var precent:Number=.7;		
		private var _changeVolumeEvent:MouseEvent=new MouseEvent("changeVolumeEvent");
		private var _voiceBtn_off_Event:MouseEvent=new MouseEvent("voiceBtn_off_Event");
		public function nieVolume()  {
			// constructor code
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
		}
		private function onAddedToStage(evt:Event):void{
			setPrecent(precent);
			voiceBtn.status="normal";
			voiceBtn.useHandCursor=true;
			voiceBtn.addEventListener(MouseEvent.CLICK,function(evt:MouseEvent):void{
									  	voiceBtn.status=(voiceBtn.status=="normal")?"none":"normal";
									  	voiceBtn.gotoAndStop(voiceBtn.status);
									  });
			mouseArea.addEventListener(MouseEvent.CLICK,function(evt:MouseEvent):void{									   
									   setPrecent(evt.localX/mouseArea.width);
									   });
			mouseArea.addEventListener(MouseEvent.MOUSE_MOVE,function(evt:MouseEvent):void{									   
									   if(allowPointMove){										   									   		
											setPrecent(evt.localX/mouseArea.width);									   }
									   
									   });			
			point.addEventListener(MouseEvent.MOUSE_DOWN,function(evt:MouseEvent):void{								   
								   allowPointMove=true;
								  // evt.stopPropagation();
								   });
			point.addEventListener(MouseEvent.MOUSE_UP,function(evt:MouseEvent):void{
								   allowPointMove=false;
								   });			
		}
		public function setPrecent(_precent:Number):void{			
			point.x=mouseArea.width*_precent+mouseArea.x;
			maskMC.width=mouseArea.width*_precent;
			_changeVolumeEvent.localX=_precent;
			
			dispatchEvent(_voiceBtn_off_Event);
			
			dispatchEvent(_changeVolumeEvent);
			
		}
		
	}
	
}
