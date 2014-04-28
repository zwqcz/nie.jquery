/**
 * LightBox v2
 * by Lokesh Dhakar - https://github.com/lokesh/lightbox2
 * modify Govo - http://res.nie.netease.com/comm/js/ui/lightBox.source.js
 *modify Mr.F - http://res.nie.netease.com/comm/js/ui/lightBoxv2.source.js
 *
 * - lightBox 插件 NIE版 第二版
 * - 此插件由Lokesh Dhakar创建，由Govo修改成使用NIE的第一个版本，由Mr.F在原有基础上进行优化
 *
 * 组件基本功能：
 * 1、读取大图并显示
 * 2、读取小图排列显示
 * 3、键盘控制左右切换
 * 4、能随视窗变化而变化位置
 * 5、预加载大图
 *
 * 2014.4优化记录 - 在大图底部添加了小图预览区域，去除了重复增加lightbox dom效果，获取相关尺寸进行了重新定义，重新修改lightBox的样式
 *
 * 注意：lightbox效果中的a标签的大图地址一定要每张都不一样
 *
 *
 * //例子1
 *	$('#gallery a').lightBox();
 *
 * //例子2
 *	$(".article a[href*='tu/']").lightBox({
*			txtFirst:				'这是第一张',
*			txtLast:				'已是最后一张',
*			txtNext:				'点击查看下一张',
*			txtPrev:				'点击查看上一张',
*			overlayBgColor:	'#000',				//遮挡层的颜色
*			overlayOpacity:	0.8,					//遮挡层的透明度
*			containerResizeSpeed:	400			//图片容器的拉伸动画速度
*		});
 */


//加载lightbox所需的css文件
$.include("http://res.nie.netease.com/comm/js/ui/lightBox/basev2.css");

//Jquery插件开始
(function($) {
    $.fn.lightBox = function(settings){
        var opt = {
            overlayBgColor: 		'#000',                    //(string) 蒙版颜色RGB值
            overlayOpacity:			0.8,                     //(integer) 蒙版透明度
            containerResizeSpeed:	400,                //(integer) 蒙版变换速度
            txtFirst:				'这是第一张',                  // (string) 提示文字
            txtLast:				'已是最后一张',               // (string) 提示文字
            txtNext:				'点击查看下一张',        // (string) 提示文字
            txtPrev:				'点击查看上一张',        // (string) 提示文字
            imageArray:				[],                        // (Array) 大图数组
            imageThumbArrary: [],                          // (Array) 小图数组
            activeImage:			0
        }
        settings = settings || {};
        opt = $.extend(opt, settings);

        var imgMatchObject = this, //所有添加lightBox效果的节点
            imgThumbMatchObject = this.find('img'); //结点下的img图片

        /**
         * 初始化插件调用开始函数
         *
         * @return boolean false
         */
        function _initialize() {
            _start(this,imgMatchObject,imgThumbMatchObject); // 开始点击效果
            return false; // 防止浏览器直接点开链接
        }
        /**
         * 运行lightBox插件
         *
         * @param object objClicked 用户所点击的节点
         * @param object imgMatchObject 所有匹配的节点
         * @param object imgThumbMatchObject 所有匹配的节点下的小图
         */
        function _start(objClicked,imgMatchObject,imgThumbMatchObject) {
            //设置弹层
            _set_interface();
            // 重置所有
            opt.imageArray.length = 0;
            // 重置激活的图片
            opt.activeImage = 0;
            //分是否为单张图片的情况
            if ( imgMatchObject.length == 1 ) {
                opt.imageArray.push(new Array(objClicked.getAttribute('href'),objClicked.getAttribute('title')));
            } else {
                // 将大图片、小图片添加到对应数组中
                for ( var i = 0; i < imgMatchObject.length; i++ ) {
                    opt.imageArray.push(new Array(imgMatchObject[i].getAttribute('href'),imgMatchObject[i].getAttribute('title')));
                }
            }
            while ( opt.imageArray[opt.activeImage][0] != objClicked.getAttribute('href') ) {
                opt.activeImage++;
            }
            // 调用函数展示图片
            _set_image_to_view();
        }
        /**
         * 插入lightBox效果所需要的html代码，代码如下
         *
         <div id="jquery-overlay" ></div>
         <div id="jquery-lightbox" >

         <div id="lightbox-container-image-box">
         <a href="javascript:void(0)" id="lightbox-secNav-btnClose"></a>
         <div id="lightbox-container-image">
         <img id="lightbox-image" src="fenxiang.jpg" style="display: inline;">
         <div id="lightbox-nav">
         <a href="#" id="lightbox-nav-btnPrev" class=""  title="点击查看上一张"></a>
         <a href="#" id="lightbox-nav-btnNext" title="点击查看下一张" ></a>
         </div>
         <div id="lightbox-loading" ><a href="#" id="lightbox-loading-link"></a></div>
         </div>
         </div>

         <div id="lightbox-container-image-data-box" >
         <div id="lightbox-container-image-data">
         <div id="lightbox-image-details">
         <span id="lightbox-image-details-caption" ></span>
         <span id="lightbox-image-details-currentNumber" >图片 2 共 7</span>
         </div>
         </div>
         <div id="lightbox-container-image-thumb-data">
         <ul>
         <li><a href="#"><img src=""></a></li>
         </ul>
         </div>
         </div>

         </div>
         *
         */
        function _set_interface() {
            var appendDOM ='<div id="jquery-overlay"></div><div id="jquery-lightbox"><div id="lightbox-container-image-box"><div id="lightbox-container-image"><a href="javascript:void(0)" id="lightbox-secNav-btnClose"></a><img id="lightbox-image"><div style="" id="lightbox-nav"><a href="#" id="lightbox-nav-btnPrev"></a><a href="#" id="lightbox-nav-btnNext"></a></div><div id="lightbox-loading"><a href="#" id="lightbox-loading-link"></a></div></div></div><div id="lightbox-container-image-data-box"><div id="lightbox-container-image-data"><div id="lightbox-image-details"><span id="lightbox-image-details-caption"></span><span id="lightbox-image-details-currentNumber"></span></div></div><div id="lightbox-container-image-thumb-data"><ul></ul></div></div></div></div>';
            if($('#jquery-lightbox').length == 0){
                $('body').append(appendDOM);
                // 将小图片添加到对应数组中
                for ( var i = 0; i < imgMatchObject.length; i++ ) {
                    opt.imageThumbArrary.push(new Array(imgMatchObject[i].getAttribute('href'),imgMatchObject[i].getAttribute('title'),imgThumbMatchObject[i].getAttribute('src')));
                }
                for(var j = 0;j<opt.imageThumbArrary.length;j++){
                    $('#lightbox-container-image-thumb-data').find('ul').append('<li><a href="'+opt.imageThumbArrary[j][0]+'" title="'+opt.imageThumbArrary[j][1]+'"><img src="'+opt.imageThumbArrary[j][2]+'"/></a></li>')
                }
                $('#lightbox-container-image-thumb-data').find('ul').css('width',opt.imageThumbArrary.length*140)
            }
            $('#lightbox-container-image-thumb-data').find('a').unbind('click').click(_initialize);
            // 得到相关尺寸
            var arrSizes = ___getSize();
            //设置蒙版
            $('#jquery-overlay').css({
                backgroundColor:	opt.overlayBgColor,
                opacity:			opt.overlayOpacity,
                height:				arrSizes[0]
            }).show();
            //弹出弹层
            var pop = $('#jquery-lightbox');
            pop.height()>arrSizes[1]?pop.fadeIn().css({top:	arrSizes[3], left:	(arrSizes[2]-pop.width())/2+arrSizes[4]}) : pop.fadeIn().css({top:(arrSizes[1]-pop.outerHeight())/2+arrSizes[3], left:	(arrSizes[2]-pop.width())/2+arrSizes[4]})
            // 关闭弹层
            $('#lightbox-secNav-btnClose').click(function() {
                _finish();
                return false;
            });
            // 视窗如果发生变化，重新定位弹层位置
            $(window).resize(function() {
                // 得到相关尺寸
                var arrSizes = ___getSize();
                //设置蒙版
                $('#jquery-overlay').css({
                    backgroundColor:	opt.overlayBgColor,
                    opacity:			opt.overlayOpacity,
                    height:				arrSizes[0]
                });
                //弹出弹层
                var pop = $('#jquery-lightbox');
                pop.height()>arrSizes[1]?pop.css({top:	arrSizes[3], left:	(arrSizes[2]-pop.width())/2+arrSizes[4]}) : pop.css({top:(arrSizes[1]-pop.outerHeight())/2+arrSizes[3], left:	(arrSizes[2]-pop.width())/2+arrSizes[4]})
            })

        }
        /**
         * 准备图片展示，并通过计算图片尺寸来预先构造放图片的容器
         *
         */
        function _set_image_to_view() {
            //显示加载图片中的图片
            $('#lightbox-loading').show();
            //图片预加载程序
            var objImagePreloader = new Image();
            objImagePreloader.onload = function() {
                $('#lightbox-image').attr('src',opt.imageArray[opt.activeImage][0]);
                //显示图片
                _show_image();
                //	清除onload
                objImagePreloader.onload=function(){};
                //根据图片设置弹层尺寸
                var arrSizes = ___getSize();
                var pop = $('#jquery-lightbox');
                pop.height()>arrSizes[1]?pop.css({top:	arrSizes[3], left:	(arrSizes[2]-pop.width())/2+arrSizes[4]}) : pop.css({top:(arrSizes[1]-pop.outerHeight())/2+arrSizes[3], left:	(arrSizes[2]-pop.width())/2+arrSizes[4]})
                //视窗变化时重新定义尺寸
                $(window).resize(function() {
                    // 得到相关尺寸
                    var arrSizes = ___getSize();
                    //设置蒙版
                    $('#jquery-overlay').css({
                        backgroundColor:	opt.overlayBgColor,
                        opacity:			opt.overlayOpacity,
                        height:				arrSizes[0]
                    });
                    //弹出弹层
                    var pop = $('#jquery-lightbox');
                    pop.height()>arrSizes[1]?pop.css({top:	arrSizes[3], left:	(arrSizes[2]-pop.width())/2+arrSizes[4]}) : pop.css({top:(arrSizes[1]-pop.outerHeight())/2+arrSizes[3], left:	(arrSizes[2]-pop.width())/2+arrSizes[4]})

                })
            }
            objImagePreloader.src = opt.imageArray[opt.activeImage][0];
        }
        /**
         * 展示预加载好的图片
         *
         */
        function _show_image() {
            //隐藏图片预加载的
            $('#lightbox-loading').hide();
            $('#lightbox-image').fadeIn(function() {
                _show_image_data();
                _set_navigation();
            });
            _preload_neighbor_images();
        };
        /**
         * 展示图片信息
         *
         */
        function _show_image_data() {
            $('#lightbox-image-details-caption').hide();
            if ( opt.imageArray[opt.activeImage][1] ) {
                $('#lightbox-image-details-caption').html(opt.imageArray[opt.activeImage][1]).show();
            }
            // 显示图片的数量信息
            if ( opt.imageArray.length > 1 ) {
                $('#lightbox-image-details-currentNumber').html( ' <em id="lightbox-image-current-num">' + ( opt.activeImage + 1 ) + ' </em>/<em id="lightbox-image-amount-num">'  + opt.imageArray.length+'</em>').show();
            }
        }
        /**
         * 显示相关按钮
         *
         */
        function _set_navigation() {
            $('#lightbox-nav').show();

            var _action_Navigation_Go=function(mark){
                $('#lightbox-nav-btn'+mark)
                    .show()
                    .unbind()
                    .removeClass('lightbox-nav-close')
                    .attr('title',opt['txt'+mark])
                    .bind('click',function() {
                        (mark=="Prev")?opt.activeImage--:opt.activeImage++;
                        _set_image_to_view();
                        return false;
                    });
            };
            var _action_Navigation_End=function(mark){

                $('#lightbox-nav-btn'+mark)
                    .show()
                    .unbind()
                    .addClass('lightbox-nav-close')
                    .attr('title',opt['txt'+(mark=='Prev'?'First':'Last')])
                    .bind('click',function(){
                        _finish();
                        return false;
                    });

            };
            if(opt.imageArray.length>1){
                // 如果不是第一张，显示上一张按钮
                if ( opt.activeImage != 0) {
                    _action_Navigation_Go('Prev');
                }else{
                    _action_Navigation_End('Prev');
                }

                // 如果不是最后一张，显示下一张按钮
                if ( opt.activeImage != (opt.imageArray.length -1 ) ) {
                    _action_Navigation_Go('Next');
                }else{
                    _action_Navigation_End('Next');
                }
            }

        }
        function _preload_neighbor_images() {
            if ( (opt.imageArray.length -1) >opt.activeImage ) {
                objNext = new Image();
                objNext.src = opt.imageArray[opt.activeImage + 1][0];
            }
            if ( opt.activeImage > 0 ) {
                objPrev = new Image();
                objPrev.src = opt.imageArray[opt.activeImage -1][0];
            }
        }
        /**
         * 获得窗口尺寸
         *
         * @return Array 返回页面宽度，高度和视窗宽度，高度
         */
        function ___getSize() {
            var dh = $(document).height(),
                wh = $(window).height(),
                ww = $(window).width(),
                st = $(window).scrollTop(),
                sl = $(window).scrollLeft();
            arraySize = new Array(dh,wh,ww,st,sl);
            return arraySize;
        }
        /**
         * 关闭弹层
         *
         */
        function _finish() {
            $('#jquery-lightbox').fadeOut();
            $('#jquery-overlay').fadeOut();
        }
        //返回对象的链接. 解除绑定的方法是为了避免这个插件被重复调用
        return this.unbind('click').click(_initialize);
    }
})(jQuery)