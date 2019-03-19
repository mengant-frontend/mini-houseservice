import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		list: [],
		page: 1,
		loading: false,
		is_select: false
	},
	onLoad(query){
		let { type = ''} = query,
			is_select = type === 'select'
		this.setData({
			is_select: is_select
		})
		if(is_select){
			wx.setNavigationBarTitle({
				title: '选择地址'
			})
		}
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
			url: '/house/api/v1/address/list',
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
	},
	select(e){
		let { detail } = e,
			id = detail.value,
			{ list } = this.data

		list.forEach(item => {
			if(item.id == id){
				item.checked = true
				return
			}
			item.checked = false
		})
		this.setData({
			list: list
		})
	},
	ensure(){
		let { list } = this.data
		let selected_item = list.filter(item => {
			return item.checked
		})
		if(!selected_item.length){
			app._warn('请选择收件地址')
			return
		}
		app.global_data.bound_address = selected_item[0]
		wx.navigateBack({
			delta: 1
		})
	}
})