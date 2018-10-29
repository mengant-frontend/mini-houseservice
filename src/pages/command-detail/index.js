import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    detail: {},
    id: 0,
    has_shop: false
  },
  async onPullDownRefresh() {
    await this.loadDetail(this.data.id)
    wx.stopPullDownRefresh()
  },
  onLoad(query) {
    let id = query.id || 0
    let has_shop = app.global_data.shop_id > 0 ? true : false
    this.setData({
      id: id,
      has_shop
    })
    this.loadDetail(id)
  },
  //加载需求详情
  async loadDetail(id) {
    if (!id || id < 1) {
      app._error('缺少id参数')
      return
    }
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/api/v1/demand',
      data: {
        id: id
      }
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    if (!(data.imgs instanceof Array)) {
      data.imgs = []
    }
    data.imgs.forEach(img => {
      img.url = img.img_url.url
    })
    this.setData({
      detail: data
    })
  },
  // 商家接单
  async getIt() {
    let id = this.data.id
    await app.asyncApi(wx.showLoading, {
      title: '接单中...',
      mask: true
    })
    let res = await app.post({
      url: '/api/v1/order/taking',
      data: {
        id: id
      }
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg } = res
    if (!success) {
      app._error(msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    await app.sleep()
    wx.redirectTo({
      url: '/pages/shop-command/index'
    })
  },
  async cancelOrder() {
    let wx_res = await app.asyncApi(wx.showModal, {
      title: '温馨提示',
      content: '请确认取消订单操作'
    })
    if (!wx_res.confirm) {
      return
    }
    let url = '/api/v1/demand/handel'
    let { detail } = this.data
    let server_res = await app.post({
      url: url,
      data: {
        id: detail.id
      }
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    wx.navigateBack()
  }
})
