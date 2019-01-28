Page({
  data: {
    sign_in: true
  },
  viewAll(){
    wx.navigateTo({
      url: '/pages/bound-shop/list'
    })
  }
})