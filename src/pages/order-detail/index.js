import regeneratorRuntime from '../../lib/runtime'
import moment from '../../lib/moment'
const app = getApp()
Page({
  data: {
    // 商家还是客户
    has_shop: false,
    // 订单id
    id: '',
    // 订单类别，服务订单还是需求订单
    type: '',
    // 订单状态
    state: '',
    test: '',
    // 订单数据
    order_detail: {},
    is_service_order: false,
    had_connect: false,
    change_price: false,
    use_red_packet: false,
    // 红包信息
    red_packet: null,
    // 红包列表
    red_packet_list: [],
    chat_text: ''
  },
  async onLoad(query) {
    this.setData({
      id: query.id,
      type: query.type,
      state: query.state
    })
    await this.loadOrder()
    this.init(query)
    this.getRedPacketList()
  },
  onShow() {
    let red_packet = app.global_data.red_packet
    let order_detail_state = app.global_data.order_detail_state
    let change_price = this.data.change_price
    if (!order_detail_state.price_change) {
      change_price = false
    }
    this.setData({
      red_packet: red_packet,
      change_price
    })
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  init({ id, type, state }) {
    let shop_id = app.global_data.shop_id
    let has_shop = false
    if (shop_id > 0) {
      has_shop = true
    }
    let is_service_order = false
    if (type === '1') {
      is_service_order = true
    }
    if (!has_shop && state === '4') {
      this.gotoEvaluate()
      return
    }
    this.setData({
      has_shop: has_shop,
      id,
      type,
      state,
      is_service_order
    })
  },
  async loadOrder() {
    let { id, type } = this.data
    if (!id) {
      app._error('缺少订单id')
      return
    }
    if (!type) {
      app._error('缺少订单类型')
      return
    }
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/api/v1/order',
      data: {
        id: id,
        type: type
      }
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      order_detail: data
    })
  },
  // 打电话
  makePhoneCall(e) {
    let phone = this.data.order_detail.user_phone
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  // 前往店铺
  goToShop() {
    if (this.data.has_shop) {
      // 商家不显示店铺title，也不跳转
      return
    }
    let shop_id = app.global_data.shop_id
    wx.navigateTo({
      url: '/pages/store/index?id=' + shop_id
    })
  },
  //是否联系
  updateHadConnect(e) {
    let { detail: { value } } = e
    this.setData({
      had_connect: value
    })
  },
  // 是否修改价格
  updateChangePrice(e) {
    let { detail: { value } } = e
    this.setData({
      change_price: value
    })
  },
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
      red_packet_list: data
    })
  },
  // 前往使用红包
  selectRedPacket() {
    wx.navigateTo({
      url: '/pages/redpacket/index?type=select'
    })
  },
  // 前往修改价格
  goToChangePrice() {
    let { id, type, state, order_detail } = this.data
    let origin = order_detail.origin_money
    app.global_data.order_detail_state.price_change = true
    wx.navigateTo({
      url: `/pages/price-change/index?id=${id}&type=${type}&state=${state}&origin=${origin}`
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
  // 确认订单接口
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
  // 商家确认订单
  async shoperConfirm() {
    let is_success = await this.confirmConnection()
    if (!is_success) {
      return
    }
    is_success = await this.ensureOrder()
    if (!is_success) {
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    let { state, id, type, order_detail } = this.data
    if (this.data.is_service_order) {
      state = state + 1
    } else {
      order_detail.shop_confirm = 2
    }
    this.init({
      state: state,
      id: id,
      type: type,
      order_detail
    })
  },
  // 检查用户是否已经付款
  async checkPay() {
    let { id, type } = this.data
    let res = await app.post({
      url: '/api/v1/order/pay/check',
      data: {
        id,
        type
      }
    })
    let { success, msg, data } = res
    if (!success) {
      app._error(msg)
      return false
    }
    if (Number(data.state) === 2) {
      app._error('用户未支付')
      return false
    }
    return true
  },
  async shoperGotoServe() {
    let { type, id, state } = this.data
    let is_pay = await this.checkPay()
    if (!is_pay) {
      return
    }
    let res = await app.post({
      url: '/api/v1/order/service/begin',
      data: {
        id,
        type
      }
    })
    let { success, msg } = res
    if (!success) {
      app._error(msg)
      return
    }
    this.init({
      state: state + 1,
      id: id,
      type: type
    })
  },
  // 取消订单
  async customerCancelOrder() {
    let wx_res = await app.asyncApi(wx.showModal, {
      title: '温馨提示',
      content: '请确认取消订单操作'
    })
    if (!wx_res.confirm) {
      return
    }
    let url = '/api/v1/demand/handel'
    let { id, is_service_order } = this.data
    if (is_service_order) {
      url = '/api/v1/order/service/handel'
    }
    let server_res = await app.post({
      url: url,
      data: {
        id: id
      }
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    wx.navigateBack()
  },
  async customerPayOrder() {
    if (Number(this.data.order_detail.shop_confirm) !== 1) {
      app._error('商家未确认')
      return
    }
    await this.confirmConnection()
    let { id, type, state, red_packet } = this.data
    let params = {
      id,
      type: type
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
    let wx_res = await app.asyncApi(wx.requestPayment, data)
    if (!wx_res.success) {
      app._error(wx_res.msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    this.init({
      id,
      type,
      state: state + 1
    })
  },
  async customerFinish() {
    let wx_res = await app.asyncApi(wx.showModal, {
      title: '温馨提示',
      content: '请确认完工操作'
    })
    if (!wx_res.confirm) {
      return
    }
    let server_res = await this.finishOrChat(1)
    if (!server_res.success) {
      app._error(server_res.msg)
      return
    }
    this.gotoEvaluate()
  },
  async customerChat() {
    let wx_res = await app.asyncApi(wx.showModal, {
      title: '温馨提示',
      content: '请确认协商操作'
    })
    if (!wx_res.success) {
      return
    }
    let server_res = await app.finishOrChat(2)
    if (!server_res.success) {
      app._error(server_res.msg)
      return
    }
    let time_end = this.data.form_data.time_end
    this.setData({
      chat_text: `将于${time_end}自动完工`
    })
  },
  finishOrChat(confirm) {
    let { id, type } = this.data
    return app.post({
      url: '/api/v1/order/confirm',
      data: {
        id,
        type,
        confirm
      }
    })
  },
  gotoEvaluate() {
    let { id, type, state } = this.data
    state = state + 1
    wx.redirectTo({
      url: `/pages/order-evaluate/index?id=${id}&type=${type}&state=${state}`
    })
  }
})
