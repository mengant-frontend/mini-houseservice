import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		id: '',
		logistic_detail: {},
		user_detail: {},
		goods_detail: {},
		order_detail: {}
	},
	onLoad(query){
		let id = query.id
		this.setData({
			id: id
		})
		this.getDetail()
	},
	async getDetail(){
		let { id } = this.data
		if(!id){
			app._error('无效订单ID')
			return
		}
		let res = await app.get({
			url: '/api/v1/goods/order/info/mini',
			data: {
				id: id
			}
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		let logistic_detail = {},
			user_detail = {},
			goods_detail = {},
			order_detail = {}
		
		this.setData({
			logistic_detail,
			user_detail,
			goods_detail,
			order_detail
		})
	}
})