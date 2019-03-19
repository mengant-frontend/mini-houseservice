import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    has_shop: '',
    shop_id: 0,
    detail: {}
  },
  onLoad() {
    let shop_id = app.global_data.shop_id || 0
    let has_shop = false
    if(Number(shop_id) > 0){
      has_shop = true
    }
    this.setData({
      has_shop,
      shop_id
    })
    this.getBalance()
  },
  async onShow(){
    await this.getBalance()
  },
  async getBalance() {
    let server_res = await app.get({
      url: '/house/api/v1/withdraw/balance'
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    if(data.balance === 0 || data.balance > 0){
      data.balance = app._toMoney(data.balance)
    }
    if(data.bond_balance === 0 || data.bond_balance > 0){
      data.bond_balance = app._toMoney(data.bond_balance)
    }
    if(data.business_balance === 0 || data.business_balance > 0){
      data.business_balance = app._toMoney(data.business_balance)
    }
    this.setData({
      detail: data
    })
  }
})
