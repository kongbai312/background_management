import request from "@/utils/request"

export default {
//GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
//根据选中三级分类后，获取平台属性列表
getList(category1Id,category2Id,category3Id){
  return request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
},

//DELETE /admin/product/deleteAttr/{attrId}
//根据ID删除某个平台属性
delete(attrId){
  return request.delete(`/admin/product/deleteAttr/${attrId}`)
},

//POST /admin/product/saveAttrInfo
//添加或修改属性
addOrUpdate(attr){
  return request.post('/admin/product/saveAttrInfo',attr)
}

//GET /admin/product/getAttrValueList/{attrId}
//根据某个ID获取属性和属性值列表，这里暂时不用
}
