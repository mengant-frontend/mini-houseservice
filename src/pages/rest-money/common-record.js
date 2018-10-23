import regeneratorRuntime from '../../lib/runtime'
import { size } from '../../common/constant'
const app = getApp()
Page({
  data: {
    list: [],
    is_end: false,
    loading: false,
    page: 1
  },
  onLoad() {
    this.getList(1)
  },
  async onPullDownRefresh() {
    await this.getList(1)
    wx.stopPullDownRefresh()
  },
  onReachBottom() {
    let page = this.data.Page
    this.getList(page + 1)
  },
  async getList(page) {
    await app.asyncApi(wx.showNavigationBarLoading)
    this.setData({
      loading: true
    })
    let server_res = await app.get({
      url: '/api/v1/payments',
      data: {
        page: page,
        size: size
      }
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      this.setData({
        loading: false
      })
      return
    }
    let list = app._deepClone(this.data.list)
    let new_list = data.data
    if (page > 1) {
      new_list = list.concat(new_list)
    }
    let is_end = false
    if (new_list.length >= data.total) {
      is_end = true
    }
    this.setData({
      is_end: is_end,
      loading: false,
      list: new_list,
      page: page
    })
  }
})
