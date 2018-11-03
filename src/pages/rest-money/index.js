import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    has_shop: '',
    shop_id: 0,
    detail: {}
  },
  onLoad() {
    let shop_id = app.global_data.shop_id || 0
    let has_shop = false
    if(Number(shop_id) > 0){
      has_shop = true
    }
    this.setData({
      has_shop,
      shop_id
    })
    this.getBalance()
  },
  async getBalance() {
    let server_res = await app.get({
      url: '/api/v1/withdraw/balance'
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      detail: data
    })
  }
})
