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
		let { address, goods, count, score, send_time, create_time, code_number, express_info =  [] } = res.data
		let logistic_detail = {},
			user_detail = Object.assign({}, address),
			goods_detail = Object.assign({}, goods, {
				count: count,
				score: score
			}),
			order_detail = Object.assign({}, {
				code_number: code_number, //订单编号
				create_time: create_time, //创建时间
				send_time: send_time, //发货时间
				
			})
		let express = express_info[0] || { data: [] }
		logistic_detail = Object.assign({}, {
			no: express.no,
			brand: express.brand,
			detail: express.data[0] || {}
		})
		this.setData({
			logistic_detail,
			user_detail,
			goods_detail,
			order_detail
		})
	}
})