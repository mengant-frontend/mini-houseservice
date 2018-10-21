import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {},

  onLoad(options) {
    this.setData({
      auth_type: options.auth_type,
      user_type: options.user_type || ''
    })
  },

  // 获取用户微信头像昵称
  async getUserInfo({ detail }) {
    let { userInfo = false, encryptedData, iv } = detail
    if (userInfo) {
      // 数据库未缓存用户信息
      if (Number(this.data.user_type) === 2) {
        let server_res = await app.post({
          url: '/api/v1/user/info',
          data: { encryptedData, iv }
        })
        // server userinfo 请求失败
        if (!server_res.success) {
          await app.reLaunchApp('server_api')
        }
      }
      app.global_data.user_info = userInfo
      await app.asyncApi(wx.redirectTo, {
        url: '/pages/welcome/index'
      })
    }
  },

  // 打开设置
  async openSetting() {
    let res = await app.asyncApi(wx.openSetting)
    if (res.success) {
      if (res.authSetting['scope.userLocation']) {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    }
  }
})