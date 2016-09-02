var config = (function() {
	var arr = window.location.hostname.split('.')[0];
	var isDebug = (arr == '192') || (arr == '127') || (arr == 'localhost') || (arr == '');
	var baseUrl = isDebug ? '' :'http://aoyun.wx.lppz.com/app/olympics-build/';
	var htmlUrl = isDebug ? '' :'http://aoyun.wx.lppz.com/app/olympics-build/';
	var cdnUrl = isDebug ? '' :'http://lppzcdn.letwx.com/app/olympics-build/';
//	cdnUrl = baseUrl; //*****************
	return {
		gameid: 'aoyun',
		touch: 'touchend',
		click: 'click',
		isDebug: isDebug,
		htmlUrl: isDebug ? '' : htmlUrl,
		baseUrl: isDebug ? '' : baseUrl,
		baseCDNUrl: isDebug ? '' : cdnUrl,
		configUrl: (isDebug ? '' : baseUrl) + '../libs/require.config.js',
		scope:'snsapi_userinfo',
		shareInfo : {
			title:'什么？这样秀恩爱竟然是……为了国家？',
			desc:'为奥运助味，为国家助威！',
			link: htmlUrl+'index.html',
			imgUrl: htmlUrl + 'images/fximg.jpg'
		}
	}
}());

//用于检测联通2G/3G环境下的广告条
//只重复一次，避免刷不出来式，始终停留
window.onload = function(){
	var checkLT = setTimeout(function(){
		if(document.getElementById('divShow')){
			window.location.reload();
			return;
		}
	},300);
}
function check(oAuth,cb){
	var gameid = config.gameid;
	oAuth.cfg(gameid,config.isDebug,config.scope);
	oAuth.checkToken(function(apiopenid, apitoken) {
		config.apiopenid = apiopenid;
		config.apitoken = apitoken;
		cb && cb(gameid, apiopenid, apitoken);
	}, function() {
		//alert('checktoken错误！');			
	});
}
function gotoUrl(url){
	setTimeout(function(){
		window.location.href = url;
	},200);
}
function __uri(str){
	return (config.baseCDNUrl + 'olympics-build/' + str);
}