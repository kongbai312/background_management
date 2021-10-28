<template>
  <!-- <el-tooltip :content="title" placement="top-start">
    <el-button v-bind="$attrs" v-on="$listeners"></el-button>
  </el-tooltip> -->
  <a :title="title" href="javascript:;">
    <el-button v-bind="$attrs" v-on="$listeners"></el-button>
  </a>
</template>

<script>
export default {
    name:'',
    props:['title']
};
</script>

<style>
a{
  margin:0 5px;
}
</style>
