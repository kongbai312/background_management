<template>
  <div>
    <el-form :model="spuForm" label-width="100px">
      <el-form-item label="SPU名称">
        <el-input v-model="spuForm.spuName"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select v-model="spuForm.tmId" placeholder="请选择品牌">
          <el-option :label="tm.tmName" :value="tm.id" v-for="(tm) in trademarkList" :key="tm.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述">
        <el-input v-model="spuForm.description" type="textarea" rows="4"></el-input>
      </el-form-item>

      <el-form-item label="SPU图片">
        <el-upload
          :file-list="spuImageList"
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-success="handleSuccess"
          :on-remove="handleRemove">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select
          v-model="spuSaleAttrIdName"
          :placeholder="unUsedSpuSaleAttrList.length>0 ? `还有${unUsedSpuSaleAttrList.length}未选择`:'没有啦'">
          <el-option
          :label="unUsedSpuSaleAttr.name"
          :value="`${unUsedSpuSaleAttr.id}:${unUsedSpuSaleAttr.name}`"
          v-for="(unUsedSpuSaleAttr) in unUsedSpuSaleAttrList"
          :key="unUsedSpuSaleAttr.id"
          ></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr" :disabled="spuSaleAttrIdName===''">添加销售属性</el-button>
        <el-table
          :data="spuForm.spuSaleAttrList"
          style="width: 100%;margin:20px 0;">
          <el-table-column
            type="index"
            align="center"
            label="序号"
            width="80">
          </el-table-column>
          <el-table-column
            prop="saleAttrName"
            label="属性名"
            width="150">
          </el-table-column>
          <el-table-column
            prop="prop"
            label="属性值列表"
            width="width">
            <template slot-scope="{row,$index}">
              <el-tag
                :key="spuSaleAttrValue.id"
                v-for="(spuSaleAttrValue,index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
                {{spuSaleAttrValue.saleAttrValueName}}
              </el-tag>

              <el-input
                v-if="row.inputVisible"
                v-model="row.inputValue"
                class="input-new-tag"
                ref="saveTagInput"
                size="small"
                placeholder="添加"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              >
              </el-input>

              <el-button  v-else class="button-new-tag" size="small" @click="showInput(row)">+ 添加</el-button>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="150">
            <template slot-scope="{row,$index}">
              <HintButton title="删除" icon="el-icon-delete" type="danger" size="mini" @click="spuForm.spuSaleAttrList.splice($index,1)"></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name:'SpuForm',
  data() {
    return {
      spuForm:{
        "category3Id": 0,
        "description": '',
        "tmId": '',
        "spuName": '',
        "spuImageList": [
          // {
          //   "id": 0,
          //   "imgName": "string",
          //   "imgUrl": "string",
          //   "spuId": 0
          // }
        ],
        "spuSaleAttrList": [
          // {
          //   "baseSaleAttrId": 0,
          //   "id": 0,
          //   "saleAttrName": "string",
          //   "spuId": 0,
          //   "spuSaleAttrValueList": [
          //     {
          //       "baseSaleAttrId": 0,
          //       "id": 0,
          //       "isChecked": "string",
          //       "saleAttrName": "string",
          //       "saleAttrValueName": "string",
          //       "spuId": 0
          //     }
          //   ]
          // }
        ]
      },

      category3Id: 0,         //未处理的category3Id
      spuImageList:[],        //未处理的spuImageList
      baseSaleAttrList:[],        //所有的销售属性列表   添加和修改都获取
      trademarkList:[],       //所有的品牌列表    添加和修改都获取

      spuSaleAttrIdName:'',       //收集的销售属性id以及名称    结构为 unUsedSpuSaleAttr.id:unUsedSpuSaleAttr.name

      //上传图片相关数据
      dialogImageUrl: '',
      dialogVisible: false
    }
  },

  methods: {
    //上传图片相关回调
    //删除图片的回调  file是删除的那个文件，fileList是删除成功后的列表
    handleRemove(file, fileList) {
      // console.log(file, fileList);
      //将删除成功后的数据保存下来
      this.spuImageList = fileList
    },
    //上传成功的回调 response请求成功返回的数据，file为上传的文件,fileList为上传成功后的列表
    handleSuccess(response, file, fileList){
      //将上传成功后的数据保存下来
      this.spuImageList = fileList
    },
    //放大镜的回调
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    //初始化修改spu时，发送4个请求
    async initUpdateSpuFormData(spu){
      //存储category3Id
      this.category3Id = spu.category3Id

      //    根据id获取SPU详情信息
      // GET /admin/product/getSpuById/{spuId}
      const result = await this.$API.spu.get(spu.id)
      if(result.code === 200){
        this.spuForm = result.data
      }

      //    获取指定SPU的id对应的图片列表
      // GET /admin/product/spuImageList/{spuId}
      const imgResult = await this.$API.sku.getSpuImageList(spu.id)
      if(imgResult.code === 200){
        let spuImageList = imgResult.data
        //先将图片进行处理，处理成upload能够进行展示的样式
        //[{name: 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg'}]
        spuImageList.forEach(item=>{
          item.name = item.imgName
          item.url = item.imgUrl
        })
        this.spuImageList = spuImageList
      }

      //    获取所有销售属性列表
      // GET /admin/product/baseSaleAttrList
      const saleAttrListResult = await this.$API.spu.getSaleAttrList()
      if(saleAttrListResult.code === 200){
        this.baseSaleAttrList = saleAttrListResult.data
      }

      //   获取所有的品牌列表
      // GET /admin/product/baseTrademark/getTrademarkList
      const trademarkListResult = await this.$API.trademark.getList()
      if(trademarkListResult.code === 200){
        this.trademarkList = trademarkListResult.data
      }
    },

    //初始化添加spu,发送两个请求
    async initAddSpuFormData(category3Id){
      //存储category3Id
      this.category3Id = category3Id
      //    获取所有销售属性列表
      // GET /admin/product/baseSaleAttrList
      const saleAttrListResult = await this.$API.spu.getSaleAttrList()
      if(saleAttrListResult.code === 200){
        this.baseSaleAttrList = saleAttrListResult.data
      }

      //   获取所有的品牌列表
      // GET /admin/product/baseTrademark/getTrademarkList
      const trademarkListResult = await this.$API.trademark.getList()
      if(trademarkListResult.code === 200){
        this.trademarkList = trademarkListResult.data
      }
    },

    //点击切换成编辑模式 input切换
    showInput(row){
      //将查看模式变为编辑模式   通过$set设置成响应式
      this.$set(row,'inputVisible',true)
      this.$set(row,'inputValue','')
      //自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus()
      })
    },
    //键盘回车或失去焦点的事件   收集数据
    handleInputConfirm(row){
      //获取收集到的数据
      let saleAttrValueName = row.inputValue
      let baseSaleAttrId = row.baseSaleAttrId
      //如果数据为空，则不往下执行
      if(saleAttrValueName.trim()===''){
        row.inputValue = ''
        return
      }

      //如果数据不为空，判断是否重复，数据还未添加到数组，所以不需要排除自身
      let isRepeat = row.spuSaleAttrValueList.some(item => item.saleAttrValueName === saleAttrValueName)
      if(isRepeat){
        //重复提示
        this.$message.info('输入的值不能重复')
        row.inputValue = ''
        return
      }

      //构造数据结构
      let obj = {
        saleAttrValueName,
        baseSaleAttrId
      }

      //把构造成的结构对象添加到row.spuSaleAttrValueList
      row.spuSaleAttrValueList.push(obj)

      //清空数据
      row.inputValue = ''

      //将编辑模式变为查看模式
      row.inputVisible = false
    },

    //添加销售属性
    addSaleAttr(){
      // 添加到哪     spuForm.spuSaleAttrList
      //   添加的结构是什么
      // {
      //    baseSaleAttrId: 0,
      //    saleAttrName: "string",
      //    spuSaleAttrValueList: [],
      //    },
      // 获取收集的数据并且解构
      let [baseSaleAttrId,saleAttrName] = this.spuSaleAttrIdName.split(':')
      let obj = {
          baseSaleAttrId,
          saleAttrName,
          spuSaleAttrValueList: [],
        }
      //讲数据添加到spuForm.spuSaleAttrList
      this.spuForm.spuSaleAttrList.push(obj)
      //清空数据
      this.spuSaleAttrIdName = ''
    },

    //保存按钮
    async save(){
      //收集需要的数据 spuForm,spuImageList,category3Id
      let {spuForm,spuImageList,category3Id} = this

      //处理图片格式
      // 所需格式：{
              //   imgName: "string",
              //   imgUrl: "string",
              // }
      // 已有格式:{                          {
              // 	id: (...)                   name: "2.jpg"
              // 	imgName: (...)              percentage: 100
              // 	imgUrl: (...)               raw: File
              // 	name: (...)                 response: {code: 201, message: "失败", data: null, ok: false}
              // 	spuId: (...)                size: 706828
              // 	status: "success"           status: "success"
              // 	uid: 1610949980533          uid: 1610949989625
              // 	url: (...)                  url: "blob:http://localhost:9528/9e2c8ea6-9079-4671-b86f-afd7eabecb95"
              // }                           }
      //处理数据结构   并添加到spuForm上
      spuForm.spuImageList = spuImageList.map(item => ({
        imgName:item.name,
        imgUrl:item.imgUrl || item.response.data
      }))

      //category3Id数据初始化的时候通过父组件传入
      spuForm.category3Id = category3Id

      //去除不要的属性
      spuForm.spuSaleAttrList.forEach(item => {
        delete item.inputVisible
        delete item.inputValue
      })

      try {
        //发送请求，保存数据
        await this.$API.spu.addUpdate(spuForm)
        //提示
        this.$message.success('保存成功')
        //返回到列表页
        this.$emit('update:visiable',false)
        //通知父组件是否保存成功，父组件中发送请求重新获取页面
        this.$emit('successBack')
        //重置自身所有数据
      } catch (error) {
        this.$message.error('保存失败')
      }

    },

    //重置data中的所有数据
    resetData(){
      this.spuForm = {
        "category3Id": 0,
        "description": '',
        "tmId": '',
        "spuName": '',
        "spuImageList": [],
        "spuSaleAttrList": []
      }

      this.category3Id = 0,         //未处理的category3Id
      this.spuImageList = [],        //未处理的spuImageList
      this.baseSaleAttrList = [],        //所有的销售属性列表   添加和修改都获取
      this.trademarkList = [],       //所有的品牌列表    添加和修改都获取

      this.spuSaleAttrIdName = '',       //收集的销售属性id以及名称    结构为 unUsedSpuSaleAttr.id:unUsedSpuSaleAttr.name

      //上传图片相关数据
      this.dialogImageUrl = '',
      this.dialogVisible = false
    },

    //取消按钮
    cancel(){
      //返回到父组件
      this.$emit('update:visiable',false)
      //通知父组件，清空标识符号
      this.$emit('cancelBack')
      //重置data中的数据
      this.resetData()
    }
  },

  computed:{
    //剩余的销售属性
    unUsedSpuSaleAttrList(){
      //返回整个过滤完的销售属性数组
      return this.baseSaleAttrList.filter(baseSaleAttr=>{
        //若为true则，返回符合条件的销售属性
        return this.spuForm.spuSaleAttrList.every(spuSaleAttr=>{
          //若都与已有的不相同，则返回true
          return baseSaleAttr.name !== spuSaleAttr.saleAttrName
        })
      })
    }
  }
}
</script>

<style>
.el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
