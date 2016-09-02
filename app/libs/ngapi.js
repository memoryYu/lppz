
define(["MHJ",('__proto__' in {} ? 'zepto':'jquery')],function(MHJ,$){

//var API_BASE = "http://mkt.wx.lppz.com/letui/api/jsapi";

var API_BASE = "http://lppz.letwx.com/api/jsapi";

var ngapi = window.ngapi = function(action,params,appid,callback,apiopenid,apitoken,debug) {
		if(!action) {
			alert("action不能为空");
			return false;
		}
		
		if(!appid) {
			alert("appid不能为空");
			return false;
		}
		
		this.httpid = this.httpid || 0;
		this.httpid ++;
		
		var postdata = {};
		postdata.action = action;
		postdata.params = (typeof params == "string" ? params:(JSON.stringify(params) || ""));
		postdata.gameid = appid;
		postdata.apiopenid = apiopenid || "testopenid";
		postdata.apitoken = apitoken || "testopenid";
		if(debug) {
			postdata.debug = debug;
		}
		
		if(API_BASE.indexOf(window.location.host) < 0) { //接口地址和当前地址不在一个域，则以跨域的方式调用
			var cbkey = 'httpcb'+this.httpid;
			ngapi[cbkey] = function(data) {
				//alert('aa-----'+JSON.stringify(data));
				callback && callback(data);
				delete ngapi[cbkey]; //消除对象
				$("#"+cbkey).remove(); //消除无用的script
			};
			
			postdata.callback = "ngapi."+cbkey;
			
			var query = [];
			for(var p in postdata) {
				if(postdata.hasOwnProperty(p)) {
					if(typeof postdata[p] == "object") {
						query.push(p+"="+encodeURIComponent(JSON.stringify(postdata[p])));
					}
					else query.push(p+"="+encodeURIComponent(postdata[p]));
				}
			}
			
			var url = API_BASE+"?"+query.join("&");
			var script = document.createElement('script');
			script.src = url;
			script.id = cbkey; //直接append会导致script无法触发
			$("head").append(script);
		}
		else {
			MHJ.post(API_BASE,postdata,callback);
		}
}
	
return ngapi;

});