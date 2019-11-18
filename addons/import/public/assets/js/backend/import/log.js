define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'import/log/index' + location.search,
                    add_url: 'import/log/add',
                    //  edit_url: 'import/log/edit',
                    del_url: 'import/log/del',
                    multi_url: 'import/log/multi',
                    table: 'import_log',
                    import_url: 'import/log/import',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                fixedColumns: true,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'table', title: __('Table')},
                        {field: 'row', title: __('Row')},
                        {field: 'head_type', title: __('head_type'), searchList: {"comment": __('comment'), "name": __('name')}, formatter: Table.api.formatter.status},
                        {field: 'path', title: __('Path'), formatter: Table.api.formatter.url},
//                        {field: 'admin_id', title: __('Admin_id')},
                        {field: 'createtime', title: __('Createtime'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'updatetime', title: __('Updatetime'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'status', title: __('Status'), searchList: {"normal": __('Normal'), "hidden": __('Hidden')}, formatter: Table.api.formatter.status},
                        {
                            field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate,
                            buttons: [
                                {
                                    name: 'detail',
                                    text: __('导入'),
                                    title: __('导入'),
                                    classname: 'btn btn-xs btn-primary btn-dialog',
                                    icon: 'fa fa-wrench',
                                    extend: 'data-area=\'["1000px","800px"]\'',
                                    url: 'import/log/edit',
                                    callback: function (data) {
                                        Layer.alert("接收到回传数据：" + JSON.stringify(data), {title: "回传数据"});
                                    },
                                    visible: function (row) {
                                        //返回true时按钮显示,返回false隐藏
                                        return true;
                                    }
                                }
                            ]
                        }
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            $("#options").on("click", function () {
                var url = $(this).attr('data-url');
                window.open(url, '_self')
            });
            Controller.api.bindevent();
        },
        doimport: function () {
            $("#submitbtn").on("click", function () {
                var that = this;
                Layer.confirm('确认导入当前数据到目标表吗？', {
                    btn: ['确认', '取消'] //按钮
                }, function (index) {
                    $(that).closest("form").trigger("submit");
                    Layer.close(index);
                    return true;
                }, function (index) {
                    Layer.close(index);
                    return false;
                });
            });

            $("#options").on("click", function () {
                var url = $(this).attr('data-url');
                window.open(url, '_self')
            });

            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                // Form.api.bindevent($("form[role=form]"));
                Form.api.bindevent($("form[role=form]"), function (data, ret) {
                    console.log(ret)
                    // window.open(ret.url, '_self')
                    // window.top.location.href= ret.url;
                    if (ret.url) {
                        window.location.href = ret.url;
                        return false;
                    }
                });
            }
        }
    };
    return Controller;
});