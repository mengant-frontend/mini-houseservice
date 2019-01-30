import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		list: [],
		page: 1,
		loading: false
	},
	onLoad(){
		this.getList()
	},
	onShow(){
		this.getList()
	},
	async onPullDownRefresh(){
		await this.getList()
		wx.stopPullDownRefresh()
		
	},
	async getList(){
		let { page, loading } = this.data
		if(loading){
			return
		}
		this.setData({
			loading: true
		})
		let res = await app.get({
			url: '/api/v1/address/list',
			// data: {
			// 	page: page,
			// 	size: 10
			// }
		})
		this.setData({
			loading: false
		})
		if(!res.success){
			app._error(res.msg)
			return
		}
		let data = res.data || []
		this.setData({
			list: data
		})
	}
})