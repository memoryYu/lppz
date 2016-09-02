(function() {
	require([config.configUrl], function() {
		var reqArr = ['auth', 'MHJ', 'loading', 'ngapi', 'imgpreload', 'jquery', 'wxshare','typed',__uri('../js/canvid.js')];
		require(reqArr, requireCb);
	});

	function requireCb(oAuth, MHJ, M, ngapi, imgpreload, $, wxshare,typed,canvid) {
		var indexPage = {}; //首页对象
		var Audio = document.getElementById('Audio');
		var Audio1 = document.getElementById('Audio1');//bg
		var Audio2 = document.getElementById('Audio2');//btn
		var Audio3 = document.getElementById('Audio3');//fly
		var Audio4 = document.getElementById('Audio4');//type
		var myTimeout;
		var canvidControl;
		var nickname;
		var date1,date2;
		var playNum = 0;
		//首页
		indexPage.act = {
			$dom: $('#indexPage'), //indexPage的dom
			init: function() {
				var me = this;
				//分享配置
				share(config.shareInfo);
				//加载加载页的图片
				imgpreload.load(preImgs, function() {
					$('#loading').hide();
					$('#loadPage').show();
				
					//图片加载
					var i = 0;
					var length = parseInt(imgs.length);
					if(i<length){
						imgpreload.load(imgs,null,function(){
							i++;
							var num = parseInt((i/length)*100);
							$('.orange,.bar-hide').css('transform','translateX('+455*num/100+'px)')
							$('#percent').text(num);
						});
					}
					//加载完成后
					imgpreload.load(imgs, function() {
						$('#loadPage').hide();
						me.$dom.show();
						Audio1.play();
	//					视频初始化
						canvidControl = canvid({
							selector : '#mycanvas',
						    videos: {
						        myvideo1: { src: 'images/lppz2.jpg',fps:15, frames: 90, cols: 6 ,loops:1,onEnd:function(){
						        	//视频播放完成,展示下一条消息
						        	Audio.pause();
						        	$('#second').addClass('fadeInUp');
						        }},
						    },
						    width:375,
						    height:211,
						    loaded: function() {
						    	canvidControl.play('myvideo1');
								Audio.play();
						    }
						});
						//动画完成，播放视频
						var second = document.getElementById('second');
						second.addEventListener('webkitAnimationEnd',function(){
							me.checkTouch();
							myTimeout = window.setTimeout(function(){
				        		me.out();
				        	},3000);
							second.removeEventListener('webkitAnimationEnd');
						});
					});	
				});
			},
			checkTouch: function() {
				var me = this;
				$('#second .content').on(config.touch, function() {
					Audio2.play();
					me.out();
				});
			},
			getuserinfoCb: function(data){
				var me = this;
				nickname = data.nickname || 'memory余';
				var headimgurl = data.headimgurl || 'images/icon.png';
				$('#nickname').text(nickname);
				$('#headImg').attr('src',headimgurl);
//				loadPage展示完成后,进入infoPage
				Audio3.play();
				$('#feiji1').addClass('fly');
				var feiji1 = document.getElementById('feiji1');
				feiji1.addEventListener('webkitAnimationEnd',function(){
					Audio3.pause();
					$('#loadPage1').hide();
					infoPage.act.init();
					feiji1.removeEventListener('webkitAnimationEnd');
				});	
			},
			out: function(){
				var me = this;
				$('#loadPage1').show();
				me.$dom.hide();
				canvidControl.destroy();
				clearTimeout(myTimeout);
				$('#second .content').off();
				indexPage.data.getuserinfo();
			}
		};
		
		indexPage.data = {
			getuserinfo: function() {
				post('ten/getuserinfo', null, function(data) {
					indexPage.act.getuserinfoCb(data);
				});
			},
		};
		
		infoPage.act ={
			$dom : $('#infoPage'),
			init : function(){
				var me= this;
				me.$dom.show();
				//页面和飞机加上动画
				var plane = document.getElementById('plane');
				var planeImg = document.getElementById('planeImg');
				window.setTimeout(function(){
					//向上滑动
					infoPage.act.height = 1339 - $('body').height();
					$('#infoPage').css('-webkit-transform','translate3d(0,-'+infoPage.act.height/2+'px,0)');
					$('#plane').removeClass('rotate45 fadeInRight delay-2');
					plane.style.opacity = '1';
					Audio3.play();
					plane.style.webkitAnimation = 'moveX1 1s both';
					planeImg.style.webkitAnimation = 'moveY1 1s both';
				},1500);	
				planeImg.addEventListener('webkitAnimationEnd',function(){
					if(playNum == 0){
						Audio3.pause();
						Audio4.play();
					}
					$("#name").typed({
						strings: [nickname],
						typeSpeed: 80,
						showCursor: false,
						callback : function(){
							$("#tel").typed({
								strings: ["828517"],
								typeSpeed: 80,
								showCursor: false,
								callback : function(){
									$("#address").typed({
										strings: ["你这个小吃货~"],
										typeSpeed: 80,
										showCursor: false,
										callback : function(){
											if(playNum == 0){
												Audio4.pause();
												Audio3.play();
											}	
											$('#planeImg').attr('src','images/feiji.png');
											$('#infoPage').css('-webkit-transform','translate3d(0,-'+infoPage.act.height+'px,0)');
											plane.style.webkitAnimation = 'moveX2 2.5s both';
											planeImg.style.webkitAnimation = 'moveY2 2.5s both';
											planeImg.removeEventListener('webkitAnimationEnd');
											if(playNum == 0){
												setTimeout(function(){
													Audio3.pause();
												},2500);
											}
											playNum++;
										}
									});
								}
							});
						}
					});	
					
				});	
				me.checkTouch();
				
			},
			checkTouch: function(){
				var me = this;
				$('#getPrize').on(config.touch,function(){
					Audio2.play();
					me.$dom.hide();
					$('#selectPage').show();
					me.checkTouch2();
					$(this).off();
				});
			},
			checkTouch2: function(){
				var me = this;
				$('.role').on(config.touch,function(){
					Audio2.play();
					var id = $(this).data('id');
					$('#loadPage2').show();
					$('#selectPage').hide();
					date1 = new Date();//请求开始时间
					var params = {
						cid : id
					};
					infoPage.data.getcoupon(params);
				});
			},
			getcouponCb : function(data){
				var me = this;
				$('#banner').attr('src','images/banner'+data.coupon.cid+'.jpg');
				var plane2 = document.getElementById('plane2');
				date2 = new Date();//请求结束时间
				var date3 = date2.getTime()-date1.getTime();//时间差，单位为毫秒
				if(date3 < 16000){
					$('#plane2').addClass('fly delay-16');
				}else{
					$('#plane2').addClass('fly');
				}
				Audio3.play();
				plane2.addEventListener('webkitAnimationEnd',function(){
					Audio3.pause();
					$('#loadPage2').hide();
					$('#endPage').show();
					$('#shareBtn').on(config.touch,function(){
						Audio2.play();
						$('#sharePage').show();
					});	
					$('#sharePage').on(config.touch,function(){
						$('#sharePage').hide();
					});	
					$('#getBtn').on(config.touch,function(){
						Audio2.play();
						gotoUrl(data.coupon.geturl);
					});	
					$('.intro').on(config.touch,function(){
						Audio2.play();
						$('#introPage').show();
					});	
					$('#knowBtn').on(config.touch,function(){
						Audio2.play();
						$('#introPage').hide();
					});	
					plane2.removeEventListener('webkitAnimationEnd');
				});	
			},
		};
		
		infoPage.data = {
			getcoupon: function(params) {
				post('ten/getcoupon', params, function(data) {
					infoPage.act.getcouponCb(data);
				});
			},
		}
		
		function defaultError(data) {
			var err = data.error - 0;
			M.loadingHide();
			switch(err) {
				case 1002:
					oAuth.clear();
					alert('你的身份信息已过期，点击确定刷新页面');
					window.location.reload();
					break;
				default:
					alert(data.error_msg);
			}
		}

		function post(action, param, cb) {
			ngapi(action, param, config.gameid, function(data) {
				console.log(action + ':' + JSON.stringify(data));
				//				alert(action+':'+JSON.stringify(data));
				var err = data.error - 0;
				switch(err) {
					case 0:
						cb && cb(data);
						break;
					default:
						defaultError(data);
				}
			}, config.apiopenid, config.apitoken);
		}

		function share(shareInfo, succCb) {
			wxshare.initWx(shareInfo, config.gameid, config.apiopenid, config.apitoken, succCb, null, null, null);
		}

		//产生随机数 例如，生成0-9的随机数(包括0,不包括9) random(0,9)
	    function random(min,max){
	    	return Math.floor(min+Math.random()*(max-min));
	    }
		
		check(oAuth, function() {
			indexPage.act.init();
		});
	}
	
	var preImgs = [
		__uri('../images/base.png'),
		__uri('../images/orange.png'),
		__uri('../images/plane.png'),
		__uri('../images/wenan.png'),
	];
	var imgs = [
		__uri('../images/arrow.png'),
		__uri('../images/arrow2.png'),
		__uri('../images/banner1.jpg'),
		__uri('../images/banner2.jpg'),
		__uri('../images/banner3.jpg'),
		__uri('../images/banner4.jpg'),
		__uri('../images/banner5.jpg'),
		__uri('../images/banner6.jpg'),
		__uri('../images/banner7.jpg'),
		__uri('../images/banner8.jpg'),
		__uri('../images/banner9.jpg'),
		__uri('../images/bg.jpg'),
		__uri('../images/bg2.jpg'),
		__uri('../images/border.png'),
		__uri('../images/btn.png'),
		__uri('../images/btn1.png'),
		__uri('../images/btn2.png'),
		__uri('../images/btn3.png'),
		__uri('../images/caiqi.png'),
		__uri('../images/card.png'),
		__uri('../images/dianji.png'),
		__uri('../images/ditu.png'),
		__uri('../images/duihuakuang.png'),
		__uri('../images/feiji.png'),
		__uri('../images/feiji2.png'),
		__uri('../images/feiji3.png'),
		__uri('../images/fenxiang.png'),
		__uri('../images/fximg.jpg'),
		__uri('../images/GIF_1.gif'),
		__uri('../images/hxm.png'),
		__uri('../images/icon.png'),
		__uri('../images/lppz2.jpg'),
		__uri('../images/shiwu_1.png'),
		__uri('../images/shiwu_2.png'),
		__uri('../images/shiwu_3.png'),
		__uri('../images/shiwu_4.png'),
		__uri('../images/shiwu_5.png'),
		__uri('../images/shiwu_6.png'),
		__uri('../images/shiwu_7.png'),
		__uri('../images/shiwu_8.png'),
		__uri('../images/shiwu_9.png'),
		__uri('../images/shiyong.png'),
		__uri('../images/text.png'),
		__uri('../images/text2.png'),
		__uri('../images/text3.png'),
		__uri('../images/tuwen.png'),
		__uri('../images/wenan2.png'),
		__uri('../images/x.png'),
		__uri('../images/xian.png'),
		__uri('../images/xiangji.png'),
		__uri('../images/xiangzi.png'),
		__uri('../images/xinfeng.png'),
		__uri('../images/xingxiang_1.png'),
		__uri('../images/xingxiang_2.png'),
		__uri('../images/xingxiang_3.png'),
		__uri('../images/xingxiang_4.png'),
		__uri('../images/xingxiang_5.png'),
		__uri('../images/xingxiang_6.png'),
		__uri('../images/xingxiang_7.png'),
		__uri('../images/xingxiang_8.png'),
		__uri('../images/xingxiang_9.png'),
		__uri('../images/xingxing.png'),
		__uri('../images/youchuo.png'),
		__uri('../images/zhi.png'),
	];

}());