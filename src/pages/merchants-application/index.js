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
    //商家头像
    avatar: {},
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
    result: false
  },
  onReady() {
    this.checkStatus()
  },
  //下拉事件
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  },
  //检查当前状态
  async checkStatus(){
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    // Todo 对接检查当前状态接口
    let server_res = await app.get({
      url: '/check/status'
    })
    await app.asyncApi(wx.hideLoading)
    let { success, data, msg } = server_res
    if(!success){
      app._error(msg)
      return 
    }
  },
  //绑定表单事件
  bindFormChange(e){
    let { currentTarget, detail } = e
    let { dataset } = currentTarget
    let form_key = dataset.form_key
    let value = detail.value
    this.updateFormData(form_key, value)
  },
  //处理表单数据
  updateFormData(form_key, value) {
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
  async chooseImage(count){
    let wx_res = await app.asyncApi(wx.chooseImage, {
      count: count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    })
    if (!wx_res.success) {
      //失败原因包括用户取消了操作
      console.error('wx: chooseImage api 调用失败')
      return
    }
    return wx_res.tempFiles
  },
  //选择头像
  async chooseAvatar(){
    let tempFiles = await this.chooseImage(1)
    if(!tempFiles) return
    let pic = tempFiles[0]
    this.setData({
      avatar: pic
    })
    
    let server_res = await app.uploadFile({
      filePath: pic.path,
    })
    let { data, success } = server_res
    pic.loaded = true
    if(!success){
      pic.error = true
    }else{
      pic.id = data.id
    }
    this.setData({
      avatar: pic
    })
  },
  //选择图片
  async chooseImg() {
    //最多选四个
    let rest = 4 - this.data.photo_list.length
    let tempFiles = await this.chooseImage(rest)
    if(!tempFiles) return
    let photo_list = app._deepClone(this.data.photo_list)
    this.setData({
      photo_list: photo_list.concat(tempFiles)
    })
    let promises = []
    tempFiles.forEach(file => {
      promises.push(
        app.uploadFile({
          filePath: file.path,
          name: 'file'
        })
      )
    })
    let server_promises = await Promise.all(promises)
    server_promises.forEach((promise, index) => {
      tempFiles[index].loaded = true
      if(promise.success){
        tempFiles[index].id = promise.data.id
      }else{
        tempFiles[index].error = true
      }
    })
    this.setData({
      photo_list: photo_list.concat(tempFiles)
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
        id: photo_list[index].id || ' '
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
  },
  async confirm(){
    let { step_current } = this.data;
    switch(step_current){
      case 0:
        let server_res = await this.sumbit()
        //如果submit返回undefined，则为提交被暂停
        if(!server_res) return
        //如果submit返回success:false,则接口出错
        if(!server_res.success){
          app._error(server_res.msg)
          return
        }
        //提交成功后刷新页面
        this.checkStatus()
        break
      case 1:
        break
      case 2: 
        break
      default:
        throw new Error('step_current 不合法')
    }
  },
  //提交请求
  sumbit(){
    let { form_data } = this.data
    let is_valid = true
    Object.keys(form_data).forEach(key => {
      //img不校验
      if(key === 'imgs'){
        return 
      }
      if(!form_data[key]){
        is_valid = false
      }
    })
    if(!is_valid){
      app._warn('请完善您的店铺信息')
      return
    }
    return app.post({
      url: '/api/v1/shop/apply',
      data: form_data
    })
  },
  redo(){
    this.setData({
      step_current: 0,
      step_status: 'wait'
    })
  }
})