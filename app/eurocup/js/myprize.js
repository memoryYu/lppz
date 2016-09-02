(function(){
	require([config.configUrl],function(){
		var reqArr = ['auth','MHJ','loading','ngapi','imgpreload','jquery',__uri('../js/wxshare.js')];
		require(reqArr,requireCb);
	});
	
	function requireCb(oAuth,MHJ,M,ngapi,imgpreload,$,wxshare){
		var prizePage = {}; //奖品页面对象
		var id;//奖品id
		var geturl;//领券跳转链接
		//奖品页面对象
		prizePage.act = {
			$dom : $('#prizePage'), //prizePage的dom
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
					prizePage.data.mycoupon();
				});
			},
			checkTouch : function(votenum){
				var me = this;
				//领取实物奖品
				$('.get').on(config.touch,function(e){
					e.preventDefault();
					$('#degree').text($(this).data('money'));
					$('#qname').text($(this).data('qname'));
					id = $(this).data('id');
					$('#infoPage').show();
				});
				$('.use').on(config.click,function(e){
					e.preventDefault();
					M.loading();
					geturl = $(this).data('geturl');
					var isyouzan = $(this).data('isyouzan');
					if(!isyouzan){//不是有赞券，先做标记，再跳转
						var params = {
							id : $(this).data('id'),
						};
						prizePage.data.isget(params);
					}else{//是有赞券，直接跳转，不做标记
						gotoUrl(geturl);
					}
				});	
				$('#gshy').on(config.touch,function(e){
					e.preventDefault();
					$('#sharePage').show();
				});	
				$('#sharePage').on(config.touch,function(e){
					e.preventDefault();
					$('#sharePage').hide();
				});	
				$('#fhsy').on(config.touch,function(e){
					e.preventDefault();
					gotoUrl('index.html');
				});	
				$('#qx').on(config.touch,function(e){
					e.preventDefault();
					$('#infoPage').hide();
				});
				$('#qrtj').on(config.touch,function(e){
					e.preventDefault();
					var name = $('#name').val();
					var tel = $('#tel').val();
					var idcard = $('#idcard').val();
					var address = $('#address').val();
					if(!name){
						alert('请输入您的姓名');
					}else if(!tel){
						alert('请输入您的联系电话');
					}else if(!idcard){
						alert('请输入您的身份证号');
					}else if(!address){
						alert('请输入您的地址');
					}else if(!(/^1[3|4|5|7|8]\d{9}$/.test(tel))){
						alert('请输入正确的联系电话');
					}else if(!(/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(idcard))){
						alert('请输入正确的身份证号');
					}else{
						M.loading();
						var params = {
							id : id,
							name : name,
							mobile : tel,
							idcard : idcard,
							address : address
						};
						prizePage.data.fillinfo(params);
					}
				});
			},
			mycouponCb : function(data){
				var me = this;
				$('#prizePage').html(MHJ.tmpl($('#prizeTMP').text(), data.list));
				me.$dom.show();
				me.checkTouch();
				M.loadingHide();
			},
			fillinfoCb : function(data){
				M.loadingHide();
				var me = this;
				alert('提交成功')
				window.location.reload();
			},
			isgetCb : function(data){
				M.loadingHide();
				gotoUrl(geturl);
			},
			out : function(){
				$('#wzdl').off();
				$('#rule').off();
				$('#ruleClose').off();
				$('.bet').off();
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
		
		prizePage.data = {
			mycoupon : function(){
				post('europ/mycoupon',null,function(data){
					prizePage.act.mycouponCb(data);
				});
			},
			fillinfo : function(params){
				post('europ/fillinfo',params,function(data){
					prizePage.act.fillinfoCb(data);
				});
			},
			isget : function(params){
				post('europ/isget',params,function(data){
					prizePage.act.isgetCb(data);
				});
			},
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
			prizePage.act.init();
		});	
	}
	
    var imgs = [
    	__uri('../images/bg.jpg'),
    	__uri('../images/btn_15.png'),
    	__uri('../images/btn_16.png'),
    	__uri('../images/btn_17.png'),
    	__uri('../images/fenxiang_1.png'),
    	__uri('../images/jiangpin.png'),
    	__uri('../images/qiu.png'),
    	__uri('../images/quan_1.png'),
    	__uri('../images/quan_2.png'),
    	__uri('../images/error.jpg'),
    	'http://lppz.letwx.com/app/eurocup-build/images/share.jpg',
    	'http://lppzcdn.letwx.com/app/eurocup-build/images/share.jpg',
	];
	
}());
