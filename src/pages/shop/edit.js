import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
		head_url_list: [],
    staffs: [],
    origin_staffs: [],
		photo_list: [],
		photos: '',
    form_data: {
      name: '',
      phone: '',
      province: '',
      city: '',
      area: '',
      address: '',
      des: '',
      staffs: ''
    },
		delete_params: [{
			key: 'id',
			value: 'id'
		}]
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
		let global_data = app.global_data
    let staffs_list = app.global_data.staffs_list || []
    let global_staffs = app._deepClone(staffs_list)
		let data = app._deepClone(this.data)
		if (global_staffs.length){
			let new_staffs = global_staffs.filter(g_staff => {
				let is_new = true
				data.staffs.forEach(l_staff => {
					if (l_staff.id === g_staff.id || l_staff.path === g_staff.path) {
						is_new = false
					}
				})
				return is_new
			})
			app.global_data.staffs_list = []
			data.staffs = data.staffs.concat(new_staffs)
			data.form_data.staffs = data.staffs.concat(new_staffs)
				.filter(staff => staff.id)
				.map(staff => staff.id)
				.join(',')
		}
		if(global_data.pic_id && global_data.pic_url){
			if(global_data.pic_type === 'avatar'){
				data.head_url_list = [{
					id: global_data.pic_id,
					url: global_data.pic_url
				}]
				data.form_data.head_url = global_data.pic_id
			}else if(global_data.pic_type === 'photo'){
				data.photo_list.push({
					id: global_data.pic_id,
					url: global_data.pic_url
				})
			}
			app.global_data.pic_id = null
			app.global_data.pic_url = null
			app.global_data.pic_type = null
		}
    
    this.setData(data)
  },
  async onPullDownRefresh() {
    await this.loadData()
    wx.stopPullDownRefresh()
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
  // 加载店铺信息
  async loadData() {
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/api/v1/shop/info/edit'
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
		let { staffs = [], head_url, imgs } = data
    staffs = staffs.map(staff => {
        let img_url = staff.img_url
        return {
          loaded: true,
          path: img_url.url,
          id: staff.id,
          state: staff.state,
          face_token: staff.face_token || 0,
          city: data.city || 0
        }
      })
      .slice(0, 9)
		let head_url_list = []
		if(data.head_url){
			head_url_list = [{
				id: data.head_url,
				url: data.head_url
			}]
		}
		let photo_list = []
		if(imgs && imgs.length > 0){
			photo_list = imgs.map(img => {
				return {
					id: img.id,
					url: img.img_url.url
				}
			})
		}
		let photos = photo_list.map(photo => photo.id).join(',')
    this.setData({
			head_url_list: head_url_list,
      staffs: staffs,
      origin_staffs: staffs.map(staff => staff.id),
			photo_list: photo_list,
			photos: photos,
      form_data: {
        ...data,
        staffs: staffs.map(staff => staff.id)
          .join(',')
      }
    })
  },
  bindFormChange(e) {
    let { form_key, value } = app._bindFormChange(e)
    let form_data = this.updateFormData(form_key, value)
    let other = {}
    if (form_key === 'staffs') {
      other.staffs = value
    }
    this.setData({
      form_data: form_data,
      ...other
    })
  },
  updateFormData(form_key, value) {
    let form_data = app._deepClone(this.data.form_data)
    switch (form_key) {
      case 'name':
      case 'phone':
      case 'des':
      case 'address':
        form_data[form_key] = value
        break;
      case 'staffs':
        let imgs = value || []
        form_data[form_key] = imgs.filter(img => img.id)
          .map(img => img.id)
          .slice(0, 9)
          .join(',')
        break
      case 'region':
        value = value || []
        value = value.filter(item => !!item)
        if (value.length) {
          form_data.province = value[0]
          form_data.city = value[1]
          form_data.area = value[2]
        }
        break
      default:

    }
    return form_data
  },
  async chooseLocation() {
    let location_res = await app.asyncApi(wx.chooseLocation)
    if (!location_res.success) {
      return
    }
    let form_data = this.updateFormData('address', location_res.address)
    this.setData({
      form_data: form_data
    })
  },
  async modify() {
    let form_data = app._deepClone(this.data.form_data)
    let err_msg = ''
		form_data.imgs = this.data.photo_list.filter(photo => this.data.photos.indexOf(photo.id) === -1).map(photo => photo.id).join(',')
    for (let key in form_data) {
			if(key === 'imgs'){
				if(this.data.photos.length > 0){
					continue
				}
			}
      if (!form_data[key]) {
        switch (key) {
					case 'head_url': 
						err_msg = '请上传店铺头像'
						break
          case 'name':
            err_msg = '请填写店铺名称'
            break;
          case 'phone':
            err_msg = '请填写商家手机号码'
            break
          case 'province':
          case 'city':
          case 'area':
            err_msg = '请选择服务区域'
            break
          case 'address':
            err_msg = '请填写商家地址'
            break
          case 'des':
            err_msg = '请填写商家简介'
            break
					case 'imgs':
						err_msg = '至少上传一张商家图片'
						break
          case 'staffs':
            err_msg = '至少上传一张员工头像'
            break
          default:
        }
        break
      }
    }
    if (err_msg) {
      app._error(err_msg)
      return
    }
		if(form_data.head_url.indexOf('http') !== -1){
			delete form_data.head_url
		}
    let origin_staffs = this.data.origin_staffs.map(staff => String(staff))
    let staffs = Array.from(new Set(form_data.staffs.split(',')))
    staffs = staffs.filter(staff => {
      return origin_staffs.indexOf(staff) === -1
    }).join(',')
    if(staffs){
      form_data.staffs = staffs
    }else{
      delete form_data.staffs
    }

    await app.asyncApi(wx.showLoading, {
      title: 'loading...',
      mask: true
    })
    let server_res = await app.post({
      url: '/api/v1/shop/update',
      data: form_data
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '修改成功'
    })
    await app.sleep()
    await app.asyncApi(wx.hideToast)
    wx.redirectTo({
      url: '/pages/shop/index'
    })
  },
  addstaffsAvatars() {
    let staffs = app._deepClone(this.data.staffs)
    let max = 9 - staffs.length
    wx.navigateTo({
      url: '/pages/avatar/index?max=' + max + '&type=' + 'staffs'
    })
  }
})