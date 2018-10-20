import regeneratorRuntime from '../../lib/runtime'
import { order_states } from '../../common/constant'
const app = getApp()
Page({
 data: {
  /**
   is_merchant: true 为商家 , false 为 普通用户
  */
  is_merchant: false,
  order_detail: {},
  //订单id
  id: '',
  //订单类型 服务订单为 type = 1 需求订单 type = 2
  type: '',
  // 订单状态
  state: '',
  // 状态的中文描述
  state_text: '',
  connection_change: false,
  price_change: false
 },
 async onLoad(query) {
  let { id = '', type = '', state = '' } = query
  this.setData({
   id: id,
   type: type,
   state: state
  })
  this.loadOrderDetail()
  await this.getInfo()
  let { is_merchant } = this.setData
  let order_state = order_states[type]
  if (is_merchant) {
   order_state = order_state.merchant
  } else {
   order_state = order_state.common
  }
  this.setData({
   state_text: order_state[state]
  })
 },
 onShow() {
  let order_detail = app._deepClone(app.global_data.order_detail_state)
  if (!order_detail.price_change) {
   this.setData({
    price_change: false
   })
  }
 },
 //获取用户信息，判断是不是商家
 async getInfo() {
  let server_res = await app.get({
   url: '/api/v1/shop/info'
  })
  let { success, msg, data } = server_res
  if (!success) {
   app._error(msg)
   return
  }
  let is_merchant = true
  if (!data) {
   is_merchant = false
  } else if (Number(data.state) !== 4) {
   is_merchant = false
  }
  this.setData({
   is_merchant: is_merchant
  })
 },
 // 加载订单详情
 async loadOrderDetail() {
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
 updateFormData(e) {
  let { currentTarget: { dataset: { form_key } }, detail: { value } } = e
  let form_data = {}
  form_data[form_key] = value
  this.setData(form_data)
 },
 goToChangePricePage() {
  let { id, type, state, order_detail } = this.data
  let origin = order_detail.origin_money
  wx.navigateTo({
   url: `/pages/price-change/index?id=${id}&type=${type}&state=${state}&origin=${origin}`
  })
 },
 confirm() {
  let { id, type, state } = this.data
 }
})
