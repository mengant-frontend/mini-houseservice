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

  async onLoad(query) {
    let { code } = query
    wx.showNavigationBarLoading()
    await app.asyncApi(wx.setNavigationBarTitle, {
      title: '加载中...'
    })
    let [ res, server_res ] = await Promise.all([app.get({
      url: this.data.api_url.get_guid_img
    }), app.get({
      url: '/api/v1/file/time',
      token_required: false
    })])
    
    wx.hideNavigationBarLoading()
    if (!res.success) {
      app._error(res.msg)
      return
    }
    await app.bindUser(code)
    if (!app.global_data.had_save_user_info){
     let res = await app.getUserInfo(2)
     if(res === false){
       return 
     }
    }
    let last_modified_local
    try{
      last_modified_local = wx.getStorageSync('last_modified')
    }catch(e){} 
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
      this.comeInto(code)
      return
    }
    this.setData({
      list
    })
  },

  // 进入首页
  comeInto(code) {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
