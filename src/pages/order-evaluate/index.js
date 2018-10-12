import regenratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    order_id: '',
    rate: 0,
    remark: '',
    order_data: {}
  },
  onLoad(query){
    if(!query.order_id){
      app._warn('缺少order_id')
    }else{
      this.setData({
        order_id: query.order_id
      })
      this.loadOrder(query.order_id)
    }
  },
  async loadOrder(id){
    let server_res = await app.get({
      url: '/test',
      data: {
        id: id
      }
    })
    let { success, msg, data } = server_res
    if(!success){
      app._error(msg)
      return
    }
    this.setData({
      order_data: data
    })

  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  },
  updateRate(e){
    let index = e.detail.index
    this.setData({
      rate: index
    })
  },
  updateRemark(e){
    const value = e.detail.value
    this.setData({
      remark: value
    })
  },
  async confirm(){
    let { rate, remark, order_id } = this.data
    if(!rate){
      app._warn('请对本次服务进行打分')
      return 
    }
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    // 对接提交接口
    let server_res = await app.post({
      url: '/test',
      data: {
        rate: rate, 
        remark,
        order_id: order_id
      }
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if(!success){
      app._error(msg)
      return 
    }
    app._success('感谢您的支持')
    // Todo 跳转
  }
})