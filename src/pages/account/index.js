import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    detail: {},
    has_shop: true
  },
  onLoad() {
    this.observerShopId()
    this.loadData()
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  async loadData() {
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.get({
      url: '/api/v1/center/info'
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      detail: data
    })
  },
  //监听shop_id的变化
  observerShopId() {
    let that = this
    this.checkHasShop(app.global_data.shop_id)
    Object.defineProperty(app.global_data, 'shop_id', {
      set(val) {
        that.checkHasShop(val)
        return val
      }
    })
  },
  //判断当前账号是否商家
  checkHasShop(shop_id) {
    let has_shop = false
    if (shop_id && Number(shop_id) > 0) {
      has_shop = true
    }
    this.setData({
      has_shop: has_shop
    })
  },
  goTo(e) {
    let { currentTarget: { dataset: { url } } } = e
    wx.navigateTo({
      url: url
    })
  }
})
