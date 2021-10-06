<template>
  <div>
    <el-card>
      <CategorySelector @changeCategory="changeCategory"></CategorySelector>
    </el-card>
    <el-card style="margin-top:20px;">
      <div v-show="isShowList">
        <el-button type="primary" icon="el-icon-plus" @click="showAddDiv" :disabled="!category3Id">添加属性</el-button>
        <el-table
        :data="attrList"
        border
        style="width: 100%;">
          <el-table-column
            align="center"
            label="序号"
            width="80"
            type="index">
          </el-table-column>
          <el-table-column
            prop="attrName"
            label="属性名称"
            width="150">
          </el-table-column>
          <el-table-column
            label="属性值列表"
            width="width">
            <template slot-scope="{row,$index}">
              <el-tag v-for="(attrValue) in row.attrValueList" :key="attrValue.id" type="info">{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="150">
            <template slot-scope="{row,$index}">
              <HintButton icon="el-icon-edit" title="修改属性" size="mini" type="warning" @click="showUpdateDiv(row)"></HintButton>
              <HintButton icon="el-icon-delete" title="删除属性" size="mini" type="danger"></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowList">

        <el-form :model="attrForm" :inline="true" >
          <el-form-item label="属性名">
            <el-input v-model="attrForm.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>

        <el-button type="primary" icon="el-icon-plus" :disabled="!attrForm.attrName" @click="addAttrValue">添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>

        <el-table
          :data="attrForm.attrValueList"
          border
          style="width: 100%;margin:20px 0;">
          <el-table-column
            align="center"
            label="序号"
            width="80"
            type="index">
          </el-table-column>
          <el-table-column
            label="属性值名称"
            width="width">
            <template slot-scope="{row,$index}">
              <el-input :ref="$index" v-model="row.valueName" placeholder="请输入属性值名称"
              v-if="row.isEdit" @blur="toLook(row)"
              @keydown.enter.native="toLook(row)" size="mini"></el-input>
              <span v-else @click="toEdit(row,$index)" style="display:block;width:100%;height:100%;">{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="width">
            <template slot-scope="{row,$index}">
              <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="attrForm.attrValueList.splice($index,1)">
                <HintButton slot="reference" icon="el-icon-delete" title="删除" size="mini" type="danger"></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep"
export default {
  name: 'Attr',
  data() {
    return {
      category1Id:'',
      category2Id:'',
      category3Id:'',
      attrList:[],

      isShowList:true,     //是否显示添加或修改界面

      //收集表单数据
      attrForm:{
        "attrName": "",
        "attrValueList": [
          // {
          //   "attrId": 0,
          //   "valueName": ""
          // }
        ],
        "categoryId": 0,
        "categoryLevel": 3,
        // "id": 0
      }
    }
  },
  methods: {
    changeCategory({categoryId,level}){
      if(level===1){
        this.category2Id = ''
        this.category3Id = ''
        this.attrList = []
        this.category1Id = categoryId
      }
      else if(level===2){
        this.category3Id = ''
        this.attrList = []
        this.category2Id = categoryId
      }
      else{
        this.category3Id = categoryId
        //发送请求获取attrList
        this.getAttrList()
      }
    },

    //获取attrList
    async getAttrList(){
      let {category1Id,category2Id,category3Id} = this
      const result = await this.$API.attr.getList(category1Id,category2Id,category3Id)
      if(result.code === 200){
        this.attrList = result.data
      }
    },

    //点击添加按钮，到达添加界面
    showAddDiv(){
      this.isShowList = false
      //清空attrForm数据
      this.attrForm = {
        "attrName": "",
        "attrValueList": [

        ],
        "categoryId": this.category3Id,
        "categoryLevel": 3,
        // "id": 0
      }
    },

    //点击添加属性值按钮
    addAttrValue(){
      //给attrValueList新建一个没有数据的对象，以便用户输入
      this.attrForm.attrValueList.push({
        "attrId":this.attrForm.id,
        "valueName": "",
        "isEdit":true
      })
    },

    //点击修改按钮，实现修改属性
    showUpdateDiv(row){
      //显示修改界面
      this.isShowList = false
      //使用深拷贝，防止原有的数据修改
      this.attrForm = cloneDeep(row)
      //给每个属性添加isEdit
      this.attrForm.attrValueList.forEach(item=>{
        this.$set(item,'isEdit',false)
      })
    },

    //input跳转到span
    toLook(row){
      // input在切换为span之前要判断数据合法性
			// 	1、数据是不是空的
      let valueName = row.valueName
      if(!valueName.trim()){//如果valueName为空，则进入判断
        //进行提示
        this.$message.info('输入的属性值不能为空')
        //进行数据清空
        valueName = ''
        return
      }
			// 	2、除了自己以外，输入的数据是不是和其它的属性值名称重复
      let isRepeat = this.attrForm.attrValueList.some(item => {
        //排除自己以外的数据
        if(item !== row){
          return item.valueName === valueName
        }
      })

      //重复后的执行结果
      if(isRepeat){
        //进行提示
        this.$message.info('输入的属性值不能重复')
        //进行数据清空
        valueName = ''
        return
      }

      row.isEdit = false
    },
    //span跳转到input
    toEdit(row,index){
      row.isEdit = true
      //获取焦点
      // this.$refs[index].focus();//这样子获取数据太早，提取不到，得用$nextTick

      this.$nextTick( () => {
        this.$refs[index].focus()

      })
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
