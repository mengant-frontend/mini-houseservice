import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		id: '',
		logistic_detail: {},
		user_detail: {},
		goods_detail: {},
		order_detail: {},
		loading: false,
		status: 1
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
		this.setData({
			loading: true
		})
		let res = await app.get({
			url: '/api/v1/goods/order/info/mini',
			data: {
				id: id
			}
		})
		this.setData({
			loading: false
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		let { address, goods, count, score, send_time, create_time,receive_time, code_number, express_info =  [], express_code, express_no, status, comment_id } = res.data
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
				receive_time: receive_time
			})
		let express = express_info[0] || { data: [] }
		logistic_detail = Object.assign({}, {
			express_no: express_no,
			express_code: express_code,
			brand: express.brand,
			detail: express.data[0] || {}
		})
		this.setData({
			logistic_detail,
			user_detail,
			goods_detail,
			order_detail,
			status: status,
			comment_id: comment_id
		})
	},
	async ensure(){
		let { status, id, comment_id } = this.data
		if(status === 3 && comment_id === 0){
			wx.redirectTo({
				url: '/pages/bound/comment?id=' + id
			})
			return
		}
		if(status === 2){
			let wx_res = await app.asyncApi(wx.showModal, {
				title: '温馨提示',
				content: '请确保已经收到快递并确认无误后'
			})
			if(!wx_res.success || !wx_res.confirm){
				return
			}
			let res = await app.get({
				url: '/api/v1/goods/order/receive/confirm',
				data: {
					id: id
				}
			})
			if(!res.success){
				app._error(res.msg)
				return
			}
			wx.showToast({
				title: '成功',
				icon: 'success'
			})
			this.setData({
				status: 3
			})
			return
		}
		app._error('不能执行当前操作，请刷新后重试')
		return
	}
})