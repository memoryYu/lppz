(function() {
	require([config.configUrl], function() {
		var reqArr = ['auth', 'MHJ', 'loading', 'ngapi', 'imgpreload', 'zepto', 'wxshare'];
		require(reqArr, requireCb);
	});

	function requireCb(oAuth, MHJ, M, ngapi, imgpreload, $, wxshare) {
			check(oAuth, checkCb); //用户身份验证
			function checkCb(gameid, apiopenid, apitoken) {
				M.loading(1, 2);
				imgpreload.load(imgs, imgloadCb);
			}
			function imgloadCb() {
				gamePage.act.init(); //初始化gamePage
			}
			var gamePage = {} //游戏首页对象
			var playingPage = {} //游戏进行时对象
			var headimgurl; //此变量用于保存用户头像
			var successPop = {} //游戏成功对象
			var failPop = {} //游戏失败对象
			var $chance = 0;
			var $isshare = 0;
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
					config.shareInfo.title = "我正在玩火山大逃亡，一起挑战吧！"; //初始化分享链接标题
					config.shareInfo.desc = "火山大逃亡，你敢来挑战吗？小心地雷哦~"; //初始化分享链接中的描述内容
					gamePage.data.getGameChance(); //发送请求，获得gameChance
					$('#main').show();
					this.$dom.show();
					M.loadingHide();
					this.checkTouch();
					$('#gameBox').html(MHJ.tmpl($('#ulTMP').text(), {}));
				},
				checkTouch: function() {
					var me = this;
					this.$rankBtn.on(config.touch, function() { //排行榜页面的接口，未完成
						me.out();
						playingPage.act.init();

					});
					this.$explainBtn.on(config.touch, function() { //显示游戏说明弹出框
						me.$gameExpPop.show();
					});
					this.$closeExpBtn.on(config.touch, function() { //隐藏游戏说明弹出框
						me.$gameExpPop.hide();
					});
				},
				out: function() {
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
							headimgurl = data.headimgurl; //用户头像
							this.$num.html(chance);
							$chance = chance; //给全局变量赋值
							$isshare = isshare; //给全局变量赋值
							share(config.shareInfo);
							if (chance == 0) { //剩余游戏机会为0
								if (isshare == 0) { //还未分享
									this.$startBtn.on(config.touch, function() {
										alert("亲，没有游戏机会咯~分享可获得一次机会哟~");
									});
								} else { //已分享
									this.$startBtn.on(config.touch, function() {
										alert("亲，没有游戏机会咯~明天再来吧~");
									});
								}
							} else { //还有游戏机会
								this.$startBtn.on(config.touch, function() { //跳到玩游戏界面
									playingPage.act.init();
									me.out();
								});
							}
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
				mineNum: 0, //地雷的数量
				step: 0, //统计步数的变量
				timerc: 180, //倒计时时间，以秒为单位
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
					this.timerc = 180;
					this.useTime = 0;
					this.barWidth = 322;
					this.$min.html("03");
					this.$sec.html("00");
					$('#tip').html("点击空白格子，逃离火山口，注意地雷哟~");
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
						$('#here').removeClass("hide");
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
							if (x == 0 && y == 5) {
								me.out();
								successPop.act.init();
							} else if (x == 1 && y == 6) {
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
				addActive: function(index, onePlus, oneNeg, sevenPlus, sevenNeg){
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
						//					yaoPage.act.init();
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
					successPop.data.updateScore();
					this.$dom.show();
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
					this.$checkRank.on(config.touch, function() {
						me.out();
						//rankPage.act.init();
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
					var err = data.error;
					var me = this;
					switch (err) {
						case 0:
							var chance = data.chance; //今天剩余玩游戏的次数
							var isshare = data.isshare; //今天是否分享过，0-为未分享，1-已分享
							$chance = chance; //给全局变量赋值
							$isshare = isshare; //给全局变量赋值
							config.shareInfo.title = "我花了" + playingPage.act.step + "步安全逃离火山，你敢挑战吗？";
							config.shareInfo.desc = "避开地雷，逃亡火山，有谁比我更机智？";
							share(config.shareInfo);
							if (chance == 0) { //剩余游戏机会为0
								if (isshare == 0) { //还未分享
									this.$playAgain.on(config.touch, function() {
										alert("亲，没有游戏机会咯~分享可获得一次机会哟~");
									});
								} else { //已分享
									this.$playAgain.on(config.touch, function() {
										alert("亲，没有游戏机会咯~明天再来吧~");
									});
								}
							} else { //还有游戏机会
								this.$playAgain.on(config.touch, function() { //跳到玩游戏界面
									gamePage.act.init();
									me.out();
								});
							}
							break;
						default:
							defaultError(data);
					}
				},
			}
			successPop.data = { //上传成绩
				updateScore: function() {
					var $step = parseInt(playingPage.act.step);
					var $usetime = parseInt(playingPage.act.useTime);
					ngapi('hsd/updatescore', {
						step: $step, //使用步数
						usetime: $usetime //使用时间，以秒为单位
					}, config.gameid, function(data) {
						alert("data: " + JSON.stringify(data));
						successPop.act.updatescoreCb(data);
					}, config.apiopenid, config.apitoken);
				},
			}
			//分享
			function share(shareInfo) {
				wxshare.initWx(shareInfo, config.gameid, config.apiopenid, config.apitoken, function() { //微信分享成功回调
					if ($chance == 0) { //没有机会
						if ($isshare == 0) { //没分享，分享获得一次机会
							ngapi('hsd/record', {
								type: 0 //记录分享
							}, gameid, function(data) {
								var err = data.error;
//								alert(err);
								switch (err) {
									case 0:
										alert("恭喜你，获得一次额外的机会！");
										break;
									default:
										defaultError(data);
								}
							}, apiopenid, apitoken);
						}
					}
				}, null, null, null);
			}
		}
		//产生随机数 例如，生成0-9的随机数(包括0,不包括9) random(0,9)

	function random(min, max) {
			return Math.floor(min + Math.random() * (max - min));
		}
		//error:1002

	function defaultError(data) {
		var err = data.error;
		switch (err) {
			case 1002:
				alert('你的身份信息已过期，点击确定刷新页面');
				oAuth.clear();
				window.location.reload();
				break;
			default:
				alert(data.error_msg);
		}
	}
	var imgs = [
		config.baseCDNUrl + 'images/bg4.jpg',
		config.baseCDNUrl + 'images/logo1.png',
		config.baseCDNUrl + 'images/huoshan.png',
		config.baseCDNUrl + 'images/bg5.jpg',
		config.baseCDNUrl + 'images/gz.jpg',
		config.baseCDNUrl + 'images/anniu-3.png',
		config.baseCDNUrl + 'images/pic.jpg',
		config.baseCDNUrl + 'images/shan.png',
		config.baseCDNUrl + 'images/time.png',
		config.baseCDNUrl + 'images/zhasile.png',
		config.baseCDNUrl + 'images/zhiyin.png',
		config.baseCDNUrl + 'images/shibai.png',
		config.baseCDNUrl + 'images/shengli.png',
		config.baseCDNUrl + 'images/anniu1.png',
		config.baseCDNUrl + 'images/btn.png',
		config.baseCDNUrl + 'images/anniu-2.png',
		config.baseCDNUrl + 'images/bg6.jpg',
		config.baseCDNUrl + 'images/timett.png',
		config.baseCDNUrl + 'images/huoshankou.jpg',
		config.baseCDNUrl + 'images/zhujue.png',
		config.baseCDNUrl + 'images/chukou.jpg',
	];
	//创建二维数组
	var bangArr = new Array(); //先声明一维
	for (var i = 0; i < 8; i++) { //一维长度为8
		bangArr[i] = new Array(); //再声明二维
		for (var j = 0; j < 7; j++) { //二维长度为7
			bangArr[i][j] = 0; //先全部设置为无地雷
		}
	}
}());