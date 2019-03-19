import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    detail: {},
    store_id: 0
  },
  onLoad() {
    this.setData({
      store_id: app.global_data.shop_id
    })
    this.loadData()
  },
  async onPullDownRefresh() {
    await this.loadData()
    wx.stopPullDownRefresh()
  },
  async loadData() {
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/house/api/v1/shop/info/edit'
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      detail: data
    })
  },
  goToEdit() {
    wx.navigateTo({
      url: '/pages/shop/edit'
    })
  }
})
