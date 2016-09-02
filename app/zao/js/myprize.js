/**
 * Created by GH on 2015/11/12.
 */
(function(){
    require([config.configUrl],function(){
        require(['auth','loading','MHJ','ngapi','wxshare','swiper','barcode'],requireCb);
    });

    function requireCb(oAuth,M,MHJ,ngapi,wxshare,swiper,barcode){
        var $ = require('jquery');
        var myPrizePage = {
            act:{
                $dom:$('#myprizePage'),
                isfollow:0, // 是否关注，0-未关注，1-已关注
                init:function(){
                    share(config.shareInfo);
                    M.loading(2,2);
                    myPrizePage.data.mycoupon(this.mycouponCb.bind(this));
                },
                mycouponCb:function(data){
                    this.isfollow = data.isfollow;
                    M.loadingHide();
                    console.log(12);
                    $('#prizeList').html(MHJ.tmpl($('#prizeListTMP').text(),data));

                    $('#prizeList>li .code .codeInner').each(function(){
                        $(this).barcode($(this).data('code'),'code128',{
                            barWidth: 1,
                            barHeight: 50,
                            output: 'bmp',
                            showHRI:true
                        });
                    });
                    this.checkTouch();
                    this.$dom.show();
                    $('.swiper-container').height($(window).height()-190);
                    this.mySwiper = new Swiper('.swiper-container',{
                        mode : 'vertical',
                        scrollContainer: true
                    })

                },
                checkTouch:function(){
                    var me = this;
                    $('#prizeList>li .coupon').on('click',function(){
                        if(me.isfollow==0){
                            $('#guanzhu').show();
                            return;
                        }
                        var $code = $(this).next().find('.codeInner');
                        if($code.data('isuse')==0){ //没有使用
                            $code.barcode($code.data('code'),'code128',{
                                barWidth: 1,
                                barHeight: 50,
                                output: 'bmp',
                            });
                            $(this).next().toggle();
                            me.mySwiper.reInit();
                        }
                    });
                    $('#goIndexBtn').on(config.touch,function(){
                       gotoUrl('index2.html');
                    });
                }
            },
            data:{
                mycoupon:function(cb){
                    post('hzjgame/mycoupon',null,cb)
                }
            }

        };

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
        function share(shareInfo,succCb){
            wxshare.initWx(shareInfo,config.gameid,config.apiopenid,config.apitoken,succCb,null,null,null);
        }
        check(oAuth,function(){
            myPrizePage.act.init();
        });

    }
})();
