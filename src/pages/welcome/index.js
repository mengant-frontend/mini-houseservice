import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取引导图
      get_guid_img: '/api/v1/guid/list'
    },
    list: []
  },
  
  async onLoad() {
    wx.showNavigationBarLoading()
    await app.asyncApi(wx.setNavigationBarTitle, {
      title: '登录中...'
    })
    let res = await app.get({
      url: this.data.api_url.get_guid_img
    })
    wx.hideNavigationBarLoading()
    
    if (!res.success) {
      // this.comeInto()
      return
    }
    await app.asyncApi(wx.setNavigationBarTitle, {
      title: '欢迎'
    })
    let list = []
    res.data.forEach(item => {
      list.push(item.url)
    })
    if (!list.length) {
      this.comeInto()
      return
    }
    this.setData({
      list
    })
  },
  
  // 进入首页
  comeInto() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})