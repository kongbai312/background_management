import request from "@/utils/request"

export default {
  //GET /admin/product/baseTrademark/{page}/{limit}
  //获取分页列表
  getPageList(page,limit){
    return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
  },
  //DELETE /admin/product/baseTrademark/remove/{id}
  //删除品牌
  delete(id){
    return request.delete(`/admin/product/baseTrademark/remove/${id}`)
  },

  //PUT /admin/product/baseTrademark/update
  //POST /admin/product/baseTrademark/save
  //添加或修改品牌
  //请求体
  // {
  //   "id": 0,       //添加的时候不需要id
  //   "logoUrl": "string",
  //   "tmName": "string"
  // }
  addOrUpdate(trademark){
    if(trademark.id){
      return request.put('/admin/product/baseTrademark/update',trademark)
    }
    else{
      return request.post('/admin/product/baseTrademark/save',trademark)
    }
  },

  //获取所有的品牌列表
  // GET /admin/product/baseTrademark/getTrademarkList
  getList(){
    return request.get('/admin/product/baseTrademark/getTrademarkList')
  }
}
