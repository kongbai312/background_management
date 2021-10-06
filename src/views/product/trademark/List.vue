<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加</el-button>

    <el-table
      :data="trademarkList"
      border
      style="width: 100%;margin:20px 0;">
      <el-table-column
        align="center"
        label="序号"
        width="80"
        type="index">
      </el-table-column>
      <el-table-column
        prop="tmName"
        label="品牌名称"
        width="width">
      </el-table-column>
      <el-table-column
        label="品牌LOGO"
        width="width">
        <template slot-scope="{row,$index}">
          <img :src="row.logoUrl" alt="" style="width:80px;height:80px;">
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="width">
        <template slot-scope="{row,$index}">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="showUpdateDialog(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTrademark(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- @size-change="handleSizeChange"
      @current-change="handleCurrentChange" -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="getTrademarkList"
      style="text-align:center"
      :current-page="page"
      :page-sizes="[3, 5, 7]"
      :page-size="limit"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total">
    </el-pagination>

    <!-- 添加和修改按钮的收集表单 -->
    <el-dialog :title="tmForm.id?'修改品牌':'添加品牌'" :visible.sync="dialogFormVisible">
      <el-form :model="tmForm" style="width:80%;" :rules="rules" ref="tmForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="tmForm.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
                <el-upload
                  class="avatar-uploader"
                  action="/dev-api/admin/product/fileUpload"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload">
                  <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Trademark',
  data() {
      //自定义校验规则
      let validateTmName = (rule, value, callback) => {
        if (value.length <2 || value.length>10) {
          callback(new Error('请输入2~10位的品牌名称'));
        } else {
          //成功
          callback();
        }
      }
    return {
      page:1,      //当前页面
      limit:3,      //每页最大数量
      trademarkList:[],   //品牌数据
      total:0,             //总页数

      dialogFormVisible:false,     //控制dialog的显示隐藏
      tmForm:{
        tmName:'',
        logoUrl:''
      },


      //用于做表单验证
      rules: {
          tmName: [
            { required: true, message: '请输入品牌名称', trigger: 'blur' },
            // { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'change' }
            //使用自定义校验规则
            { validator: validateTmName, trigger: 'change' }
          ],
          logoUrl: [
            { required: true, message: '请上传图片', trigger: 'blur' }
          ],
      },

    }
  },
  mounted() {
    this.getTrademarkList()
  },
  methods: {
    //获取品牌数据，和点击的回调
    async getTrademarkList(page = 1){
      this.page = page
      const result = await this.$API.trademark.getPageList(this.page,this.limit)
      if(result.code ===200){
        this.trademarkList = result.data.records
        this.total = result.data.total
      }
      else{
        this.$message.error('请求出错');
      }
    },
    handleSizeChange(size){
      this.limit = size
      this.getTrademarkList()
    },

    //上传成功的回调
    handleAvatarSuccess(res, file) {
      this.tmForm.logoUrl = res.data
    },
    //上传前的回调
    beforeAvatarUpload(file) {
      const typeArr = ['image/jpeg','image/png']
      // const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;
      const isJpgOrPng = typeArr.indexOf(file.type) !==-1
      if (!isJpgOrPng) {
        // this.$message.error('上传头像图片只能是 JPG 格式!');
        this.$message.error('上传头像图片只能是 JPG或PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJpgOrPng && isLt2M;
    },

    //添加按钮相关
    showAddDialog(){
      this.dialogFormVisible = true
      this.tmForm = {
        tmName:'',
        logoUrl:''
      }
    },
    //修改按钮相关
    showUpdateDialog(row){
      this.dialogFormVisible = true
      //进行浅拷贝
      this.tmForm = {
        ...row
      }
    },

    //确定后发送请求
    addOrUpdate(){
      this.$refs.tmForm.validate(async(valid) => {
        if (valid) {
          //获取收集好的数据
          let trademark = this.tmForm
          try {
            //发送请求
            const result = await this.$API.trademark.addOrUpdate(trademark)
            //提示成功
            this.$message.success(trademark.id?'修改品牌成功':'添加品牌成功')
            //关闭dialog
            this.dialogFormVisible = false
            //重新发送请求获取数据
            this.getTrademarkList(trademark.id?this.page:1)
          } catch (error) {
            //提示失败
            this.$message.error(trademark.id?'修改品牌失败':'添加品牌失败')
          }
        } else {
          console.log('校验失败，不提交');
          return false;
        }
      });



    },

    //点击删除按钮，删除数据
    deleteTrademark(row) {
      this.$confirm(`是否要删除${row.tmName}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          //发送请求，删除数据
          await this.$API.trademark.delete(row.id)
          //删除成功提示
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          //重新获取数据
          this.getTrademarkList(this.trademarkList.length>1?this.page:this.page-1)
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    }
  },
}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
