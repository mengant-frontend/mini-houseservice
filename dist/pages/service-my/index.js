import regeneratorRuntime from '../../lib/runtime'
import { size } from '../../common/constant'
const app = getApp()
Page({
  data: {
    list: [],
    total: 0,
    page: 1,
    bottom_loading: false,
    can_load_more: true
  },
  onLoad() {
    this.loadData(1)
  },
  async onPullDownRefresh() {
    await this.loadData(1)
    wx.stopPullDownRefresh()
  },
  onReachBottom() {
    let page = this.data.page + 1
    let can_load_more = this.data.can_load_more
    if (can_load_more) {
      this.loadData(page)
    }
  },
  async loadData(page) {
    page = page || 1
    if (page > 1) {
      this.setData({
        bottom_loading: true
      })
    }
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/house/api/v1/shop/service/list',
      data: {
        page: page,
        size: size
      }
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let list = this.data.list
    let new_list = data.data, total = data.total
    if (page > 1) {
      new_list = list.concat(new_list)
    }
    let can_load_more = this.updateCanLoadMore(new_list, total)
    new_list.forEach(item => {
      item.price = app._toMoney(item.price)
    })
    this.setData({
      list: new_list,
      total: total,
      page: page,
      bottom_loading: false,
      can_load_more: can_load_more
    })
  },
  //
  updateCanLoadMore(list, total) {
    let can_load_more = true
    if (list.length >= total) {
      can_load_more = false
    }
    return can_load_more
  },
  async deleteService(e) {
    let wx_res = await app.asyncApi(wx.showModal, {
      title: '温馨提示',
      content: '是否确认删除该服务?',
      confirmText: "确认",
      cancelText: "取消",
    })
    if (!wx_res.confirm) {
      return
    }
    let { currentTarget: { dataset: { id } } } = e
    let server_res = await app.post({
      url: '/house/api/v1/shop/service/delete',
      data: {
        id: id
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let list = app._deepClone(this.data.list)
    let total = this.data.total
    let index
    list.forEach((item, i) => {
      if (item.id === id) {
        index = i
      }
    })
    if (index !== undefined) {
      total = total - 1
      list.splice(index, 1)
    }
    let can_load_more = this.updateCanLoadMore(list, total)
    this.setData({
      total: total,
      list: list,
      can_load_more: can_load_more
    })
  },
  addService(){
    wx.navigateTo({
      url: '/pages/service-release/index'
    })
  }
})
