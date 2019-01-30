import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		lines: ['分享邀请码给好友', '好友使用您的邀请码后', '您和好友即可分别获得最高1000积分', '邀请的好友越多，获赠的积分越多'],
		code: 'lifuzhao100',
		type: 'invite',
		name: '',
		phone: ''
	},
	onLoad(query){
		let { type = 'invite' } = query
		this.setData({
			type: type
		})
		this.getCode()
	},
	onShareAppMessage(){
		let { code } = this.data
		return {
			title: '邀请您一起来用久房通 让您省心、放心、安心',
			path: '/pages/invite/index?code=' + code
		}
	},
	async getCode(){
		let res = await app.get({
			url: '/'
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		this.setData({
			code: 'lifuzhao100'
		})
	},
	bindFormChange(e){
		let { form_key, value } = app._bindFormChange(e),
			new_data = {}
			new_data[form_key] = value
		this.setData(new_data)
	}
})