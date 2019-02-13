import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		lines: ['分享邀请码给好友', '好友使用您的邀请码后', '您和好友即可分别获得最高1000积分', '邀请的好友越多，获赠的积分越多'],
		code: '',
		type: 'invite',
		loading: false
	},
	onLoad(query){
		let { type = 'invite' } = query,
			code = ''
		if(type === 'invite'){
			code = app.global_data.code
			this.setClipboardData(code)
		}
		this.setData({
			type: type,
			code: code
		})
	},
	onShareAppMessage(){
		let { code } = this.data
		return {
			title: '邀请您一起来用久房通 让您省心、放心、安心',
			path: '/pages/welcome/index?code=' + code
		}
	},
	//复制邀请码到粘贴板
	setClipboardData(code){
		wx.setClipboardData({
			data: code
		})
	},
	bindFormChange(e){
		let { form_key, value } = app._bindFormChange(e),
			new_data = {}
			new_data[form_key] = value
		this.setData(new_data)
	},
	async bindUser(){
		let { code, loading } = this.data
		if(!code){
			app._warn('请输入邀请码')
			return
		}
		if(loading){
			return
		}
		this.setData({
			loading: true
		})
		let res = await app.bindUser(code)
		this.setData({
			loading: false
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		res = await app.asyncApi(wx.showModal, {
			title: '绑定成功',
			content: '本次获得' + res.data.score + '积分',
			showCancel: false
		})
		if()
		await app.sleep()
		wx.navigateBack({
			delta: 1
		})
	}
})