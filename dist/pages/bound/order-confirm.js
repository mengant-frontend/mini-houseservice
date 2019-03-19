import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		id: '',
		address: undefined,
		detail: {},
		sell_num: 1,
		total_bound: 0
	},
	async onLoad(query){
		let id = query.id
		this.setData({
			id: id
		})
		wx.showLoading({
			mask: true
		})
		await Promise.all([this.getAddress(), this.getGoodsDetail()])
		wx.hideLoading()
	},
	onShow(){
		let { bound_address } = app.global_data
		if(bound_address){
			this.setData({
				address: bound_address
			})
			app.global_data.bound_address = undefined
		}
	},
	//加载地址列表
	async getAddress(){
		let res = await app.get({
			url: '/house/api/v1/address/list'
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		let data = res.data || [],
			address
		data.forEach(item => {
			if(item.type === 1){
				address = item
			}
		})
		if(!address){
			address = data[0]
		}
		this.setData({
			address: address
		})
	},
	//加载商品信息
	async getGoodsDetail(){
		let id = this.data.id
		if(!id){
			app._error('无效商品ID')
			return
		}
		let res = await app.get({
			url: '/house/api/v1/goods/info',
			data: {
				id: id
			}
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		let data = res.data,
			sell_num = this.data.sell_num
		let total_bound = data.score * sell_num
		this.setData({
			detail: res.data,
			total_bound: total_bound
		})
	},
	//更新sell_num, 同时更新total_score
	updateSellNum(e){
		let { detail } = e,
			sell_num = detail.value || 1,
			total_bound = this.data.detail.score
		total_bound = sell_num * total_bound
		this.setData({
			sell_num: sell_num,
			total_bound: total_bound
		})
	},
	//提交订单
	async confirmOrder(){
		let { id, sell_num, total_bound, address } = this.data
		if(!id){
			app._error('无效商品ID')
			return
		}
		if(sell_num < 1 || sell_num !== parseInt(sell_num)){
			app._error('请输入正确的商品数量')
			return
		}
		if(!address){
			app._error('无效的地址')
			return
		}
		wx.showLoading({
			mask: true
		})
		let res = await app.post({
			url: '/house/api/v1/goods/order/save',
			data:{
				g_id: id,
				score: total_bound,
				count: sell_num,
				a_id: address.id
			}
		})
		wx.hideLoading()
		if(!res.success){
			app._error(res.msg)
			return
		}
		let data = res.data, wx_res
		if(data.res === 1){
			wx.redirectTo({
				url: '/pages/bound/record'
			})
			return
		}
		wx_res = await app.asyncApi(wx.showModal, {
			title: '订单错误提示',
			content: '积分不足',
			cancelText: '返回上页',
			confirmText: '去充值'
		})
		if(wx_res.success && wx_res.confirm){
			wx.navigateTo({
				url: '/pages/bound/buy'
			})
			return
		}
		wx.navigateBack({
			delta: 1
		})
	}
})