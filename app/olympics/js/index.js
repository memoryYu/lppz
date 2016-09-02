(function() {
	require([config.configUrl], function() {
		var reqArr = ['auth', 'MHJ', 'loading', 'ngapi', 'imgpreload', 'jquery', 'wxshare', __uri('../js/html2canvas.js')];
		require(reqArr, requireCb);
	});

	function requireCb(oAuth, MHJ, M, ngapi, imgpreload, $, wxshare) {
		var indexPage = {}; //首页对象
		var postPage = {}; //海报页
		//首页
		indexPage.act = {
			$dom: $('#indexPage'), //indexPage的dom
			init: function() {
				var me = this;
				imgpreload.load(imgs, function() {
					$('#main').show();
					share(config.shareInfo);
					me.$dom.show();
					me.checkTouch();
					var value = [
						{
							name:'钢铁侠',
							like:'葛优躺',
							where:'沙发上'
						},
						{
							name:'密子君',
							like:'吃小龙虾',
							where:'斗鱼直播'
						},
						{
							name:'林心如',
							like:'霍建华',
							where:'巴厘岛'
						},
						{
							name:'小明',
							like:'芒果干',
							where:'武汉'
						}
					];
					var num = random(0,4);
					$('#name').attr('placeholder',value[num].name);
					$('#like').attr('placeholder',value[num].like);
					$('#where').attr('placeholder',value[num].where);
					M.loadingHide();
				});
			},
			checkTouch: function() {
				var me = this;
				//生成海报
				$('#create').on(config.click, function() {
					M.loading(1, 2);
					$('#yellow').show();
					var who = $('#name').val() ? $('#name').val() : $('#name').attr('placeholder');
					var like = $('#like').val() ? $('#like').val() : $('#like').attr('placeholder');
					var where = $('#where').val() ? $('#where').val() : $('#where').attr('placeholder');
					var params = {
						am: who,
						love: like,
						adr: where
					};
					indexPage.data.savelog(params);
				});
			},
			checkTouch2 : function(){
				var me = this;
				$('#back').off();
				$('#back').on(config.click,function(){
					M.loading(1,2);
//					document.getElementById('imgBox').removeChild(document.getElementById('canvasImage'));
					$('#tipPage').hide();
					$('body').css('background','#f4f554');
					indexPage.act.init();
				});
			},
			savelogCb: function(data) {
				var me = this;
				$('#postPage').html(MHJ.tmpl($('#postTMP').text(), data));
				$('#postPage').show();
				me.out();
				var postPage = document.getElementById('postPage');
				var width = postPage.clientWidth;
				if(width>320){
					$('.zt').css('left','32%');
				}
				if(width>=414){
					$('.zt').css('left','40%');
				}
				html2canvas(postPage, {
					onrendered: function(canvas) {
						$('#main').hide();
						$('#postPage').hide();
						save(canvas);
					},
				});
			},
			uploadimgCb : function(data){
				var me = this;
				$('#canvasImage').attr('src',data.imgurl);
				$('#tipPage').show();
				$('body').css('background','#fff');
				indexPage.act.checkTouch2();
				$('#yellow').hide();
				M.loadingHide();
			},
			out: function() {
				$('#create').off();
				this.$dom.hide();
			},
		};

		indexPage.data = {
			savelog: function(params) {
				post('aoyun/savelog', params, function(data) {
					indexPage.act.savelogCb(data);
				});
			},
			uploadimg: function(params) {
//				post('aoyun/uploadimg', params, function(data) {
//					indexPage.act.uploadimgCb(data);
//				});
				$.ajax({
					type:'POST',
					url:'http://aoyun.wx.lppz.com/api/jsapi?',
					data:{
						action:'aoyun/uploadimg',
						apiopenid:config.apiopenid,
						apitoken:config.apitoken,
						params:params
					},
					success:function(data){
						console.log(JSON.stringify(data))
						indexPage.act.uploadimgCb(data);
					},
					dataType:'json'
				});
			},
		};
		
		function save(canvas){
			var canvasImage = canvas.toDataURL("image/jpeg",0.9);
			var params = {
				imgdata:  encodeURIComponent(canvasImage)
			};
			console.log(params.imgdata);
			indexPage.data.uploadimg(JSON.stringify(params));
		}
		
		function defaultError(data) {
			var err = data.error - 0;
			M.loadingHide();
			$('section').hide();
			$('#errorPage').show();
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
		
		M.loading(1, 2);
		check(oAuth, function() {
			indexPage.act.init();
		});
	}

	var imgs = [
		__uri('../images/biaoti.png'),
		__uri('../images/btn.png'),
		__uri('../images/jy.png'),
		__uri('../images/logo.png'),
		__uri('../images/ly2016.png'),
		__uri('../images/p1.png'),
		__uri('../images/p2.png'),
		__uri('../images/p3.png'),
		__uri('../images/qrcode.png'),
		__uri('../images/txt.png'),
		__uri('../images/zhitiao.png'),
	];

}());