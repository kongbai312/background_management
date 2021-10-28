<template>
  <div>
    <el-card>
      <CategorySelector :isShowList="isShowList" @changeCategory="changeCategory"></CategorySelector>
    </el-card>
    <el-card>
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button type="primary" icon="el-icon-plus" @click="showAddSpuForm">添加SPU</el-button>

        <el-table
          border
          :data="spuList"
          style="width: 100%">
          <el-table-column
            align="center"
            type="index"
            label="序号"
            width="80">
          </el-table-column>
          <el-table-column
            prop="spuName"
            label="SPU名称"
            width="width">
          </el-table-column>
          <el-table-column
            prop="description"
            label="SPU描述"
            width="width">
          </el-table-column>
          <el-table-column
            label="操作"
            width="width">
            <template slot-scope="{row,$index}">
              <HintButton type="success" icon="el-icon-plus" title="添加SKU" size="mini" @click="showAddSkuForm(row)"></HintButton>
              <HintButton type="warning" icon="el-icon-edit" title="修改SPU" size="mini" @click="showUpdateSpuForm(row)"></HintButton>
              <HintButton type="info" icon="el-icon-info" title="查看SKU列表" size="mini" @click="showSkuList(row)"></HintButton>
              <el-popconfirm :title="`是否删除 ${row.spuName} 吗？`" @onConfirm="deleteSpu(row)">
                <HintButton slot="reference" type="error" icon="el-icon-delete" title="删除SPU" size="mini" ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          style="text-align:center;"
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          :current-page="page"
          :page-sizes="[2,3,5]"
          :page-size="limit"
          layout="prev, pager, next, jumper,->,sizes,total"
          :total="total">
        </el-pagination>
      </div>
      <SkuForm v-show="isShowSkuForm" ref="sku" :visiable.sync="isShowSkuForm"></SkuForm>
      <SpuForm v-show="isShowSpuForm" ref="spu" :visiable.sync="isShowSpuForm" @successBack="successBack" @cancelBack="cancelBack"></SpuForm>
    </el-card>

    <el-dialog
      :before-close="handleClose"
      :title="`${spu.spuName}的sku列表`"
      :visible.sync="dialogVisible"
      width="width">
      <el-table
        v-loading="loading"
        :data="skuList"
        style="width: 100%">
        <el-table-column
          prop="skuName"
          label="名称"
          width="width">
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格（元）"
          width="width">
        </el-table-column>
        <el-table-column
          prop="weight"
          label="重量（KG）"
          width="width">
        </el-table-column>
        <el-table-column
          prop="prop"
          label="默认图片"
          width="width">
          <template slot-scope="{row,$index}">
            <img :src="row.skuDefaultImg" alt="" style="width:100px;height:100px;">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SkuForm from "../components/SkuForm.vue"
import SpuForm from "../components/SpuForm.vue"
export default {
  name: 'Spu',
  data() {
    return {
      category1Id:'',
      category2Id:'',
      category3Id:'',
      spuList:[],
      page:1,       //当前页数
      limit:3,      //每页数量
      total:0,      //总页数

      isShowList:true,  //子属性需要接收一个这个数据

      isShowSkuForm:false,      //是否展示SkuForm
      isShowSpuForm:false,      //是否展示SpuForm

      //控制spu的sku显示隐藏
      dialogVisible:false,
      spu:{},
      skuList:[],

      loading:true,     //用于在数据加载前
    }
  },
  components:{
    SkuForm,
    SpuForm
  },
  methods: {
    //自定义事件的回调
    changeCategory({categoryId,level}){
      if(level === 1){
        this.category1Id = categoryId
        this.category2Id = ''
        this.category3Id = ''
        this.spuList = []
      }
      else if(level === 2){
        this.category2Id = categoryId
        this.category3Id = ''
        this.spuList = []
      }
      else{
        this.category3Id = categoryId
        //发送请求获取数据
        this.getSpuList()
      }
    },

    //发送请求获取spuList
    async getSpuList(pager = 1){
      this.page = pager
      //解构获取发送请求所需要的数据
      let {page,limit,category3Id} = this

      //发送请求获取数据
      const result = await this.$API.spu.getList(page,limit,category3Id)
      if(result.code === 200){
        //存储获取的spuList
        this.spuList = result.data.records
        //存储总页数
        this.total = result.data.total
      }
    },

    //调整每页数量的回调
    handleSizeChange(size){
      this.limit = size
      this.getSpuList()
    },

    //添加Spu
    showAddSpuForm(){
      //显示spuForm
      this.isShowSpuForm = true

      //调用子组件的方法，发送请求
      this.$refs.spu.initAddSpuFormData(this.category3Id)
    },

    //修改Spu
    showUpdateSpuForm(row){
      //判断是否是添加  还是 修改的标识
      this.flag = row.id
      //显示spuForm
      this.isShowSpuForm = true

      //调用子组件的方法，发送请求
      this.$refs.spu.initUpdateSpuFormData(row)
    },

    //在Spu中添加Sku
    showAddSkuForm(row){
      this.isShowSkuForm = true
      //调用子组件的方法，发送请求，获取初始数据
      this.$refs.sku.initAddSkuFormData(row,this.category1Id,this.category2Id)
    },

    //子组件中发送请求成功
    successBack(){
      //如果标识存在 则为修改spu 返回当前页面
      if(this.flag){
        this.getSpuList(this.page)
      }
      //标识不存在 则为添加spu 返回第一页
      else{
        this.getSpuList()
      }
      //重置标识符
      delete this.flag
    },

    //子组件中，取消后，父组件需清空标识符
    cancelBack(){
      //重置标识符
      delete this.flag
    },

    //删除spu
    async deleteSpu(row){
      try {
        //发送请求，删除一个spu
        await this.$API.spu.remove(row.id)
        //删除成功提示
        this.$message.success('删除成功')
        //重新发送请求获取数据
        this.getSpuList(this.spuList.length>1?this.page:this.page-1)
      } catch (error) {
        this.$message.error('删除失败')
      }
    },

    //sku列表的展示
    async showSkuList(row){
      //控制sku的展示
      this.dialogVisible = true
      //存储当前的spu
      this.spu = row
      //未获取到数据前
      this.loading = true
      //发送请求获取skuList
      //根据指定的SPU的id查询所有对应的SKU的列表 getListBySpuId (spuId)
      const result = await this.$API.sku.getListBySpuId(row.id)
      if(result.code === 200){
        this.skuList = result.data
      }
      //获取到数据后
      this.loading = false
    },

    //关闭dialog之前调用的回调
    handleClose(down){
      //控制sku的展示
      this.dialogVisible = false
      //重置数据
      this.loading = true
      this.skuList = []
    }
  },
  watch:{
    //监视isShowSkuForm 使三级分类在显示SkuForm时候不可用
    isShowSkuForm:{
      handler(newVal,oldVal){
        this.isShowList = !newVal
      }
    },
    //监视isShowSkuForm 使三级分类在显示SpuForm时候不可用
    isShowSpuForm:{
      handler(newVal,oldVal){
        this.isShowList = !newVal
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
