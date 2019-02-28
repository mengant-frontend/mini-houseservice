import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		express_code: '',
		express_no: '',
		detail: {}
	},
	onLoad(query){
		let { express_code, express_no } = query
		this.setData({
			express_no: express_no,
			express_code: express_code
		})
		this.getDetail()
	},
	async getDetail(){
		let { express_code, express_no } = this.data
		if(!express_code){
			app._error('无效物流单号')
			return
		}
		if(!express_no){
			app._error('无效快递类别')
			return
		}
    wx.showLoading({
      title: 'loading',
      mask: true
    })
		let res = await app.get({
			url: '/api/v1/goods/express/info',
			data: {
				express_code: express_code,
				express_no: express_no
			}
		})
    wx.hideLoading()
		if(!res.success){
			app._error(res.msg)
			return
		}
		let data = res.data || [],
			detail = data[0] || { data: []}
		this.setData({
			detail: detail
		})
	}
})