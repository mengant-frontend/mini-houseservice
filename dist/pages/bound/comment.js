import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
	data: {
		id: '',
		type: '',
		rate: 0,
		remark: '',
		imgs: '',
		photo_list: []
	},
	onLoad(query) {
		this.setData({
			id: query.id
		})
	},
	onShow(){
		let global_data = app.global_data
		let new_data = app._deepClone(this.data)
		if(global_data.pic_id && global_data.pic_url){
			new_data.photo_list.push({
				id: global_data.pic_id,
				url: global_data.pic_url
			})
			app.global_data.pic_id = null
			app.global_data.pic_url = null
		}
		this.setData(new_data)
	},
	// 删除图片
	confirmDelete(e){
		let photo_list = app._deepClone(this.data.photo_list)
		let { detail:{ index } } = e
		if(index !== undefined){
			photo_list.splice(index, 1)
			this.setData({
				photo_list: photo_list
			})
		}
	},
	updateRate(e) {
		let index = e.detail.index
		let evaluate_type
		if (index < 3) {
			evaluate_type = '1'
		} else if (index < 5) {
			evaluate_type = '2'
		} else {
			evaluate_type = '3'
		}
		this.setData({
			rate: index,
			evaluate_type
		})
	},
	updateRemark(e) {
		const value = e.detail.value
		this.setData({
			remark: value
		})
	},
	selectEvaluate(e) {
		let { currentTarget: { dataset: { type } } } = e
		let rate
		switch (type) {
			case '1':
				rate = 5
				break;
			case '2':
				rate = 3
				break
			case '3':
				rate = 1
			default:
		}
		this.setData({
			type: type,
			rate: rate
		})
	},
	updateImgs(e) {
		let { detail: { value } } = e
		let imgs = ''
		value = value || []
		imgs = value.filter(img => img.id)
		.map(img => img.id)
		.join(',')
		this.setData({
			imgs: imgs
		})
	},
	async confirm() {
		let { rate, evaluate_type, remark, id, type, order_data, photo_list } = this.data
		if (!rate) {
			app._warn('请对本产品进行打分')
			return
		}
		await app.asyncApi(wx.showLoading, {
			title: 'loading...'
		})
		let server_res = await app.post({
			url: '/house/api/v1/goods/order/comment',
			data: {
				score: rate,
				o_id: id,
				type: type,
				content: remark,
				imgs: photo_list.map(photo => photo.id).join(',')
			}
		})
		await app.asyncApi(wx.hideLoading)
		let { success, msg, data } = server_res
		if (!success) {
			app._error(msg)
			return
		}
		wx.navigateBack({
			delta: 1
		})
	}
})
