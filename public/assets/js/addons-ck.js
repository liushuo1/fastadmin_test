define([], function () {
    if ($('.cropper', $('form[role="form"]')).length > 0) {
        var allowAttr = [
            'aspectRatio', 'autoCropArea', 'cropBoxMovable', 'cropBoxResizable', 'minCropBoxWidth', 'minCropBoxHeight', 'minContainerWidth', 'minContainerHeight',
            'minCanvasHeight', 'minCanvasWidth', 'croppedWidth', 'croppedHeight', 'croppedMinWidth', 'croppedMinHeight', 'croppedMaxWidth', 'croppedMaxHeight', 'fillColor'
        ];
        String.prototype.toLineCase = function () {
            return this.replace(/[A-Z]/g, function (match) {
                return "-" + match.toLowerCase();
            });
        };

        var btnAttr = [];
        $.each(allowAttr, function (i, j) {
            btnAttr.push('data-' + j.toLineCase() + '="<%=data.' + j + '%>"');
        });
        var btn = '<button class="btn btn-success btn-cropper btn-xs" data-input-id="<%=data.inputId%>" ' + btnAttr.join(" ") + ' style="position:absolute;top:10px;right:15px;">裁剪</button>';
        require(['upload'], function (Upload) {
            //图片裁剪
            $(document).on('click', '.btn-cropper', function () {
                var image = $(this).closest("li").find('.thumbnail').data('url');
                var input = $("#" + $(this).data("input-id"));
                var url = image;
                var data = $(this).data();
                var params = [];
                $.each(allowAttr, function (i, j) {
                    if (typeof data[j] !== 'undefined' && data[j] !== '') {
                        params.push(j + '=' + data[j]);
                    }
                });
                (parent ? parent : window).Fast.api.open('/addons/cropper/index/cropper?url=' + image + (params.length > 0 ? '&' + params.join('&') : ''), '裁剪', {
                    callback: function (data) {
                        if (typeof data !== 'undefined') {
                            var arr = data.dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1],
                                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                            while (n--) {
                                u8arr[n] = bstr.charCodeAt(n);
                            }
                            var urlArr = url.split('.');
                            var suffix = 'png';
                            url = urlArr.join('');
                            var filename = url.substr(url.lastIndexOf('/') + 1);
                            var exp = new RegExp("\\." + suffix + "$", "i");
                            filename = exp.test(filename) ? filename : filename + "." + suffix;
                            var file = new File([u8arr], filename, {type: mime});
                            Upload.api.send(file, function (data) {
                                input.val(input.val().replace(image, data.url)).trigger("change");
                            }, function (data) {
                            });
                        }
                    },
                    area: ["880px", "520px"],
                });
                return false;
            });

            var insertBtn = function () {
                return arguments[0].replace(arguments[2], btn + arguments[2]);
            };
            Upload.config.previewtpl = Upload.config.previewtpl.replace(/<li(.*?)>(.*?)<\/li>/, insertBtn);
            $(".cropper").each(function () {
                var preview = $("#" + $(this).data("preview-id"));
                if (preview.size() > 0 && preview.data("template")) {
                    var tpl = $("#" + preview.data("template"));
                    tpl.text(tpl.text().replace(/<li(.*?)>(.*?)<\/li>/, insertBtn));
                }
            });
        });
    }
    require.config({
        paths: {
            'async': '../addons/example/js/async',
            'BMap': ['//api.map.baidu.com/api?v=2.0&ak=mXijumfojHnAaN2VxpBGoqHM'],
        },
        shim: {
            'BMap': {
                deps: ['jquery'],
                exports: 'BMap'
            }
        }
    });

    require.config({
        paths: {
            'ckeditor': '../addons/ckeditor/ckeditor'
        },
        shim: {
            'ckeditor': '../addons/ckeditor/config'
        }
    });

    require(['form', 'upload'], function (Form, Upload) {
        var _bindevent = Form.events.bindevent;
        Form.events.bindevent = function (form) {
            _bindevent.apply(this, [form]);
            try {
                //绑定summernote事件
                if ($(".ckeditor,.editor", form).size() > 0) {
                    require(['ckeditor'], function () {
                        CKEDITOR.replace('c-content', {language:'zh-cn'});
                        CKEDITOR.editorConfig= function( config ) {
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


                    });
                }
            } catch (e) {

            }

        };
    });

});