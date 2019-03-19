import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    form_data: {}
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  bindFormChange(e) {
    let { form_key, value } = app._bindFormChange(e)
    this.updateFormData(form_key, value)
  },
  updateFormData(form_key, value) {
    let form_data = app._deepClone(this.data.form_data)
    form_data[form_key] = value
    this.setData({
      form_data: form_data
    })
  },
  async saveMessage() {
    let form_data = app._deepClone(this.data.form_data)
    if (!form_data.msg || !form_data.phone) {
      return
    }
    await app.asyncApi(wx.showLoading, {
      title: '提交中...'
    })
    let server_res = await app.post({
      url: '/house/api/v1/message/save',
      data: form_data
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    app._success('已提交')
    wx.switchTab({
      url: '/pages/account/index'
    })
  }
})
