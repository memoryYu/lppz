(function(){
	require([config.configUrl],function(){
		var reqArr = ['auth','MHJ','loading','ngapi','imgpreload','jquery',__uri('../js/wxshare.js'),'shake'];
		require(reqArr,requireCb);
	});
	
	function requireCb(oAuth,MHJ,M,ngapi,imgpreload,$,wxshare,Shake){
		var indexPage = {}; //首页对象
		var tzcgPage = {}; //投注成功，摇奖页面
		var rankPage = {}; //排行榜页面
		var wdzjPage = {}; //我的战绩页面
		var isTipShow = localStorage.isTipShow?localStorage.isTipShow:0;//是否出现过投注操作指示，0-未出现，1-已出现
		var f;//索要积分时分享在url中带出去的参数(索要者openid加密后的串)
		var mypoints;//我的积分
		var furl = MHJ.getUrlParam().f;
		window.oAudio = document.getElementById('audio');
		//首页
		indexPage.act = {
			$dom : $('#indexPage'), //indexPage的dom
			params : {
				sid : null,
				type : null,
				points : null
			},
			ismember : null,
			registerurl : null,
			init : function(){
				var me = this;
				imgpreload.load(imgs,function(){
					$('#main').show();
					config.shareInfo.title = '累计猜对8场球，平分10万元';
					config.shareInfo.desc = '快来和我一起参加良品铺子欧洲杯火热大竞猜吧！';
					config.shareInfo.link = config.htmlUrl+'index.html';
					share(config.shareInfo,function(){
						succCb(1);
					});
					indexPage.data.checkuser();
				});
			},
			checkTouch : function(votenum){
				var me = this;
				//查看赛程
				$('#cksc').on(config.touch,function(){
					me.$dom.hide();
					$('#scPage').show();
				});
				//赛程返回
				$('#scfh').on(config.touch,function(){
					me.$dom.show();
					$('#scPage').hide();
				});
				//我知道怎么下注了
				$('#wzdl').on(config.touch,function(){
					$('.operatetip').hide();
					localStorage.isTipShow = 1;
					$('.tztip').removeClass('tztip');
				});
				//活动规则
				$('#rule').on(config.touch,function(){
					$('#rulePage').show();
					$('body').css('overflow','hidden');
				});
				//关闭活动规则
				$('#ruleClose').on(config.touch,function(){
					$('#rulePage').hide();
					$('body').css('overflow','auto');
				});
				//首页投注
				$('.bet').on(config.click,function(){
					if(!me.ismember){//非会员
						$('.ljzc').attr('href',me.registerurl);
						$('#memberPage').show();
					}else{
						M.loading(1,1);
						$('body').css('overflow','hidden');
						me.params.sid = $(this).data('sid');
						me.params.type = $(this).data('type');
						var country = $(this).text().split(' ')[0];
						if(country != '平局'){
							country = country + '胜';
						}
						var data = {
							country : country,
							mypoints : mypoints,
//							rate : $(this).data('rate').split(','),
						}
						$('#tzgj').text(country);
						$('#xzPage').html(MHJ.tmpl($('#xzTMP').text(), data));
						$('#xzsbPage').html(MHJ.tmpl($('#xzsbTMP').text(), data));
						$('#xzPage').show();
						me.checkTouch2();
						M.loadingHide();
					}
				});
				//关闭提示会员注册页面
				$('#memberClose').on(config.touch,function(){
					$('#memberPage').hide();
				});
				//点击分享页面任意处，隐藏此页面
				$('#sharePage').on(config.touch,function(){
					$(this).hide();
					$('body').css('overflow','auto');
				});
				//我的奖品页面
				$('#wdjp').on(config.touch,function(){
					gotoUrl('myprize.html');
				});
				//我的战绩页面
				$('#wdzj').on(config.touch,function(){
					M.loading(1,1);
					wdzjPage.act.init();
					me.out();
				});
				//竞猜排行榜
				$('#jcph').on(config.touch,function(){
					M.loading(1,1);
					rankPage.act.init();
					me.out();
				});
				//求赠积分
				$('#qzjf').on(config.touch,function(){
					config.shareInfo.title = '点击一下，送我积分，助我赢10万大奖！';
					config.shareInfo.desc = '我在参加良品铺子欧洲杯火热大竞猜';
					config.shareInfo.link = config.htmlUrl + 'index.html?f='+f;
					share(config.shareInfo,function(){
						succCb(2);
					});
					$('#sharePage').show();
					$('body').css('overflow','hidden');
				});
			},
			checkTouch2 : function(){
				var me = this;
				//选择投注积分
				$('.xz').on(config.touch,function(){
					$('#xzPage li').removeClass('active');
					$(this).parent().addClass('active');
//					var getPoints = $(this).data('rate');
//					$('#getPoints').text(parseInt(getPoints));
				});	
				//取消投注
				$('#cancel').on(config.touch,function(){
					$('#xzPage').hide();
					$('body').css('overflow','auto');
				});
				//确认下注
				$('#qrxz').on(config.touch,function(){
					var xzPoints = $('li.active .xz').data('points');
					console.log(xzPoints);
					if(mypoints<xzPoints){//积分不足,展示下注失败页面
						$('#xzPoints').text(xzPoints);
						$('#xzsbPage').show();
						$('#xzPage').hide();
						$('body').css('overflow','hidden');
					}else{//积分满足，可以发送投注请求
						M.loading(1,1);
						$('#xzPage').hide();
						$('body').css('overflow','auto');
						$('#tzjf').text(xzPoints);
						me.params.points = xzPoints;
						indexPage.data.bet(me.params);
					}
				});
				//下注失败，点击“确定”，展示分享页
				$('#sure').on(config.touch,function(){
					$('#xzsbPage').hide();
					$('#sharePage').show();
					$('body').css('overflow','hidden');
					config.shareInfo.title = '点击一下，送我积分，助我赢10万大奖！';
					config.shareInfo.desc = '我在参加良品铺子欧洲杯火热大竞猜';
					config.shareInfo.link = config.htmlUrl + 'index.html?f='+f;
					share(config.shareInfo,function(){
						succCb(2);
					});
				});	
			},
			checkuserCb : function(data){
				var me = this;
				var isfollow = data.isfollow;
				me.ismember = data.ismember;
				me.registerurl = data.registerurl;
//				me.ismember = 1;
//				isfollow = 1;
				if(!isfollow){//未关注弹出关注弹出框
					$('#hyPage').show();
					M.loadingHide();
				}else{//已关注
					indexPage.data.index();
				}
			},
			indexCb : function(data){
				var me = this;
				f = data.f;
				mypoints = data.mypoints;
				data.registerurl = me.registerurl;
				$('#indexPage').html(MHJ.tmpl($('#indexTMP').text(), data));
				if(!isTipShow){//未出现
					var num = parseInt($('.bet').length)-3;
					$('.bet').eq(num).addClass('tztip');
					$('.operatetip').show();
				}else{
					if($('.tztip').hasClass('tztip')){
						$('.tztip').removeClass('tztip');
					}
				}
				me.$dom.show();
				me.checkTouch();
				M.loadingHide();
			},	
			betCb : function(data){
				var me = this;
				//投注成功，可以进行摇一摇
				tzcgPage.act.init();
				me.out();
			},	
			out : function(){
				$('#cksc').off();
				$('#scfh').off();
				$('#wzdl').off();
				$('#rule').off();
				$('#ruleClose').off();
				$('.bet').off();
				$('#memberClose').off();
				$('#sharePage').off();
				$('#wzjp').off();
				$('#wdzj').off();
				$('#jcph').off();
				$('#qzjf').off();
				$('.xz').off();
				$('#cancel').off();
				$('#qrxz').off();
				$('#sure').off();
				this.$dom.hide();
			},
		};
		
		indexPage.data = {
			checkuser : function(){
				post('europ/checkuser',null,function(data){
					indexPage.act.checkuserCb(data);
				});
			},
			index : function(){
				post('europ/index',null,function(data){
					indexPage.act.indexCb(data);
				});
			},
			bet : function(parasm){
				post('europ/bet',parasm,function(data){
					indexPage.act.betCb(data);
				});
			}
		};
		
		tzcgPage.act = {
			$dom : $('#tzcgPage'), //tzcgPage的dom
			myShakeEvent : null,
			init : function(temp){
				var me = this;
				config.shareInfo.title = '累计猜对8场球，平分10万元';
				config.shareInfo.desc = '快来和我一起参加良品铺子欧洲杯火热大竞猜吧！';
				config.shareInfo.link = config.htmlUrl+'index.html';
				share(config.shareInfo,function(){
					succCb(1);
				});
				if(!temp){//投注成功，抽奖
					$('.tzcgPage').css('display','block');
					$('.zscgPage').css('display','none');
				}else{//赠送成功，抽奖
					$('.tzcgPage').css('display','none');
					$('.zscgPage').css('display','block');
				}
				me.$dom.show();
				me.myShakeEvent = new Shake({
				    threshold: 15, // optional shake strength threshold
				    timeout: 1000 // optional, determines the frequency of event generation
				});
				me.myShakeEvent.start();//Start listening to device motion:
				window.addEventListener('shake', me.shakeEventDidOccur, false);//function to call when shake occurs
				M.loadingHide();
//				setTimeout(function(){
//					tzcgPage.data.getcoupon();
//				},2000);
			},
			checkTouch : function(votenum){
				var me = this;
				//返回首页
				$('#fhsy').on(config.click,function(){
					M.loading(1,1);
					indexPage.act.init();
					me.out();
				});
				//查看奖品
				$('#ckjp').on(config.touch,function(){
					gotoUrl('myprize.html');
				});
			},
			shakeEventDidOccur : function() {
//				alert('shake!');
				oAudio.play();
				M.loading(1,1);
				tzcgPage.data.getcoupon();
			},
			getcouponCb : function(data){
				var me = this;
				var hasget = data.hasget;
				if(!hasget){//未获得奖品
					$('#hyhPage').show();
				}else{//获得奖品
					if(data.qname.length == 1){
						$('#jpname').html(data.qname[0]);
					}else{
						$('#jpname').html(data.qname[0]+'<br />'+data.qname[1]);
					}
					$('#gxnPage').show();
				}
				
				//stop listening for shake events
				window.removeEventListener('shake', me.shakeEventDidOccur, false);
				//stop listening to device motion
				me.myShakeEvent.stop();
				M.loadingHide();
				me.checkTouch();
			},	
			out : function(){
				var me = this;
				$('#fhsy').off();
				$('#ckjp').off();
				//stop listening for shake events
				window.removeEventListener('shake', me.shakeEventDidOccur, false);
				//stop listening to device motion
				me.myShakeEvent.stop();
				$('#hyhPage').hide();
				me.$dom.hide();
			},
		};	
		
		tzcgPage.data = {
			getcoupon : function(){
				post('europ/getcoupon',null,function(data){
					tzcgPage.act.getcouponCb(data);
				});
			}
		};
		
		rankPage.act = {
			$dom : $('#rankPage'), //rankPage的dom
			params : {
				type : null,
			},
			init : function(){
				var me = this;
				config.shareInfo.title = '累计猜对8场球，平分10万元';
				config.shareInfo.desc = '快来和我一起参加良品铺子欧洲杯火热大竞猜吧！';
				config.shareInfo.link = config.htmlUrl+'index.html';
				share(config.shareInfo,function(){
					succCb(1);
				});
				me.params.type = 'week';
				rankPage.data.rank(me.params);
			},
			checkTouch : function(votenum){
				var me = this;
				//返回首页
				$('#backHome').on(config.touch,function(){
					M.loading(1,1);
					indexPage.act.init();
					me.out();
				});
				//排行切换
				$('.paihang').on(config.touch,function(){
					$('.paihang').removeClass('active');
					M.loading(1,1);
					me.params.type = $(this).data('type');
					rankPage.data.rank(me.params);
				});	
			},
			rankCb : function(data){
				var me = this;
				$('#rankPage').html(MHJ.tmpl($('#rankTMP').text(), data));
				if(me.params.type == 'week'){
					$('.week').addClass('active');
				}else{
					$('.all').addClass('active');
				}
				me.$dom.show();
				me.checkTouch();
				M.loadingHide();
			},	
			out : function(){
				$('#backHome').off();
				$('.paihang').off();
				this.$dom.hide();
			},
		};	
		
		rankPage.data = {
			rank : function(params){
				post('europ/rank',params,function(data){
					rankPage.act.rankCb(data);
				});
			}
		};
		
		wdzjPage.act = {
			$dom : $('#wdzjPage'), //wdzjPage的dom
			pointsmall : null,
			init : function(){
				var me = this;
				config.shareInfo.title = '累计猜对8场球，平分10万元';
				config.shareInfo.desc = '快来和我一起参加良品铺子欧洲杯火热大竞猜吧！';
				config.shareInfo.link = config.htmlUrl+'index.html';
				share(config.shareInfo,function(){
					succCb(1);
				});
				wdzjPage.data.betlog();
			},
			checkTouch : function(votenum){
				var me = this;
				//返回首页
				$('#backIndex').on(config.touch,function(){
					M.loading();
					indexPage.act.init();
					me.out();
				});
				//积分兑换
				$('#jfdh').on(config.touch,function(){
					gotoUrl(me.pointsmall);
				});	
				//求赠积分
				$('#qiuz').on(config.touch,function(){
					config.shareInfo.title = '点击一下，送我积分，助我赢10万大奖！';
					config.shareInfo.desc = '我在参加良品铺子欧洲杯火热大竞猜';
					config.shareInfo.link = config.htmlUrl + 'index.html?f='+f;
					share(config.shareInfo,function(){
						succCb(2);
					});
					$('#sharePage').show();
					$('body').css('overflow','hidden');
				});
				//点击分享页面任意处，隐藏此页面
				$('#sharePage').on(config.touch,function(){
					$(this).hide();
					$('body').css('overflow','auto');
				});
			},
			betlogCb : function(data){
				var me = this;
				me.pointsmall = data.pointsmall;
				$('#wdzjPage').html(MHJ.tmpl($('#wdzjTMP').text(), data));
				me.$dom.show();
				me.checkTouch();
				M.loadingHide();
			},	
			out : function(){
				$('#backIndex').off();
				$('#jfdh').off();
				$('#qiuz').off();
				$('#sharePage').off();
				this.$dom.hide();
			},
		};	
		
		wdzjPage.data = {
			betlog : function(){
				post('europ/betlog',null,function(data){
					wdzjPage.act.betlogCb(data);
				});
			}
		};
		
		zsPage.act = {
			$dom : $('#zsPage'), //zsPage的dom
			params : {
				f : furl,
			},
			init : function(){
				var me = this;
				$('#main').show();
				config.shareInfo.title = '累计猜对8场球，平分10万元';
				config.shareInfo.desc = '快来和我一起参加良品铺子欧洲杯火热大竞猜吧！';
				config.shareInfo.link = config.htmlUrl+'index.html';
				share(config.shareInfo,function(){
					succCb(1);
				});
				zsPage.data.sharepage(me.params);
			},
			checkTouch : function(votenum){
				var me = this;
				//赠送抽奖
				$('#zscj').on(config.touch,function(){
					M.loading();
					zsPage.data.givepoint(me.params);
				});
			},
			sharepageCb : function(data){
				var me = this;
				if(!data.todayhasget){//今日还未被赠送积分
					$('#zsPage').html(MHJ.tmpl($('#zsTMP').text(), data));
					me.$dom.show();
					me.checkTouch();
					M.loadingHide();
				}else{//今日已被赠送过积分
					indexPage.act.init();
					me.out();
				}
			},	
			givepointCb : function(data){
				var me = this;
				tzcgPage.act.init(1);
				me.out();
			},
			out : function(){
				$('#zscj').off();
				this.$dom.hide();
			},
		};	
		
		zsPage.data = {
			sharepage : function(params){
				post('europ/sharepage',params,function(data){
					zsPage.act.sharepageCb(data);
				});
			},
			givepoint : function(params){
				post('europ/givepoint',params,function(data){
					zsPage.act.givepointCb(data);
				});
			}
		};
		
		function defaultError(data){
			var err = data.error - 0;
			M.loadingHide();
			$('section').hide();
			$('#errorPage').show();
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
//				alert(action+':'+JSON.stringify(data));
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
		
		function succCb(temp){//分享成功回调
			var params = {
				type : null
			};
			switch(temp){
				case 1://分享游戏
					params.type = 1;
					break;
				case 2://求赠积分
					params.type = 2;
					break;	
			}
			post('europ/share',params,function(data){
				alert('分享成功');
			});
		}
		
		function share(shareInfo,succCb){
			wxshare.initWx(shareInfo,config.gameid,config.apiopenid,config.apitoken,succCb,null,null,null);
		}
		
		M.loading(1,2);
		check(oAuth,function(){
			if(!furl){
				indexPage.act.init();
			}else{//从求赠积分链接进入
				zsPage.act.init();
			}
		});	
	}
	
    var imgs = [
    	__uri('../images/bg.jpg'),
    	__uri('../images/bg_2.png'),
    	__uri('../images/btn_1.png'),
    	__uri('../images/btn_2.png'),
    	__uri('../images/btn_3.png'),
    	__uri('../images/btn_4.png'),
    	__uri('../images/btn_5.png'),
    	__uri('../images/btn_6.png'),
    	__uri('../images/btn_7.png'),
    	__uri('../images/btn_8.png'),
    	__uri('../images/btn_9.png'),
    	__uri('../images/btn_10.png'),
    	__uri('../images/btn_11.png'),
    	__uri('../images/btn_12.png'),
    	__uri('../images/btn_15.png'),
    	__uri('../images/btn_16.png'),
    	__uri('../images/btn_17.png'),
    	__uri('../images/btn_19.png'),
    	__uri('../images/btn_20.png'),
    	__uri('../images/btn_21.png'),
    	__uri('../images/close.png'),
    	__uri('../images/fenxiang_1.png'),
    	__uri('../images/fenxiang_2.png'),
    	__uri('../images/flag.png'),
    	__uri('../images/friend.png'),
    	__uri('../images/gz.png'),
    	__uri('../images/hand.png'),
    	__uri('../images/jiangpin.png'),
    	__uri('../images/jingcai.png'),
    	__uri('../images/kuang.png'),
    	__uri('../images/logo.png'),
    	__uri('../images/paihang.png'),
    	__uri('../images/qiu.png'),
    	__uri('../images/qrcode.jpg'),
    	__uri('../images/quan_1.png'),
    	__uri('../images/quan_2.png'),
    	__uri('../images/shangyichang.png'),
    	__uri('../images/tanchu.png'),
    	__uri('../images/tanchu_1.png'),
    	__uri('../images/tanchu_2.png'),
    	__uri('../images/text_1.png'),
    	__uri('../images/text_2.png'),
    	__uri('../images/tishi.png'),
    	__uri('../images/VS.png'),
    	__uri('../images/yao.png'),
    	__uri('../images/yes.png'),
    	__uri('../images/zhanji.png'),
    	__uri('../images/zhuti.jpg'),
    	__uri('../images/zhuti_1.png'),
    	__uri('../images/saicheng.png'),
    	__uri('../images/saicheng1.png'),
    	__uri('../images/saicheng2.png'),
    	__uri('../images/banner.jpg'),
    	__uri('../images/error.jpg'),
    	__uri('../images/prizes.png'),
    	'http://lppz.letwx.com/app/eurocup-build/images/share.jpg',
    	'http://lppzcdn.letwx.com/app/eurocup-build/images/share.jpg',
	];
	
}());
