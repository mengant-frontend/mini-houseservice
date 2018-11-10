import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    type: '',
    type_text: '',
    shop_id: 0,
    balance: 0,
    money: 1,
    can_withdraw: false
  },
  onLoad(query) {
    let { type, shop_id = 0 } = query
    let type_text = ''
    if (type === '1') {
      type_text = '保证金'
    } else if (type === '2') {
      type_text = '余额'
    }
    this.setData({
      type: type,
      shop_id: shop_id,
      type_text: type_text
    })
    this.getBalance()
    this.getWithdrawingOrder()
  },
  async getBalance() {
    let server_res = await app.get({
      url: '/api/v1/withdraw/balance'
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let { type, shop_id } = this.data
    let balance = 0
    if (Number(shop_id) > 0) {
      if (type === '1') {
        balance = data.bond_balance
      } else {
        balance = data.business_balance
      }
    } else {
      balance = data.balance
    }
    balance = app._toMoney(balance)
    this.setData({
      balance: balance
    })
  },
  // 获取是否正在进行的提现操作
  async getWithdrawingOrder() {
    let type = this.data.type
    if (!type) {
      app._error('缺少type参数')
      return
    }
    let server_res = await app.get({
      url: '/api/v1/withdraw/check',
      data: {
        type: type
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let can_withdraw = false
    if (Number(data.state) === 1) {
      can_withdraw = true
    }
    this.setData({
      can_withdraw: can_withdraw
    })
  },
  // 表单
  updateMoney(e) {
    let detail = e.detail.detail
    this.setData({
      money: detail.value
    })
  },
  //全部提现
  withdrawAll() {
    let balance = this.data.balance
    this.setData({
      money: balance
    })
  },
  // 提交提取余额申请
  async submit() {
    let { type, money, can_withdraw, balance } = this.data
    if (!can_withdraw) {
      app._error('当前状态不可提现')
      return
    }
    if (!type) {
      app._error('缺少type参数')
      return
    }
    if (!money) {
      app._error('请输入提现金额后再提现')
      return
    }
    money = Number(money)
    if (!money || money <= 0) {
      app._error('请输入合法的数字')
      return
    }
    if (money < 1) {
      app._error('提现金额最低为1元')
      return
    }
    if (balance < money) {
      app._error('不可超过可提现金额')
      return
    }
    let server_res = await app.post({
      url: '/api/v1/withdraw/apply',
      data: {
        type: type,
        money: money
      }
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '发起提现成功'
    })
    await app.sleep()
    await app.asyncApi(wx.hideToast)
    wx.redirectTo({
      url: '/pages/rest-money/withdraw-record'
    })
  }
})
