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
    padding_bottom: 0,
    // 使用红包
    red_packet_list: [],
    red_packet: null
  },
  onLoad(query) {
    app.global_data.red_packet = null
    let { id = '', type = '', state = '' } = query
    let order_state = order_states[type].common
    let padding_bottom = 0
    switch (Number(state)) {
      case 1:
        padding_bottom = 64
        break;
      case 2:
        padding_bottom = 0
        break
      case 3:
        padding_bottom = 118
        break
      case 4:
        // Todo 前往评论页
        break
      case 5:
        padding_bottom = 0
      default:
        padding_bottom = 0
    }
    this.setData({
      id,
      type,
      state,
      padding_bottom: padding_bottom,
      state_text: order_state[state]
    })
    this.getOrderDetail()
    this.getRedPacketList()
  },
  onShow() {
    let red_packet = app.global_data.red_packet
    this.setData({
      red_packet: red_packet
    })
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
      return false
    }
    return true
  },
  updateStatus(e) {
    const { currentTarget: { dataset: { form_key } }, detail: { value } } = e
    let new_state = {}
    let { padding_bottom } = this.data
    new_state[form_key] = value
    if (form_key === 'connection_change' && value) {
      padding_bottom = 64
    }
    this.setData({
      padding_bottom: padding_bottom
    })
    this.setData(new_state)
  },
  goToShop() {
    wx.navigateTo({
      url: '/pages/store/index'
    })
  },
  // 取消订单
  async cancelOrder() {
    let { type, id } = this.data
    let server_res = await app.post({
      url: '/api/v1/demand/handel',
      data: {
        type,
        id
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    await app.sleep()
    await app.asyncApi(wx.hideToast)
    wx.navigateBack()
  },
  // 获取红包列表
  async getRedPacketList() {
    let server_res = await app.get({
      url: '/api/v1/red/list'
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      red_packet_list: [{ id: 0, name: '不使用' }].concat(data)
    })
  },
  // 付款
  async payOrder() {
    let { type, id, red_packet, state } = this.data
    let is_connect = await this.confirmConnection()
    if (!is_connect) {
      return
    }
    let params = {
      type,
      id
    }
    if (red_packet) {
      params.r_id = red_packet.id
    }
    let server_res = await app.get({
      url: '/api/v1/pay/getPreOrder',
      data: params
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let pay = await app.asyncApi(wx.requestPayment, data)
    if (!pay.success) {
      app._error(pay.msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    await app.sleep()
    await app.asyncApi(wx.hideToast)
    state = state + 1
    wx.redirectTo({
      url: `/pages/order-detail/common?id=${id}&type=${type}&state=${state}`
    })
  },
  selectRedPacket() {
    wx.navigateTo({
      url: '/pages/redpacket/index?type=select'
    })
  },
  async finishAndContact(confirm) {
    let { id, type, state } = this.data
    let server_res = await app.post({
      url: '/api/v1/order/confirm',
      data: {
        id,
        type,
        confirm
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    await app.sleep()
    await app.asyncApi(wx.hideToast)
    state = state + 1
    wx.redirectTo({
      rul: `/pages/order_detail/common?id=${id}&type=&{type}&state=${state}`
    })
  },
  async finish() {
    let state
    let server_res = await this.finishAndContact(1)
  },
  async contact() {
    let server_res = await this.finishAndContact(2)
  }
})
