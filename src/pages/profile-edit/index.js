import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    form_data: {
      province: '广东省',
      city: '广州市',
      area: '天河区'
    }
  },
  //下拉事件
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  },
  //获取地理位置
  async chooseLocation(){
    await app.asyncApi(wx.showLoading, {
      title: '正在启动'
    })
    let wx_res = await app.asyncApi(wx.chooseLocation)
    await app.asyncApi(wx.hideLoading)
    if(!wx_res.success){
      app._error(wx_res.msg)
      return
    }
    this.updateFormData('address', wx_res.address)
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
    switch (form_key) {
      case 'name':
      case 'phone':
      case 'address':
      case 'remark':
        form_data[form_key] = value
        break
      case 'services_region':
        form_data.province = value[0]
        form_data.city = value[1]
        form_data.area = value[2]
        break
      default: 
        throw new Error('form_key 无效')
    }
    this.setData({
      form_data: form_data,
    })
  },
  //获取数据
  async getData(){
    //Todo 对接接口
    let server_res = await app.get({
      url: '/test'
    })
    let { data, success, msg } = server_res
    if(!success){
      app._error(msg)
      return 
    }
    this.setData({
      form_data: data
    })
  },
  async confirm(){
    let { form_data } = this.data
    let is_valid = true
    Object.keys(form_data).forEach(key => {
      if(!form_data[key]){
        is_valid = false
      }
    })
    if(!is_valid){
      app._warn('请完善表单')
      return 
    }
    //Todo 保存接口
    let server_res = await app.post({
      url: '/test',
      data: form_data
    })
    let { success, msg } = server_res
    if(!success){
      app._error(msg)
      return 
    }
    wx.navigateBack()    
  }
})