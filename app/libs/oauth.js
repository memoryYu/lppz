/**
 * Created by GH on 2015/8/26.
 */
(function(global,factory){
    if(typeof define === 'function' && define.amd){ //AMD
        define(function(){
            return factory(global);
        });
    }else if(typeof module !== 'undefined' && module.exports){ //cmd
        module.exports = factory(global);
    }else {
        global.oAuth = factory(global);
    }
}(typeof window !== 'undefined' ? window : this,function(window){
    var PROJECT_NAME = window.PROJECT_NAME = 'lppz'; //项目名称
    var BASEURL = 'http://lppz.letwx.com/';
    var KEY_API_TOKEN = window.KEY_API_TOKEN = PROJECT_NAME + 'apitoken';
    var KEY_API_OPENID = window.KEY_API_OPENID = PROJECT_NAME + 'authid';
    var KEY_SERVER_REDIRECT = "m_redirect";
    var OAUTH_URL = window.OAUTH_URL;
    var KEY_CHECK_TIMES = "CHECK_TOKEN_";
    var MAX_CHECK_TIMES = 10;
    var checktimes;

    var oAuth = {
        cfg:function(gameid,isdebug,scope){
            var date = new Date();
            var scope = scope || 'snsapi_base';//snsapi_base,snsapi_userinfo
            KEY_API_TOKEN += '_' + gameid + '_' + [date.getYear(),date.getMonth(),date.getDate()].join('');
            KEY_API_OPENID += '_' + gameid + '_' + [date.getYear(),date.getMonth(),date.getDate()].join('');

            if(isdebug){
                OAUTH_URL = window.OAUTH_URL = BASEURL + 'oauth/' + PROJECT_NAME + 'test?scope=' + scope + '&gameid=' + gameid + '&redirect=';
            }else{
                OAUTH_URL = window.OAUTH_URL = BASEURL + 'oauth/' + PROJECT_NAME + '?scope=' + scope + '&gameid=' + gameid + '&redirect=';
            }

            KEY_CHECK_TIMES += gameid;
            checktimes = localStorage[KEY_CHECK_TIMES] || 0;
        },
        checkToken:function(cb,errcb){
            var oAuthURLTMP = OAUTH_URL + encodeURIComponent(window.location.href);
            //console.log(oAuthURLTMP);
            var obj = this.getUrlParam();
            var apitoken,
                apiopenid,
                redirect = window.location.href.split('&apiopenid')[0];
            redirect = redirect.split('&apitoken')[0];//去掉参数中的openid,token后面的部分
            if(!obj.from){ //在无from的情况下，才会认为当前url中的apitoken和apiopenid有效
                apitoken = obj.apitoken;
                apiopenid = obj.apiopenid;
            }else{
                redirect = redirect.split("&from")[0];
                redirect = redirect.split("?from")[0];
                oAuthURLTMP = OAUTH_URL + encodeURIComponent(redirect);
            }

            if(!apitoken || !apiopenid){
                if(!this.getCookie(KEY_API_TOKEN) || !this.getCookie(KEY_API_OPENID)){
                    this.setCookie(KEY_SERVER_REDIRECT,encodeURIComponent(redirect));
                    checktimes++;
                    localStorage[KEY_CHECK_TIMES] = checktimes;

                    if(checktimes < MAX_CHECK_TIMES){
                        setTimeout(function(){
                            window.location.href = oAuthURLTMP;
                        },200);
                    }else{
                        delete localStorage[KEY_CHECK_TIMES];
                        errcb && errcb();
                    }
                }else{
                    cb && cb(this.getCookie(KEY_API_OPENID),this.getCookie(KEY_API_TOKEN));
                }
            } else {
                this.setCookie(KEY_API_TOKEN, apitoken);
                this.setCookie(KEY_API_OPENID, apiopenid);
                cb && cb(apiopenid,apitoken);
            }
        },
        getAuthId:function() {
            return MHJ.getCookie(KEY_API_OPENID);
        },

        getAuthToken:function() {
            return MHJ.getCookie(KEY_API_TOKEN);
        },

        clear:function() {
            MHJ.delCookie(KEY_API_TOKEN);
            MHJ.delCookie(KEY_API_OPENID);
        },
        getUrlParam:function(url) {
            var str = url;
            var jinghao = 0; //存放'#'的位置
            var jinghaoyu = null; //存放'#'后面第一个'&'的位置
            if (!str) str = window.location.href;
            while(str.indexOf('#') > -1){ //以防url中出现多个'#'
                jinghao = str.indexOf('#',jinghao + 1);
                var jinghaostr = str.substr(jinghao);
                if(jinghaostr.indexOf('&') > -1){
                    jinghaoyu = jinghaostr.indexOf('&');
                }else{
                    jinghaoyu = jinghaostr.length;
                }
                str = str.replace(str.substr(jinghao,jinghaoyu),'');
            }
            var obj = new Object();
            if (str.indexOf('?') > -1) {
                var string = str.substr(str.indexOf('?') + 1);
                var strs = string.split('&');
                for (var i = 0; i < strs.length; i++) {
                    var tempArr = strs[i].split('=');
                    obj[tempArr[0]] = tempArr[1];
                }
            }
            return obj;
        },
        setCookie:function(name, value, expire_days) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + expire_days);
            document.cookie = name + '=' + escape(value) + ((expire_days == null) ? '' : ';expires=' + exdate.toGMTString());
        },
        getCookie:function(name) {
            var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
            if (arr = document.cookie.match(reg))
                return (arr[2]);
            else
                return null;
        },
        delCookie:function(name) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = this.getCookie(name);
            if (cval != null)
                document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString();
        }
    };
    return oAuth;
}));

