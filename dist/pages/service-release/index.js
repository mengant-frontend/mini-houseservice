import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    service_types: [],
    form_data: {},
    type_text: '',
    price_keys: [],
    extend: false,
    photo_list: [],
    shop_location: [],
    // 店铺类型，家政还是维修
    type: '',
    shop_id: 0,
    location: [],
		cover_list: [],
		delete_params: [{
			key: 'id',
			value: 'id'
		}],
		is_edit: false,
		imgs_arr: []
  },
  async onLoad(query) {
		let is_edit = false
		if(query.id){
			is_edit = true
		}
		this.setData({
			is_edit: is_edit
		})
    this.initData()
    this.getPriceKeys()
    await this.getInfo()
    await this.getServiceTypes()
		if(is_edit){
			this.loadService(query.id)
		}
  },
	onShow(){
		let global_data = app.global_data
		let new_data = app._deepClone(this.data)
		if(global_data.pic_id && global_data.pic_url){
			if(global_data.pic_type === 'avatar'){
				new_data.cover_list = [{
					id: global_data.pic_id,
					url: global_data.pic_url
				}]
			}else{
				new_data.photo_list.push({
					id: global_data.pic_id,
					url: global_data.pic_url
				})
			}
			app.global_data.pic_id = null
			app.global_data.pic_url = null
		}
		this.setData(new_data)
	},
  //初始化
  initData() {
    let init_form_data = {
      "c_id": '',
      "name": "",
      "area": "",
      "price": '',
      "unit": "",
      "cover": '',
      "des": "",
      "extend": '',
			"imgs": "",
    }
    let form_data = app._deepClone(this.data.form_data)
    form_data = Object.assign({}, init_form_data, form_data)
    if (this.data.extend) {
      form_data.extend = 1
    } else {
      form_data.extend = 2
    }
    this.setData({
      form_data: form_data,
    })
  },
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
  // 获取店铺信息
  async getInfo() {
    let server_res = await app.get({
      url: '/api/v1/shop/info'
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }

    if (!Object.keys(data)
      .length) {
      app._warn('暂未申请店铺')
      return
    }
    let shop_location = [
      data.province,
      data.city,
      data.area
    ]
    let form_data = app._deepClone(this.data.form_data)
    let location = app._deepClone(this.data.location)
    if (!location[0]) {
      location = [data.province, data.city, data.area]
      form_data.area = data.area
    }
    this.setData({
      location: location,
      shop_location: shop_location,
      type: data.type,
      shop_id: data.id,
      form_data: form_data
    })
  },
  // 获取服务列表
  async getServiceTypes() {
    let type = this.data.type
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/api/v1/category/mini/list',
      data: {
        type: type
      }
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      service_types: data
    })
  },
	async loadService(id){
		await app.asyncApi(wx.showLoading, {
			title: '正加载服务详情',
			mask: true
		})
		let server_res = await app.get({
			url: '/api/v1/extend/mini/service',
			data: {
				id: id
			}
		})
		await app.asyncApi(wx.hideLoading)
		let { success, msg, data } = server_res
		if(!success){
			app._error(msg)
			return
		}
		let form_data = app._deepClone(this.data.form_data)
		let service_types = this.data.service_types
		let new_data = {}
		form_data.id = id
		form_data.c_id = data.c_id
		for(let i = 0; i < service_types.length; i++){
			if(service_types[i].id == data.c_id){
				new_data.type_text = service_types[i].name
				break
			}
		}
		form_data.name = data.name
		form_data.area = data.area
		form_data.price = parseFloat(data.price)
		form_data.unit = data.unit
		form_data.cover = data.cover
		new_data.cover_list = [{
			id: data.cover,
			url: data.cover
		}]
		form_data.extend = data.extend.extend
		new_data.photo_list = data.imgs.map(img => {
			return {
				id: img.id,
				url: img.img_url.url
			}
		})
		new_data.imgs_arr = new_data.photo_list.map(img => img.id)
		form_data.des = data.des
		new_data.form_data = form_data
		this.setData(new_data)
	},
  //监听表单变化
  bindFormChange(e) {
    let { service_types } = this.data
    let { form_key, value } = app._bindFormChange(e)
    let form_data = this.updateFormData(form_key, value)
    let other_data = {}
    if (form_key === 'c_id') {
      other_data.type_text = service_types[value].name
    }
    if (form_key === 'extend') {
      other_data.extend = value
    }
    if (form_key === 'area') {
      other_data.location = value
      this.checkArea(value)
    }
    if(form_key === 'price'){
      let price_100 = value * 100
      if(price_100 !== parseInt(price_100)){
        form_data.price = parseInt(price_100) / 100
      }
    }
    this.setData({
      form_data: form_data,
      ...other_data
    })
  },
  //更新表单的值
  updateFormData(form_key, value) {
    let form_data = app._deepClone(this.data.form_data)
    let service_types = app._deepClone(this.data.service_types)
    let price_keys = app._deepClone(this.data.price_keys)
    switch (form_key) {
      case 'c_id':
        if (!service_types.length) return
        form_data[form_key] = service_types[value].id
        break
      case 'name':
      case 'des':
      case 'price':
        form_data[form_key] = value
        break
      case 'unit':
        form_data[form_key] = price_keys[value].name
        break
      case 'area':
        form_data.area = value[2]
        break
      case 'extend':
        // 是为1，否为2
        if (value) {
          form_data[form_key] = 1
        } else {
          form_data[form_key] = 2
        }
        break
    }
    return form_data
  },
  // 检查所选省市区是否正确
  checkArea(local_location) {
    let shop_location = app._deepClone(this.data.shop_location)
    if (local_location[0] !== shop_location[0] || local_location[1] !== shop_location[1]) {
      app._warn('所选省市与店铺所在省市不符，请重选')
      return false
    }
    return true
  },
  // 获取价格单位
  async getPriceKeys() {
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/api/v1/units/mini',
      data: {
        id: app.global_data.shop_id
      }
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      price_keys: data,
    })
  },
  //发布服务
  async releaseService() {
    let form_data = app._deepClone(this.data.form_data)
		
    let require_params = [{
      key: 'c_id',
      required: '请选择服务类型'
    }, {
      key: 'name',
      required: '请输入服务名称'
    }, {
      key: 'area',
      required: '请选择服务区域'
    }, {
      key: 'price',
      required: '请输入服务价格'
    }, {
      key: 'unit',
      required: '请选择价格单位'
    }, {
      key: 'des',
      required: '请输入服务简介'
    }, {
      key: 'imgs',
      required: '请上传服务相关照片(至少两张)'
    }, {
      key: 'extend',
      required: '请选择是否推广'
    }]
		let need_cover = true
		if(this.data.cover_list.length){
			let cover = this.data.cover_list[0]
			if(cover.id.indexOf('http') !== -1){
				need_cover = false
				delete form_data.cover
			}else{
				form_data.cover = cover.id
			}
		}
		let need_photo = true
		if(this.data.photo_list.length){
			let imgs = this.data.photo_list.filter(img => {
				return this.data.imgs_arr.indexOf(img.id) === -1
			})
			need_photo = false
			form_data.imgs = imgs.map(img => img.id).join(',')
		}
		
    let is_valid = true
    let err_msg = ''
    for (let i = 0; i < require_params.length; i++) {
			if(require_params[i].key === 'cover' && !need_cover){
				continue
			}
			if(require_params[i].key === 'imgs' && !need_photo){
				continue
			}
      if (!form_data[require_params[i].key]) {
        is_valid = false
        err_msg = require_params[i].required
        break
      }
    }
    if (!is_valid) {
      app._warn(err_msg)
      return
    }
    if (!this.checkArea(this.data.location)) {
      return
    }
    let check_status = await this.checkMoney(form_data.price)
    if (check_status === undefined) {
      return
    }
    if (check_status.success === false) {
      let wx_res = await app.asyncApi(wx.showModal, {
        title: '保证金充值',
        content: '您的店铺保证金不足,无法发布服务,是否前往充值?',
        confirmText: "确认",
        cancelText: "取消",
      })
      if (wx_res.confirm) {
        wx.navigateTo({
          url: '/pages/rest-money/recharge?type=1'
        })
      }
      return
    }
    await app.asyncApi(wx.showLoading, {
      title: '提交中...'
    })
    let server_res = await app.post({
      url: this.data.is_edit ? '/api/v1/shop/service/update' : '/api/v1/shop/service/save',
      data: form_data
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    await app.sleep()
    wx.redirectTo({
      url: '/pages/service-my/index'
    })

  },
  // 检测商铺保证是否充足
  async checkMoney(money) {
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.get({
      url: '/api/v1/bond/check',
      data: {
        money: money
      }
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let need = data.need || 0
    if (Number(need) > 0) return {
      success: false,
      need: need
    }
    return {
      success: true
    }
  }
})
