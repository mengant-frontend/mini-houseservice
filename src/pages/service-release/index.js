import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    service_types: [],
    form_data: {},
    type_text: '',
    price_keys: [],
    extend: false,
    picture_list: [],
    shop_location: [],
    // 店铺类型，家政还是维修
    type: '',
    shop_id: 0,
    location: []
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
        form_data[form_key] = price_keys[value].name
        break
      case 'area':
        form_data.area = value[2]
        break
      case 'picture':
        let cover = '',
          imgs = ''
        if (value.length >= 1) {
          cover = value[0].id
          let img_list = value.slice(1)
          imgs = img_list.map(img => {
              return img.id || ''
            })
            .join(',')
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
  async getPriceKeys(shop_id) {
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/api/v1/units/mini',
      data: {
        id: shop_id
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
      key: 'cover',
      required: '请上传服务相关照片'
    }, {
      key: 'extend',
      required: '请选择是否推广'
    }]
    let is_valid = true
    let err_msg = ''
    for (let i = 0; i < require_params.length; i++) {
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
      url: '/api/v1/shop/service/save',
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
