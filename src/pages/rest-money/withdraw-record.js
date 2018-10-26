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
  async onReachBottom() {
    let page = this.data.Page
    await this.getList(page + 1)
  },
  async getList(page) {
    this.setData({
      loading: true
    })
    let server_res = await app.get({
      url: '/api/v1/withdraws',
      data: {
        page: page,
        size: size
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
    let list = app._deepClone(this.data.list)
    let new_list = data.data
    new_list.forEach(item => {
      if (Number(item.type) === 1) {
        item.type_text = '保证金'
      } else {
        item.type_text = '余额'
      }
      if (Number(item.state) === 1) {
        // 未支付
        if (!item.pay_id || Number(item.pay_id) == 99999) {
          item.state_text = '处理中'
        } else {
          item.state_text = '已到账'
        }
      } else {
        item.state_text = '已拒绝'
      }
    })
    if (page > 1) {
      new_list = list.concat(new_list)
    }
    let is_end = false
    if (new_list.length >= data.total) {
      is_end = true
    }
    this.setData({
      is_end,
      page: page,
      list: new_list,
      loading: false
    })
  }
})
