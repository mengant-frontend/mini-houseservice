import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    location: [],
		type: false,
    id: '',
		address: {}
  },
  onLoad(query){
    let { id = '' } = query,
			bar_title = '新增地址',
			location = app.global_data.location
    this.setData({
			id: id,
			location: location
		})
		if(id){
			this.getAddress()
			bar_title = '更新地址'
		}
		wx.setNavigationBarTitle({
			title: bar_title
		})
  },
	async getAddress(){
  	let { id } = this.data
		wx.showLoading({
			mask: true
		})
		let res = await app.get({
			url: '/house/api/v1/address/list'
		})
		wx.hideLoading()
		if(!res.success){
			app._error(res.msg)
			return
		}
		let data = res.data || [],
			address = {}
		for (let i = 0; i < data.length; i++){
			if(data[i].id == id){
				address = data[i]
				break
			}
		}
		let type = false,
			location = this.data.location || []
		if(parseInt(address.type) === 1){
			type = true
		}
		if(address.province && address.city && address.area){
			location = [
				address.province,
				address.city,
				address.area
			]
		}
		console.log(address)
		this.setData({
			address: address,
			type: type,
			location: location
		})
	},
  bindFormChange(e){
  	let {  form_key, value } = app._bindFormChange(e),
			{ address, location, type } = this.data
		switch (form_key) {
			case 'region':
				address.province = value[0]
				address.city = value[1]
				address.area = value[2]
				location = value
				break
			case 'type':
				address.type = value ? '1' : '2'
				type = value
				break
			default:
				address = Object.assign({}, address, {
					[form_key]: value
				})
		}
		this.setData({
			address: address,
			location,
			type
		})
	},
	//确认
	async ensure(){
 		let { address } = this.data,
			url, msg
		if(address.id){
			url = '/house/api/v1/address/update'
		}else{
			url = '/house/api/v1/address/save'
		}
		let params = [{
			key: 'name',
			msg: '请输入收件人姓名'
		}, {
			key: 'phone',
			msg: '请输入收件人联系电话'
		},{
			key: 'province',
			msg: '请选择收件人地址'
		},{
			key: 'city',
			msg: '请选择收件人地址'
		},{
			key: 'area',
			msg: '请选择收件人地址'
		},{
			key: 'detail',
			msg: '请输入收件人详细地址'
		}]
		for (let i = 0; i < params.length; i++){
			let param = params[i]
			if(!address[param.key]){
				msg = param.msg
				break
			}
		}
		if(msg){
			app._warn(msg)
			return
		}
		wx.showLoading({
			mask: true
		})
		let res = await app.post({
			url: url,
			data: address
		})
		wx.hideLoading()
		if(!res.success){
			app._error(res.msg)
			return
		}
		wx.navigateBack({
			delta: 1
		})
	}
})