import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    detail: {}
  },
  async onPullDownRefresh() {
    await this.loadData()
    wx.stopPullDownRefresh()
  },
  async loadData() {
    await app.asyncApi(wx.showNavigationLoading)
    let server_res = await app.get({
      url: '/api/v1/shop/info/edit'
    })
    await app.asyncApi(wx.hideNavigationLoading)
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
