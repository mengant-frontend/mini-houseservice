import regeneratorRuntime from '../../lib/runtime'
import moment from '../../lib/moment'
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
    let last_modified_local
    try{
      last_modified_local = wx.getStorageSync('last_modified')
    }catch(e){}
    let server_res = await app.get({
      url: '/api/v1/file/time'
    })
    if(!server_res.success){
      app._error(server_res.msg)
    }else{
      last_modified_local = last_modified_local || ''
      let last_modified_server = server_res.data.update_time
      if(!last_modified_local || moment(last_modified_local, 'YYYY-MM-DD HH:mm:SS').isBefore(last_modified_server)){
        wx.redirectTo({
          url: '/pages/term/index?type=service_term'
        })
        return
      }
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