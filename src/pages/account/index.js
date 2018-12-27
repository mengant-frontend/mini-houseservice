import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    detail: {},
    has_shop: true
  },
  onLoad() {
    this.loadData()
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  onShow() {
    this.loadData()
  },
  async loadData() {
    let shop_id = app.global_data.shop_id
    this.checkHasShop(shop_id)
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/api/v1/center/info'
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    data.balance = app._toMoney(data.balance)
    this.setData({
      detail: data
    })
  },
  //判断当前账号是否商家
  checkHasShop(shop_id) {
    let has_shop = false
    if (shop_id && Number(shop_id) > 0) {
      has_shop = true
    }
    this.setData({
      has_shop: has_shop
    })
  },
  goTo(e) {
    let { currentTarget: { dataset: { url } } } = e
    wx.navigateTo({
      url: url
    })
  },
  // 编辑个人信息
  editProfile() {
    wx.navigateTo({
      url: '/pages/account/edit'
    })
  },
	contract(){
		if(!this.data.detail.phone){
			app._error('暂无电话')
			return 
		}
		wx.makePhoneCall({
			phoneNumber: this.data.detail.phone
		})
	}
})
