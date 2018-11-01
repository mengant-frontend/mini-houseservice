Page({
  data: {},
  onLoad() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  onShareAppMessage() {
    let obj = {
      title: '久房通',
      path: '/pages/index/index'
    }
    return obj
  },
})
