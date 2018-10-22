import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    form_data: {}
  },
  bindFormChange(e) {
    let { form_key, value } = app._bindFormChange(e)
    let form_data = this.updateFormData(form_key, value)
    this.setData({
      form_data: form_data
    })
  },
  updateFormData(form_key, value) {
    let form_data = app._deepClone(this.data.form_data)
    switch (form_key) {
      case 'phone':
      case 'pwd':
        form_data[form_key] = value
        break
    }
    return form_data
  },
  async login() {
    let form_data = app._deepClone(this.data.form_data)
    if (!form_data.phone || !form_data.pwd) {
      app._warn('请输入登录账号和密码')
      return
    }
    let server_res = await app.get({
      url: '/api/v1/token/admin',
      data: form_data
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    wx.redirectTo({
      url: '/pages/face-detect/index'
    })
  }
})
