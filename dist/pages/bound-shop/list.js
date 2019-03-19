import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    list: [],
    page: 1,
    load_end: false
  },
  onLoad(){
    this.getList(this.data.page)
  },
  onPullDownRefresh(){
    this.setData({
      page: 1
    })
    this.getList(1)
  },
  async onReachBottom(){
    let page = this.data.page + 1,
      load_end = this.data.load_end
    if(load_end){
      return
    }
    this.setData({
      page: page
    })
    this.getList(page, true)
  },
  async getList(page = 1, is_bottom = false){
    if(!is_bottom){
      wx.showLoading({
        mask: true
      })
    }else{
      this.setData({
        loading: true
      })
    }
    let res = await app.get({
      url: '/house/api/v1/goods/list/mini',
      data: {
        page: page,
        size: 10
      }
    })
    wx.hideLoading()
    this.setData({
      loading: false
    })
    if(!res.success){
      app._error(res.msg)
      return
    }
    let list = this.data.list,
      data = res.data,
      load_end = false
    if(page === 1){
      list = data.data || []
    }else{
      list = list.concat(data.data)
    }
    if(list.length >= data.total){
      load_end = true
    }
    this.setData({
      list: list,
      load_end: load_end
    })
  },
  goToDetail(e){
    let { currentTarget } = e,
      { dataset } = currentTarget
    if(!dataset.id){
      app._warn('无效商品ID')
      return
    }
    wx.redirectTo({
      url: "/pages/bound-shop/detail?id=" + dataset.id
    })
  }
})