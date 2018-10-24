import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    form_data: {
      money: '',
      price_remark: ''
    }
  },
  onLoad(query) {
    let { id, type, state, origin } = query
    this.setData({
      id: id,
      type: type,
      state: state,
      origin: origin
    })
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
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
      case 'money':
      case 'price_remark':
        form_data[form_key] = value
        break;
      default:
    }
    return form_data
  },
  async confirm() {
    let form_data = app._deepClone(this.data.form_data)
    if (!form_data.money) {
      app._warn('请输入修改后的价格')
      return
    }
    // 弹框
    let is_confirm = await this.prompt()
    if (!is_confirm) {
      return
    }
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let is_success = await this.ensureModify()
    if (!is_success) {
      await app.asyncApi(wx.hideLoading)
      return
    }
    is_success = await this.confirmConnection()
    if (!is_success) {
      await app.asyncApi(wx.hideLoading)
      return
    }
    is_success = await this.ensureOrder()
    await app.asyncApi(wx.hideLoading)
    if (!is_success) {
      return
    }
    let { id, state, type } = this.data
    state = state + 1
    wx.redirectTo({
      url: `/pages/order-detail/index?id=${id}&type=${type}&state=${state}`
    })
  },
  // 弹框提醒
  async prompt() {
    let wx_res = await app.asyncApi(wx.showModal, {
      title: '温馨提示',
      content: '价格修改成功后将自动确认该订单，请确认'
    })
    let { success, confirm, msg } = wx_res
    if (!success) {
      return false
    }
    return confirm
  },
  // 确定更改价格
  async ensureModify() {
    let { id, type, state, form_data } = this.data
    let server_res = await app.post({
      url: '/api/v1/order/price/update',
      data: {
        id: id,
        money: form_data.money,
        price_remark: form_data.price_remark
      }
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return false
    }
    return true
  },
  // 确认电话联系
  // 确认电话联系
  async confirmConnection() {
    let { id, type } = this.data
    let server_res = await app.post({
      url: '/api/v1/order/phone/confirm',
      data: {
        id: id,
        type: type
      }
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return false
    }
    return true
  },
  // 确认订单
  async ensureOrder() {
    let { id, type } = this.data
    let server_res = await app.post({
      url: '/api/v1/order/shop/confirm',
      data: {
        id,
        type
      }
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return false
    }
    return true
  },
  // 取消修改
  cancelModify() {
    let order_detail_state = app._deepClone(app.global_data.order_detail_state)
    order_detail_state.price_change = false
    app.global_data.order_detail_state = order_detail_state
    wx.navigateBack()
  }
})
