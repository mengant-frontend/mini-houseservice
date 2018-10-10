//async 需要显式引入regeneratorRuntime
const regeneratorRuntime = require('../../lib/runtime')
const app = getApp()
Page({
  data: {
    // steps
    steps_list: [{
      title: '填写资料',
    }, {
      title: '审核中',
    }, {
      title: '审核结果'
    }],
    step_status: '',
    step_current: 0,

    //经营类型
    business_activities: [{
      title: '家政'
    }, {
      title: '维修'
    }],
    business_activities_index: 0,
    //服务区域
    services_region: ['广东省', '广州市', '天河区'],

    //商家图片
    photo_list: []
  },
  onReady() {
    app.get({
      url: '/test'
    })
  },
  //处理经营类型
  updateBusinessActivities({ detail: { value } }) {
    this.setData({
      business_activities_index: value
    })
  },
  //处理服务区域
  updateServicesRegion({ detail: { value } }) {
    this.setData({
      services_region: value
    })
  },
  //选择图片
  async chooseImg() {
    //最多选四个
    let rest = 4 - this.data.photo_list.length
    let wx_res = await app.asyncApi(wx.chooseImage, {
      count: rest,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    })
    if(!wx_res.success){
      //失败原因包括用户取消了操作
      console.error('wx: chooseImage api 调用失败')
      return
    }
    let photo_list = app._deepClone(this.data.photo_list)
    this.setData({
      photo_list: photo_list.concat(wx_res.tempFiles)
    })
  },
  //删除图片
  deleteImg(e){
    let { currentTarget: { dataset: { index } } } = e
    let photo_list = app._deepClone(this.data.photo_list)
    photo_list.splice(index, 1)
    this.setData({
      photo_list: photo_list
    })
  }
})