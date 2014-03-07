//是否记录了回访数据，防止重复记录
nie.util.share_traceCome=nie.util.share_traceCome||false;
nie.util.share_css=nie.util.share_css||false;
(function($){
    nie.util.share=nie.util.share||function(){
        var _href="javascript:;",
            chkDefault=function(valName,defaultVal){
                return typeof valName!="undefined"?valName:defaultVal;
            },
            loadImg=function(src){
                $(new Image())
                    .bind('readystatechange',function(){
                        // 如果图片已经存在于浏览器缓存
                        if(this.readyState=="complete"){
                            return;// 直接返回，不用再处理onload事件
                        }
                    })
                    .bind("abort",function(){
                        return;
                    })
                    .attr("src",src);
            },
            chkDatas=function(valName,id,defaultVal,plusContent){
                var	result=(o.args[valName]!=null)?o.args[valName]:defaultVal;
                if(result=="") return result;
                else{
                    if(valName=="url"){
                        result=addUrlMark(result,id);
                    }
                    return encodeURIComponent(result+(typeof plusContent!="undefined"?plusContent:""));
                }
            },
            combind=function(obj){
                var result=[];
                for (var i in obj){
                    result.push(i+"="+obj[i]);
                }
                return result;
            },
            track=function(id){
                var params=[
                    "product="+o.args.product,
                    "id="+id,
                    "type="+o.args.traceType
                ];
                loadImg("http://click.ku.163.com/share.v2.gif?"+params.join("&"));
            },
        /*
         fixPng=function(str){
         if($.browser.msie<7) $.fixPNG.fix(str);
         },*/
        //在链接中增加回访记录标记
            aObj=function(url){
                /*
                 var a=document.createElement("a");
                 a.setAttribute("href",url);
                 return a;
                 */
                var div = document.createElement('div');
                div.innerHTML = '<a href="' + url.replace(/"/g, '%22') + '"/>';
                return div.firstChild;
            },
            addUrlMark=function(url,id){
                var _m=url.match(o.args.urlReg);
                if(_m){
                    return url.replace(_m[0],_m[1]+[id,o.args.product,o.args.traceType].join(","));
                }
                else{
                    var a=aObj(url),
                        _search=a.search+((a.search=="")?"?":"&")+"nieShare="+[id,o.args.product,o.args.traceType].join(","),
                        _pathname=/^\//.test(a.pathname)?a.pathname:"/"+a.pathname,
                        _host=(a.port==80)?a.hostname:a.host;
                    return  a.protocol+"//"+_host+_pathname+_search+a.hash;
                }
            },
            jump=function(id){
                if(o.data[id]){
                    var data=o.data[id],
                        _localUrl=chkDatas("url",id,location.href),
                        _title=chkDatas("title",id,document.title),
                        _picUrl=chkDatas("img",id,""),
                        _content=chkDatas("content",id,document.title),
                    //size=(id==22?[460,380]:[650,500]),
                        size=(function(){
                            var __size=[650,500];
                            id==22?__size=[460,380]:'';
                            id==23?__size=[573,600]:'';
                            return __size;
                        }()),
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
                                tmp=_localUrl;
                                break;
                            case 2:
                                tmp=((id==5)?_title+_localUrl:_title);
                                //if(o.args.append_title) tmp+=encodeURIComponent(o.args.append_title);
                                break;
                            case 3:
                                tmp=_picUrl;
                                break;
                            case 4:
                                tmp=_content;
                                break;
                            case 5:
                                tmp=encodeURIComponent(nie.util.siteName());
                                break;
                        }
                        data.params[data.paramName[i]]=tmp;
                    }
                    var url="http://"+data.file+"?"+combind(data.params).join("&");
                    window.open(url,"_blank",ustr.join(','));
                    track(id);
                }
            },
            o={
                data:{},
                args:{
                    panelID:"NIE-share-panel",
                    fat:"#NIE-share",
                    product:nie.config.site,
                    imgs:null,
                    txt:null,
                    type:1,
                    traceType:null,
                    imgSize:[100,100],
                    /*
                     大话2:
                     QQ空间 新浪微博 腾讯微博 网易微博 人人网
                     */
                    defShow:[23,22,5,2,1,4],//(nie.config.site=="xy2")?[1,2,3,8]:[5,1,2,3],
                    defShow2:[23,22,5,2,1,4,3,8],//(nie.config.site=="xy2")?[1,2,3,5,8]:[5,1,2,3,8,4],
                    moreShow:[23,22,5,1,2,3,4,6,7,8,9,10,11,13],
                    searchTips:"输入网站名或拼音缩写",
                    sideBar_top:100,
                    title:null,
                    //append_title:null,//#在title后面追加内容
                    url:null,
                    img:null,
                    content:null,
                    urlReg:new RegExp("([&?]nieShare=)(\\d+),([^,]+),(\\d+)")
                },
                addBtn:function(id,btnHeight,leftPos,fatDom,needTxt,type){
                    var name="",
                        moreTxt="",
                        id=parseInt(id),
                        t='分享到',
                        _html="",
                        aStyle="",
                        pos=0,
                        _size=20;
                    switch(chkDefault(type,o.args.type)){
                        case 1:
                            pos=-(btnHeight-20+(id-1)*5+(id-1)*20);
                            id==22?pos=-325:'';
                            id==23?pos=-350:'';
                            break;
                        case 2:
                            //pos=(id==22)?-160:-id*32;//pos=-id*32;
                            pos=-(id-1)*40-80;
                            id==22?pos=-40:'';
                            id==23?pos=-0:'';
                            _size=36;
                            break;
                        case 3:
                            pos=-(btnHeight-16+(id+1)*6+(id+1)*16);
                            break;
                    }
                    var _style='background-position:'+leftPos+'px '+pos+'px';
                    if(needTxt==true){
                        name=o.data[id].name;
                        moreTxt=t+name;
                        aStyle=_style;
                    }
                    else if(needTxt==false){
                        moreTxt=t+o.data[id].name;
                        _html="<img width="+_size+" height="+_size+" src='http://res.nie.netease.com/comm/blank.gif' style='"+_style+"'>"
                    }
                    else{
                        name=needTxt;
                        aStyle=_style;
                    }
                    var _obj={index:id,
                        "class":o.args.type==6?"NIE-share":"",
                        style:aStyle,
                        href:_href,
                        title:moreTxt,
                        target:"_self"
                    };
                    if(_html==""){
                        _obj.text=name;
                    }else{
                        _obj.html=_html;
                    }
                    var	a=$("<a>",_obj).appendTo(fatDom);
                    (function(){
                        var _i=id;
                        a.click(function(){jump(_i);}).addClass('NIE-share-btn'+_i);
                    })();
                    return a;
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
                    var con=panel.find("div");
                    for(var i in o.data){
                        o.addBtn(i,12,5,con,true,1);
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
                                if(o.data[index].name.toLowerCase().indexOf(val)!=-1
                                    ||
                                    o.data[index].searchTxt.toLowerCase().indexOf(val)!=-1
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
                    obj=$(id);
                    var tmp=win.scrollTop()+(win.height()-obj.height())/2;
                    obj.css({
                        top:tmp<0?0:tmp,
                        left:(win.width()-obj.width())/2
                    }).show().find("a").show();
                },
                render:function(){
                    var type=o.args.type;
                    if(o.args.traceType==null) o.args.traceType=type;
                    if(type==1||type==2){
                        var fat=$(o.args.fat);
                        if(fat.length>0){
                            var shareObj=$("<span>",{
                                    "class":"NIE-share NIE-share"+type,
                                    html:"<span class='NIE-share-txt'>分享到:</span>"
                                }).appendTo(fat),
                                iconBtns=$("<span>",{
                                    "class":"NIE-share-iconBtn"
                                }).appendTo(shareObj);
                            if($.browser.webkit) {
                                iconBtns.css("fontSize",type==2?"41px":"20px");
                            }
                            $.each(o.args.defShow,function(i){
                                o.addBtn(this,20,0,iconBtns,false);
                            });
                            var _over=true,
                                _timer,
                                more=$("<span>",{
                                    html:"<em></em>",
                                    "class":"NIE-share-more"
                                }).mouseenter(function(){
                                        clearTimeout(_timer);
                                        _over=true;
                                        var win=$(window),
                                            morePanel=$(this).children("span"),
                                        //obj=$(this).find("span"),
                                            h=morePanel.outerHeight(),
                                            w=morePanel.outerWidth(),
                                            pos=shareObj.offset();//morePanel.offset();
                                        morePanel.css({"top":(win.scrollTop()+win.height()<pos.top+h+20)?-h-12:4,
                                            "left":(win.scrollLeft()+win.width()<pos.left+shareObj.width()+w)?-w+42:0
                                        }).fadeIn("fast");
                                    }).mouseleave(function(){
                                        clearTimeout(_timer);
                                        _over=false;
                                        _timer=setTimeout(function(){
                                            if(!_over) morePanel.fadeOut("fast");
                                        },500);
                                    }).appendTo(shareObj),
                                morePanel=$("<span>").appendTo(more);
                            $.each(o.args.moreShow,function(){
                                o.addBtn(this,20,5,morePanel,true,1);
                            });
                            /*取消更多的分享，只留10个
                            [多人会话]h|小马|网站|黄耀文|5790 -  说: (2014-03-06 11:28:33)
                            你先保留10个以内，看看有哪些
                            [多人会话]熊猫丨网站|黎芷然 - 你瞞我瞞 说: (2014-03-06 11:28:38)
                            顺序可以调整下
                            土豆|郭剑飞|网站 - 幸福就是一觉醒来,窗外的阳光依然灿烂。 说: (2014-03-06 11:29:15)
                            按照新版来吧
                            */
                            /*o.addBtn(-1,12,5,morePanel,"更多...",1).click(function(){
                                morePanel.fadeOut("fast");
                                o.showPanel();
                            });*/
                            //fixPng(".NIE-share-iconBtn a i,.NIE-share-more em,.NIE-share-more a i");
                        }
                    }
                    else if(type==3){
                        var _id="NIE-share-sideBar",
                            _showStatus=false,
                            _overStatus=false,
                            _time=500,
                            _timer,
                            sideBar=$("<div>",{
                                id:_id,
                                html:"<div><b></b><span><button></button><h3>分享到...</h3><p></p></span></div>",
                                mouseleave:function(){
                                    if(_showStatus){
                                        clearTimeout(_timer);
                                        _overStatus=false;
                                        _timer=setTimeout(function(){
                                            if(!_overStatus) {
                                                sideBar.animate({"width":30},_time)
                                                con.animate({"right":-120},_time,function(){_showStatus=false;});
                                            }
                                        },_time*2);
                                    }
                                },
                                mouseenter:function(){
                                    if(_showStatus){
                                        clearTimeout(_timer);
                                        _overStatus=true;
                                    }
                                }
                            }).appendTo($(document.body)),
                            p=sideBar.find("p"),
                            con=sideBar.find("div"),
                            setPos=function(){
                                sideBar.css("top",$(window).scrollTop()+o.args.sideBar_top);
                            };
                        $.each(o.args.moreShow,function(){
                            o.addBtn(this,20,5,p,true,1);
                        });
                       /* o.addBtn(-1,12,5,p,"更多...").click(function(){
                            o.showPanel();
                        });
                        */
                        sideBar.find("b").hover(function(){
                            if(!_showStatus){
                                _showStatus=true;
                                sideBar.animate({"width":150},_time)
                                con.animate({"right":0},_time);
                            }
                        });
                        sideBar.find("button").click(function(){
                            con.animate({"right":-150},_time,function(){sideBar.remove();});
                        }).hover(function(){$(this).addClass("hover");},function(){$(this).removeClass("hover");});
                        if($.browser.msie&&$.browser.msie<=6){
                            $(window).scroll(setPos);
                            setPos();
                        }
                        else{
                            sideBar.css({
                                "position":"fixed",
                                "top":o.args.sideBar_top
                            });
                        }
                        //fixPng("#NIE-share-sideBar div span p a i");
                    }
                    else if(type==4 && o.args.imgs){
                        var _id="NIE-share-img",
                            obj=$("#"+_id),
                            obj_created=(obj.length>0),
                            timer,
                            time=500,
                            imgs=$(o.args.imgs),
                            overStatus=false,
                            chkImgSize=function(obj){
                                return o.args.imgSize[0]<obj.outerWidth()&&o.args.imgSize[1]<obj.outerHeight();
                            };
                        imgs.hover(function(){
                            var self=$(this),
                                h=self.outerHeight(),
                                pos=self.offset(),
                                space=10,
                                win=$(window),
                                objH=obj.outerHeight();
                            if(chkImgSize(self)){
                                clearTimeout(timer);
                                overStatus=true;
                                o.args.img=aObj(self.attr("src")).href;
                                obj.find(".NIE-share-more>span").hide();
                                obj.css({
                                    top:(pos.top+h>win.scrollTop()+win.height())?pos.top+space:pos.top+h-space-objH,
                                    left:pos.left+space
                                }).show();
                            }
                        },function(){
                            var self=$(this);
                            if(chkImgSize(self)){
                                overStatus=false;
                                clearTimeout(timer);
                                timer=setTimeout(function(){
                                    if(!overStatus){
                                        obj.hide();
                                    }
                                },time);
                            }
                        });
                        o.args.defShow=o.args.defShow2;
                        if(!obj_created){
                            obj=$("<div>",{
                                id:_id,
                                mouseenter:function(){
                                    clearTimeout(timer);
                                    overStatus=true;
                                },
                                mouseleave:function(){
                                    overStatus=false;
                                    clearTimeout(timer);
                                    timer=setTimeout(function(){
                                        if(!overStatus) obj.hide();
                                    },time)
                                }
                            }).appendTo($(document.body))

                            o.args.type=1;
                            o.args.fat=obj;
                            arguments.callee();
                        }
                    }
                    else if(type==5 && o.args.txt){
                        var _id="NIE-share-txt",
                            obj=$("#"+_id),
                            obj_created=(obj.length>0),
                            over_status=false,
                            txt=$(o.args.txt),
                            getTxt=function(){
                                var t = '';
                                if(window.getSelection){
                                    t = window.getSelection();
                                }else if(document.getSelection){
                                    t = document.getSelection();
                                }else if(document.selection){
                                    t = document.selection.createRange().text;
                                }
                                return $.trim(t);
                            };
                        o.args.defShow=o.args.defShow2;
                        if(!obj_created){
                            obj=$("<div>",{
                                id:_id
                            }).appendTo($(document.body))
                            txt.mouseup(function(e){
                                setTimeout(function(){
                                    var _t=$.trim(getTxt());
                                    if(over_status&&_t!=""){
                                        o.args.content=o.args.title=_t;//+" "+location.href;
                                        obj.css({
                                            top:e.pageY+15,
                                            left:e.pageX-50
                                        }).show();
                                    }
                                    else obj.hide();
                                },100);
                            }).mouseleave(function(){
                                    over_status=false;
                                }).mouseenter(function(){
                                    over_status=true;
                                })
                            $(document.body).mouseup(function(){
                                if(!over_status&&$.trim(getTxt())=="") obj.hide();
                            })
                            o.args.type=1;
                            o.args.fat=obj;
                            arguments.callee();
                        }
                    }
                    else if(type==6){
                        $.each(o.args.defShow,function(){
                            o.addBtn(this,20,0,o.args.fat,true,1);
                        })
                    }
                }
            };
        o.init=function(){
            //统计回访数据
            if(location.search!=""&&!nie.util.share_traceCome){
                var _m=location.search.match(o.args.urlReg);
                if(_m){
                    nie.util.share_traceCome=true;
                    loadImg("http://click.ku.163.com/share.income.gif?"+["id="+_m[2],"product="+_m[3],"type="+_m[4],"_r="+new Date().getMilliseconds()].join("&"));
                }
            }
            var data=[
                [23,"易信二维码",'YiXinQrCode','res.nie.netease.com/comm/js/nie/util/share/api/',{1:"url",2:"title"}],
                [22,"易信","YiXin","news.163.com/special/yixin-share/",{1:"url",2:"title",3:"image",4:"desc"},{"source":encodeURIComponent("网易游戏")}],
                [1,"QQ空间","QQKongJian","sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",{1:"url",2:"title",3:"pics",4:"desc"/*,4:"summary"*/}],
                [2,"新浪微博","XinLangWeiBo","v.t.sina.com.cn/share/share.php",{1:"url",2:"title",3:"pic"},{"c":"nie","content":"gb2312","source":"nie"}],
                [3,"腾讯微博","TengXunWeiBo","v.t.qq.com/share/share.php",{1:"url",2:"title",3:"pic"}],
                [4,"腾讯朋友","TengXunPengYou","sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",{1:"url",2:"title",3:"pics",4:"desc"/*,4:"summary"*/},{"to":"pengyou"}],
                [5,"网易微博","WangYiWeiBo","t.163.com/article/user/checkLogin.do",{1:"link",2:"info",3:"images",5:"source"},{"check1stImg":true,"togImg":true,"key":"OELT16LMxo0rAmtO"}],
                [6,"搜狐微博","SouHuWeiBo","t.sohu.com/third/post.jsp",{1:"url",2:"title",3:"pic"},{"content":"utf-8"}],
                [7,"开心网","KaiXinWang","www.kaixin001.com/repaste/share.php",{1:"rurl",2:"rtitle",4:"rcontent"}],
                [8,"人人网","RenRenWang","share.renren.com/share/buttonshare.do",{1:"link",2:"title"}],
                [9,"搜狐白社会","SouHuBaiSheHui","bai.sohu.com/share/blank/add.do",{1:"link",2:"title"}],
                [10,"淘江湖","TaoJiangHu","share.jianghu.taobao.com/share/addShare.htm",{1:"url",2:"title",4:"content"}],
                [11,"豆瓣","DouBan","www.douban.com/recommend/",{1:"url",2:"title",3:"image"}],
                //[12,"猫扑推客","MaoPuTuiKe","tk.mop.com/api/post.htm",{1:"url",2:"title",4:"desc"}],
                [13,"百度Hi","BaiDuHi","apps.hi.baidu.com/share/",{1:"url",2:"title",4:"content"}],
                [14,"百度贴吧","BaiDuTieBa","tieba.baidu.com/i/app/open_share_api",{1:"link"}],
                [15,"百度搜藏","BaiDuShouChang","cang.baidu.com/do/add",{1:"iu",2:"it",4:"dc"},{"fr":"ien"}],
                [16,"饭否","FangFou","fanfou.com/sharer",{1:"u",2:"t",4:"d"}],
                [17,"MSN","Msn","profile.live.com/badge",{1:"url",2:"title",3:"screenshot",4:"description"},{"wa":"wsignin1.0"}],
                [18,"天涯社区","TianYaSheQu","share.tianya.cn/openapp/restpage/activity/appendDiv.jsp",{1:"ccUrl",2:"ccTitle",4:"ccBody"}],
                //[19,"凤凰网微博","FengHuangWangWeiBo","t.ifeng.com/interface.php",{1:"sourceUrl",2:"title",3:"pic"}],
                [19,"凤凰网微博","FengHuangWangWeiBo","t.ifeng.com/interface.php",{1:"sourceUrl",2:"title",3:"pic"},{"_c":"share","_a":"share"}],
                [20,"139说客","139ShuoKe","shequ.10086.cn/share/share.php",{1:"tourl",2:"title"}],
                [21,"梦幻人生","MengHuanRenSheng","dream.163.com/share/link/",{1:"url",2:"title",4:"content"}]

            ];
            if(!nie.util.share_css){
                $.include("share.v3.css");
                nie.util.share_css=true;
            }
            //$.include("share.css");
            var args=arguments;
            if(args.length>0&&args[0].length>0){
                var tmp=args[0][0];
                for(var i in tmp){
                    if(typeof tmp[i]!="undefined"){
                        o.args[i]=tmp[i];
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
})(jQuery);