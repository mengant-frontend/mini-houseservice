import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    list: [{id: 1}]
  },
  onLoad(){
    this.loadData()
  },
  async loadData(){
    let server_res = await app.get({
      url: '/test'
    })
    let { success, msg, data } = server_res
    if(!success){
      app._error(msg)
      return
    }
    this.setData({
      list: data
    })
  },
  async readMessage(e){
    let { currentTarget: { dataset: { id }}} = e
    wx.navigateTo({
      url: '/pages/order-detail/index?id=' + id
    })
  }
})