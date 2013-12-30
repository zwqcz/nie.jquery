package nie.util
{
	import flash.display.*;
	import flash.net.URLRequest;
	import flash.events.Event;
	public class img extends Sprite
	{
		private var pictLdr:Loader ;//建立loader对象
		private var _org_width:int=0;
		//private var pictURLReq:URLRequest;
		public function img(imgUrl:String,org_width:Number)
		{
			_org_width=org_width;
			var pictURLReq:URLRequest= new URLRequest(imgUrl);//建立载入接收对象
			pictLdr= new Loader();
			pictLdr.load(pictURLReq);
			//载入;
			
			pictLdr.contentLoaderInfo.addEventListener(Event.COMPLETE, imgLoaded);
			//addChild(pictLdr);
			//this.addChild(pictLdr);
		}
		
		public function resizeImg():void{
			//pictLdr.visible=false;
			/*
			var _img=this.getChildByName("img")
			if(_img){*/
				pictLdr.scaleX=pictLdr.scaleY=stage.stageWidth/_org_width;
			//}
		}		
		//载入完成后响应;		
		private function imgLoaded(event:Event):void
		{
			//pictLdr.content.x=0;
			//pictLdr.content.y=0;			
			pictLdr.scaleX=pictLdr.scaleY=stage.stageWidth/_org_width;
			pictLdr.name="img";
			this.addChild(pictLdr);			
		}
		
	}
}