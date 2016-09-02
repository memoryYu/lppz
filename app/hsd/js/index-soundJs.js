(function(){
	require([config.configUrl],function(){
		var reqArr = ['auth','MHJ','loading','ngapi','imgpreload','jquery','wxshare','swiper','metaFix'];
		require(reqArr,requireCb);
	});
	
	function requireCb(oAuth,MHJ,M,ngapi,imgpreload,$,wxshare,swiper){
		var indexPage = {}; //首页对象
		var yaoPage = {}; //摇色子页面对象
		var musicPage = {}; //播放歌曲页面对象
		var rankPage = {}; //排行榜页面对象
		var myprizePage = {}; //我的奖品页面对象
		var gamePage = {} //游戏首页对象
		var playingPage = {} //游戏进行时对象
		var headimgurl; //此变量用于保存用户头像
		var successPop = {} //游戏成功对象
		var failPop = {} //游戏失败对象
		var $chance = 5;
		var $isshare = 0;
		var NOWTYPE = MHJ.getUrlParam().type;
		var type = {product:'product',friend:'friend',times:0};
		var shareInfo = {
			title:'我正在玩火山大逃亡，快来挑战吧！',
			desc:'火山大逃亡，你敢来探险吗？小心有岩浆爆发哦~'
		};
		window.oAudio = document.getElementById('audio');
		
		//首页
		indexPage.act = {
			$dom : $('#indexPage'), //indexPage的dom
			$startBtn : $('#indexStartBtn'), //开始按钮
			init : function(){
				var me = this;
				M.loading(1,2);
				check(oAuth,function(){
					imgpreload.load(imgs,function(){
						$('#main').show();
						me.$dom.show();
						me.checkTouch();
						me.setMusicArr();
						M.loadingHide();
						config.shareInfo.title = shareInfo.title;
						config.shareInfo.desc = shareInfo.desc;
						share(config.shareInfo);
					});
				});

			},
			checkTouch : function(){
				var me = this;
				this.$startBtn.on(config.touch,function(){
					yaoPage.act.init();
					me.out();
				});
			},
			out : function(){
				this.$dom.hide();
				this.$startBtn.off();
			},
			setMusicArr : function(){ //设置随机音乐数组
				yaoPage.act.musicArr = [];
				yaoPage.act.musicArr.push(random(1,6));
				yaoPage.act.musicArr.push(random(6,11));
				yaoPage.act.musicArr.push(random(11,16));
				yaoPage.act.musicArr.push(random(16,21));
				yaoPage.act.musicArr.push(random(21,26));
//				yaoPage.act.preloadMusic();
			}
		};
		//摇色子页面
		yaoPage.act = {
			$dom : $('#szPage'), //摇色子页面的dom
			nowCountry : 2, //当前选择的国家， 默认为中国
			nowMusic : 0,
			countryArr : [0,1,2,3,4],//日本,美国,中国,希腊,阿根廷
			musicArr : [],//初始化musicArr
			mySwiper : null,
			$musicLoad : $('#musicLoad'),
			init : function(){
				this.nowCountry = 2; //当前选择的国家， 默认为中国
				this.touchTimes = 0;
				$('.device').html(MHJ.tmpl($('#deviceTMP').text()));
				this.checkTouch();
				this.$dom.show();		
				console.log(yaoPage);
			},
			checkTouch : function(){
				var me = this;
				this.mySwiper = new Swiper('.swiper-country',{
					slidesPerView: 3,
					centeredSlides: true,
					initialSlide :2,
					loop: true,
					onTouchEnd: function(swiper){
						$('.swiper-wrapper').css({"padding-left":"1","padding-right":"0"});
						var index = me.mySwiper.activeLoopIndex;
						me.getIndex(index);
					}
				});
				$('.arrow-left').on(config.touch,function(){
					me.mySwiper.swipePrev();
					var index = me.mySwiper.activeLoopIndex;
					me.getIndex(index);
				});
				$('.arrow-right').on(config.touch,function(){
					me.mySwiper.swipeNext();
					var index = me.mySwiper.activeLoopIndex;
					me.getIndex(index);
				});
				$('#tw').on(config.touch,function(){
					me.out();
					//前往火山大逃亡页面
					gamePage.act.init();
				});
//				$('.contryList .swiper-slide').each(function(index){
////					$(this).on(config.touch,function(){
////						$('.contryList .swiper-slide').removeClass('active');
////						$(this).addClass('active');
//						var active = $(this).hasClass('swiper-slide-active');
//						if(active){
//							me.moveTriangle(index);
//						}
//						
////					});
//				});
				//摇一摇按钮
				this.ranYao();
			},
			getIndex : function(index){
				this.nowCountry = this.countryArr[index];
				console.log(this.nowCountry);
			},
			ranYao : function(){
				var me = this;
				$('#yao,.shaizi').on(config.touch,function(){ //首先应该根据国家获取之前随机数组中的数据，然后再次生成数据
					oAudio.play();//播放音效
					$(this).off();
					//this.randomMusic();
					console.log(me.touchTimes);
//					if(me.touchTimes !=0){
//						me.musicArr[me.nowCountry] = me.randomMusic();
//					}
//					me.preloadMusic(me.nowCountry);
//					this.touchTimes++;
					var dice = $('#dice');
					dice.attr("class","dice");//清除上次动画后的点数
					dice.css("cursor","default");
					$(".wrap").append("<div id='dice_mask'></div>");//加遮罩
					var temp = me.musicArr[me.nowCountry];
					var num = (temp % 5) == 0 ? 5 : (temp%5);
					console.log('筛子：'+num);
					dice.animate({left: '+2px'}, 100,function(){
						dice.addClass("dice_t");
					}).delay(200).animate({top:'-2px'},100,function(){
						dice.removeClass("dice_t").addClass("dice_s");
					}).delay(200).animate({opacity: 'show'},100,function(){
						dice.removeClass("dice_s").addClass("dice_e");
					}).delay(200).animate({left: '+2px'}, 100,function(){
						dice.removeClass("dice_e").addClass("dice_t");
					}).delay(200).animate({top:'-2px'},100,function(){
						dice.removeClass("dice_t").addClass("dice_s");
					}).delay(200).animate({opacity: 'show'},100,function(){
						dice.removeClass("dice_s").addClass("dice_e");
					}).delay(100).animate({left:'-2px',top:'2px'},100,function(){
						dice.removeClass("dice_e").addClass("dice_"+num);
						$("#result").html("您掷得点数是<span>"+num+"</span>");
						dice.css('cursor','pointer');
						console.log(me.musicArr);
						me.ranYao();
						$("#dice_mask").remove();//移除遮罩
						setTimeout(function(){
							me.out();
//							alert(me.musicArr[me.nowCountry]);
							musicPage.act.init(me.musicArr[me.nowCountry],me.nowCountry);
						},800);
					});
					yaoPage.data.getMusicNum(me.musicArr[me.nowCountry]);
				});
			},
			preloadMusic : function(country){ //预加载随机音乐
				var me = this;
				this.$musicLoad.show();
				var temp = 'music_'+ me.musicArr[country];
				createjs.Sound.alternateExtensions = ["mp3"];
				createjs.Sound.on("fileload",function(){
					console.log(musicsSM2);
					var ppc = new createjs.PlayPropsConfig().set({interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1})
					musicPage.act.nowSound = createjs.Sound.play(temp,ppc);
					musicPage.act.nowSound._pause();
					me.$musicLoad.hide();
				});
				musicsSM2[me.musicArr[country]] = 'music_'+ me.musicArr[country];
				createjs.Sound.registerSound(musics[me.musicArr[country]], temp, 1);
			},
			randomMusic : function(){
				var me = this;
				var temp = 0;
				return random(this.nowCountry*5+1,(this.nowCountry+1)*5+1);
			},
			out : function(){
//				this.mySwiper.destroy();
//				this.mySwiper = null;
//				this.mySwiper.reInit();
//				$('.contryList ').off();
				$('.arrow-left').off();
				$('.arrow-right').off();
				$('#tw').off();
				$('#yao').off();
				$('.shaizi').off();
				this.$dom.hide();
			}
		};
		yaoPage.data = {
			getMusicNum : function(musicid){
				post('hsd/getmusicnum',{musicid:musicid},musicPage.act.setPercent);
			}
		};
		//播放音乐页面
		musicPage.act = {
			$dom : $('#musicPage'),
			$changeMusic : $('#changeMusic'),
			$goGame : $('#goGame'),
			$musicLoad : $('#musicLoad'),
			musicId : null,
			countryId : null,
			nowMusicId : null,
			nowSound : null, //存放当前正在播放的音乐的sound.play实例
			offset : 0,
			tms: 0,
			init : function(musicid,country){
				var me = this;
				createjs.Sound.stop();
				$('#playMusic').addClass('active');
				this.$dom.show();
				this.musicId = musicid; //当前的音乐id
				this.countryId = country; //当前的国家Id
				this.$musicLoad.show();
				this.preloadMusic(musicid);
				this.checkTouch();
				this.nowMusicId = musicsSM2[musicid];
				config.shareInfo.title = '果冻时间，来点音乐最好！我正在听'+musicInfo[musicid].country+'火山音乐，你也来听吧！';
				config.shareInfo.desc = '会唱歌的火山冻，五个火山国家的音乐供你选择';
				share(config.shareInfo);
			},
			setPercent : function(data){
				//设置dom值
				var percent = data.percent;
				$('#percent').html(percent);
				$('.intro').css('visibility','visible');
			},
			randMusic : function(){
				var temp = random(this.countryId*5+1,(this.countryId+1)*5+1);
				while(temp == this.musicId){
					temp = random(this.countryId*5+1,(this.countryId+1)*5+1);
				}
				this.musicId = temp;
//				alert("temp: "+temp);
				return temp;
			},
			preloadMusic : function(musicid,readyCb){
				console.log('musicid:'+musicid);
				var me = this;
				this.musicId = musicid;
				config.shareInfo.title = '果冻时间，来点音乐最好！我正在听'+musicInfo[musicid].country+'火山音乐，你也来听吧！';
				share(config.shareInfo);
				this.setMusicInfo(musicid);
				var temp = 'music_'+musicid;
				var tag = 0;
				this.nowMusicId = musicid;
//				if(musicsSM2[musicid]){
//					console.log("musicsSM2[musicid]是真的！");
//					var ppc = new createjs.PlayPropsConfig().set({interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1})
//					me.nowSound = createjs.Sound.play(temp,ppc);
//					me.nowSound._pause();
//					readyCb && readyCb(temp,musicid);
//				}else{
					console.log("musicsSM2[musicid]是假的！");
					createjs.Sound.alternateExtensions = ["mp3"];
					createjs.Sound.registerSound(musics[musicid], temp);
					createjs.Sound.on("fileload",function(event){
						console.log(event.id);
						if(createjs.Sound.loadComplete(musics[musicid])){
							console.log('1');
							var ppc = new createjs.PlayPropsConfig().set({interrupt: createjs.Sound.INTERRUPT_ANY,offset:0, loop: -1});
							me.nowSound = createjs.Sound.play(musics[musicid],ppc);
//							alert("1:" + temp + "  " +me.nowSound.playState);
//							if(me.nowSound.playState == 'playSucceeded'){
								console.log('2');
								me.nowSound._pause();
								createjs.Sound.stop();
//								me.nowSound.stop();
								console.log('3');
								readyCb && readyCb(temp,musicid);
//							setTimeout(function(){
								me.$musicLoad.hide();
//							},800);
//							musicsSM2[musicid] = 'music_'+ musicid;
//							}
						}
					});
					console.log(musics[musicid]);
//				}
			},
			playMusic : function(musicid,id){
				this.nowSound.applyPlayProps({offset:0});
				this.nowSound.stop();
				console.log(musicid);
//				createjs.Sound.stop(musicid);
//				createjs.Sound.play(musicid);
//				alert("2:" + temp + "  " + this.nowSound.playState);
				if(this.nowSound.playState == 'playFinished'){
					this.nowSound.play();
//				alert("3:" + temp + "  " + this.nowSound.playState);
				}
				++type.times;
				$('#playMusic').removeClass('active');
				$(".huatong").addClass("rotate15");
				$("#musicpic").addClass("rotate360");
				$(".diwen").addClass("rotate360");
				$('.intro').css('visibility','hidden');
//				this.$musicLoad.hide();
				this.nowMusicId = musicid;
			},
			checkTouch : function(){
				var me = this;
				//返回上一页
				$("#anz1").on(config.touch,function(){
					me.out();
					yaoPage.act.init();
				});
				//换一首歌
				this.$changeMusic.on(config.touch,function(){
					console.log(me.nowSound);
//					me.nowSound.muted = true;
//					me.nowSound.off();
//					me.nowSound._pause();
//					createjs.Sound.stop();
					createjs.Sound.removeAllEventListeners();
					createjs.Sound.removeAllSounds();
					me.$musicLoad.show();
					$('#playMusic').addClass('active');
					$(".huatong").removeClass("rotate15");
					$("#musicpic").removeClass("rotate360");
					$(".diwen").removeClass("rotate360");
					if(NOWTYPE == type.friend){
						if(type.times>2){
							alert('您必须购买商品才能继续听音乐！');
							return;
						}
					}
					me.preloadMusic(me.randMusic(),function(musicid,id){
						me.playMusic(musicid,id);
					});
					
				});
				//去往火山大逃亡
				this.$goGame.on(config.touch,function(){
					me.out();
					//前往火山大逃亡页面
					gamePage.act.init();
				});
				//播放、暂停
				$('#playMusic').on(config.touch,function(){
//					console.log(me.nowMusicId);
//					me.nowSound.applyPlayProps({offset:me.offset});
//					createjs.Sound.stop();
//					me.nowSound.stop();
//					var myInstance = createjs.Sound.createInstance(me.nowMusicId);
//					var myInstanse;
					me.nowSound.startTime = me.offset;
					if($(this).hasClass('active')){
						console.log('4');
						me.nowSound._resume();
						console.log('5');
						$(".huatong").addClass("rotate15");
						$("#musicpic").addClass("rotate360");
						$(".diwen").addClass("rotate360");
						$(this).removeClass('active');
					}else{
						console.log('6');
						me.nowSound._pause();//暂停
						me.offset = me.nowSound.startTime;
						console.log('7');
						$(".huatong").removeClass("rotate15");
						$("#musicpic").removeClass("rotate360");
						$(".diwen").removeClass("rotate360");
						$(this).addClass('active');
					}
				});
			},
			setMusicInfo : function(musicid){
				$('#musicName').html(musicInfo[musicid].name);
				$('#musicSonger').html(musicInfo[musicid].desc);
				$('#musicpic').attr('src',musicInfo[musicid].pic);
			},
			out : function(){
				createjs.Sound.stop();
				createjs.Sound.removeAllEventListeners();
				createjs.Sound.removeAllSounds();
				config.shareInfo.title = shareInfo.title;
				config.shareInfo.desc = shareInfo.desc;
				this.$dom.hide();
				this.$changeMusic.off();
				this.$goGame.off();
				$('#anz1').off();
				$('#playMusic').off();
				$('#playMusic').removeClass('active');
				$("#musicpic").removeClass("rotate360");
				$(".diwen").removeClass("rotate360");
				$(".huatong").removeClass("rotate15");
			}
		};

		rankPage.act = {
			$dom : $('#rankPage'),
			init : function(){
				config.shareInfo.title = shareInfo.title;
				config.shareInfo.desc = shareInfo.desc;
				var me = this;
				this.$dom.show();
//				check(oAuth,function(){
					M.loading(1,2);
					rankPage.data.getRank();
//				});

			},
			rankCb : function(data){
				var me = this;
				if(data.myrank == 0){
					$('#muqdi').hide();
				}else $('#myrank').html(data.myrank);
				$('#rankpack').html(MHJ.tmpl($('#rankListTMP').text(),data.rank));
				me.setListHeight();
				this.$dom.show();
				this.checkTouch();
				new Swiper('.swiper-containerph',{
					mode:'vertical',
					scrollContainer: true,
					scrollbar: {
						container: '.swiper-scrollbar'
					}
				});
				M.loadingHide();
			},
			checkTouch : function(){
				var me = this;
				//返回首页
				$('#rankGoIndex').on(config.touch,function(){
					me.out();
					gamePage.act.init();
				});
				//我的奖品
				$('#rankGoPrize').on(config.touch,function(){
					me.out();
					myprizePage.act.init();
				});
			},
			setListHeight : function(){
				var wHeight = $(window).height();
				//$('#rankpack').height(wHeight - 350);
				$('.swiper-containerph').height(wHeight - 350);
			},
			out : function(){
				this.$dom.hide();
				$('#rankGoIndex').off();
				$('#rankGoPrize').off();
			}
		};
		rankPage.data = {
			getRank : function(){
				post('hsd/rank',null,function(data){
					rankPage.act.rankCb(data);
				});
			}
		};

		myprizePage.act = {
			$dom : $('#myprizePage'),
			logid : null,
			$nowdom : null,
			init : function(){
				config.shareInfo.title = shareInfo.title;
				config.shareInfo.desc = shareInfo.desc;
				M.loading(1,2);
				this.$dom.show();
				this.setHeight();
				myprizePage.data.getMyPrize();
			},
			getMyPrizeCb : function(data){
				$('#myPrizeList').html(MHJ.tmpl($('#myPrizeListTMP').text(),data.prize));
				M.loadingHide();
				this.checkTouch();
			},
			setHeight : function(){
				var wHeight = $(window).height();
				$('#myPrizeList').height(wHeight - 350);
			},
			checkTouch : function(){
				var me = this;
				$('#myPrizeList li .quanr').on(config.touch,function(){
					if($(this).hasClass('lq')){
						me.logid = $(this).data('id');
						me.$nowdom = $(this);
						$('#myprzePop').show();
					}
				});
				//弹出框的关闭按钮
				$('#myprzePopClose').on(config.touch,function(){
					$('#myprzePop').hide();
				});
				//我的奖品确认
				$('#myprizeConfirm').on(config.touch,function(){
					var mobile = '^0?(13|15|18|14|17)[0-9]{9}$';
					var name = $('#myprizeName').val();
					var tel = $('#myprizeTel').val();
					if(!name){
						alert('请填写您的姓名！');
						return;
					}else if(!(new RegExp(mobile).test(tel))){
						alert('请填写正确的联系电话！');
						return;
					}
					M.loading(1,2);
					myprizePage.data.saveInfo(me.logid,name,tel);
				});
				//返回首页
				$('#myprizeGoIndex').on(config.touch,function(){
					me.out();
					gamePage.act.init();
				});
			},
			saveInfoCb : function(data){
				M.loadingHide();
				this.$nowdom.removeClass('lq');
				$('#myprzePop').hide();
				alert('恭喜你已经领取成功了');
			},
			out : function(){
				this.$dom.hide();
				$('#myPrizeList li .quanr').off();
				$('#myprzePopClose').off();
				$('#myprizeConfirm').off();
				$('#myprizeGoIndex').off();
			}
		};
		myprizePage.data = {
			getMyPrize : function(){
				post('hsd/myprize',null,myprizePage.act.getMyPrizeCb.bind(myprizePage.act));
			},
			saveInfo : function(logid,name,tel){
				post('hsd/saveinfo',{
					logid : logid,
					name : name,
					tel : tel
				},myprizePage.act.saveInfoCb.bind(myprizePage.act));
			}
		}
		
		//游戏首页
		gamePage.act = {
			$dom: $('#gameIndex'), //indexPage的dom
			$startBtn: $('#gameStartBtn'), //开始游戏按钮
			$rankBtn: $('#rankList'), //排行榜按钮
			$explainBtn: $('#gameExp'), //游戏说明按钮
			$gameExpPop: $('#gameExpPop'), //游戏说明弹出框
			$closeExpBtn: $('#closeExp'), //关闭游戏说明按钮
			$num: $('.num'), //剩余游戏次数的dom
			init: function() {
				M.loading(1,2);
				config.shareInfo.title = "我正在玩火山大逃亡，快来挑战吧！"; //初始化分享链接标题
				config.shareInfo.desc = "火山大逃亡，你敢来探险吗？小心有岩浆爆发哦~"; //初始化分享链接中的描述内容
				gamePage.data.getGameChance(); //发送请求，获得gameChance
				$('#main').show();
				this.$dom.show();
				$('#gameBox').html(MHJ.tmpl($('#ulTMP').text(), {}));
//				this.checkTouch();
			},
			checkTouch: function() {
//				alert($chance);
				var me = this;
				$("#anfh").on(config.touch, function() {//返回到摇骰子页面
					me.out();
					yaoPage.act.init();
				});
				this.$rankBtn.on(config.touch, function() { //排行榜页面的接口，未完成
					me.out();
					rankPage.act.init();
				});
				this.$explainBtn.on(config.touch, function() { //显示游戏说明弹出框
					me.$gameExpPop.show();
				});
				this.$closeExpBtn.on(config.touch, function() { //隐藏游戏说明弹出框
					me.$gameExpPop.hide();
				});
//				alert("判断alert内容的$chance: " + $chance);
				this.$startBtn.on(config.click, function() {
					if ($chance <= 0) { //剩余游戏机会为0
						if ($isshare <= 0) { //还未分享
							alert("亲，没有游戏机会咯~分享可获得一次机会哟~");
						} else { //已分享
							alert("亲，没有游戏机会咯~明天再来吧~");
						}
					} else { //还有游戏机会
						playingPage.act.init();
						me.out();
					}
				});
			},
			out: function() {
				$('#anfh').off();
				this.$startBtn.off();
				this.$rankBtn.off();
				this.$explainBtn.off();
				this.$closeExpBtn.off();
				this.$dom.hide();
			},
			gameChanceCb: function(data) { //getGameChance的回调函数
				var err = data.error;
				var me = this;
				switch (err) {
					case 0:
						var chance = data.chance; //今天剩余玩游戏的次数
						var isshare = data.isshare; //今天是否分享过，0-为未分享，1-已分享
						var nickname = data.nickname; //用户名称
						$chance = chance;
//						alert("这是ngapi返回的： " + $chance);
						$isshare = isshare;
						headimgurl = data.headimgurl; //用户头像
						if(chance <= 0){
							this.$num.html("0");
						}else{
							this.$num.html(chance);
						}
						wxshareType(chance,isshare);
						me.checkTouch();
						M.loadingHide();
						break;
					default:
						defaultError(data);
				}
				
			}
		}
		gamePage.data = {
			getGameChance: function() {
				ngapi('hsd/gamechance', {}, config.gameid, function(data) {
					console.log(JSON.stringify(data));
					gamePage.act.gameChanceCb(data);
				}, config.apiopenid, config.apitoken);
			}
		}
				//正式游戏界面
		playingPage.act = {
			$dom: $('#playing'), //playing的dom
			$userImg: $('.userimg'), //用户图像
			$bar: $('.barpack .bar'), //时间条
			$min: $('#min'), //时间的分钟
			$sec: $('#sec'), //时间的秒钟
			$gameList: $('.gamelist'), //ul，整个格子
			$li: $('.gamelist li'), //ul中的li
			$pass: $('li .zhe'), //魔鬼的步伐~
			$steps: $('.bushupack .count'), //步数
			$sz: $('#sz'), //bangArr[6][0],即six and zero
			$so: $('#so'), //bangArr[7][1],即seven and one
			preStep: 49, //上一步index索引号的初始化
			mineNum: 10, //地雷的数量
			step: 0, //统计步数的变量
			timerc: 120, //倒计时时间，以秒为单位
			useTime: 0, //用时
			barWidth: 322, //初始化时间条的长度
			t: function() {}, //settimeout()
			init: function() {
				console.log(playingPage);
				this.$gameList = $('.gamelist');
				this.$li = $('.gamelist li');
				this.$pass = $('li .zhe');
				this.$sz = $('#sz'); //bangArr[6][0],即six and zero
				this.$so = $('#so'); //bangArr[7][1],即seven and one
				this.step = 0;
				this.$steps.html(this.step);
				this.preStep = 49; //上一步index索引号的初始化
				this.timerc = 120;
				this.useTime = 0;
				this.barWidth = 322;
				this.$min.html("02");
				this.$sec.html("00");
				$('#tip').html("从左下角开始，逃离火山口，注意地雷哟~");
				wxshareType(1,1);//普通的分享
				playingPage.data.playRecord(); //发送请求，记录游戏
				this.setLiAttr();
				this.setBangArr();
				this.$dom.removeClass("hide");
				$('#main').show();
				this.time();
				this.checkTouch();
			},
			setLiAttr: function() { //将每个li加上index这个属性，便于索引
				var lis = this.$li;
				console.log(lis);
				for (var i = 0; i < lis.length; i++) { //从0开始计数
					lis.eq(i).attr("index", i);
				}
			},
			checkTouch: function() {
				var me = this;
				this.$sz.addClass("active");
				this.$so.addClass("active");
				this.$li.on(config.touch, function() {
					if (!$(this).hasClass("active")) {
						return;
					}
					if ($(this).hasClass("old")) {
						return;
					}
					me.step++;
					me.$steps.html(me.step);
					console.log("step: " + me.step);
					$('#sp').html(me.step);
//					$('#here').removeClass("hide");
					$('.gamelist li').removeClass("active");
					$(this).children("div").addClass('hide');
					$(this).addClass('old');
					var index = parseInt($(this).attr("index"));
					$('#here').removeClass("upDown");
					//					alert(preStep);
					me.move(me.preStep, index);
					//					alert(index);
					var x = parseInt(index / 7); //得到数组下标x
					var y = parseInt(index % 7); //得到数组下标y
//					alert("x: " +x+" "+"y: "+y+" " +bangArr[x][y]);
					var onePlus = parseInt(index) + 1; //index+1
					var oneNeg = parseInt(index) - 1; //index-1
					var sevenPlus = parseInt(index) + 7; //index+7
					var sevenNeg = parseInt(index) - 7; //index-7
					var mines = me.arround(onePlus, oneNeg, sevenPlus, sevenNeg);
					if (bangArr[x][y] == 1) { //有熔岩
						$('#tip').html("Boom!!!你踩到熔岩了！");
						$('.pa').removeClass("hide");
						$('.pa').addClass("bounceIn");
						setTimeout(function() {
							me.out();
							failPop.act.init();
						}, 2000);
					} else { //无熔岩，快到终点了
						me.tip(mines);
						me.addActive(index, onePlus, oneNeg, sevenPlus, sevenNeg);
						if (x == 0 && y == 6) {//走到最后一步，游戏成功
							me.out();
							successPop.act.init();
						}
					}
		
				});
			},
			tip: function(mines) {
				if (mines == 0) {
					$('#tip').html("nice!您的四周暂时很安全~");
				} else {
					$('#tip').html("小心哦！周围有" + mines + "块熔岩");
				}
			},
			addActive: function(index, onePlus, oneNeg, sevenPlus, sevenNeg) {
				var me = this;
				if (index % 7 == 0) { //方格左侧一列
					me.$li.eq(onePlus).addClass("active");
					me.$li.eq(sevenPlus).addClass("active");
					me.$li.eq(sevenNeg).addClass("active");
				}
				if ((index + 1) % 7 == 0) { //方格右侧一列
					me.$li.eq(oneNeg).addClass("active");
					me.$li.eq(sevenPlus).addClass("active");
					me.$li.eq(sevenNeg).addClass("active");
				}
				if (index <= 6) { //方格第一行
					me.$li.eq(onePlus).addClass("active");
					me.$li.eq(oneNeg).addClass("active");
					me.$li.eq(sevenPlus).addClass("active");
				}
				if (index >= 49) { //方格第八行
					//					alert("判别到第八行了");
					me.$li.eq(onePlus).addClass("active");
					me.$li.eq(oneNeg).addClass("active");
					me.$li.eq(sevenNeg).addClass("active");
				} else {
					me.$li.eq(onePlus).addClass("active");
					me.$li.eq(oneNeg).addClass("active");
					me.$li.eq(sevenPlus).addClass("active");
					me.$li.eq(sevenNeg).addClass("active");
				}
			},
			move: function(preStep, index) {
				console.log(index + "-" + preStep);
				var direction = parseInt(index - preStep);
				console.log("direction:" + direction);
				var left = parseInt($('#here').css("left"));
				var bottom = parseInt($('#here').css("bottom"));
				//				console.log("left:" + left);
				switch (direction) {
					case -1: //从右往左移动
						$('#here').css("left", left - 70);
						break;
					case 1: //从左往右移动
						$('#here').css("left", left + 70);
						break;
					case -7: //从下往上移动
						$('#here').css("bottom", bottom + 72);
						break;
					case 7: //从上往下移动
						$('#here').css("bottom", bottom - 72);
						break;
					default:
						console.log(direction);
				}
				this.preStep = index;
				//				console.log(this.preStep);
				$('#here').addClass("upDown"); //move完了之后加上upDown
			},
			arround: function(onePlus, oneNeg, sevenPlus, sevenNeg) { //判断周围有几个地雷
				var mine = 0;
				if (this.ifmine(onePlus)) {
					mine++;
				}
				if (this.ifmine(oneNeg)) {
					mine++;
				}
				if (this.ifmine(sevenPlus)) {
					mine++;
				}
				if (this.ifmine(sevenNeg)) {
					mine++;
				}
				return mine;
			},
			ifmine: function(num) {
				var i = Math.floor(num / 7);
				var j = num % 7;
				console.log('num= ' + num);
				console.log("i= " + i);
				console.log("j= " + j);
				//				alert("hfggjhjnh"+bangArr[i][j]);
				try {
					if (bangArr[i][j] == 1) {
						return true; //有地雷
					} else {
						return false; //无地雷
					}
				} catch (e) {
					return false; //
				}
			},
			time: function() {
				this.$bar.addClass("widthChg");
				this.sub(this.timerc); //首次调用sub函数
			},
			sub: function(timerc) { //减时函数
				var me = this;
				me.barWidth = me.$bar.css("width");
				if (timerc > 0) { //如果还有时间
					--timerc; //时间变量自减1
					this.$min.html("0" + parseInt(timerc / 60)); //写入分钟数
					this.$sec.html(Number(parseInt(timerc % 60 / 10)).toString() + (timerc % 10)); //写入秒数（两位）
					console.log(timerc);
					me.useTime = Math.floor(180 - timerc);
					this.t = setTimeout(function() {
						me.sub(timerc);
					}, 1000); //设置1000毫秒以后执行一次本函数,每秒计时
				} else {
					me.out();
					failPop.act.init();
				}
			},
			setBangArr: function() {
				for (var i = 0; i < 8; i++) { //一维长度为8
					for (var j = 0; j < 7; j++) { //二维长度为7
						bangArr[i][j] = 0; //先全部设置为无地雷
					}
				}
				var result = "";
				for (i = 0; i < this.mineNum; i++) {
					var first = Math.floor(Math.random() * bangArr.length + 1) - 1;
					var second = Math.floor(Math.random() * bangArr[first].length + 1) - 1;
					bangArr[first][second] = 1; //将选中的22个赋值为1，即有地雷
					result += first + " " + second + "|";
				}
				console.log(result);
				bangArr[7][0] = 0; //入口设置为无熔岩
				bangArr[0][6] = 0; //出口设置为无熔岩
				console.log(bangArr);
			},
			out: function() {
				window.clearTimeout(this.t);
				this.$bar.removeClass("widthChg");
				this.$bar.css("width", this.barWidth);
				$('.pa').hide();
				this.$li.off();
			},
			playRecordCb: function(data) { //playRecord的回调函数
				console.log(JSON.stringify(data));
				var err = data.error;
				var me = this;
				switch (err) {
					case 0:
						console.log("已记录游戏一次！");
						this.$userImg.attr("src", headimgurl);
						break;
					default:
						defaultError(data);
				}
			}
		}
		playingPage.data = {
			playRecord: function() {
				ngapi('hsd/record', {
					type: 1 //记录玩游戏
				}, config.gameid, function(data) {
					playingPage.act.playRecordCb(data);
				}, config.apiopenid, config.apitoken);
			}
		}
		//游戏失败弹出框
		failPop.act = {
			$dom: $('#popshibai'), //游戏失败弹出框的dom
			$playAgain: $('#playAgain1'), //再来一次按钮
			$share: $('#share1'), //分享按钮
			$back: $('#back'), //返回摇歌按钮
			init: function() {
				wxshareType(1,1);//普通的分享
				$('#popshibai').show();
				this.checkTouch();
			},
			checkTouch: function() {
				var me = this;
				this.$share.on(config.touch, function() {
					$('#popshare').show();
					$('#popshare').on(config.touch, function() {
						$('#popshare').hide();
					});
				});
				this.$back.on(config.touch, function() {
					me.out();
					yaoPage.act.init();
				});
				this.$playAgain.on(config.touch,function(){
					me.out();
					gamePage.act.init();
				});
			},
			out: function() {
				this.$playAgain.off();
				this.$share.off();
				this.$back.off();
				playingPage.act.$dom.addClass("hide");
				this.$dom.hide();
			},
		}
		//游戏胜利弹出框
		successPop.act = {
			$dom: $('#popshengli'), //游戏胜利弹出框的dom
			$playAgain: $('#playAgain2'), //再来一次按钮
			$share: $('#share2'), //分享按钮
			$checkRank: $('#checkRank'), //查看排行按钮
			init: function() {
				M.loading(1,2);
				config.shareInfo.title = "我花了" + playingPage.act.step + "获得逃亡大师称号，快来挑战吧！";
				config.shareInfo.desc = "安全逃离火山，躲避火山岩浆，一起来火山大逃亡吧！";
				successPop.data.updateScore();
				this.$dom.show();
//				M.loadingHide();
//				this.checkTouch();
			},
			checkTouch: function() {
				var me = this;
				this.$share.on(config.touch, function() {
					$('#popshare').show();
					$('#popshare').on(config.touch, function() {
						$('#popshare').hide();
					});
				});
				this.$checkRank.on(config.touch, function() {
					me.out();
					rankPage.act.init();
				});
				this.$playAgain.on(config.touch, function() {
					if ($chance <= 0) { //剩余游戏机会为0
						if ($isshare <= 0) { //还未分享
							alert("亲，没有游戏机会咯~分享可获得一次机会哟~");
						} else { //已分享
							alert("亲，没有游戏机会咯~明天再来吧~");
						}
					} else { //还有游戏机会
						gamePage.act.init();
						me.out();
					}
				});
			},
			out: function() {
				this.$playAgain.off();
				this.$share.off();
				this.$checkRank.off();
				playingPage.act.$dom.addClass("hide");
				this.$dom.hide();
			},
			updatescoreCb: function(data) { //上传成绩的回调函数
				M.loadingHide();
				var err = data.error;
				var me = this;
				switch (err) {
					case 0:
//						alert("上传成绩成功");
						var chance = data.chance; //今天剩余玩游戏的次数
						var isshare = data.isshare; //今天是否分享过，0-为未分享，1-已分享
						$chance = chance;
						$isshare = isshare;
						wxshareType(chance,isshare);
						me.checkTouch();
						break;
					default:
						defaultError(data);
				}
			},
		}
		successPop.data = { //上传成绩
			updateScore: function() {
				ngapi('hsd/updatescore', {
					step: playingPage.act.step - 0, //使用步数
					usetime: playingPage.act.useTime - 0 //使用时间，以秒为单位
				}, config.gameid, function(data) {
//					alert("data: " + JSON.stringify(data));
					successPop.act.updatescoreCb(data);
				}, config.apiopenid, config.apitoken);
			},
		}
		
		//分享
        function wxshareType(chance, isshare) {
        	var temp = null;
            if (chance <= 0) { //没有机会
                if (isshare <= 0) { // 没有分享
                    temp = 1; 
                } else { // 分享过了
                   temp = 0;
                }
            } else { //还有机会
                temp = 0;
            }
            share(config.shareInfo,function(){
                 shareSuccCb(temp); //+1的操作
             }); 
        }
        function shareSuccCb(type){
            if(type){
                post('hsd/record', {
                    type: 0
                },function(data){
                    var err = data.error - 0;
                    switch(err){
                        case 0:
                            alert("恭喜你，获得一次额外的机会！");
							successPop.act.out();
							$chance = 1;
							gamePage.act.init();
                            break;
                        default:
                            defaultError(data);
                    }
                });
            }
        }
        
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
		
		//创建二维数组
		var bangArr = new Array(); //先声明一维
		for (var i = 0; i < 8; i++) { //一维长度为8
			bangArr[i] = new Array(); //再声明二维
			for (var j = 0; j < 7; j++) { //二维长度为7
				bangArr[i][j] = 0; //先全部设置为无地雷
			}
		}

		function share(shareInfo,succCb){
			wxshare.initWx(shareInfo,config.gameid,config.apiopenid,config.apitoken,succCb,null,null,null);
		}
		
		indexPage.act.init();
	}
	
	//产生随机数 例如，生成0-9的随机数(包括0,不包括9) random(0,9)
    function random(min,max){
    	return Math.floor(min+Math.random()*(max-min));
    }
    var imgs = [
		config.baseCDNUrl + 'images/bg.jpg',
		config.baseCDNUrl + 'images/bg6.jpg',
		config.baseCDNUrl + 'images/anniu1.png',
		config.baseCDNUrl + 'images/anniu-2.png',
		config.baseCDNUrl + 'images/anniu5.png',
		config.baseCDNUrl + 'images/anniushang.png',
		config.baseCDNUrl + 'images/anniuxia.png',
		config.baseCDNUrl + 'images/anniufanhui.png',
		config.baseCDNUrl + 'images/anniuzuo1.png',
		config.baseCDNUrl + 'images/bofanganniu.png',
		config.baseCDNUrl + 'images/btn.png',
		config.baseCDNUrl + 'images/chukou.jpg',
		config.baseCDNUrl + 'images/dice.png',
		config.baseCDNUrl + 'images/die1.png',
		config.baseCDNUrl + 'images/die2.png',
		config.baseCDNUrl + 'images/fenxiang.png',
		config.baseCDNUrl + 'images/fenxiang1.png',
		config.baseCDNUrl + 'images/fenxiang2.png',
		config.baseCDNUrl + 'images/guang.png',
		config.baseCDNUrl + 'images/guodong.png',
		config.baseCDNUrl + 'images/huangguan.png',
		config.baseCDNUrl + 'images/huoshan.png',
		config.baseCDNUrl + 'images/huoshankou.jpg',
		config.baseCDNUrl + 'images/jp.png',
		config.baseCDNUrl + 'images/lingqu1.png',
		config.baseCDNUrl + 'images/load.gif',
		config.baseCDNUrl + 'images/logo.png',
		config.baseCDNUrl + 'images/logo1.png',
		config.baseCDNUrl + 'images/pic.jpg',
		config.baseCDNUrl + 'images/shan.png',
		config.baseCDNUrl + 'images/shengli.png',
		config.baseCDNUrl + 'images/shibai.png',
		config.baseCDNUrl + 'images/time.png',
		config.baseCDNUrl + 'images/timett.png',
		config.baseCDNUrl + 'images/to.png',
		config.baseCDNUrl + 'images/txtbg.png',
		config.baseCDNUrl + 'images/wenzi.png',
		config.baseCDNUrl + 'images/zantinganniu.png',
		config.baseCDNUrl + 'images/zhasile.png',
		config.baseCDNUrl + 'images/zhiyin.png',
		config.baseCDNUrl + 'images/zhujue.png',
		config.baseCDNUrl + 'images/zhuti.png',
		config.baseCDNUrl + 'images/2p-guodong-huang.png',
		config.baseCDNUrl + 'images/2p-guodong-hong.png',
		config.baseCDNUrl + 'images/2p-jiantou-you.png',
		config.baseCDNUrl + 'images/2p-jiantou-zuo.png',
		config.baseCDNUrl + 'images/4-1p-beijing.jpg',
		config.baseCDNUrl + 'images/4-2p youxiguize.jpg',
		config.baseCDNUrl + 'images/4-2p-chacha.png',
		config.baseCDNUrl + 'images/8p-beijing.jpg',
		config.baseCDNUrl + 'images/9p-gou.png',
		config.baseCDNUrl + 'images/5-1p-beijng.jpg',
	];
	//音乐cdn地址
    var musics = [
    	null,
    	'http://lppzcdn.letwx.com/app/hsd/resource/1_1.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/1_2.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/1_3.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/1_4.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/1_5.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/2_1.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/2_2.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/2_3.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/2_4.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/2_5.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/3_1.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/3_2.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/3_3.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/3_4.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/3_5.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/4_1.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/4_2.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/4_3.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/4_4.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/4_5.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/5_1.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/5_2.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/5_3.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/5_4.mp3',
    	'http://lppzcdn.letwx.com/app/hsd/resource/5_5.mp3',
    ];
    var assetPath = config.cdnUrl + 'resource/';
    var sounds = [
    	{src:"1_1.mp3", id:"1"},
    	{src:"1_2.mp3", id:"2"},
    	{src:"1_3.mp3", id:"3"},
    	{src:"1_4.mp3", id:"4"},
    	{src:"1_5.mp3", id:"5"},
    	{src:"2_1.mp3", id:"6"},
    	{src:"2_2.mp3", id:"7"},
    	{src:"2_3.mp3", id:"8"},
    	{src:"2_4.mp3", id:"9"},
    	{src:"2_5.mp3", id:"10"},
    	{src:"3_1.mp3", id:"11"},
    	{src:"3_2.mp3", id:"12"},
    	{src:"3_3.mp3", id:"13"},
    	{src:"3_4.mp3", id:"14"},
    	{src:"3_5.mp3", id:"15"},
    	{src:"4_1.mp3", id:"16"},
    	{src:"4_2.mp3", id:"17"},
    	{src:"4_3.mp3", id:"18"},
    	{src:"4_4.mp3", id:"19"},
    	{src:"4_5.mp3", id:"20"},
    	{src:"5_1.mp3", id:"21"},
    	{src:"5_2.mp3", id:"22"},
    	{src:"5_3.mp3", id:"23"},
    	{src:"5_4.mp3", id:"24"},
    	{src:"5_5.mp3", id:"25"},
    ];
    //存放音乐的SM对象
    var musicsSM2 = window.musicsSM2 = [];
    //音乐信息
    var musicInfo = window.musicInfo = [
    	null,
    	{name:'中二病lite ED',nickname:'ZAQ',desc:'真的是相当萌的一首歌曲，大家一起来洗脑吧。',country:'日本'},
    	{name:'Sunshine Girl',nickname:'Moumoon',desc:'听过的看到歌名就想跑两步，还得感概下“生活真美好啊”',country:'日本'},
    	{name:'素敌だね',nickname:'RIKKI',desc:'美，但有种碎掉的惆怅',country:'日本'},
    	{name:'好想大声叫喜欢你',nickname:'BAAD',desc:"清晨抄单词洗脑抖腿神曲之一(*'▽'*)?",country:'日本'},
    	{name:'Friend',nickname:'玉置浩二',desc:'虽然我不懂歌词的含义 每次想起这简单的旋律 总觉得星星都失忆了',country:'日本'},
    	{name:'Imagine',nickname:'Declan',desc:'很美的一首歌，加上天籁童音，so beautiful~',country:'美国'},
    	{name:'Dying in the Sun',nickname:'The Cranberries',desc:'“绝美” 像想把你拖入深海里唱歌的美人鱼。',country:'美国'},
    	{name:'Everybody',nickname:'Ingrid Michaelson',desc:'很欢快节奏，有一种要跳起来的的冲动！声音很舒服。',country:'美国'},
    	{name:"You're Beautiful",nickname:'James Blunt',desc:'听音乐，每个角落都是避风港。',country:'美国'},
    	{name:'The Show',nickname:'Lenka',desc:'音乐是常听常新的，每一阶段都会有不同的感受。',country:'美国'},
    	{name:'烟花易冷',nickname:'周杰伦',desc:'烟花易冷人事易分，周董中国风的巅峰之作。',country:'中国'},
    	{name:'你曾是少年',nickname:'S.H.E',desc:'当我曾是少年，我亦有梦；如今，不忘初心。',country:'中国'},
    	{name:'天后',nickname:'陈势安',desc:'有人心疼才显得多么出众，你也是别人眼中的天后！',country:'中国'},
    	{name:'模特',nickname:'李荣浩',desc:'慵懒忧郁低沉的声线，久了会有对味的感觉。',country:'中国'},
    	{name:'匆匆那年',nickname:'王菲',desc:'有王菲的时光才是最好的青春记忆。',country:'中国'},
    	{name:'I Arxi Kai To Terma',nickname:'Giorgos Xristou',desc:'希腊天王Giorgos Xristou超赞新单',country:'希腊'},
    	{name:'Erev Shel Shoshanim',nickname:'Nana Mouskouri',desc:'Nana，一个永恒的歌者，希腊最美丽的声音',country:'希腊'},
    	{name:'Thalasses',nickname:'Various Artists',desc:'雅典古乐器的完美组合，独具特色。',country:'希腊'},
    	{name:'TO TANGO TIS NEFELIS',nickname:'Haris Alexiou',desc:'迷醉其中，当歌曲停止，被拉回现实的感觉糟透了。',country:'希腊'},
    	{name:'With an Orchid',nickname:'Yanni',desc:'最开始，以为是中国制作的曲调，原来不是。每每听便有一种不可名状的感动。',country:'希腊'},
    	{name:'Libertango',nickname:'Yo-Yo Ma',desc:'近乎极致的演绎，在现实的冷静和激情的热烈中一次危险而魅惑的试探。',country:'阿根廷'},
    	{name:'Mi vestido azul',nickname:'Floricienta',desc:'这首西语歌完全颠覆了我以为的阿根廷清一色探戈风',country:'阿根廷'},
    	{name:"I Don't Want To Say Goodbye",nickname:'Teddy Thompson',desc:'每个人心里都有一座断背山,唯有音乐与爱不可辜负',country:'阿根廷'},
    	{name:'Irreal',nickname:'Deborah de corral',desc:'不同的国度 不同的曲风 不同的心情 产生不同的感受',country:'阿根廷'},
    	{name:'Porque Te Vas',nickname:'Jeanette',desc:'惊艳了我数年一直以为是法语歌。',country:'阿根廷'},
    ];
	for(var i=1;i<26;i++){
		var temp = parseInt((i-1)/5) +1;
		musicInfo[i].pic = config.baseCDNUrl + 'images/'+temp+'_'+((i%5)==0?5:(i%5))+'.jpg';
	}
	
}());
