<?php

namespace app\admin\controller\import;

use app\common\controller\Backend;
use think\Config;
use think\Db;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Reader\Xls;
use PhpOffice\PhpSpreadsheet\Reader\Csv;
use think\Exception;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 数据导入辅助
 *
 * @icon fa fa-circle-o
 */
class Log extends Backend
{

    /**
     * Log模型对象
     * @var \app\admin\model\import\Log
     */
    protected $model = null;
    /**
     * 是否开启数据限制
     * 支持auth/personal
     * 表示按权限判断/仅限个人
     * 默认为禁用,若启用请务必保证表中存在admin_id字段
     */
    protected $dataLimit = true;
    /**
     * 数据限制字段
     */
    protected $dataLimitField = 'admin_id';

    /**
     * 数据限制开启时自动填充限制字段值
     */
    protected $dataLimitFieldAutoFill = true;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\import\Log;
        $this->view->assign("statusList", $this->model->getStatusList());

        $tableList = [];
        $list = \think\Db::query("SHOW TABLES");
        foreach ($list as $key => $row) {
            $tableList[reset($row)] = reset($row);
        }

        $this->view->assign("hidden_num", $this->model->where('status', 'hidden')->count());
        $this->view->assign("tableList", $tableList);
        $this->view->assign("from", $this->request->request('from'));
    }

    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */

    /**
     * 添加
     */
    public function add()
    {
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);

                if ($this->dataLimit && $this->dataLimitFieldAutoFill) {
                    $params[$this->dataLimitField] = $this->auth->id;
                }
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.add' : $name) : $this->modelValidate;
                        $this->model->validateFailException(true)->validate($validate);
                    }
                    $result = $this->model->allowField(true)->save($params);
                    Db::commit();
                } catch (ValidateException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (PDOException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                if ($result !== false) {

                    $this->success('设置成功', url('doimport', ['ids' => $this->model->id]));
                } else {
                    $this->error(__('No rows were inserted'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }
        return $this->view->fetch();
    }


    /**
     * 编辑
     */
    public function edit($ids = null)
    {
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds)) {
            if (!in_array($row[$this->dataLimitField], $adminIds)) {
                $this->error(__('You have no permission'));
            }
        }
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.edit' : $name) : $this->modelValidate;
                        $row->validateFailException(true)->validate($validate);
                    }
                    $result = $row->allowField(true)->save($params);
                    Db::commit();
                } catch (ValidateException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (PDOException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                if ($result !== false) {
                    $this->success('设置成功', url('doimport', ['ids' => $row['id']]));
                } else {
                    $this->error(__('No rows were updated'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }
        $this->view->assign("row", $row);
        return $this->view->fetch();
    }

    /**
     * 导入
     */
    public function doimport($ids = null)
    {
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds)) {
            if (!in_array($row[$this->dataLimitField], $adminIds)) {
                $this->error(__('You have no permission'));
            }
        }
        $this->view->assign("row", $row);
        $file = $row['path'];
        if (!$file) {
            $this->error(__('Parameter %s can not be empty', 'file'));
        }
        $filePath = ROOT_PATH . DS . 'public' . DS . $file;
        if (!is_file($filePath)) {
            $this->error(__('No results were found'));
        }
        //实例化reader
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        if (!in_array($ext, ['csv', 'xls', 'xlsx'])) {
            $this->error(__('Unknown data format'));
        }
        if ($ext === 'csv') {
            $file = fopen($filePath, 'r');
            $filePath = tempnam(sys_get_temp_dir(), 'import_csv');
            $fp = fopen($filePath, "w");
            $n = 0;
            while ($line = fgets($file)) {
                $line = rtrim($line, "\n\r\0");
                $encoding = mb_detect_encoding($line, ['utf-8', 'gbk', 'latin1', 'big5']);
                if ($encoding != 'utf-8') {
                    $line = mb_convert_encoding($line, 'utf-8', $encoding);
                }
                if ($n == 0 || preg_match('/^".*"$/', $line)) {
                    fwrite($fp, $line . "\n");
                } else {
                    fwrite($fp, '"' . str_replace(['"', ','], ['""', '","'], $line) . "\"\n");
                }
                $n++;
            }
            fclose($file) || fclose($fp);

            $reader = new Csv();
        } elseif ($ext === 'xls') {
            $reader = new Xls();
        } else {
            $reader = new Xlsx();
        }

        //导入文件首行类型,默认是注释,如果需要使用字段名称请使用name
        $importHeadType = $row['head_type'];
        $table = $row['table'];
        $database = \think\Config::get('database.database');
        $fieldArr = [];
        $pk = Db::getTableInfo($table, 'pk');
        $list = db()->query("SELECT COLUMN_NAME,COLUMN_COMMENT,COLUMN_TYPE,IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?", [$table, $database]);
        foreach ($list as $k => $v) {
            if ($v['COLUMN_NAME'] !== $pk) {
                if ($importHeadType == 'comment') {
                    if ($v['COLUMN_COMMENT']) {
                        $importField[] = $v['COLUMN_COMMENT'];
                    }
                    $fieldArr[$v['COLUMN_COMMENT']] = $v['COLUMN_NAME'];
                } else {
                    $importField[] = $v['COLUMN_NAME'];
                    $fieldArr[$v['COLUMN_NAME']] = $v['COLUMN_NAME'];
                }
            }
        }
        //加载文件
        $insert = [];
        try {
            if (!$PHPExcel = $reader->load($filePath)) {
                $this->error(__('Unknown data format'));
            }
            $currentSheet = $PHPExcel->getSheet($row['sheet']);  //读取文件中的第一个工作表
            $allColumn = $currentSheet->getHighestDataColumn(); //取得最大的列号
            $allRow = $currentSheet->getHighestRow(); //取得一共有多少行
            $maxColumnNumber = Coordinate::columnIndexFromString($allColumn);
            $fields = [];


            for ($currentRow = 1; $currentRow <= 1; $currentRow++) {
                for ($currentColumn = 1; $currentColumn <= $maxColumnNumber; $currentColumn++) {
                    $val = $currentSheet->getCellByColumnAndRow($currentColumn, $currentRow)->getValue();
                    $fields[] = $val;
                }
            }

            for ($currentRow = $row['row']; $currentRow <= $allRow; $currentRow++) {
                $values = [];
                for ($currentColumn = 1; $currentColumn <= $maxColumnNumber; $currentColumn++) {
                    $val = $currentSheet->getCellByColumnAndRow($currentColumn, $currentRow)->getValue();
                    $values[] = is_null($val) ? '' : $val;
                }
                $rows = [];
                $temp = array_combine($fields, $values);
                foreach ($temp as $k => $v) {
                    if (isset($fieldArr[$k]) && $k !== '') {
                        $rows[$fieldArr[$k]] = $v;
                    }
                }
                if ($rows) {
                    $insert[] = $rows;
                }
                $excelVal[] = $values;
            }
            $active_num = 0;
            $active_col = [];
            foreach ($fields as $k => $v) {
                if (in_array($v, $importField)) {
                    $active_num += 1;
                    $active_col[] = $k;
                }
            }

        } catch (Exception $exception) {
            $this->error($exception->getMessage());
        }
        if (!$insert && $this->request->isPost()) {
            $this->error(__('No rows were updated'));
        }


        if ($this->request->isPost()) {
            try {
                //是否包含admin_id字段
                $has_admin_id = false;
                foreach ($fieldArr as $name => $key) {
                    if ($key == 'admin_id') {
                        $has_admin_id = true;
                        break;
                    }
                }
                if ($has_admin_id) {
                    $auth = Auth::instance();
                    foreach ($insert as &$val) {
                        if (!isset($val['admin_id']) || empty($val['admin_id'])) {
                            $val['admin_id'] = $auth->isLogin() ? $auth->id : 0;
                        }
                    }
                }

                $prefix = Config::get('database.prefix');

                $res = Db::name(str_replace($prefix, "", $table))->insertAll($insert);
                if ($res) {
                    $result = $this->model->where('id', $ids)->update(['status' => 'normal']);
                }

            } catch (PDOException $exception) {
                $msg = $exception->getMessage();
                if (preg_match("/.+Integrity constraint violation: 1062 Duplicate entry '(.+)' for key '(.+)'/is", $msg, $matches)) {
                    $msg = "导入失败，包含【{$matches[1]}】的记录已存在";
                };
                $this->error($msg);
            } catch (\Exception $e) {
                $this->error($e->getMessage());
            }

            $this->success('成功导入' . $res . '条记录', '', '');
        }

        $this->view->assign("list", $list);
        $this->view->assign("importField", $importField);
        $this->view->assign("fields", $fields);
        $this->view->assign("values", $excelVal);
        $this->view->assign("active_num", $active_num);
        $this->view->assign("active_col", $active_col);
        return $this->view->fetch();
    }


    /**
     * 获取字段列表
     * @internal
     */
    public function get_field_list()
    {
        $dbname = Config::get('database.database');
        $prefix = Config::get('database.prefix');
        $table = $this->request->request('table');
        //从数据库中获取表字段信息
        $sql = "SELECT * FROM `information_schema`.`columns` "
            . "WHERE TABLE_SCHEMA = ? AND table_name = ? "
            . "ORDER BY ORDINAL_POSITION";
        //加载主表的列
        $columnList = Db::query($sql, [$dbname, $table]);
        $fieldlist = [];
        foreach ($columnList as $index => $item) {
            $fieldlist[] = $item['COLUMN_NAME'];
        }
        $this->success("", null, ['fieldlist' => $fieldlist]);
    }

}
