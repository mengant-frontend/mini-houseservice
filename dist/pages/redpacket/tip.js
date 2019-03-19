Page({
  data: {},
  onLoad() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  onShareAppMessage() {
    let obj = {
      title: '盟蚁家政维修平台',
      path: '/pages/index/index'
    }
    return obj
  },
})
