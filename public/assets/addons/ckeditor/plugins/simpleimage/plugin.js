﻿(function () {
    b = 'simpleimage';   //在config.js配置文件中写的注册自定义按钮名称
    CKEDITOR.plugins.add(b, {
        requires: ["dialog"],
        init: function (a) {
            a.addCommand(b, new CKEDITOR.dialogCommand(b));
            a.ui.addButton("SimpleImage", {  //注意这里SimpleImage是大写的，是在config.js中配置按钮名称
                label: "上传图片",  //鼠标放在按钮上时显示提示
                command: b,
                icon: this.path + "images/upload.png"   //自定义上传按钮图片，放在在simpleimage文件夹下的images文件夹中

            });
            CKEDITOR.dialog.add(b, this.path + "dialogs/simpleimage.js")   //添加上传图片配置脚本，放在simpleimage文件夹下dialogs文件夹中
        }
    })
})();