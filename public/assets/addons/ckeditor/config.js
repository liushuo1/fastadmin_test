/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    config.toolbarGroups = [
        { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
        { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
        { name: 'forms', groups: [ 'forms' ] },
        { name: 'styles', groups: [ 'styles' ] },
        '/',
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
        { name: 'links', groups: [ 'links' ] },
        { name: 'insert', groups: [ 'insert' ] },
        '/',
        { name: 'colors', groups: [ 'colors' ] },
        { name: 'tools', groups: [ 'tools' ] },
        { name: 'others', groups: [ 'others' ] },
        { name: 'about', groups: [ 'about' ] }
    ];

    config.removeButtons = 'Source,Save,NewPage,Preview,Print,Templates,Find,Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Outdent,Indent,Blockquote,CreateDiv,BidiLtr,BidiRtl,Language,Anchor,Unlink,Link,Flash,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,ShowBlocks,Maximize,About,PasteFromWord,BGColor,TextColor';

    config.language = 'en';
    //config.resize_maxHeight = 500; //改变大小最大高
    //config.height = 600; //设置高
    //config.maxHeight = 600;

    //config.toolbarCanCollapse = true;
    //config.forcePasteAsPlainText = true;
    config.extraPlugins="uploadimg";
    config.scayt_autoStartup = true; //拼写检查 默认 开启
    config.removeDialogTabs = 'image:advanced;image:Link'; //去掉上传图片框中的 高级 选项卡
    config.image_previewText = ' '; //传图片框中 预览区域显示内容
    config.image_removeLinkByEmptyURL = false; //清空“图像”对话框窗口中的链接URL字段时是否删除链接。
    config.filebrowserUploadUrl = '/index.php?g=Home&m=Ckeditor&a=upload'; //上传图片
};