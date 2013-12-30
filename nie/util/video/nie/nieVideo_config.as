package nie 
{	
	import flash.display.Sprite;	
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.xml.XMLNode;
	public class nieVideo_config extends Sprite
	{		
		private var _channel:String = null;//视频的频道（域名）		
		private const xmlUrl:String = "http://res.nie.netease.com/comm/js/nie/util/player.xml";								
		private var _channelXml:XMLList;
		private var cdnDatas:Array = new Array();
		private var cdn_totalRate:uint = 100;
		private var configLoaded:Event = new Event("configLoaded");
		private var ioError:Event = new Event("ioError");
		public var loaded:Boolean = false;		
		public var matchCahnnel:Boolean = false;//是否匹配使用channel
		public function nieVideo_config() {
			var xmlLoader:URLLoader= new URLLoader();
			xmlLoader.addEventListener(Event.COMPLETE, completeHandler);
			xmlLoader.addEventListener(IOErrorEvent.NETWORK_ERROR, ioErrorHandler);
			xmlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			xmlLoader.load(new URLRequest(xmlUrl));
		}
		private function httpStatusHandler(evt:HTTPStatusEvent):void {
			if (evt.status == 404) {
				dispatchEvent(ioError);
			}
		}
		private function ioErrorHandler(evt:IOErrorEvent):void {
			dispatchEvent(ioError);
		}
		private function completeHandler(evt:Event):void {			
			var xml:XML = XML(evt.target.data);
			_channelXml = xml.child("movieCDNcontrol")[0].channel;			
			loaded = true;			
			dispatchEvent(configLoaded);
		}		
		/*
		 * 
		 */
		public function get_CDNdata(movieUrl:String):nieVideo_cdn {		
			trace("-----------------------------");
			trace("---------get_CDNdata---------");			
			var result:nieVideo_cdn = null;
			if(cdnDatas){
				var newCdnDatas:Array = new Array();
				trace("cdn_totalRate:" + cdn_totalRate);
				trace("cdnDatas.length:"+this.cdnDatas.length);
				var randomRate:uint = uint(Math.random()*cdn_totalRate);
				if (cdnDatas.length == 0) {				
					trace("case:1");
					var m:Array = movieUrl.match(new RegExp(/^http:\/\/([^\/]+)([^$]+)/));
					var _path:String = null;
					if (m.length == 3) {
						_channel = m[1];
						_path = m[2];
					}												
					trace("channel len:" + _channelXml.length());
					for (var i = 0; i <_channelXml.length(); i++) {													
						if (_channel.toLowerCase() == _channelXml[i].attribute("domain")) {						
							matchCahnnel = true;
							var cdn:XMLList=_channelXml[i].child("cdn");											
							var count_rate:uint = 0;
							for (var j = 0; j < cdn.length(); j++) {
								var rate:uint = Number(cdn[j].child("rate")[0]);
								cdnDatas.push(new nieVideo_cdn(_path,cdn[j].child("domain")[0], uint(cdn[j].child("timeout")[0]),rate, count_rate, count_rate+rate));													
								count_rate += rate;
							}						
							for (var k = 0; k < cdnDatas.length; k++) {
								trace("randomRate:"+randomRate);
								trace(cdnDatas[k].start_rate+"-"+cdnDatas[k].end_rate);
								if (cdnDatas[k].isHitRate(randomRate)) {								
									result = cdnDatas[k];
									trace("====got result===");								
									cdn_totalRate-= cdnDatas[k].rate;
									trace(cdnDatas[k]);
								}
								else newCdnDatas.push(cdnDatas[k]);
							}
							break;
						}
					}
				}else {
					trace("case:2");
					var reCount_startRate:uint = 0;
					trace("randomRate:"+randomRate);
					for (var n = 0; n < cdnDatas.length; n++) {	
						trace("reCount_startRate:" + reCount_startRate);
						trace(cdnDatas[n].start_rate+"-"+cdnDatas[n].end_rate);
						cdnDatas[n].reCountRate(reCount_startRate);
						trace(cdnDatas[n].start_rate+"-"+cdnDatas[n].end_rate);
						reCount_startRate += cdnDatas[n].rate;										
						if (cdnDatas[n].isHitRate(randomRate)) {
							result = cdnDatas[n];
							cdn_totalRate-= cdnDatas[n].rate;
						}
						else {
							trace("yes") ;						
							newCdnDatas.push(cdnDatas[n]);						
						}
					}				
				}
				cdnDatas = (newCdnDatas.length == 0?null:newCdnDatas);
			}
			trace("result:" + result );			
			if (result) trace("result.channel:" + result.channel);							
			trace("cdnDatas:" + cdnDatas);
			if(cdnDatas) trace("cdnDatas.length:"+cdnDatas.length);
			trace("---------end:get_CDNdata---------");
			trace("-----------------------------");
			return result;			
		}		
	}
}