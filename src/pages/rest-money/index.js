import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    has_shop: false,
    detail: {}
  },
  onLoad(){
    let shop_id = app.global_data.shop_id
    let has_shop = false
    if(shop_id && Number(shop_id) > 0){
      has_shop = true
    }
    this.setData({
      has_shop: has_shop
    })
  },
  async loadData(){
    let server_res = await app.get({
      url: '/',
      data: {}
    })
    let { success, msg, data } = server_res
    if(!success){
      app._error(msg)
      return
    }
    this.setData({
      detail: data
    })
  }
})