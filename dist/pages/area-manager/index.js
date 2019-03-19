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
      url: '/house/api/v1/token/village',
      data: form_data
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    app._success('登陆成功')
    app.global_data.village = 1
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
