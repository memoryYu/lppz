/**
 * Created by GH on 2015/11/7.
 */
var question = [
    {
        id:'1',
        name:'菩萨',
        className:'ques_1',
        desc:'隐隐觉得哪里不对？我佛的吉祥痣在哪里！在哪里！',
        activeDesc:'瞬间佛光普照，爱我你怕了吗？',
        x:-1,
        y:-252
    },
    {
        id:'2',
        name:'佛祖',
        className:'ques_2',
        desc:'隐隐觉得哪里不对？我佛的吉祥痣在哪里！在哪里！',
        activeDesc:'瞬间佛光普照，爱我你怕了吗？',
        x:-1,
        y:-255
    },
    {
        id:'3',
        name:'哆来a梦',
        className:'ques_3',
        desc:'等等…连鼻子都没有还想骗我！负分差评！没商量！',
        activeDesc:'等等…连鼻子都没有还想骗我！负分差评！没商量！',
        x:-37,
        y:-242
    },
    {
        id:'4',
        name:'小丑',
        className:'ques_4',
        desc:'等等…连鼻子都没有还想骗我！负分差评！没商量！',
        activeDesc:'等等…连鼻子都没有还想骗我！负分差评！没商量！',
        x:42,
        y:-239
    },
    {
        id:'5',
        name:'流川枫',
        className:'ques_5',
        desc:'哈哈，大鹏展翅闹哪样？！不觉得手上缺了个装饰品咩…',
        activeDesc:'篮球在手，风一样的男子就是在下！',
        x:45,
        y:-272
    },
    {
        id:'6',
        name:'凹凸曼',
        className:'ques_6',
        desc:'不好！没电了…谁来救我，我还要拯救世界呢！',
        activeDesc:'放着我来！你们这群无知的地球人！',
        x:0,
        y:-196
    },
    {
        id:'7',
        name:'皮卡丘',
        className:'ques_7',
        desc:'红脸蛋都没了，还敢粗来卖萌，想要变萌吗，求我呀~~',
        activeDesc:'有了红脸蛋，感觉自己萌萌哒~',
        x:-22,
        y:-241
    },
    {
        id:'8',
        name:'小丸子',
        className:'ques_8',
        desc:'红脸蛋都没了，还敢粗来卖萌，想要变萌吗，求我呀~~',
        activeDesc:'有了红脸蛋，感觉自己萌萌哒~',
        x:2,
        y:-256
    },
    {
        id:'9',
        name:'美少女战士',
        className:'ques_9',
        desc:'谁偷了我萌萌哒发卡，我要代表月亮消灭你！',
        activeDesc:'满血复活！月棱镜威力变身,爱和正义的,水兵服美少女战士来啦！',
        x:-26,
        y:-305
    },
    {
        id:'10',
        name:'天线宝宝',
        className:'ques_10',
        desc:'天线宝宝出来玩了~为什么只有我信号最差，伐开心，要抱抱~',
        activeDesc:'WIFI在手，大家还是好基友~',
        x:-48,
        y:-272
    }
];
var txt = '拖住下面的红枣到上面合适的位置吧！';

(function(){
    require([config.configUrl],function(){
        require(['auth','loading','ngapi','imgpreload','wxshare','../zao/js/touch-0.2.14.min'],requireCb);
    });

    function requireCb(oAuth,M,ngapi,imgpreload,wxshare,touch){
        var $ = require('zepto');

        var indexPage = {},
            questionPage = {},
            failPop = {},
            rulePop = {},
            resultPage = {},
            personIsOk = !1, //person图片是否加载完毕
            personIsLoading = !1; //是否到达需要加载person图片的时候图片还没加载完毕
        var share = 0;
        indexPage.act = {
            $dom:$('#indexPage'),
            chanceOver:0, //今天是否机会用完,1表示用完
            hasshare:false, //是否分享过
            init:function(){
                indexPage.data.index(this.indexCb.bind(this));
            },
            indexCb:function(data){
                M.loadingHide();
                this.$dom.show();
                this.chanceOver = data.num==0 ? 1:0;
                this.hasshare = data.hasshare;
                this.checkTouch();
            },
            checkTouch:function(){
                var me = this;
                //开始
                $('#indexStart').on(config.touch,function(){
                    if(me.hasshare){
                        if(me.chanceOver==1){
                            alert('你今天的游戏机会已经用完了，明天再来吧！');
                        }else{
                            me.out();
                            questionPage.act.init();
                        }
                    }else{
                        if(me.chanceOver==1){
                            share = 1;
                            alert('你今天的游戏机会已经用完了,告诉你的小伙伴可以多获得一次游戏机会哟！');
                        }else{
                            me.out();
                            questionPage.act.init();
                        }
                    }

                });
                //我的奖品
                $('#indexMyprize').on(config.touch,function(){
                    gotoUrl('myprize.html');
                });
                //规则
                $('#indexRule').on(config.touch,function(){
                    $('#rulePop').show();
                });
                //游戏规则关闭
                $('#rulePop .failClose').on(config.touch,function(){
                    $('#rulePop').hide();
                });
            },
            out:function(){
                $('#indexStart').off();
                $('#indexMyprize').off();
                $('#indexRule').off();
                $('#rulePop .failClose').off();
                this.$dom.hide();
            }

        };
        indexPage.data = {
            index:function(cb){
                post('hzjgame/index',null,cb);
            }
        };

        questionPage.act = {
            $dom:$('#questionPage'),
            qArr:[], //存放需要展示的问题的序号,序号存放在question数组中
            MAX:5,
            nowG:1, //当前的关卡
            nowId:null,//当前关卡对应的id,
            timeOut:null, //存放过渡3s可以进入下一关的setTimeout
            init:function(){
                this.$dom.show();
                $('#question').removeClass('active');
                this.checkTouch();
                this.game();
            },
            game:function(){
                //产生随机数
                for(var i=0;i<this.MAX;i++){
                    this.qArr[i] = random(i*2+1,i*2+3);
                }
                console.log(this.qArr);
                this.nowId = this.qArr[this.nowG-1];
                this.createQ(this.nowId);
            },
            createQ:function(index){
                var me = this;
                $('#resultActiveW').html(txt);
                var questionDom = $('#question');
                for(var i=0;i<this.MAX*2;i++){
                    questionDom.removeClass('ques_'+(i+1));
                }
                questionDom.addClass('ques_'+index);
                $('#quesDesc').html(question[index-1].desc);
                this.drag(index);
            },
            drag:function(index){
                var me = this;
                var dx, dy;
                function touchHandler(ev){
                    dx = dx || 0;
                    dy = dy || 0;
                    var offx = dx + ev.x + "px";
                    var offy = dy + ev.y + "px";
                    //console.log("当前x值为:" + offx + ", 当前y值为:" + offy +".");
                    this.style.webkitTransform = "translate3d(" + offx + "," + offy + ",0)";
                }
                touch.on('#touchMove','touchstart', function(ev){
                    ev.preventDefault();
                });
                touch.on('#touchMove', 'drag', touchHandler);
                touch.on('#touchMove', 'dragend', function(ev){
                    dx += ev.x;
                    dy += ev.y;
                    if(Math.abs((Math.abs(question[index-1].x)- Math.abs(dx)))<=30 && Math.abs((Math.abs(question[index-1].y)- Math.abs(dy)))<=30 ){
                        $('#resultActiveW').html(question[index-1].activeDesc);
                        this.style.webkitTransform = "translate3d(0,0,0)";
                        $('#question').addClass('active');
                        $('#resultOut').html('');
                        $('#resultOut').html('<div id="touchMove" class="resultMove box box-center"><div class="resultImg"></div></div>');
                        //touch.off( '#touchMove','drag',touchHandler);
                        $('#question.active #resultOut').off();
                        $('.arrow').css('background','transparent');
                        if(!personIsOk){
                            M.loading(2,2);
                        }else{
                            if(me.nowG==5){
                                me.gameOver(true);
                            }else{
                                me.timeOut = setTimeout(function(){
                                    me.goNext();
                                },3000);
                                $('#question.active #resultOut').on('click',function(){
                                    $('#question.active #resultOut').off();
                                    clearTimeout(me.timeOut);
                                    me.goNext();
                                });
                            }
                        }
                    }else{
                        me.gameOver(false);
                    }
                });
            },
            goNext:function(){
                var me =this;
                $('#question').removeClass('active');
                me.nowG++;
                me.nowId = me.qArr[me.nowG-1];
                me.createQ(me.nowId);
            },
            gameOver:function(isOver){
                if(isOver){ //正常结束
                    resultPage.act.init(this.nowG,1);
                }else{
                    $('#failPop').show();
                }

            },
            checkTouch:function(){
                var me = this;
                //失败弹出框，再来一次
                $('#failAgain').on(config.touch,function(){
                    $('#failPop').hide();
                    me.nowG = 1;
                    $('#resultOut').html('<div id="touchMove" class="resultMove box box-center"><div class="resultImg"></div></div>');
                    me.game();
                });
                ////失败弹出框，关闭按钮
                //$('#failClose').on(config.touch,function(){
                //
                //});
            },
            out:function(){
                $('#failAgain').off();
                this.$dom.hide();
            }
        };

        resultPage.act = {
            $dom:$('#resultPage'),
            init:function(step,pass){
                M.loading(2,2);
                resultPage.data.saveLog(step,pass,this.saveLogCb.bind(this));
            },
            saveLogCb:function(data){
                if(data.isget) $('#resultImgI').removeClass('no');
                else if(data.isover) $('#resultImgI').addClass('no');
                this.$dom.show();
                this.checkTouch();
                questionPage.act.out();
                M.loadingHide();
            },
            checkTouch:function(){
                var me = this;
                //再来一次
                $('#resultPageAgain').on(config.touch,function(){
                    questionPage.act.nowG = 1;
                    $('#resultOut').html('<div id="touchMove" class="resultMove box box-center"><div class="resultImg"></div></div>');
                    indexPage.act.init();
                    me.out();
                });
                //分享
                $('#resultPageShare').on(config.touch,function(){
                    $('#sharePage').show();
                });
                //关闭分享
                $('#sharePage').on(config.touch,function(){
                    $('#sharePage').hide();
                });
            },
            out:function(){
                $('#resultPageAgain').off();
                $('#resultPageShare').off();
                this.$dom.hide();
            }
        };
        resultPage.data = {
            saveLog:function(step,pass,cb){
                post('hzjgame/savelog',{
                    step:step,
                    pass:pass
                },cb);
            }
        };

        //产生随机数 例如，生成0-9的随机数(包括0,不包括9) random(0,9)
        function random(min,max){
            return Math.floor(min+Math.random()*(max-min));
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

        function shareFunc(shareInfo,succCb){
            wxshare.initWx(shareInfo,config.gameid,config.apiopenid,config.apitoken,function(){
                if(share==1){
                    window.location.reload();
                }
            },null,null,null);
        }

        var imgs = [
            __uri('../images/indexPage.png'),
            __uri('../images/shouyebeijing.jpg'),
            __uri('../images/tongyongbeijing.jpg')
        ];
        var imgs2 = [
            __uri('../images/person.png'),
            //__uri('../images/resultPage.png')
        ];
        var imgs3 = [
            __uri('../images/resultPage.png'),
            __uri('../images/fenxiang.png')
        ];
        M.loading(2,2);
        check(oAuth,function(){
            shareFunc(config.shareInfo);
            imgpreload.load(imgs,function(){
                console.log('imgs加载完毕');
                indexPage.act.init();
                //加载person图片
                imgpreload.load(imgs2,function(){
                    personIsOk = 1; //person图片加载完毕
                    if(personIsLoading){ //正在展示loading以加载person图片
                        M.loadingHide(); //此时应该进入第二关
                        questionPage.act.nowId = questionPage.act.qArr[questionPage.act.nowG-1];
                        questionPage.act.createQ(questionPage.act.nowId);
                    }
                });
                ////加载结果图片
                //imgpreload.load(imgs3,function(){
                //    console.log(imgs3);
                //});
            });
        });
    }
})();
