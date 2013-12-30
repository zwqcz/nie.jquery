 nie.util.share=nie.util.share||function(){
	var _href="javascript:;",
		chkDefault=function(valName,defaultVal){
			return typeof valName!="undefined"?valName:defaultVal;
	    },
		chkDatas=function(datas,valName,defaultVal){			
			var result=encodeURIComponent((typeof datas!="undefined" &&typeof datas[valName]!="undefined")?datas[valName]:defaultVal);
			return result;
		},
		combind=function(obj){
			var result=[];
			for (var i in obj){
				result.push(i+"="+obj[i]);
			}
			return result;
		},
		jump=function(id,datas){
			if(o.data[id]){
				var data=o.data[id],
				    title=chkDatas(datas,"title",document.title),
				    localUrl=chkDatas(datas,"url",window.location.href),
				    picUrl=chkDatas(datas,"img",""),
				    content=chkDatas(datas,"content",document.title),				    
				    size=[650,500],
				    ustr=combind({	
						'width':size[0],
						'height':size[1],
						'top':(screen.height - size[1]) / 4,
						'left':(screen.width - size[0]) / 2,
						'toolbar':'no',
						'menubar':'no',
						'scrollbars':'no',
						'resizable':'yes',
						'location':'no',
						'status':'no'
				    });
				for(var i in data.paramName){
				    var tmp="";
				    switch(parseInt(i)){
						case 1:
							tmp=localUrl;
							break;
						case 2:
							tmp=title;
							break;
						case 3:
							tmp=picUrl;
							break;
						case 4:
							tmp=content;
							break;
				    }					
				    data.params[data.paramName[i]]=tmp;
				}
				var url="http://"+data.file+"?"+combind(data.params).join("&");
				window.open(url,"_blank",ustr.join(','));		
			}
		},
	    o={		
			data:{},
			product:nie.config.site,	
			args:{
				"panelID":"NIE-share-panel",
				"fatID":"NIE-share",
				"type":1,
				"defShow":[5,1,2,3,8],
				"moreShow":[1,2,3,4,5,6,7,8,9,10,11,12,13],
				"searchTips":"输入网站名或拼音缩写"
			},
			addBtn:function(id,fatDom,needTxt){
				var name=o.data[id].name,					  
					  a=$("<a>",{
						  "class":"NIE-share-btn NIE-share-btn"+id,
						  index:id,
						  html:"<i class='NIE-share-png' style='background-position:0 -"+((id-1)*16)+"px'></i>"+(needTxt?name:""),
						  href:_href,
						  title:"分享到"+name
					  }).appendTo(fatDom);
				  (function(){
					  var _i=id;
					  a.click(function(){jump(_i);});
				  })();
			},
			addPanel:function(){
				var panel=$("<div>",{
					id:o.args.panelID,
					html:"<h3>分享到...</h3><input type=text value='"+o.args.searchTips+"'/><div></div>"
				}).hide().appendTo($(document.body));
				$("<button>")
					.click(function(){
						panel.hide();
					})
					.hover(function(){$(this).addClass("hover");},function(){$(this).removeClass("hover");})
					.appendTo(panel);
				var con=panel.find("div")
				for(var i in o.data){					
					o.addBtn(i,con,true);
				}
				panel.find("input")
					.click(function(){
						var self=$(this),
							val = self.val();
						if(val== o.args.searchTips){
							self.val("");
						}
					})
					.keyup(function(){
						var val = $(this).val().toLowerCase();
						con.find("a").each(function(){
							var self=$(this),
								index=self.attr("index");
							if(o.data[index].searchTxt.toLowerCase().indexOf(val)!=-1
								||
								o.data[index].searchTxt.replace(/[a-z]/g,"").toLowerCase().indexOf(val)!=-1){
								self.show();
							}
							else self.hide();
						});
					});
			},
			showPanel:function(){
				var id="#"+o.args.panelID,
					obj=$(id),
					win=$(window);
				if(obj.length==0) {
					o.addPanel();
				}
				var obj=$(id);
				obj.css({
					top:win.scrollTop()+(win.height()-obj.height())/2,
					left:(win.width()-obj.width())/2
				}).show();
			},
			render:function(){
				var obj=$("#"+o.args.fatID);
				if(obj.length>0){
					var className="";
					switch(o.args.type){
						//小号
						case 1:
							className="_small";
							break;
						//大号
						case 2:
							className="_big";
							break;
					}
					obj.addClass(className);
					$.each(o.args.defShow,function(i){
						o.addBtn(this,obj,false);
					});
					var _over=true,
						more=$("<span>",{
							html:"<span class='NIE-share-more-txt NIE-share-png'>更多</span>",
							"class":"NIE-share-more"
						}).hover(function(){
							_over=true;
							i.show();
						},function(){
							_over=false;
							setTimeout(function(){
								if(!_over) i.hide();
							},300);
						}).appendTo(obj),
						i=$("<div>",{
							"class":"NIE-share-morePanel"
						}).appendTo(more);
					$.each(o.args.moreShow,function(){
						o.addBtn(this,i,true);
					});
					$("<a>",{
						html:"<i class='NIE-share-png NIE-share-more'></i>更多...",
						href:_href,
						"class":"NIE-share-btn",
						click:function(){
							i.hide();
							o.showPanel();
						}
					}).appendTo(i);
					$.fixPNG.fix(".NIE-share-png");
				}
			}
	    };
	o.init=function(){
	    var data=[
			[1,"QQ空间","QQKongJian","sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",{1:"url",2:"title",3:"pics",4:"desc",4:"summary"}],
			[2,"新浪微博","XinLangWeiBo","v.t.sina.com.cn/share/share.php",{1:"url",2:"title",3:"pic"},{"c":"nie","content":"gb2312","source":"nie"}],
			[3,"腾讯微博","TengXunWeiBo","v.t.qq.com/share/share.php",{1:"url",2:"title",3:"pic"}],
			[4,"腾讯朋友","TengXunPengYou","sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",{1:"url",2:"title",3:"pics",4:"desc",4:"summary"},{"to":"pengyou"}],
			[5,"网易朋友","WangYiWeiBo","t.163.com/article/user/checkLogin.do",{1:"link",2:"info",3:"images"},{"check1stImg":true,"togImg":true}],
			[6,"搜狐微博","SouHuWeiBo","t.sohu.com/third/post.jsp",{1:"url",2:"title",3:"pic"},{"content":"utf-8"}],
			[7,"开心网","KaiXinWang","www.kaixin001.com/repaste/share.php",{1:"rurl",2:"rtitle",4:"rcontent"}],
			[8,"人人网","RenRenWang","share.renren.com/share/buttonshare.do",{1:"link",2:"title"}],
			[9,"搜狐白社会","SouHuBaiSheHui","bai.sohu.com/share/blank/add.do",{1:"link",2:"title"}],
			[10,"淘江湖","TaoJiangHu","share.jianghu.taobao.com/share/addShare.htm",{1:"url",2:"title",4:"content"}],
			[11,"豆瓣","DouBan","www.douban.com/recommend/",{1:"url",2:"title",3:"image"}],		
			[12,"猫扑推客","MaoPuTuiKe","tk.mop.com/api/post.htm",{1:"url",2:"title",4:"desc"}],
			[13,"百度Hi","BaiDuHi","apps.hi.baidu.com/share/",{1:"url",2:"title",4:"content"}],
			[14,"百度贴吧","BaiDuTieBa","tieba.baidu.com/i/app/open_share_api",{1:"link"}],
			[15,"百度搜藏","BaiDuShouChang","cang.baidu.com/do/add",{1:"iu",2:"it",4:"dc"},{"fr":"ien"}],
			[16,"饭否","FangFou","fanfou.com/sharer",{1:"u",2:"t",4:"d"}],
			[17,"MSN","Msn","profile.live.com/badge",{1:"url",2:"title",3:"screenshot",4:"description"},{"wa":"wsignin1.0"}],
			[18,"天涯社区","TianYaSheQu","share.tianya.cn/openapp/restpage/activity/appendDiv.jsp",{1:"ccUrl",2:"ccTitle",4:"ccBody"}],
			[19,"凤凰网微博","FengHuangWangWeiBo","t.ifeng.com/interface.php",{1:"sourceUrl",2:"title",3:"pic"}],
			[20,"139说客","139ShuoKe","shequ.10086.cn/share/share.php",{1:"tourl",2:"title"}],
			[21,"梦幻人生","MengHuanRenSheng","dream.163.com/share/link/",{1:"url",2:"title",4:"content"}]

		];
	   $.include("share.css");

	   if(arguments.length>0){
		   for(var i in o.defArgs){
			   if(typeof arguments[i]!="undefined"){
				   o.defArgs[i]=arguments[i];
			   }
		   }
	   }
	   for(var i=0,l=data.length;i<l;i++){
			var _data=data[i];
			o.data[_data[0]]={
				"name":_data[1],
				"searchTxt":_data[2],				
				"file":_data[3],
				"paramName":_data[4],
				"params":chkDefault(_data[5],{})
			}
	   }	
	   o.render();   	   
	}(arguments);
	return o;
}