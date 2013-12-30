package  nie.ui.videoPlayer{
	import flash.events.*;
	import flash.display.MovieClip;
	public class loading  extends MovieClip{
		private var _max_alpha:Number=.8;
		public function loading() {
			// constructor code
			alpha=_max_alpha;
			addEventListener(Event.ENTER_FRAME,enterFrameHander);
		}
		private function addedHander(evt:Event):void{
			addEventListener(Event.ENTER_FRAME,enterFrameHander);
		}
		private function enterFrameHander(evt:Event):void{			
			if(alpha>=0){				
				alpha-=.05;
			}
			else{				
				alpha=_max_alpha;
			}
			
		}

	}
	
}
