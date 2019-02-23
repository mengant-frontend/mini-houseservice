import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    detail: {},
    has_shop: true,
		// 客服电话
		customer: '',
		// 监督电话
		supervise: '',
		show_input_invite: false,
		loading: false
  },
  onLoad() {
    this.loadData()
		this.loadPhone()
		this.checkBindUser()
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  onShow() {
    this.loadData()
  },
	async checkBindUser(){
  	let res = await app.checkBindUser()
		if(!res.success){
			app._error(res.msg)
			return
		}
		let show_input_invite = true
		if(res.data.bind == 1){
			show_input_invite = false
		}
		this.setData({
			show_input_invite: show_input_invite
		})
	},
  async loadData() {
    let shop_id = app.global_data.shop_id
    this.checkHasShop(shop_id)
    await app.asyncApi(wx.showNavigationBarLoading)
		if(this.data.loading){
			return
		}
		this.setData({
			loading: true
		})
    let server_res = await app.get({
      url: '/api/v1/center/info'
    })
		this.setData({
			loading: false
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
	async loadPhone(){
		this.phone_promise = app.get({
			url: '/api/v1/system/phone'
		})
		let server_res = await this.phone_promise
		this.phone_promise = null
		let { success, msg, data } = server_res
		if(!success){
			app._error(msg)
			return
		}
		this.setData({
			supervise: data.supervise,
			customer: data.customer
		})
	},
	
	async contract(){
		if(this.phone_promise){
			await this.phone_promise
		}
		let { supervise, customer } = this.data
		let phones = [], phone_items = []
		if(supervise){
			phones.push(supervise)
			phone_items.push('监督电话: ' + supervise)
		}
		if(customer){
			phones.push(customer)
			phone_items.push('客服电话: ' + customer)
		}
		if(!phones.length){
			app._warn('暂无电话')
			return
		}
		let wx_res = await app.asyncApi(wx.showActionSheet, {
			itemList: phone_items
		})
		let { success, msg , tapIndex} = wx_res 
		if(!success && msg){
			app._error(msg)
			return
		}		
		wx.makePhoneCall({
			phoneNumber: phones[tapIndex]
		})
	}
})
