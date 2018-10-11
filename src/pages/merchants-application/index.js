//async 需要显式引入regeneratorRuntime
import regeneratorRuntime from '../../lib/runtime'
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
    step_current: 1,

    //经营类型
    business_activities: [{
      title: '家政',
      type: 2
    }, {
      title: '维修',
      type: 1
    }],
    //商家图片
    photo_list: [],
    //默认的服务类型
    type_text: '家政',
    //form data
    form_data: {
      type: 2,
      province: '广东省',
      city: '广州市',
      area: '天河区'
    },

  },
  onReady() {
    this.checkStatus()
  },
  //检查当前状态
  async checkStatus(){
    // Todo 对接检查当前状态接口
    let server_res = await app.get({
      url: '/check/status'
    })
    let { success, data } = server_res
    if(!success){
      app._error(data.msg)
      return 
    }
  },
  //处理表单数据
  updateFormData(e) {
    let { currentTarget, detail } = e
    let { dataset } = currentTarget
    let form_key = dataset.form_key
    let value = detail.value
    let form_data = app._deepClone(this.data.form_data)
    let other_data = {}
    switch (form_key) {
      case 'name':
      case 'address':
      case 'phone':
      case 'phone_sub':
      case 'id_number':
        form_data[form_key] = value
        break
      case 'type':
        let type = Number(value)
        let business_activities = this.data.business_activities
        business_activities.forEach(business => {
          if (business.type === type) {
            other_data.type_text = business.title
          }
        })
        form_data[form_key] = type
        break
      case 'services_region':
        form_data.province = value[0]
        form_data.city = value[1]
        form_data.area = value[2]
        break
      case 'head_url':
        break
      case 'imgs':
        break;
      default: 
        throw new Error('form_key 无效')
    }
    this.setData({
      form_data: form_data,
      ...other_data
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
    if (!wx_res.success) {
      //失败原因包括用户取消了操作
      console.error('wx: chooseImage api 调用失败')
      return
    }
    let photo_list = app._deepClone(this.data.photo_list)
    this.setData({
      photo_list: photo_list.concat(wx_res.tempFiles)
    })
    let promises = []
    wx_res.tempFiles.forEach(file => {
      // Todo 上传接口
      promises.push(
        app.uploadFile({
          url: '/test',
          filePath: file.path,
          name: 'file'
        })
      )
    })
    let server_promises = await Promise.all(promises)
    server_promises.forEach((promise, index) => {
      wx_res.tempFiles[index].loaded = true
      if(promise.success){
        wx_res.tempFiles[index].id = promise.id
      }else{
        wx_res.tempFiles[index].error = true
      }
    })
    this.setData({
      photo_list: photo_list.concat(wx_res.tempFiles)
    })
  },
  //删除图片
  async deleteImg(e) {
    let { currentTarget: { dataset: { index } } } = e
    let photo_list = app._deepClone(this.data.photo_list)
    //如果上传过程中失败，则直接删除
    if(photo_list[index].error){
      photo_list.splice(index, 1)
      this.setData({
        photo_list: photo_list
      })
      return
    }else{
      photo_list[index].loaded = false
    }
    //展示spining
    await new Promise(resolve => {
      this.setData({
        photo_list: photo_list
      }, resolve)
    })
    //Todo 删除接口
    let server_res = await app.post({
      url: '/test',
      data: {
        id: photo_list[index].id
      }
    })
    if(!server_res.success){
      photo_list[index].loaded = true
    }else{
      photo_list.splice(index, 1)
    }
    this.setData({
      photo_list: photo_list
    })
  }
})