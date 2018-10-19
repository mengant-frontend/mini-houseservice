import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    list: []
  },
  onLoad(){
    this.loadList()
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  },
  //获取红包列表
  async loadList(){
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.get({
      url: '/api/v1/red/list'
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if(!success){
      app._error(msg)
      return
    }
    // 做点容错处理
    data.forEach(item => {
      item.detail = item.detail || {}
    })
    this.setData({
      list: data
    })
  }
})