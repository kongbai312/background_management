<template>
  <div>
    <el-form :inline="true" :model="cForm" class="demo-form-inline" :disabled="!isShowList">
      <el-form-item label="一级分类">
        <el-select v-model="cForm.category1Id" placeholder="请选择" @change="changeCategory1">
          <el-option :label="c1.name" :value="c1.id" v-for="(c1) in categoryList1" :key="c1.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select v-model="cForm.category2Id" placeholder="请选择" @change="changeCategory2">
          <el-option :label="c2.name" :value="c2.id" v-for="(c2) in categoryList2" :key="c2.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select v-model="cForm.category3Id" placeholder="请选择" @change="changeCategory3">
          <el-option :label="c3.name" :value="c3.id" v-for="(c3) in categoryList3" :key="c3.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'CategorySelector',
  props:['isShowList'],
  data() {
    return {
      cForm:{
        category1Id:'',
        category2Id:'',
        category3Id:''
      },
      categoryList1:[],
      categoryList2:[],
      categoryList3:[],
    }
  },
  mounted(){
    this.getCategory1List()
  },
  methods: {
    //获取一级分类列表
    async getCategory1List(){
      //发送请求获取数据
      const result = await this.$API.category.getCategory1()
      if(result.code === 200){
        this.categoryList1 = result.data
      }
    },

    //根据一级分类，获取二级分类
    async changeCategory1(category1Id){
      //发送请求前，先清空二三级数据，防止一级分类做修改时，二三级分类仍有数据
      this.cForm.category2Id=''
      this.cForm.category3Id=''
      this.categoryList2=[]
      this.categoryList3=[]

      //向父组件传递
      this.$emit('changeCategory',{categoryId:category1Id,level:1})

      //发送请求获取数据
      const result = await this.$API.category.getCategory2(category1Id)
      if(result.code === 200){
        this.categoryList2 = result.data
      }
    },

    //根据二级分类，获取三级分类
    async changeCategory2(category2Id){
      //发送请求前，先清空三级数据，防止二级分类做修改时，三级分类仍有数据
      this.cForm.category3Id=''
      this.categoryList3=[]

      //向父组件传递
      this.$emit('changeCategory',{categoryId:category2Id,level:2})

      //发送请求获取数据
      const result = await this.$API.category.getCategory3(category2Id)
      if(result.code === 200){
        this.categoryList3 = result.data
      }
    },

    //三级分类选择时，下面会显示数据
    changeCategory3(category3Id){
      //向父组件传递
      this.$emit('changeCategory',{categoryId:category3Id,level:3})
    }
  }
}
</script>

