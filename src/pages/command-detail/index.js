import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    detail: {},
    id: 0
  },
  async onPullDownRefresh(){
    await this.loadDetail(this.data.id)
    wx.stopPullDownRefresh()
  },
  onLoad(query){
    let id = query.id || 0
    this.setData({
      id: id
    })
    this.loadDetail(id)
  },
  //加载需求详情
  async loadDetail( id ){
    if(!id || id < 1){
      app._error('缺少id参数')
      return
    }
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.get({
      url: '/api/v1/demand',
      data:{
        id: id
      }
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if(!success){
      app._error(msg)
      return
    }
    if(!(data.imgs instanceof Array)){
      data.imgs = []
    }
    data.imgs.forEach(img => {
      // img.url = img.img_url.url
      img.url = 'https://gss1.bdstatic.com/9vo3dSag_xI4khGkpoWK1HF6hhy/baike/crop%3D0%2C2%2C600%2C395%3Bc0%3Dbaike80%2C5%2C5%2C80%2C26/sign=be8449909516fdfacc239cae89bfa066/d009b3de9c82d158d5d4eb0a880a19d8bc3e4232.jpg'
    })    
    this.setData({
      detail: data
    })
  }
})