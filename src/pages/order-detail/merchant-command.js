import regeneratorRuntime from '../../lib/runtime'
import { order_states } from '../../common/constant'
const app = getApp()
Page({
  data: {
    // 訂單id
    id: '',
    // 订单类型
    type: '',
    //订单状态
    state: '',
    // 订单详情
    order_detail: {},
    // 状态的中文描述
    state_text: '',
    // 商家和客户是否已经联系
    connection_change: false,
    // 是否需要修改价格
    price_change: false,
    padding_bottom: 0
  },
  onLoad(query) {
    let { id = '', type = '', state = '' } = query
    let order_state = order_states[type].merchant
    this.setData({
      id,
      type,
      state,
      state_text: order_state[state]
    })
    this.getOrderDetail()
  },
  async getOrderDetail() {
    let { id, type } = this.data
    if (!id) {
      app._error('缺少订单id')
      return
    }
    if (!type) {
      app._error('缺少订单类型')
      return
    }
    let server_res = await app.get({
      url: '/api/v1/order',
      data: {
        id: id,
        type: type
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      order_detail: data
    })
  },
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
  async confirmOrder() {
    let { id, type } = this.data
    let server_res = await app.post({
      url: '/api/v1/order/shop/confirm',
      data: {
        id: id,
        type: type
      }
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return
    }

  },
  async goToChangePricePage() {
    let { id, type, state, order_detail } = this.data
    let origin = order_detail.origin_money
    wx.navigateTo({
      url: `/pages/price-change/index?id=${id}&type=${type}&state=${state}&origin=${origin}`
    })
  },
  updateStatus(e) {
    const { currentTarget: { dataset: { form_key } }, detail: { value } } = e
    let new_state = {}
    new_state[form_key] = value
    this.setData(new_state, () => {
      let { connection_change, price_change } = this.data
      let padding_bottom = 0
      if (connection_change || price_change) {
        padding_bottom = 64
      }
      this.setData({
        padding_bottom: padding_bottom
      })
    })
  }
})
