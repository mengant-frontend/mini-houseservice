import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    // 当前的店铺保证金
    balance: 0,
    // 保证金的类型 1 新增服务 2接单, 3充值
    type: ''
  },
  onLoad(query) {
    let { type } = query
    this.setData({
      type: type
    })
    this.getBalance()
  },
  // 表单
  updateMoney(e) {
    let detail = e.detail.detail
    this.setData({
      money: detail.value
    })
  },
  // 获取当前保证金
  async getBalance() {
    let server_res = await app.get({
      url: '/api/v1/withdraw/balance'
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let { type } = this.data
    let balance = data.bond_balance
    balance = app._toMoney(balance)
    this.setData({
      balance: balance
    })
  },
  async submit() {
    let { type, money } = this.data
    if (!type) {
      app._error('缺少type参数')
      return
    }
    money = Number(money)
    if (!money || money <= 0) {
      app._error('请输入合法的数字')
      return
    }
    if (money < 1) {
      app._error('充值金额最低为1元')
      return
    }

    let server_res = await app.post({
      url: '/api/v1/bond/save',
      data: {
        type: type,
        money: money
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.pay(data.id)
  },
  // 调起支付
  async pay(id) {
    // 首先去服务器获取支付信息
    let server_res = await app.get({
      url: '/api/v1/pay/getPreOrder',
      data: {
        id: id,
        type: 3
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let wx_res = await app.asyncApi(wx.requestPayment, data)
    if (!wx_res.success) {
      app._error(wx_res.msg || wx_res.message)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    await app.sleep()
    wx.navigateBack({
      delta: 1
    })
  }
})
