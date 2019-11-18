(function () {
    CKEDITOR.dialog.add("simpleupload",
        function (a) {
            console.log(a);
            return {
                title: "上传图片",
                minWidth: 300,  //弹出框的最小宽度
                minHeight: 80,   //弹出框的最小高度
                contents: [{
                    id: "tab1",
                    label: "",
                    title: "",
                    expand: true,
                    padding: 0,
                    elements: [{
                        type: "html",
                        html: initImageDlgInnerHtml(a.name) //对话框中要显示的内容，a.name:表示的是当前编辑器的id，initImageDlgInnerHtml方法是调用页面上的js方法（注意：a.name是为了解决同一个页面上使用多个编辑器）
                    }]
                }],
                onOk: function () {
                    initUploadImage();  //点击确定按钮调用页面上的js方法
                },
                onLoad: function () {
                    //弹出框中默认的按钮为【确定】和【取消】，这里将【确定】按钮的文字为【上传】，鼠标悬停时显示也为上传
                    $('.cke_dialog_ui_button_ok > .cke_dialog_ui_button').text('上传');
                    $('.cke_dialog_ui_button_ok').attr('title', '上传');
                }
            }
        })
})();

//在弹出框中加入html（参数id：是simpleupload.js脚本传递过来的，用于上传图片成功后返回的图片插入到当前编辑器的id中，这里只有多个编辑器时才需用到）
var ckeditorId; //定义当前上传的图片的编辑器ID为全局变量
function initImageDlgInnerHtml(id) {
    ckeditorId = id;
    var content = '<a style="cursor:pointer;display:inline-block;padding: 4px;border: 1px solid #bcbcbc;background: #f8f8f8;" οnclick="triggerFileEvent()">选择图片</a>&emsp;<span id="imgName"></span>';
    return content;
}