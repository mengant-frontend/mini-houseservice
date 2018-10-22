import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    form_data: {
      phone: '',
      avatarUrl: '',
      nickName: '',
      address: ''
    },
    detail: [],
    default_photos: []
  },
  onLoad() {
    this.getInfo()
  },
  //获取个人信息
  async getInfo() {
    let server_res = await app.get({
      url: '/api/v1/center/info'
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let default_photos = [{
      path: data.userInfo.avatarUrl
    }]
    let detail = []
    if (data.userInfo.address) {
      detail = data.userInfo.address.split('-')
    }
    if (detail.length <= 1) {
      detail = []
    }
    this.setData({
      default_photos: default_photos,
      detail: detail,
      form_data: {
        address: data.userInfo.address,
        phone: data.userInfo.phone,
        avatarUrl: data.userInfo.avatarUrl,
        nickName: data.userInfo.nickName
      }
    })
  },
  // 更新个人信息
  async updateInfo() {
    let form_data = app._deepClone(this.data.form_data)
    if (form_data.avatarUrl.indexOf('http') !== -1) {
      delete form_data.avatarUrl
    }
    let err_msg = ''
    for (let key in form_data) {
      if (!form_data[key]) {
        switch (key) {
          case 'avatarUrl':
            err_msg = '请上传头像'
            break;
          case 'nickName':
            err_msg = '请输入昵称'
            break
          case 'phone':
            err_msg = '请输入手机号码'
            break
          case 'address':
            err_msg = '请选择区域'
            break
          default:

        }
        break
      }
    }
    if (err_msg) {
      app._error(msg)
      return
    }
    let server_res = await app.post({
      url: '/api/v1/user/update',
      data: form_data
    })
    let { success, msg } = server_res
    await app.asyncApi(wx.showToast, {
      title: "成功"
    })
    await app.sleep()
    wx.switchTab({
      url: "/pages/account/index"
    })
  },
  //绑定表单变化
  bindFormChange(e) {
    let { form_key, value } = app._bindFormChange(e)
    let form_data = this.updateFormData(form_key, value)
    let detail = app._deepClone(this.data.detail)
    if (form_key == 'region') {
      detail = value
    }
    this.setData({
      form_data,
      detail
    })
  },
  updateFormData(form_key, value) {
    let form_data = app._deepClone(this.data.form_data)
    switch (form_key) {
      case 'nickName':
      case 'phone':
        form_data[form_key] = value
        break
      case 'region':
        form_data.address = value.join('-')
        break
      case 'avatarUrl':
        let avatar = value[0]
        form_data[form_key] = avatar && avatar.id || ''
        break
      default:

    }
    return form_data
  }
})
