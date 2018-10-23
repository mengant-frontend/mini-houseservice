import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    has_shop: '',
    shop_id: 0,
    detail: {}
  },
  onLoad() {
    this.getStore()
    this.getBalance()
  },
  // 获取店铺信息，判断有没有店铺
  async getStore() {
    let server_res = await app.get({
      url: '/api/v1/shop/info'
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let has_shop = true
    let shop_id = 0
    if (Object.keys(data)
      .length === 0) {
      has_shop = false
    } else if (Number(data.state) < 4) {
      has_shop = false
    } else {
      shop_id = data.id
    }
    this.setData({
      has_shop: has_shop,
      shop_id: shop_id
    })
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
