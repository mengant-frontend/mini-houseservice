import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    img_list: [],
    max: 1,
    type: 'avatar_list'
  },
  onLoad(query) {
    let max = query.max || 1
    let type = query.type || 'avatar_list'
    this.setData({
      max: max,
      type: type
    })
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  async takingPhoto() {
    const ctx = wx.createCameraContext()

    let takePhoto = ctx.takePhoto.bind(ctx)
    let wx_res = await app.asyncApi(takePhoto, {
      quality: 'high'
    })
    if (!wx_res.success) {
      app._error(wx_res.msg)
      return
    }
    await app.asyncApi(wx.showLoading, {
      title: '上传中...',
      mask: true
    })
    let server_res = await app._uploadFile({
      filePath: wx_res.tempImagePath
    })
    await app.asyncApi(wx.hideLoading)

    if (!server_res.success) {
      app._error(server_res.msg)
      return
    }
    let img_list = app._deepClone(this.data.img_list)
    let img = {
      id: server_res.data.id,
      path: wx_res.tempImagePath,
      loaded: true,
      error: false
    }
    img_list = img_list.concat([img])

    this.setData({
      img_list: img_list
    })
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    await app.sleep()
  },
  goBack() {
    let img_list = app._deepClone(this.data.img_list)
    let type = this.data.type
    app.global_data[type + '_list'] = img_list
    wx.navigateBack()
  }
})
