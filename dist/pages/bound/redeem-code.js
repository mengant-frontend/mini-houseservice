import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		code: ''
	},
	updateCode(e){
		let { detail } = e,
			{ value } = detail
		this.setData({
			code: value
		})
	},
	async exchargeCode(){
		let { code } = this.data
		if(!code){
			app._error('请输入兑换码')
			return
		}
		let res = await app.post({
			url: '/house/api/v1/recharge/exchange',
			data:{
				code: code
			}
		})
		if(!res.success){
			wx.navigateTo({
				url: '/pages/status/index?status=fail&type=1'
			})
			return
		}
		let score = res.data.score
		wx.redirectTo({
			url: '/pages/status/index?status=success&type=1&val=' + score
		})
	}
})