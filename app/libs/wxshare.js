(function(global,factory){
	if(typeof define === 'function' && define.amd){
		define(['wx','auth', 'ngapi'],function(wx, oAuth, ngapi){
			return factory(wx, oAuth, ngapi, global);
		});
	}else if(typeof module !== 'undefined' && module.exports){
		module.exports = factory(require('wx'), require('oAuth'), require('ngapi'),global);
	}else{
		global.ngapi = factory(global.wx,global.oAuth,global.ngapi,global);
	}
}(typeof window !== 'undefined' ? window : this,function(wx, oAuth, ngapi, window){
	/**
	 * 用于微信分享
	 */
	var wxshare = window.wxshare = {
		times: 0,
		wxconfig: null,
		/**
		 * 以api的形式请求服务器有关微信JSSDK的相关信息，
		 * @param {Object} share	用于分享的信息 ：{title:'title',desc:'desc',link:'link',imgUrl:'imgUrl'},分享到朋友圈分享的是desc
		 * @param {Object} letwxid	
		 * @param {Object} apiopenid	
		 * @param {Object} apitoken
		 * @param {Object} succCb     分享成功的回调
		 * @param {Object} cancelCb   取消分享的回调
		 * @param {errorCb} errorCb	     出现错误的回调
		 */
		initWx : function(share, letwxid, apiopenid, apitoken, succCb, cancelCb, errorCb, readyCb){
			var me = this;
			if(me.times == 0){
				ngapi('jscfg', {
					url: window.location.href
				}, letwxid, function(data) {
					var error = parseInt(data.error);
					if (error == 0) {
						me.times++;
						me.wxconfig = data.cfg;
						me.initWxCfg(share, me.wxconfig,letwxid,apiopenid, apitoken, succCb, cancelCb, errorCb, readyCb);
					} else {
						alert(data.error_msg);
					}
				}, apiopenid, apitoken);
			}else{
				me.initWxCfg(share, me.wxconfig,letwxid,apiopenid, apitoken, succCb, cancelCb, errorCb, readyCb);
			}
		},
		/**
		 * 在initWx的基础上加上了oAuth的验证
		 * @param {Object} share    用于分享的信息 ：{title:'title',desc:'desc',link:'link',imgUrl:'imgUrl'},分享到朋友圈分享的是desc
		 * @param {Object} letwxid
		 * @param {Object} succCb	分享成功的回调
		 * @param {Object} cancelCb	取消分享的回调
		 */
		initWxAuth : function(share,letwxid,succCb,cancelCb, errorCb,readyCb){
			var me = this;
			oAuth.cfg(letwxid, false);
			oAuth.checkToken(function(apiopenid, apitoken) {
				me.initWx(share, letwxid, apiopenid, apitoken, succCb, cancelCb, errorCb,readyCb);
			}, function() {
//				alert('checktoken错误！');
			});
		},
		
		initWxCfg : function(share, wxconfig, letwxid,apiopenid, apitoken, succCb, cancelCb, errorCb, readyCb){
			var me = this;
			wx.config({
				appId: wxconfig.appId,
				timestamp: wxconfig.timestamp,
				nonceStr: wxconfig.nonceStr,
				signature: wxconfig.signature,
				jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo','hideOptionMenu','showOptionMenu']
			});
			wx.ready(function() {
				readyCb && readyCb(wx);
				wx.onMenuShareAppMessage({ //朋友
					title: share.title,
					desc: share.desc,
					link: share.link,
					imgUrl: share.imgUrl,
					success: function() {
						me.statics('sharefriend',letwxid, apiopenid, apitoken);
						succCb && succCb();
					},
					cancel: function() {
						cancelCb && cancelCb();
					}
				});
				wx.onMenuShareTimeline({ //朋友圈
					title: share.title,
					link: share.link,
					imgUrl: share.imgUrl,
					success: function() {
						me.statics('sharetimeline',letwxid, apiopenid, apitoken);
						succCb && succCb();
					},
					cancel: function() {
						cancelCb && cancelCb();
					}
				});
				wx.onMenuShareQQ({ //QQ
					title: share.title,
					desc: share.desc,
					link: share.link,
					imgUrl: share.imgUrl,
					success: function() {
						me.statics('QQ',letwxid, apiopenid, apitoken);
						succCb && succCb();
					},
					cancel: function() {
						cancelCb && cancelCb();
					}
				});
				wx.onMenuShareWeibo({ //QQ
					title: share.title,
					desc: share.desc,
					link: share.link,
					imgUrl: share.imgUrl,
					success: function() {
						me.statics('tencentWeibo',letwxid, apiopenid, apitoken);
						succCb && succCb();
					},
					cancel: function() {
						cancelCb && cancelCb();
					}
				});
			});
			wx.error(function(res) {
//				alert(JSON.stringify(res));
				errorCb && errorCb(JSON.stringify(res))
			});
		},
		statics : function(to, letwxid ,apiopenid, apitoken){
			var me = this;
			ngapi('statics',{channel:letwxid,evtkey:me.getPageName() + '--'+to},letwxid,null,apiopenid, apitoken);
		},

		getPageName : function(){
			var url = window.location.href,
				length = url.length,
				index = url.lastIndexOf('/'),
				subName = url.substr(index+1),
				indexP = subName.indexOf('.')!=-1 ? subName.indexOf('.') : subName.indexOf('?'),
				name = subName.substr(0,indexP);
			return name;
		}

	};

	return wxshare;
}));

