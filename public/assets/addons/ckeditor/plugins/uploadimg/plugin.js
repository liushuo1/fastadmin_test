(function () {

    b = 'uploadimg';

    CKEDITOR.plugins.add(b, {



        init: function (a) {

            a.addCommand(b, CKEDITOR.plugins.autoformat.commands.autoformat);

            a.ui.addButton('uploadimg', {

                label: "一键排版",

                command: 'uploadimg',

                icon: this.path + "/images/image.png"

            });

        }

    });

    CKEDITOR.plugins.autoformat = {

        commands: {

            autoformat: {

                exec: function (editor) {

                    formatText(editor);

                }

            }

        }

    };
    //执行的方法
    function formatText(editor) {
        console.log(123);
        // var myeditor = editor;
        //
        // //得到要编辑的源代码
        // var editorhtml = myeditor.getData();
        // //在这里执行你的操作。。。。。
        //
        // editorhtml= editorhtml.replace(/(<\/?(?!br|p|img|a|h1|h2|h3|h4|h5|h6)[^>\/]*)\/?>/gi,'');
        // //在p标签处添加样式，使每个段落自动缩进两个字符
        // editorhtml= editorhtml.replace(/\<[p|P]>/g,"<p style='text-indent: 2em'>");
        //
        // //再将内容放回到编辑器中
        editor.setData('<p>123</p>');

        parent.Fast.api.open("general/attachment/select?element_id=&multiple=true&mimetype=image/*", __('Choose'), {
            callback: function (data) {
                var urlArr = data.url.split(/\,/);
                $.each(urlArr, function () {
                    var url = Fast.api.cdnurl(this);
                    editor.setData(url);
                });
            }
        });
        return false;

    }

})();