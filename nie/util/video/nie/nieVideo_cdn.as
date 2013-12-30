package nie {
	public class nieVideo_cdn {
		private var path:String;
		public var channel:String;
		public var timeout:uint;
		public var rate:uint;
		public var start_rate:uint;
		public var end_rate:uint;
		public function nieVideo_cdn(_path:String, _channel:String, _timeout:uint, _rate:uint, _start_rate:uint, _end_rate:uint) {
			path=_path;
			channel = _channel;
			timeout = _timeout;
			rate = _rate;
			start_rate = _start_rate;
			end_rate = _end_rate;
		}
		public function isHitRate(rate:uint):Boolean {
			return rate >= start_rate && rate < end_rate;
		}
		public function reCountRate(_startRate:uint):void {
			start_rate = _startRate;
			end_rate = start_rate + rate;
		}
		public function get movieUrl():String {
			return "http://" + channel+path;
		}
	}
}