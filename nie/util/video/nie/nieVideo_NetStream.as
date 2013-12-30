package nie 
{
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.external.ExternalInterface;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.net.NetStreamInfo;
	import flash.utils.setTimeout;
	
	public class nieVideo_NetStream extends NetStream
	{
		private var config:nieVideo_config = new nieVideo_config();
		private var stats:nieVideo_stats = new nieVideo_stats();			
		private var has_stats:Boolean = false;		
		private var cdn_timeout:uint = 0;
		private var got_cdn:Boolean = false;//是否获取到cdn数据
		private var cdn_changeTimes:uint = 1;//cdn切换次数
		private var _timer = null;
		private const _time = 60 * 1000;//一分钟统计数据	
		private var _netStatusTimes:uint = 0;//网络状态变化次数
		private var original_movieUrl:String = null;//原视频地址
		private var _self:nieVideo_NetStream = null;
		private var _checkBuffer_byCDN=null;//检查首次缓冲超时情况 方便cdn超时切换
		public function nieVideo_NetStream(conn:NetConnection, peerID:String = "connectToFMS") {			
			if (_self == null) {
				_self = this;
				super(conn, peerID);
				if (config.loaded) {				
					addEvent();			
				}else {
					//log("1");
					config.addEventListener("configLoaded", function(evt:Event):void {						
						//log("2");
						addEvent();			
					});				
					config.addEventListener("ioError", function(evt:Event):void {						
						//log("3");
						addEvent();
					});
				}				
			}			
		}
		/*
		private function log(str:String):void {
			ExternalInterface.call("console.log", str+"@"+new Date().getTime());
		}
		*/
		private function addEvent() {
			_self.addEventListener(NetStatusEvent.NET_STATUS,netStatusHandler);
			_self.addEventListener(AsyncErrorEvent.ASYNC_ERROR, netAsyncErrorHandler);			
			_self.addEventListener(IOErrorEvent.NETWORK_ERROR, stream_error);			
		}
		public function set videodatarate(val):void {
			stats.vbr = val;
		}	
		private function netStatusHandler(evt:NetStatusEvent):void {
			++_netStatusTimes;
			//trace("_netStatusTimes:" + _netStatusTimes);
			//log(evt.info.code);
			stats.pushEvtLog(evt.info.code);
			//http://livedocs.adobe.com/flex/3_cn/langref/flash/events/NetStatusEvent.html
			if (evt.info.level == "error") {
				stats.play_error();
				changeCDN("error");
			}
			switch (evt.info.code){
				//播放已结束。
				case "NetStream.Play.Stop":						
					if (_netStatusTimes>1) {
						stats.play_finish();
						sendData();						
					}					
					break;
				//数据的接收速度不足以填充缓冲区。 数据流将在缓冲区重新填充前中断，此时将发送 NetStream.Buffer.Full 消息，并且该流将重新开始播放。
				case "NetStream.Buffer.Empty" :
					stats.start_buffer();
					checkBuffer_byCDN();
					break;
				//缓冲区已满并且流将开始播放。
				case "NetStream.Buffer.Full":
					stats.end_buffer();								
					break;
				//播放已开始。
				case "NetStream.Play.Start":
					stats.start_buffer();
					checkBuffer_byCDN();
					break;				
			}
		}
		private function checkBuffer_byCDN():void {
			//首次缓冲 检查cdn
			if (_checkBuffer_byCDN == null) {				
				(function() {				
					var currentTimes = _netStatusTimes;
					trace("currentTimes:"+currentTimes);
					trace("==== cdn timeout:"+cdn_timeout+"s ==========");
					_checkBuffer_byCDN=setTimeout(function() {
						trace("_netStatusTimes:" + _netStatusTimes + ",currentTimes:" + currentTimes);
						if (_netStatusTimes == currentTimes) {								
							changeCDN("timeout");												
						}
					},cdn_timeout*1000);
				})();		
			}
		}
		private function netAsyncErrorHandler(evt:AsyncErrorEvent):void {
			stats.play_error();
		}
		private function stream_error(evt:IOErrorEvent):void
		{
			stats.play_error();
		}
		private function sendData():void {
			if(!has_stats){
				has_stats = true;
				stats.send_data();
			}
		}
		override public function play(...args):void {		
			if(original_movieUrl==null) original_movieUrl = args[0];			
			if (config.loaded) {
				trace("===config.loaded======");
				_play(args);
			}else {
				(function() {
					var _args = args;
					config.addEventListener("configLoaded", function(evt:Event):void {
						trace("===configLoaded======");
						_play(_args);
					});
				})();
			}
		}
		private function _play(...args):void {						
			var cdnData:nieVideo_cdn = config.get_CDNdata(args[0]);			
			var movieUrl:String = null;	
			trace("_play.cdnData:"+cdnData);
			if (cdnData != null) {		
				trace("=====_play.case:1====");
				got_cdn = true;				
				cdn_timeout = cdnData.timeout;
				trace(cdnData.movieUrl);
				movieUrl = cdnData.movieUrl;
				trace("final movie by cdn =========");
				trace(movieUrl);
				trace("=========");
			}
			else if (!config.matchCahnnel) {
				trace("=====_play.case:2====");
				movieUrl = original_movieUrl;									
			}
			else {
				trace("=====_play.case:3====");				
			}
			if (movieUrl) super.play(movieUrl);
			if (args.length > 0&&movieUrl!=null) {
				 trace("=====2====");
				stats.movieUrl = movieUrl;		
				trace("=====3====");
				_timer = setTimeout(sendData, _time);
			}
		}
		private function changeCDN(changeReson:String):void {					
			trace("---------------changeCDN");			
			if (stats.loaded) {
				_changeCDN(changeReson);
				//log("changeCDN:1");
			}
			else {
				(function() {
					var _changeReson:String = changeReson;
					//log("changeCDN:2");
					stats.addEventListener("loadLoaded", function(evt:Event):void {
						_changeCDN(_changeReson);
						//log("changeCDN:3");
					});
				})();
			}
		}
		/*
		 * 切换cdn		 
		 */		
		private function _changeCDN(changeReson:String):void {		
			trace("check cdn_changeTimes:" + cdn_changeTimes);
			if(got_cdn&&cdn_changeTimes-->0){
				_netStatusTimes = 0;//切换cdn后重置				
				switch(changeReson) {
					case "error":
						stats.changeCDN_pre_byError();
						break;
					case "timeout":
						stats.changeCDN_pre_byTimeOut();						
						break;
				}				
				/*if (cdn_changeTimes > 0) stats.changeCDN_post_addParams();
				else stats.changeCDN_post();
				*/
				stats.changeCDN_post_addParams();
				_play(original_movieUrl);				
			}
		}
	}

}