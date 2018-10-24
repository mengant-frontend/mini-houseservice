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
    let res = await app.get({
      url: this.data.api_url.get_guid_img
    })
    if (res.success) {
      let list = []
      res.data.forEach(item => {
        list.push(item.url)
      })
      this.setData({ list })
    } else { // 出错处理debug
      console.log(res)
    }
    wx.hideNavigationBarLoading()
  },

  // 进入首页
  comeInto() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})