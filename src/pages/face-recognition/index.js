import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    wx_res: ''
  },
  onLoad(){

  },
  async takePhoto() {
    const ctx = wx.createCameraContext()
    let wx_res = await app.asyncApi(ctx.takePhoto,{
      quality: 'high'
    })
    let { success } = wx_res
    this.setData({
      wx_res: JSON.stringify(wx_res)
    })
  },
  // 人脸识别
  async recognition(path){
    let server_res = await app.asyncApi(wx.uploadFile, {
      url: '/api/v1/image/search',
      name: 'file',
      filePath: path,
      formData: { 
        city: '广东省广州市'
      }
    })
  },
  handleError(){

  },

})