<template>
  <div>
    <el-form :model="skuForm" label-width="100px">
      <el-form-item label="SPU 名称">
        {{spu.spuName}}
      </el-form-item>

      <el-form-item label="SKU 名称">
        <el-input v-model="skuForm.skuName" placeholder="SKU 名称"></el-input>
      </el-form-item>

      <el-form-item label="价格（元）">
        <el-input v-model="skuForm.price" placeholder="SKU 价格" type="number"></el-input>
      </el-form-item>

      <el-form-item label="重量（千克）">
        <el-input v-model="skuForm.weight" placeholder="SKU 重量" type="number"></el-input>
      </el-form-item>

      <el-form-item label="规格描述">
        <el-input v-model="skuForm.skuDesc" placeholder="SKU 规格描述" type="textarea" rows="4"></el-input>
      </el-form-item>

      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item :label="attr.attrName" v-for="(attr,index) in attrList" :key="attr.id">
            <el-select v-model="attr.attrIdValueId" placeholder="请选择">
              <el-option :label="attrValue.valueName" :value="`${attr.id}:${attrValue.id}`" v-for="(attrValue,index) in attr.attrValueList" :key="attrValue.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item :label="spuSaleAttr.saleAttrName" v-for="(spuSaleAttr,index) in spuSaleAttrList" :key="spuSaleAttr.id">
            <el-select v-model="spuSaleAttr.spuAttrIdValueId" placeholder="请选择">
              <el-option :label="spuSaleAttrValue.saleAttrValueName" :value="`${spuSaleAttr.id}:${spuSaleAttrValue.id}`" v-for="(spuSaleAttrValue,index) in spuSaleAttr.spuSaleAttrValueList" :key="spuSaleAttrValue.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table
          @selection-change="handleSelectionChange"
          :data="spuImageList"
          border
          style="width: 100%">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="prop"
            label="图片"
            width="width">
            <template slot-scope="{row,$index}">
              <img :src="row.imgUrl" alt="" style="width:100px;height:100px;">
            </template>
          </el-table-column>
          <el-table-column
            prop="imgName"
            label="名称"
            width="width">
          </el-table-column>
          <el-table-column
            prop="prop"
            label="操作"
            width="width">
            <template slot-scope="{row,$index}">
              <el-button type="primary" size="mini" v-if="row.isDefault==='0'" @click="setDefault(row)">设为默认</el-button>
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name:'SkuForm',
  data() {
    return {
      //需要收集的数据
      skuForm:{
        //父组件传入
        "tmId": '',
        "category3Id": '',
        "spuId": '',
        // "createTime": "2021-10-13T07:33:56.850Z",
        // "id": 0,
        // "isSale": 0,

        //v-model自动收集
        "price": '',
        "weight": "",
        "skuDesc": "",
        "skuName": "",


        //需要代码处理
        "skuDefaultImg": "",
        "skuAttrValueList": [
          // {
          //   "attrId": 0,
          //   "attrName": "string",
          //   "id": 0,
          //   "skuId": 0,
          //   "valueId": 0,
          //   "valueName": "string"
          // }
        ],
        "skuImageList": [
          // {
          //   "id": 0,
          //   "imgName": "string",
          //   "imgUrl": "string",
          //   "isDefault": "string",
          //   "skuId": 0,
          //   "spuImgId": 0
          // }
        ],
        "skuSaleAttrValueList": [
          // {
          //   "id": 0,
          //   "saleAttrId": 0,
          //   "saleAttrName": "string",
          //   "saleAttrValueId": 0,
          //   "saleAttrValueName": "string",
          //   "skuId": 0,
          //   "spuId": 0
          // }
        ]
      },
      spu:{},                 //初始化发送请求获取的row
      attrList:[],            //平台属性列表
      spuSaleAttrList:[],     //spuid对应的销售属性列表
      spuImageList:[],        //spuid对应的图片列表
      checkedImageList:[],    //存储已选择的图片


    }
  },

  methods: {
    //发送请求获取初始化的数据
    async initAddSkuFormData(row,category1Id,category2Id){
      //将row存储下来
      this.spu = row
      //根据选中三级分类后，获取平台属性列表 getList(category1Id,category2Id,category3Id)
      const Promise1 = this.$API.attr.getList(category1Id,category2Id,row.category3Id)
      //获取指定SPU的id对应的销售属性列表 getSpuSaleAttrList (spuId)
      const Promise2 = this.$API.sku.getSpuSaleAttrList(row.id)
      //获取指定SPU的id对应的图片列表 getSpuImageList (spuId)
      const Promise3 = this.$API.sku.getSpuImageList(row.id)
      //使用Promise.all共同发送请求
      const result = await Promise.all([Promise1,Promise2,Promise3])
      //将数据存储下来
      this.attrList = result[0].data
      this.spuSaleAttrList = result[1].data
      let spuImageList = result[2].data
      //将spuImageList添加一个属性isDefault来设置是否为默认，初始值为'0'
      spuImageList.forEach(item => {
        item.isDefault = '0'
      });
      this.spuImageList = spuImageList
    },

    //收集图片列表已选择的图片
    handleSelectionChange(val){
      this.checkedImageList = val
    },

    //设置默认的图片
    setDefault(row){
      //排他思想 先将所有的还原默认样式
      this.spuImageList.forEach(item => {
        item.isDefault = '0'
      })
      //当前的设置为'1' 即为默认
      row.isDefault = '1'
      //存储默认图片的url到skuForm中
      this.skuForm.skuDefaultImg = row.imgUrl
    },

    //保存按钮
    async save(){
      //获取数据
      let {skuForm,spu,attrList,spuSaleAttrList,checkedImageList} = this
      //整理参数  三个从父组件中传入tmId,category3Id,spuId
      skuForm.tmId = spu.tmId
      skuForm.category3Id = spu.category3Id
      skuForm.spuId = spu.spuId
      //整理图片列表
      //需要的格式：                      我们的格式:
			// {                                  {
      //   "imgName": "string",               imgName:"7155bba4c363065f.jpg"
      //   "imgUrl": "string",                imgUrl:"http://47.93.148.192:8080/group1/M00/00/02/rBHu8l-rgfWAVRWzAABUiOmA0ic932.jpg"
      //   "isDefault": "string",             isDefault:"0"
      //   "spuImgId": 0                      id:12       实际上就是spuImgId
      // }                                    spuId:3
      //                                     }
			skuForm.skuImageList = checkedImageList.map(item => ({
        imgName:item.imgName,
        imgUrl:item.imgUrl,
        isDefault:item.isDefault,
        spuImgId:item.id
      }))

      //整理平台属性   平台属性中有个 attrIdValueId 需收集成{attrId,valueId}
      skuForm.skuAttrValueList = attrList.reduce((prev,item) =>{
        //如果存在这个属性，则拆分成需要收集的数据
        if(item.attrIdValueId){
          let [attrId,valueId] = item.attrIdValueId.split(':')
          //存入对象中
          let obj = {
            attrId,
            valueId
          }
          //将对象添加进收集的数组中
          prev.push(obj)
        }
        //每次都要返回统计值
        return prev
      },[])
      //整理销售属性  销售属性中有个 spuAttrIdValueId 需收集成{saleAttrId,saleAttrValueId}
      skuForm.skuSaleAttrValueList = spuSaleAttrList.reduce((prev,item) =>{
        //如果存在这个属性，则拆分成需要收集的数据
        if(item.spuAttrIdValueId){
          let [saleAttrId,saleAttrValueId] = item.spuAttrIdValueId.split(':')
          //存入对象中
          let obj = {
            saleAttrId,
            saleAttrValueId
          }
          //将对象添加进收集的数组中
          prev.push(obj)
        }
        //每次都要返回统计值
        return prev
      },[])
      try {
        //发送请求 保存数据
        await this.$API.sku.addUpdate(skuForm)
        //提示
        this.$message.success('保存sku成功')
        //返回列表
        this.$emit('update:visiable',false)
        //清空数据
        this.resetData()
      } catch (error) {
        this.$message.error('保存sku失败')
      }
    },

    //重置 清空数据
    resetData(){
      this.skuForm = {
        //父组件传入
        "tmId": '',
        "category3Id": '',
        "spuId": '',
        //v-model自动收集
        "price": '',
        "weight": "",
        "skuDesc": "",
        "skuName": "",
        //需要代码处理
        "skuDefaultImg": "",
        "skuAttrValueList": [],
        "skuImageList": [],
        "skuSaleAttrValueList": []
      },
      this.spu = {}                 //初始化发送请求获取的row
      this.attrList = []            //平台属性列表
      this.spuSaleAttrList = []    //spuid对应的销售属性列表
      this.spuImageList = []       //spuid对应的图片列表
      this.checkedImageList = []   //存储已选择的图片
    },

    //取消按钮操作
    cancel(){
      //返回列表页
      this.$emit('update:visiable',false)
      //清空数据
      this.resetData()
    }
    
  },
}
</script>
