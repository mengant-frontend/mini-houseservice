import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    banner_imgs: [],
    detail_imgs: [],
    id: '',
    detail: {},
    hide_param: true,
    comment: {}
  },
  onLoad(query){
    let id = query.id
    this.setData({
      id: id
    })
    this.getDetail()
    this.loadComment()
  },
  onPullDownRefresh(){
    this.getDetail()
  },
  async getDetail(){
    let id = this.data.id
    if(!id){
      app._error('无效商品ID')
      return
    }
    wx.showLoading({
      mask: true
    })
    let res = await app.get({
      url: '/api/v1/goods/info',
      data: {
        id: id
      }
    })
    wx.hideLoading()
    if(!res.success){
      app._error(res.msg)
      return
    }
    let { data } = res
    let imgs = data.imgs || [], banner_imgs = [], detail_imgs = []
    imgs.forEach(item => {
      let img = {
        url: item.img_url.url
      }
      if(item.type === 1){
        banner_imgs.push(img.url)
      }else if(item.type === 2){
        detail_imgs.push(img.url)
      }
    })
    this.setData({
      detail: data,
      banner_imgs: banner_imgs,
      detail_imgs: detail_imgs
    })
  },
  showParam(){
    this.setData({
      hide_param: false
    })
  },
  hideParam(){
    this.setData({
      hide_param: true
    })
  },
  //加载用户评论
  async loadComment(){
    let id = this.data.id
    if(!id){
      app._error('无效商品ID')
      return
    }
    let res = await app.get({
      url: '/api/v1/goods/comment',
      data: {
        id: id,
        page: 1,
        size: 1
      }
    })
    if(!res.success){
      app._error(res.msg)
      return
    }
    let data = res.data.data || [],
      comment_total = res.data.total || 0
    this.setData({
      comment: data[0] || {},
      comment_total: comment_total
    })
  },
  //去兑换
  goToExchange(){
  
  },
  //查看更多评论
  goToMoreComment(){
    wx.navigateTo({
      url: '/pages/'
    })
  }
})