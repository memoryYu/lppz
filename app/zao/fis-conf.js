fis.match('*', {
   useHash: false, //�Ƿ������ļ�md5��׺��
   domain:'http://lppz.letwx.com/app/zao-build'
});
 
fis.match('*.js', {
  // fis-optimizer-uglify-js �������ѹ����������
  optimizer: fis.plugin('uglify-js'),
  useHash:true
});

fis.match('*.css', {
  // fis-optimizer-clean-css �������ѹ����������
  optimizer: fis.plugin('clean-css'),
  useHash:true
});

fis.match('::image', {
    // fis-optimizer-png-compressor 插件进行压缩，已内置
    useHash: true
});
fis.match('*.html',{
    //npm install -g fis-optimizer-htmlmin
    optimizer:fis.plugin('htmlmin',{
        html: "htmlmin"
    })
});