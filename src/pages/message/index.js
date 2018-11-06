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
    let { page, is_end } = this.data
    if(is_end) return
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
      new_list = list.concat(new_list)
    }
    let is_end = false
    if (new_list.length === data.total) {
      is_end = true
    }
    new_list.forEach(item => {
      item.money = app._toMoney(item.money)
    })
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
    let type = order.type,
      id = order.order_id,
      state = order.state
    await this.changeState(id, 2)
    wx.navigateTo({
      url: `/pages/order-detail/index?id=${id}&type=${type}&state=${state}`
    })
  },
  async changeState(id, state) {
    await app.asyncApi(wx.showLoading, {
      title: 'loading...',
      mask: true
    })
    let server_res = await app.post({
      url: '/api/v1/center/msg/handel',
      data: {
        id: id,
        state: state
      }
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return false
    }
    return true
  },
  async deleteMessage(e){
    let { currentTarget: { dataset: { index } } } = e
    let order = this.data.list[index]
    let type = order.order_type,
      id = order.order_id,
      state = order.state
    let res = await this.changeState(id, 3)
    if(!res) return
    let list = app._deepClone(this.data.list)
    list.splice(index, 1)
    this.setData({
      list: list
    })
  }
})
