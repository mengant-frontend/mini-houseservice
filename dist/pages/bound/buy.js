import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		list: [],
		selected_item: {}
	},
	onLoad(){
		this.getList()
	},
	async getList(){
		let res = await app.get({
			url: '/house/api/v1/score/rule/list'
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		let data = res.data || []
		this.setData({
			list: data
		})
	},
	select(e){
		let { currentTarget: { dataset } } = e,
			list = this.data.list,
			item = list[dataset.index]
		this.setData({
			selected_item: item
		})
	},
	async ensure(){
		let { selected_item } = this.data,
			{ money, score, id } = selected_item
		if(!id){
			app._error('请先选择积分充值')
			return
		}
		let res = await app.post({
			url: '/house/api/v1/score/buy',
			data: {
				id: id
			}
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		let order_id = res.data.o_id
		//获取支付数据
		res = await app.get({
			url: '/house/api/v1/pay/getPreOrder',
			data:{
				id: order_id,
				// 4为购买积分支付
				type: 4,
				r_id: ''
			}
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		let wx_res = await app.asyncApi(wx.requestPayment, res.data)
		console.log(wx_res)
		if (!wx_res.success) {
			app._error(wx_res.msg || '支付失败')
			return
		}
		wx.navigateTo({
			url: '/pages/status/index?type=2&status=success&val=' + score
		})
	}
})