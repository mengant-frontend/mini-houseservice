import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      get_guid_img: '/api/v1/guid/list'
    },
    list: [],
    view_w: 0,
    view_h: 0,
    margin_left: 0,
    margin_right: 0
  },

  async onLoad() {
    let res = await app.get({
      url: this.data.api_url.get_guid_img
    })
    if (res.success) {
      let list = []
      res.data.forEach(item => {
        list.push(item.url)
      })
      // 没有测试数据debug
      if (list.length === 0) {
        list.push('/images/avatar.jpg')
      }
      this.setData({ list })
    } else {
      // server guid 请求失败
      await app.reLaunchApp('server_api')
    }
  },

  // 进入首页
  comeInto() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 让图片按原比例铺满窗口
  imgLoad({ detail }) {
    let ratio = detail.width / detail.height
    let system_info = app.global_data.system_info
    let window_w = system_info.windowWidth * 2
    let window_h = system_info.windowHeight * 2
    let view_w = window_w
    let view_h = view_w / ratio
    let margin_left = 0
    let margin_top = 0
    if (view_h < window_h) {
      view_h = window_h
      view_w = ratio * view_h
      margin_left = (view_w - window_w) / 2
    } else {
      margin_top = (view_h - window_h) / 2
    }
    this.setData({
      view_w,
      view_h,
      margin_left,
      margin_top
    })
  }
})