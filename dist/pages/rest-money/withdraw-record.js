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
      url: '/house/api/v1/withdraws',
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
    if(!Object.keys(data).length){
      data = {
        "total": 0,
        "current_page": 1,
        "last_page": 1,
        "data": []
      }
    }
    let new_list = data.data
    new_list.forEach(item => {
      if (Number(item.type) === 1) {
        item.type_text = '保证金'
      } else {
        item.type_text = '余额'
      }
      item.state = Number(item.state)
      switch (item.state) {
        case 1:
          item.state_text = '处理中'
          item.className = 'process'
          break
        case 2:
          item.state_text = '已到账'
          item.className = 'success'
          break
        case 3:
          item.state_text = '已拒绝'
          item.className = 'fail'
          break
        default:
        
      }
    })
    if (page > 1) {
      new_list = list.concat(new_list)
    }
    let is_end = false
    if (new_list.length >= data.total) {
      is_end = true
    }
    new_list.forEach(item => {
      item.money = app._toMoney(item.money)
    })
    this.setData({
      is_end,
      page: page,
      list: new_list,
      loading: false
    })
  }
})
