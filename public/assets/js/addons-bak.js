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

// require.config({
//     paths: {
//         'summernote': '../addons/summernote/lang/summernote-zh-CN.min'
//     },
//     shim: {
//         'summernote': ['../addons/summernote/js/summernote.min', 'css!../addons/summernote/css/summernote.css'],
//     }
// });


    require.config({
        paths: {
            'summernote': '../addons/summernote/lang/summernote-zh-CN.min'
        },
        shim: {
            'summernote': ['../addons/summernote/js/summernote.min', 'css!../addons/summernote/css/summernote.css'],
        }
    });

    require(['form', 'upload'], function (Form, Upload) {
        var _bindevent = Form.events.bindevent;
        Form.events.bindevent = function (form) {
            _bindevent.apply(this, [form]);
            try {
                //绑定summernote事件
                if ($(".summernote,.editor", form).size() > 0) {
                    require(['summernote'], function () {
                        var imageButton = function (context) {
                            var ui = $.summernote.ui;
                            var button = ui.button({
                                contents: '<i class="fa fa-file-image-o"/>',
                                tooltip: __('Choose'),
                                click: function () {
                                    parent.Fast.api.open("general/attachment/select?element_id=&multiple=true&mimetype=image/*", __('Choose'), {
                                        callback: function (data) {
                                            var urlArr = data.url.split(/\,/);
                                            $.each(urlArr, function () {
                                                var url = Fast.api.cdnurl(this);
                                                context.invoke('editor.insertImage', url);
                                            });
                                        }
                                    });
                                    return false;
                                }
                            });
                            return button.render();
                        };
                        var attachmentButton = function (context) {
                            var ui = $.summernote.ui;
                            var button = ui.button({
                                contents: '<i class="fa fa-file"/>',
                                tooltip: __('Choose'),
                                click: function () {
                                    parent.Fast.api.open("general/attachment/select?element_id=&multiple=true&mimetype=*", __('Choose'), {
                                        callback: function (data) {
                                            var urlArr = data.url.split(/\,/);
                                            $.each(urlArr, function () {
                                                var url = Fast.api.cdnurl(this);
                                                var node = $("<a href='" + url + "'>" + url + "</a>");
                                                context.invoke('insertNode', node[0]);
                                            });
                                        }
                                    });
                                    return false;
                                }
                            });
                            return button.render();
                        };

                        $(".summernote,.editor", form).summernote({
                            height: 250,
                            lang: 'zh-CN',
                            fontNames: [
                                'Arial', 'Arial Black', 'Serif', 'Sans', 'Courier',
                                'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande',
                                "Open Sans", "Hiragino Sans GB", "Microsoft YaHei",
                                '微软雅黑', '宋体', '黑体', '仿宋', '楷体', '幼圆',
                            ],
                            fontNamesIgnoreCheck: [
                                "Open Sans", "Microsoft YaHei",
                                '微软雅黑', '宋体', '黑体', '仿宋', '楷体', '幼圆'
                            ],
                            toolbar: [
                                ['style', ['style', 'undo', 'redo']],
                                ['font', ['bold', 'underline', 'strikethrough', 'clear']],
                                ['fontname', ['color', 'fontname', 'fontsize']],
                                ['para', ['ul', 'ol', 'paragraph', 'height']],
                                ['table', ['table', 'hr']],
                                ['insert', ['link', 'picture', 'video']],
                                ['select', ['image', 'attachment']],
                                ['view', ['fullscreen', 'codeview', 'help']],
                            ],
                            buttons: {
                                image: imageButton,
                                attachment: attachmentButton,
                            },
                            dialogsInBody: true,
                            followingToolbar: false,
                            callbacks: {
                                onChange: function (contents) {
                                    $(this).val(contents);
                                    $(this).trigger('change');
                                },
                                onInit: function () {
                                },
                                onImageUpload: function (files) {
                                    var that = this;
                                    //依次上传图片
                                    for (var i = 0; i < files.length; i++) {
                                        Upload.api.send(files[i], function (data) {
                                            var url = Fast.api.cdnurl(data.url);
                                            $(that).summernote("insertImage", url, 'filename');
                                        });
                                    }
                                }
                            }
                        });
                    });
                }
            } catch (e) {

            }

        };
    });
// require(['form', 'upload'], function (Form, Upload) {
//     var _bindevent = Form.events.bindevent;
//     Form.events.bindevent = function (form) {
//         _bindevent.apply(this, [form]);
//         try {
//             //绑定summernote事件
//             if ($(".summernote,.editor", form).size() > 0) {
//                 require(['summernote'], function () {
//                     var imageButton = function (context) {
//                         var ui = $.summernote.ui;
//                         var button = ui.button({
//                             contents: '<i class="fa fa-file-image-o"/>',
//                             tooltip: __('Choose'),
//                             click: function () {
//                                 parent.Fast.api.open("general/attachment/select?element_id=&multiple=true&mimetype=image/*", __('Choose'), {
//                                     callback: function (data) {
//                                         var urlArr = data.url.split(/\,/);
//                                         $.each(urlArr, function () {
//                                             var url = Fast.api.cdnurl(this);
//                                             context.invoke('editor.insertImage', url);
//                                         });
//                                     }
//                                 });
//                                 return false;
//                             }
//                         });
//                         return button.render();
//                     };
//                     var attachmentButton = function (context) {
//                         var ui = $.summernote.ui;
//                         var button = ui.button({
//                             contents: '<i class="fa fa-file"/>',
//                             tooltip: __('Choose'),
//                             click: function () {
//                                 parent.Fast.api.open("general/attachment/select?element_id=&multiple=true&mimetype=*", __('Choose'), {
//                                     callback: function (data) {
//                                         var urlArr = data.url.split(/\,/);
//                                         $.each(urlArr, function () {
//                                             var url = Fast.api.cdnurl(this);
//                                             var node = $("<a href='" + url + "'>" + url + "</a>");
//                                             context.invoke('insertNode', node[0]);
//                                         });
//                                     }
//                                 });
//                                 return false;
//                             }
//                         });
//                         return button.render();
//                     };
//
//                     $(".summernote,.editor", form).summernote({
//                         height: 250,
//                         lang: 'zh-CN',
//                         fontNames: [
//                             'Arial', 'Arial Black', 'Serif', 'Sans', 'Courier',
//                             'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande',
//                             "Open Sans", "Hiragino Sans GB", "Microsoft YaHei",
//                             '微软雅黑', '宋体', '黑体', '仿宋', '楷体', '幼圆',
//                         ],
//                         fontNamesIgnoreCheck: [
//                             "Open Sans", "Microsoft YaHei",
//                             '微软雅黑', '宋体', '黑体', '仿宋', '楷体', '幼圆'
//                         ],
//                         toolbar: [
//                             ['style', ['style', 'undo', 'redo']],
//                             ['font', ['bold', 'underline', 'strikethrough', 'clear']],
//                             ['fontname', ['color', 'fontname', 'fontsize']],
//                             ['para', ['ul', 'ol', 'paragraph', 'height']],
//                             ['table', ['table', 'hr']],
//                             ['insert', ['link', 'picture', 'video']],
//                             ['select', ['image', 'attachment']],
//                             ['view', ['fullscreen', 'codeview', 'help']],
//                         ],
//                         buttons: {
//                             image: imageButton,
//                             attachment: attachmentButton,
//                         },
//                         dialogsInBody: true,
//                         followingToolbar: false,
//                         callbacks: {
//                             onChange: function (contents) {
//                                 $(this).val(contents);
//                                 $(this).trigger('change');
//                             },
//                             onInit: function () {
//                             },
//                             onImageUpload: function (files) {
//                                 var that = this;
//                                 //依次上传图片
//                                 for (var i = 0; i < files.length; i++) {
//                                     Upload.api.send(files[i], function (data) {
//                                         var url = Fast.api.cdnurl(data.url);
//                                         $(that).summernote("insertImage", url, 'filename');
//                                     });
//                                 }
//                             }
//                         }
//                     });
//                 });
//             }
//         } catch (e) {
//
//         }
//
//     };
// });

});