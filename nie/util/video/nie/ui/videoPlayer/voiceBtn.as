package  nie.ui.videoPlayer{
	import flash.display.MovieClip;
	import flash.events.MouseEvent;
	public class voiceBtn extends MovieClip {
		public var _offStatus:Boolean=false;
		private var _offEvent:MouseEvent=new MouseEvent("offEvent");
		private var _onEvent:MouseEvent=new MouseEvent("onEvent");
		public function voiceBtn() {
			// constructor code
			buttonMode= true;
			addEventListener(MouseEvent.CLICK,voiceBtnClick);			
		}
		private function goOff():void{
			_offStatus=true;
			gotoAndPlay("p1");
		}
		public function goOn():void{
			if(_offStatus){
				_offStatus=false;
				gotoAndPlay("p2");
			}
		}
		private function voiceBtnClick(evt:MouseEvent):void{						
			if(_offStatus){				
				dispatchEvent(_onEvent);
				goOn();				
			}
			else{				
				dispatchEvent(_offEvent);
				goOff();				
			}
		}

	}
	
}
