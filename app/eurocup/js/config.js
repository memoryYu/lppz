var config = (function() {
	var arr = window.location.hostname.split('.')[0];
	var isDebug = (arr == '192') || (arr == '127') || (arr == 'localhost') || (arr == '');
	var baseUrl = isDebug ? '' :'http://lppz.letwx.com/app/eurocup-build/';
	var htmlUrl = isDebug ? '' :'http://lppz.letwx.com/app/eurocup-build/';
	var cdnUrl = isDebug ? '' :'http://lppzcdn.letwx.com/app/eurocup-build/';
//	cdnUrl = baseUrl; //*****************
	return {
		gameid: 'europ',
		touch: 'touchend',
		click: 'click',
		isDebug: isDebug,
		htmlUrl: isDebug ? '' : htmlUrl,
		baseUrl: isDebug ? '' : baseUrl,
		baseCDNUrl: isDebug ? '' : cdnUrl,
		configUrl: (isDebug ? '' : baseUrl) + '../libs/require.config.js',
		scope:'snsapi_userinfo',
		shareInfo : {
			title:'累计猜对8场球，平分10万元',
			desc:'快来和我一起参加良品铺子欧洲杯火热大竞猜吧！',
			link: htmlUrl+'index.html',
			imgUrl: cdnUrl + 'images/share.jpg'
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
//	return (config.baseCDNUrl + '../eurocup/js/' + str);
	return (config.baseCDNUrl + 'eurocup-build/' + str);
}