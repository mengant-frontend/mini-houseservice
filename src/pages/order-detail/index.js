import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
 data: {
  is_merchants: false,
  order_detail: {},
  id: '', //订单id
  type: '' //订单类型，是需求订单还是服务订单
 },
 onLoad(query) {
  let { id = '', type = '' } = query
  this.setData({
   id: id,
   type: type
  })
  this.getInfo()
  this.loadOrderDetail()
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
  let is_merchants = true
  if (!data) {
   is_merchants = false
  } else if (Number(data.state) !== 4) {
   is_merchants = false
  }
  this.setData({
   is_merchants: is_merchants
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
  // 服务订单为 type = 1 需求订单 type = 2
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
 //商家是否已联系
 bindPicker(e) {
  let value = e.detail.value
  this.setData({
   picker_selected: value
  })
 }
})
