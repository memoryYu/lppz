(function(){
	require([config.configUrl],function(){
		var reqArr = ['auth','MHJ','loading','ngapi','imgpreload','jquery',__uri('../js/wxshare.js'),'swiper'];
		require(reqArr,requireCb);
	});
	
	function requireCb(oAuth,MHJ,M,ngapi,imgpreload,$,wxshare,swiper){
		var indexPage = {}; //首页对象
		var choosePage = {}; //选择页面对象
		var lyPage = {}; //录音页面对象
		var successPage = {}; //录音成功页面对象
		var friendPage = {}; //分享链接进入的页面对象
		var localId;
		var serverId;
		var enId;
		var mediaUrl;
		var x;
		var u = navigator.userAgent;
		var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
		var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

		window.oAudio0 = document.getElementById('audio0');
		window.oAudio1 = document.getElementById('audio1');
		window.oAudio2 = document.getElementById('audio2');
		window.oAudio3 = document.getElementById('audio3');
		window.oAudio4 = document.getElementById('audio4');
		var oAudios = [
			oAudio0,
			oAudio1,
			oAudio2,
			oAudio3,
			oAudio4
		];
		
		//首页
		indexPage.act = {
			$dom : $('#indexPage'), //indexPage的dom
			init : function(){
				var me = this;
				var height = $('body').height();
				$('#main').css('height',height);
				$('#main').show();
				$('#loadPage').show();
				var i = 0;
				var length = imgs.length;
				imgpreload.load(imgs,function(){
					//图片加载完成的回调函数
					share(config.shareInfo);
					me.$dom.show();
					me.checkTouch();
					$('#loadPage').hide();
				},function(){
					//每加载完一张图片的回调函数
					i++;
					var num = parseInt((i/length)*100);
					$('.percent span').text(num);
					$('.process div').css('width',num + '%');
				});
			},
			checkTouch : function(){
				var me = this;
				$('#startBtn').on(config.touch,function(){
					choosePage.act.init();
					me.out();
				});
			},
			out : function(){
				this.$dom.hide();
				$('#startBtn').off();
			},
		};
        
        choosePage.act = {
			$dom : $('#choosePage'), //choosePage的dom
			id : 0,
			myInterval :null,
			init : function(){
				var me = this;
				M.loading(1,2);
				me.shareLink();
				share(config.shareInfo,function(){
					succCb(me.id);
				});
				me.checkTouch();
				M.loadingHide();
				me.$dom.show();
				var mySwiper = new Swiper('.swiper-container',{
					loop:true,
				});
				$('.arrow-left').on('click', function(e){
				    e.preventDefault();
				    mySwiper.swipePrev();
				    me.slideChange();
				});
				$('.arrow-right').on('click', function(e){
				    e.preventDefault();
				    mySwiper.swipeNext();
				    me.slideChange();
				});
			},
			shareLink : function(){
				var me = this;
				config.shareInfo.link = config.htmlUrl + 'index.html?id=' + me.id;
			},
			slideChange :function(){
				var me = this;
				me.id = $('.swiper-slide-active').attr('data-id');
				$('.language').attr('src',languagePic[me.id]);
				$('.txt').attr('src',txtPic[me.id]);
				$('.voice img').attr('src',__uri('../images/yy0.png'));
				for(i=0;i<5;i++){
					oAudios[i].currentTime = 0;
					oAudios[i].pause();
				}	
				me.shareLink();
				share(config.shareInfo,function(){
					succCb(me.id);
				});
			},
			checkTouch : function(){
				var me = this;
				$('#voice').on(config.touch,function(){
					if(oAudios[me.id].paused){
						oAudios[me.id].play();
						$('.voice img').attr('src',__uri('../images/yy.gif'));
						me.myInterval = setInterval(function(){
							if(oAudios[me.id].ended){
								$('.voice img').attr('src',__uri('../images/yy0.png'));
								clearInterval(me.myInterval);
							}
						},500);
					}else{
						oAudios[me.id].pause();
						$('.voice img').attr('src',__uri('../images/yy0.png'));
					}
				});
				$('.wh').on(config.touch,function(){
					$('#txtPage').show();
				});	
				$('.close').on(config.touch,function(){
					$('#txtPage').hide();
				});	
				$('#shareBtn').on(config.touch,function(){
					$('#sharePage').show();
				});	
				$('#sharePage').on(config.touch,function(){
					$('#sharePage').hide();
				});	
				$('#meBtn').on(config.touch,function(){
					lyPage.act.init();
					me.out();
				});	
			},
			out : function(){
				var me = this;
				this.$dom.hide();
				$('#voice').off();
				$('.wh').off();
				$('.close').off();
				$('#shareBtn').off();
				$('#sharePage').off();
				$('#meBtn').off();
				clearInterval(me.myInterval);
				for(i=0;i<5;i++){
					oAudios[i].currentTime = 0;
					oAudios[i].pause();
				}
			},
		};
		
		lyPage.act = {
			$dom : $('#lyPage'), //lyPage的dom
			myInterval : null,
			interval : null,
			time : 0,
			init : function(){
				var me = this;
				config.shareInfo.link = config.htmlUrl + 'index.html';
				share(config.shareInfo);
				me.checkTouch();
				me.time = 0;
				$('#sec').text('00');
				$('#min').text('00');
				$('.ly').attr('src',__uri('../images/ly.png'));
				$('.tt1').attr('src',__uri('../images/f_ly.png'));
				$('#record img').attr('src',__uri('../images/lyan.png'));
				me.$dom.show();
			},
			checkTouch : function(){
				var me = this;
				var canrecord = true;
//				第一次点击进行录音
				$('#record').on(config.touch,function(){
					if(canrecord){
//						alert(canrecord);
						canrecord = false;
						$('.tt1').attr('src',__uri('../images/f_zt.png'));
						$('#record img').attr('src',__uri('../images/zt.png'));
					    $('.ly').attr('src',__uri('../images/yinyue.gif'));
					    wxshare.startRecord();
					    me.myInterval = setInterval(function(){//录音计时
					    	me.time++;
					    	if(me.time<60){
					    		if(me.time<=9){
					    			$('#sec').text('0'+me.time);
					    		}else{
					    			$('#sec').text(me.time);
					    		}
					    	}
					    },1000);
					}else{    
//						alert(canrecord);
						canrecord = true;
						M.loading(1,2);
						$('.ly').attr('src',__uri('../images/ly.png'));
			    		$('.tt1').attr('src',__uri('../images/f_ly.png'));
						$('#record img').attr('src',__uri('../images/lyan.png'));
						clearInterval(me.myInterval);
						clearInterval(me.interval);
//						停止录音		 
		    			wxshare.stopRecord(function(res){
							//停止录音成功回调
//							alert('touchend停止录音');
							localId = res.localId; 
							wxshare.uploadVoice(localId,function(res){
								//上传语音成功的回调
								serverId = res.serverId; // 返回音频的服务器端ID
//								alert('serverId: ' + serverId);
								successPage.act.init();
								me.out();
							});
						});
		    		}
				});
	    		me.interval = setInterval(function(){
	    			var time = parseInt($('#sec').text());
	    			if(time >= 59){
//	    				alert('录音时间超过一分钟');
	    				canrecord = true;
	    				M.loading(1,2);
	    				$('.ly').attr('src',__uri('../images/ly.png'));
			    		$('.tt1').attr('src',__uri('../images/f_ly.png'));
						$('#record img').attr('src',__uri('../images/lyan.png'));
//						停止录音		 
		    			wxshare.stopRecord(function(res){
							//停止录音成功回调
//							alert('touchend停止录音');
							localId = res.localId; 
							wxshare.uploadVoice(localId,function(res){
								//上传语音成功的回调
								serverId = res.serverId; // 返回音频的服务器端ID
//								alert('serverId: ' + serverId);
								successPage.act.init();
								me.out();
							});
						});
	    			}
	    		},1000);
				$('#back').on(config.touch,function(){
					choosePage.act.init();
					clearInterval(me.myInterval);
					clearInterval(me.interval);
					me.out();
					wxshare.stopRecord(function(res){
						//停止录音成功回调
						localId = res.localId; 
					});
				});	
			},
			out : function(){
				var me = this;
				this.$dom.hide();
				$('#record').off();
				$('#back').off();
				
			},
		};
		
		successPage.act = {
			$dom : $('#successPage'), //successPage的dom
			init : function(){
				var me = this;
				
				successPage.data.send();
			},
			checkTouch : function(){
				var me = this;
				var canplay = true;
				$('#play').on(config.touch,function(){
					if(canplay){
						wxshare.playVoice(localId);
						$('.voice img').attr('src',__uri('../images/yy.gif'));
						canplay = false;
					}else{
						wxshare.pauseVoice(localId);
						$('.voice img').attr('src',__uri('../images/yy0.png'));
						canplay = true;
					}
				});		
				$('#fanhui').on(config.touch,function(){
					lyPage.act.init();
					$('.voice img').attr('src',__uri('../images/yy0.png'));
					wxshare.stopVoice(localId);
					me.out();
				});	
				wxshare.onVoicePlayEnd(function(res){
//					监听语音播放完毕的成功回调
					localId = res.localId; // 返回音频的本地ID
					$('.voice img').attr('src',__uri('../images/yy0.png'));
					canplay = true;
				});
				$('#sendBtn').on(config.touch,function(){
					$('#sharePage').show();
				});	
				$('#sharePage').on(config.touch,function(){
					$('#sharePage').hide();
				});	
				$('#giftBtn').on(config.touch,function(){
					gotoUrl('https://wap.koudaitong.com/v2/showcase/goods?alias=3f3zt2r3jxugf');
				});	
			},
			sendCb : function(data){
				var me = this;
				enId = data.id;
//				alert('enId: ' + enId);
				config.shareInfo.link = config.htmlUrl + 'index.html?enid=' + enId;
				share(config.shareInfo);
				wxshare.downloadVoice(serverId,function(res){
					//下载语音成功的回调
					localId = res.localId; // 返回音频的本地ID
					me.checkTouch();
					me.$dom.show();
					M.loadingHide();
				});
			},
			out : function(){
				var me = this;
				this.$dom.hide();
				$('#play').off();
				$('#fanhui').off();
				$('#sendBtn').off();
				$('#sharePage').off();
				$('#giftBtn').off();
			},
		};
		successPage.data = {
			send : function(){
				post('sayhello/send',{
					isupload : 1,
					type : null,
					mediaid : serverId
				},function(data){
					successPage.act.sendCb(data);
				});	
			}
		};
		
		friendPage.act = {
			$dom : $('#friendPage'), //friendPage的dom
			myInterval : null,
			init : function(id,enid){
				var me = this;
				var height = $('body').height();
				$('#main').css('height',height);
				$('#main').show();
				$('#loadPage').show();
				var i = 0;
				var length = imgs.length;
				imgpreload.load(imgs,function(){
					//图片加载完成的回调函数
					config.shareInfo.link = config.htmlUrl + 'index.html';
					share(config.shareInfo);
					if(enid){//自录版语音
						friendPage.data.get(id,enid);
					}else{//默认版语音
						oAudios[id].currentTime = 0;
						oAudios[id].paused = true;
						me.checkTouch(id,enid);
						me.$dom.show();
						$('#loadPage').hide();
					}
				},function(){
					//每加载完一张图片的回调函数
					i++;
					var num = parseInt((i/length)*100);
					$('.percent span').text(num);
					$('.process div').css('width',num + '%');
				});
			},
			checkTouch : function(id,enid){
				var me = this;
				$('#playBtn').on(config.touch,function(){
					if(id){//方言版
						if(oAudios[id].paused){
							if(isIOS){
								console.log(isIOS);
								oAudios[id].load();
							}
							$('#playBtn').attr('src',__uri('../images/zt.png'));	
							oAudios[id].play();
							me.interval(oAudios[id]);
						}else{
							$('#playBtn').attr('src',__uri('../images/bf.png'));		
							oAudios[id].pause();
						}
					}
					if(enid){//自录版
						if(x.paused){
							if(isIOS){
								console.log(isIOS);
								x.load();
							}
							$('#playBtn').attr('src',__uri('../images/zt.png'));	
							x.play();
							me.interval(x);
						}else{
							$('#playBtn').attr('src',__uri('../images/bf.png'));		
							x.pause();
						}
					}
				});
				$('#tryBtn').on(config.touch,function(){
					gotoUrl('index.html');
				});	
				$('#lbBtn').on(config.touch,function(){
					gotoUrl('https://wap.koudaitong.com/v2/showcase/goods?alias=3f3zt2r3jxugf');
				});	
			},
			interval : function(Audio){
//				进度显示
				var me = this;
				me.myInterval = setInterval(function(){
					var percent = parseInt((Audio.currentTime/Audio.duration)*100);
					$('.yellow').css('width',percent+'%');
					$('.white').css('width',(100-percent)+'%');
					if(percent == 100){
						$('#playBtn').attr('src',__uri('../images/bf.png'));		
						Audio.pause();
						clearInterval(me.myInterval);
					}
				},67);
			},
			getCb : function(data,id,enid){
				var me = this;
				mediaUrl = data.mediaurl; 
				x = document.createElement("AUDIO");
				x.setAttribute("src", mediaUrl);
				x.setAttribute("preload", "auto");
				x.style.display = 'none';
				x.style.width = '0';
				x.style.height = '0';
				document.getElementById('main').appendChild(x);
				x.currentTime = 0;
				x.paused = true;
				me.checkTouch(id,enid);
				me.$dom.show();
				$('#loadPage').hide();
			},
			out : function(){
				var me = this;
				me.$dom.hide();
				$('#playBtn').off();
				$('#tryBtn').off();
				$('#lbBtn').off();
			},
		};
		friendPage.data = {
			get : function(id,enid){
				post('sayhello/get',{
					id : enid,
				},function(data){
					friendPage.act.getCb(data,id,enid);
				});	
			}
		};
		
		function defaultError(data){
			var err = data.error - 0;
			switch(err){
				case 1002:
					oAuth.clear();
					alert('你的身份信息已过期，点击确定刷新页面');
					window.location.reload();
					break;
				default:
					alert(data.error_msg);
			}
		}
		
		function post(action,param,cb){
			ngapi(action,param,config.gameid,function(data){
				console.log(action+':'+JSON.stringify(data));
				//alert(action+':'+JSON.stringify(data));
				var err = data.error - 0;
				switch(err){
					case 0:
						cb && cb(data);
						break;
					default:
						defaultError(data);
				}
			},config.apiopenid,config.apitoken);
		}
		
		function share(shareInfo,succCb){
			wxshare.initWx(shareInfo,config.gameid,config.apiopenid,config.apitoken,succCb,null,null,null);
		}
		
		function succCb(temp){
			if(temp){
				//记录分享默认音频
				post('sayhello/send',{
					isupload : 0,
					type : types[temp],
					mediaid : null
				},function(data){
					console.log('sharelog: ' + data.type);
				});	
			}
		}
		
		check(oAuth,function(){
			var id = MHJ.getUrlParam().id;
			var enid = MHJ.getUrlParam().enid;
			if((!id)&&(!enid)){//链接后面不带id或者enid
				indexPage.act.init();
			}else{//从分享链接进入
				friendPage.act.init(id,enid);
			}
		});
	}
	
	//产生随机数 例如，生成0-9的随机数(包括0,不包括9) random(0,9)
    function random(min,max){
    	return Math.floor(min+Math.random()*(max-min));
    }
    var types = [
    	4,
    	2,
    	0,
    	1,
    	3
    ];
    var imgs = [
    	__uri('../images/1db.jpg'),
    	__uri('../images/1sc.jpg'),
    	__uri('../images/1tw.jpg'),
    	__uri('../images/1wh.jpg'),
    	__uri('../images/1yy.jpg'),
    	__uri('../images/b_fh.png'),
    	__uri('../images/b_fx.png'),
    	__uri('../images/b_ks.png'),
    	__uri('../images/b_lb.png'),
    	__uri('../images/b_lb1.png'),
    	__uri('../images/b_me.png'),
    	__uri('../images/b_try.png'),
    	__uri('../images/b_zfx.png'),
    	__uri('../images/bf.png'),
    	__uri('../images/bfjdt.png'),
    	__uri('../images/bg.jpg'),
    	__uri('../images/close.png'),
    	__uri('../images/cq.png'),
    	__uri('../images/djyysys.png'),
    	__uri('../images/dsj.png'),
    	__uri('../images/f_db.png'),
    	__uri('../images/f_ly.png'),
    	__uri('../images/f_sc.png'),
    	__uri('../images/f_tw.png'),
    	__uri('../images/f_wh.png'),
    	__uri('../images/f_yy.png'),
    	__uri('../images/f_zt.png'),
    	__uri('../images/fx.png'),
    	__uri('../images/fx_img.jpg'),
    	__uri('../images/hsl1.png'),
    	__uri('../images/hz.png'),
    	__uri('../images/jindu.png'),
    	__uri('../images/jt1.png'),
    	__uri('../images/jt2.png'),
    	__uri('../images/k.png'),
    	__uri('../images/lh.png'),
    	__uri('../images/loading1.png'),
    	__uri('../images/logo.png'),
    	__uri('../images/ly.png'),
    	__uri('../images/lyan.png'),
    	__uri('../images/lzcg.png'),
    	__uri('../images/shouyinji.png'),
    	__uri('../images/t_db.png'),
    	__uri('../images/t_sc.png'),
    	__uri('../images/t_tw.png'),
    	__uri('../images/t_wh.png'),
    	__uri('../images/t_yy.png'),
    	__uri('../images/tt.png'),
    	__uri('../images/tt1.png'),
    	__uri('../images/tt2.png'),
    	__uri('../images/wh.png'),
    	__uri('../images/yinyue.gif'),
    	__uri('../images/yy.gif'),
    	__uri('../images/yy.png'),
    	__uri('../images/yy0.png'),
    	__uri('../images/zfbbx.png'),
    	__uri('../images/zt.png')
	];
	var languagePic = [
		__uri('../images/f_yy.png'),
    	__uri('../images/f_tw.png'),
    	__uri('../images/f_db.png'),
    	__uri('../images/f_sc.png'),
    	__uri('../images/f_wh.png')
	];
	var txtPic = [
		__uri('../images/t_yy.png'),
    	__uri('../images/t_tw.png'),
    	__uri('../images/t_db.png'),
    	__uri('../images/t_sc.png'),
    	__uri('../images/t_wh.png')
	];
}());
