import regeneratorRuntime from '../../lib/runtime'
import { size } from '../../common/constant'
const app = getApp()
Page({
  data: {
    list: [],
    page: 1,
    loading: false,
    is_end: false
  },
  onLoad() {
    this.loadData(1)
  },
  async onPullDownRefresh() {
    await this.loadData(1)
    wx.stopPullDownRefresh()
  },
  async onReachBottom() {
    let page = this.data.page
    await this.loadData(page + 1)
  },
  async loadData(page) {
    let list = app._deepClone(this.data.list)
    this.setData({
      loading: true
    })
    let server_res = await app.get({
      url: '/api/v1/center/msgs',
      data: {
        size: size,
        page: page
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      this.setData({
        loading: false
      })
      return
    }
    let new_list = data.data
    if (page > 1) {
      new_list = list.concat(data.data)
    }
    let is_end = false
    if (new_list.length === data.total) {
      is_end = true
    }
    this.setData({
      list: new_list,
      page: page,
      is_end: is_end,
      loading: false
    })
  },
  async readMessage(e) {
    let { currentTarget: { dataset: { index } } } = e
    let order = this.data.list[index]
    let type = order.order_type,
      id = order.order_id,
      state = order.state
    this.changeState(order.id)
    wx.navigateTo({
      url: `/pages/order-detail/index?id=${id}&type=${type}&state=${state}`
    })
  },
  async changeState(id) {
    let server_res = await app.get({
      url: '/',
      data: {
        id: id
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
  }
})
