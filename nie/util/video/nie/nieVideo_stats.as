package nie
{
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.external.ExternalInterface;
	import flash.utils.ByteArray;
	import flash.utils.setTimeout;

	/**
	 * ...
	 * @author ...
	 * 
这是已经和cc那边得视频直播联调后的格式。好像除了serverip他们没法取得外，其他都没问题了。如果你们需要监控视频质量的话，请按以下格式在播放器提交监测结果到我们得日志服务器吧。测试时有什么问题可以联系我。
http://valy.nie.163.com/query?channel=xxxx&path=videopath&status=(finish\error\cancel)&fbt=xxx&rbt=xxx&rbc=xxx&serverip=112.90.216.36&netdns=124.95.147.31&gw=121.18.209.23&gwdns=(correct/error/unknown)&type=(live/ondemand)&returncode=403/404/200&vbr=xxx
channel:视频的频道（域名）
path :视频原始文件的地址。只包含域名后的路径
status:播放状态，正常播放到指定时间或视频结束finish，错误error，用户取消cancel），如果是error的话，需要记录returncode
fbt:首次缓冲时间（first buffer time）
rbt:再缓冲时间(re-buffer time),此项累计
rbc:再缓冲次数(re-buffer count),此项累计
serverip:访问的视频服务器的ip
netdns、gw、gwdns 3项需要通过访问http://nstool.netease.com/ip.js获得.
ip('218.107.55.253',
'广东省 广州市 联通',
'218.107.55.113',
'广东省 广州市 联通',
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2',
'correct');

返回信息如上所示，其中第一个ip是用户的gw，第二个ip是为用户外网的dns，括号内最后一项是用户网关与dns是否匹配的判断。
netdns:用户外网使用的dns服务器
gw:用户的网关出口ip
gwdns:用户网关与dns是否匹配正确
type:视频播放类型，live直播，ondemand点播
returncode:http返回码
vbr:视频码率vbr


统计时间，暂定1分钟。如果视频测试时间内内仍无法完成缓冲或用户提前取消，则统计到事件触发时为止。


视频质量好坏的评定为用户体验指数单位是秒
与之相关的参数是fbt、rbt、rbc、rate
用户体验指数=（fbt + rbt）+1*rbc 
不同的码率的用户指数需要分开计算。

	 */
	public class nieVideo_stats  extends Sprite
	{		
		private var channel:String = null;//视频的频道（域名）
		private var path:String = null;// 视频原始文件的地址。只包含域名后的路径
		private var status:String = "finish";//播放状态，正常播放到指定时间或视频结束finish，错误error，用户取消cancel），如果是error的话，需要记录returncode
		private var fbt:Number = 0;//首次缓冲时间（first buffer time）
		private var rbt:Number = 0;//再缓冲时间(re-buffer time),此项累计
		private var rbc:uint = 0;//再缓冲次数(re-buffer count),此项累计
		private var serverip:String = null;// 访问的视频服务器的ip
		private var netdns:String = null;// 用户外网使用的dns服务器
		private var gw:String = null;// 用户的网关出口ip
		private var gwdns:String = null;// 用户网关与dns是否匹配正确
		private var type:String = "ondemand";//视频播放类型，live直播，ondemand点播
		private var returncode:uint=200;//http返回码
		public var vbr:uint;//视频码率vbr
		private var _movieUrl:String = null;//视频url		
		private var gw_loader:URLLoader = new URLLoader();		
		private var start_buffer_time:Number = 0;//每次缓冲时间的开始时间（方便计算缓冲时间）
		private var bufferLog:Array = new Array();//统计缓冲日志
		private var netStatus_evtLog:Array = new Array();//网络流状态事件日志
		private var st:Number = new Date().getTime();//start time 开始运行时间
		private var swid:String = null;//改变cdn使用，标识一次切换，6-digits随机值（用UTC秒+IP作为种子，要保证至少一天内不重复），同一次切换前后两条日志用同一个swid；
		private var plusParams:Object = null;
		private var loadLoaded:Event = new Event("loadLoaded");
		public var loaded:Boolean = false;//是否已加载http://nstool.netease.com/ip.js
		public function nieVideo_stats()
		{			
			gw_loader.dataFormat = URLLoaderDataFormat.TEXT;
			gw_loader.addEventListener(Event.COMPLETE, gw_loadComplete );
			gw_loader.load(new URLRequest("http://nstool.netease.com/ip.js"));
		}
		public function pushEvtLog(evtCode:String):void {
			netStatus_evtLog.push(evtCode);
		}
		//播放出错
		public function play_error():void {
			this.status = "error";
		}
		public function play_finish():void {
			this.status = "finish";
		}
		public function play_cancel():void {
			this.status = "cancel";
		}
		public function set movieUrl(url:String):void {
			this._movieUrl = url;			
			var m:Array = this._movieUrl.match(new RegExp(/^http:\/\/([^\/]+)([^$]+)/));
			if (m.length == 3) {
				this.channel = m[1];
				this.path = m[2];
			}
		}		
		private function ip2Num(ip:String):Number {
			var ipArray:Array = ip.split(".");
			var result:Number = 0;
			for (var i = 0, l = ipArray.length; i < l;i++) {
				result+=Math.pow(256,i)*Number(ipArray[i]);
			}
			return result;
		}
		private function get_swid(ip:String):String {
			var ipNum:Number = ip2Num(ip);
			var r:uint = Math.floor(Math.random() * 1000);//随机数
			var now = new Date();
			var ts:Number = Number(now.getUTCHours().toString() + now.getUTCMinutes().toString() + now.getUTCSeconds().toString());//时间戳:小时分钟秒
			return Number(ipNum.toString()+ts.toString()+r.toString()).toString(32);
		}
		private function gw_loadComplete(evt:Event):void {					
			var m:Array = (gw_loader.data as String).match( new RegExp(/ip\('([^']+)','[^']+','([^']+)',(?:'[^']+',){2}'([^']+)'\);/));			
			if (m.length ==4) {				
				netdns = m[1];
				gw = m[2];
				gwdns = m[3];				
			}						
			swid = get_swid(gw);
			trace("swid:" + swid);
			loaded = true;
			dispatchEvent(loadLoaded);
		}
		public function start_buffer():void {			
			if(start_buffer_time==0){//判断之前是否缓冲完毕
				start_buffer_time = new Date().getTime();						
				bufferLog.push([0,start_buffer_time].join(","));
				rbc++;			
			}
		}		
		public function end_buffer():void {
			if(start_buffer_time>0){
				var bufferTime = (new Date().getTime() - start_buffer_time) / 1000;
				bufferLog.push([1,start_buffer_time,new Date().getTime()].join(","));
				if (rbc == 1) {
					fbt = bufferTime;
				}
				else {
					rbt += bufferTime;
				}
				start_buffer_time = 0;
			}
		}
		//4. 发生切换后，以下日志参数需要重新初始化：channel、returncode、 status、st、fbt、rbt、rbc；
		private function reset_byChangeCDN():void {
			returncode = 200;
			status = "finish";
			st = new Date().getTime();
			fbt = 0;
			rbt = 0;
			rbc = 0;
		}
		//改变cdn时 更改新增数据
		private function plusParams_byChangeCDN(swstage:String,swtrig:String,swtime:String):void {
			plusParams= {
				"swstage":swstage,
				"swid":swid,
				"swtime":swtime,
				"swtrig":swtrig
				};
		}
		//切换cdn前，原因是timeout
		public function changeCDN_pre_byTimeOut():void {			
			plusParams_byChangeCDN("pre", "timeout",new Date().getTime().toString());
			send_data();
			reset_byChangeCDN();
		}
		//切换cdn前，原因是error
		public function changeCDN_pre_byError():void {			
			plusParams_byChangeCDN("pre", "error",new Date().getTime().toString());
			send_data();
			reset_byChangeCDN();
		}
		//切换cdn后 只是增加参数
		public function changeCDN_post_addParams():void {
			plusParams_byChangeCDN("post", "null", null);
			
		}
		//切换cdn后 增加参数马上发数据
		public function changeCDN_post():void {
			changeCDN_post_addParams();
			send_data();
		}
		public function send_data():void {			
			if (start_buffer_time > 0) {//在缓冲中
				end_buffer();
			}			
			var params = { 
				"channel":channel,
				"path":path,
				"status":status,
				"fbt":fbt,
				"rbt":rbt,
				"rbc":rbc,
				//"serverip":this.serverip,
				"netdns":netdns,
				"gw":gw,
				"gwdns":gwdns,
				"type":type,
				"returncode":returncode,
				"vbr":vbr,
				/* 发送缓冲日志数据
				 * 先后顺序，发缓冲事件的数据结构:  0,nowTime|1,preTime,currentTime
				 * 0:开始缓冲
				 * 1:结束缓冲
				 * nowTime:开始缓冲时的时间
				 * preTime:完成缓冲前的时间
				 * currentTime:完成缓冲时的时间
				*/
				//"bl":bufferLog.join("|"),
				//"evt":netStatus_evtLog.join("|"),
				"st":st,//开始运行时间
				"rt":(new Date().getTime()-st)/1000//run time 运行时间
			},array_params:Array = [];			
			if (plusParams != null) {
				for (var key in plusParams) {
					trace(key+":"+plusParams[key]);
					params[key] = plusParams[key];
				}
			}			
			for (var i in params) {
				array_params.push(i + "=" + params[i]);
			}
			var url:String = "http://valy.nie.163.com/query?" + array_params.join("&");			
			trace("send data:"+url);
			var ld:Loader = new Loader();
			setTimeout(function(){
				ld.load(new URLRequest(url));							
			},0);
		}
	}
}