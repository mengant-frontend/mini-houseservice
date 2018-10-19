import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    service_types: [],
    form_data: {},
    type_text: '',
    price_keys: [],
    extend: true,
    picture_list: [],
    shop_location: [],
    local_location: [],
    // 店铺类型，家政还是维修
    type: ''
  },
  async onLoad() {
    this.initData()
    this.getPriceKeys()
    await this.getInfo()
    await this.getServiceTypes()
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
    if (!data) {
      app._error('暂未申请店铺')
      return
    }
    let shop_location = [
      data.province,
      data.city,
      data.area
    ]
    let local_location = app._deepClone(this.data.local_location)
    if (!local_location[0]) {
      local_location = shop_location
    }
    this.setData({
      shop_location: shop_location,
      local_location: local_location,
      type: data.type
    })
  },
  // 获取服务列表
  async getServiceTypes() {
    let type = this.data.type
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.get({
      url: '/api/v1/category/mini/list',
      data: {
        type: type
      }
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      service_types: data
    })
  },
  //监听表单变化
  bindFormChange(e) {
    let { service_types } = this.data
    let { form_key, value } = app._bindFormChange(e)
    console.log(form_key, value)
    let form_data = this.updateFormData(form_key, value)
    let other_data = {}
    if (form_key === 'c_id') {
      other_data.type_text = service_types[value].name
    }
    if (form_key === 'extend') {
      other_data.extend = value
    }
    if (form_key === 'area') {
      this.checkArea(value)
      other_data.local_location = value
    }
    if (form_key === 'picture') {
      other_data.picture_list = value
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
        if (!price_keys.length) return
        form_data[form_key] = price_keys[value].label
        break
      case 'area':
        form_data.area = value[2]
        break
      case 'picture':
        let cover = '', imgs = ''
        if (value.length >= 1) {
          cover = value[0].id
          let img_list = value.slice(1)
          imgs = img_list.map(img => {
            return img.id || ''
          }).join(',')
        }
        form_data.cover = cover
        form_data.imgs = imgs
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
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.get({
      url: '/test'
    })
    await app.asyncApi(wx.hideLoading)
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
    let local_location = app._deepClone(this.data.local_location)
    let is_valid = true
    for (let key in form_data) {
      if (key === 'imgs' || key === 'cover') {

      } else if (!form_data[key]) {
        is_valid = false
        break
      }
    }
    if (!is_valid) {
      app._warn('请完善表单信息')
      return
    }
    let has_error_photos = false
    let picture_list = app._deepClone(this.data.picture_list)
    picture_list.forEach(picture => {
      if (!picture.id) {
        has_error_photos = true
      }
    })
    if (has_error_photos) {
      app._warn('请先删除上传失败的照片')
      return
    }
    if (!form_data.cover) {
      app._warn('请上传店铺封面照')
      return
    }
    if (!form_data.imgs) {
      app._warn('请至少上传一张服务照片')
      return
    }
    if (!this.checkArea(local_location)) {
      return
    }
    let check_status = await this.checkMoney(form_data.price)
    if (check_status === undefined) {
      return
    }
    if (check_status.success === false) {
      let wx_res = await app.asyncApi(wx.showModal, {
        title: '温馨提示',
        content: '您的店铺保证金不足,无法发布服务,是否前往充值?',
        confirmText: "确认",
        cancelText: "取消",
      })
      let { success, res } = wx_res
      if(res.confirm){
        // Todo 充值页面路径
        wx.navigateTo({
          url: '/pages/'
        })
      }
      return
    }
    await app.asyncApi(wx.showLoading, {
      title: 'loading'
    })
    let server_res = await app.post({
      url: '/api/v1/shop/service/save',
      data: form_data
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    app._success('发布服务成功')

  },
  // 检测商铺保证是否充足
  async checkMoney(money) {
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.post({
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