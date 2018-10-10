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
  onReady(){
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
  async chooseImg(){
    let res = new Promise(resolve => {
      wx.chooseImage({
        count: 4,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        
      })
    })
  },
  //获取用户信息
  bindGetUserInfo(){
    console.log(arguments)
  }
})