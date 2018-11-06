import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    staffs: [],
    origin_staffs: [],
    form_data: {
      name: '',
      phone: '',
      province: '',
      city: '',
      area: '',
      address: '',
      des: '',
      staffs: ''
    }
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
    let staffs_list = app.global_data.staffs_list || []
    let global_staffs = app._deepClone(staffs_list)
    let local_staffs = app._deepClone(this.data.staffs)
    if (!global_staffs.length) return
    let new_staffs = global_staffs.filter(g_staff => {
      let is_new = true
      local_staffs.forEach(l_staff => {
        if (l_staff.id === g_staff.id || l_staff.path === g_staff.path) {
          is_new = false
        }
      })
      return is_new
    })
    app.global_data.staffs_list = []
    let form_data = app._deepClone(this.data.form_data)
    form_data.staffs = local_staffs.concat(new_staffs)
      .filter(staff => staff.id)
      .map(staff => staff.id)
      .join(',')
    this.setData({
      staffs: local_staffs.concat(new_staffs),
      form_data: form_data
    })
  },
  async onPullDownRefresh() {
    await this.loadData()
    wx.stopPullDownRefresh()
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
    let staffs = data.staffs || []
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
    this.setData({
      staffs: staffs,
      origin_staffs: staffs.map(staff => staff.id),
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
    delete form_data.head_url
    let err_msg = ''
    for (let key in form_data) {
      if (!form_data[key]) {
        switch (key) {
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
          case 'staffs':
            err_msg = '至少上传一张图片'
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
    let origin_staffs = this.data.origin_staffs.map(staff => String(staff))
    let staffs = form_data.staffs.split(',')
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
