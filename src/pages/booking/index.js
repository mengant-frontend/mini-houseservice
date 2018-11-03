import regeneratorRuntime from '../../lib/runtime'
import moment from '../../lib/moment.js'
const app = getApp()
let errors = {
  s_id: {
    required: '缺少s_id'
  },
  area: {
    required: '请选择服务地点',
    match: '所选服务地点不在商家服务范围内，请重选'
  },
  address: {
    required: '请选择服务地点'
  },
  time_begin: {
    required: '请选择开始服务时间'
  },
  time_end: {
    required: '请选择结束服务时间'
  },
  phone: {
    required: '请填写手机号码'
  },
  remark: {
    required: '请填写备注信息'
  }
}
Page({
  data: {
    range: ['单次', '每周', '每月'],
    form_data: {},
    service_data: {
      s_id: '',
      area: '',
      address: '',
      time_begin: '',
      time_end: '',
      phone: '',
      remark: ''
    },
    time_begin: [],
    time_end: []
  },
  async onLoad(query) {
    let s_id = query.s_id
    let form_data = app._deepClone(this.data.form_data)
    form_data.s_id = s_id
    this.setData({
      form_data: form_data
    })
    await this.getServiceInfo(s_id)
  },
  async getServiceInfo() {
    let s_id = this.data.form_data.s_id
    if (!s_id) {
      app._error('缺少s_id')
      return false
    }
    let server_res = await app.get({
      url: '/api/v1/extend/mini/service',
      data: {
        id: s_id
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return false
    }
    this.setData({
      service_data: data
    })
  },
  bindFormChange(e) {
    let { form_key, value } = app._bindFormChange(e)
    let form_data = this.updateFormData(form_key, value)
    let other_data = {}
    if (form_key === 'time_begin' || form_key === 'time_end') {
      other_data[form_key] = value
    }
    this.setData({
      form_data: form_data,
      ...other_data
    })
  },
  updateFormData(form_key, value) {
    let form_data = app._deepClone(this.data.form_data)
    switch (form_key) {
      case 'phone':
      case 'remark':
        form_data[form_key] = value
        break;
      case 'time_begin':
      case 'time_end':
        form_data[form_key] = value[0] + ' ' + value[1] + ':' + value[2]
        break
      default:
    }
    return form_data
  },
  async chooseLocation() {
    let wx_res = await app.asyncApi(wx.chooseLocation)
    let { success, msg } = wx_res
    if (!success) {
      return
    }
    let { latitude, longitude, name } = wx_res
    let location_res = await app._getAdInfo({
      lat: latitude,
      lng: longitude
    })
    let { data } = location_res
    if (!location_res.success) {
      app._error(location_res.msg)
      return
    }
    let area = data[2] || ''
    let address = name
    let form_data = app._deepClone(this.data.form_data)
    form_data.area = area
    form_data.address = address
    this.setData({
      form_data: form_data
    })
  },
  async confirm() {
    let shop_id = app.global_data.shop_id
    if(Number(shop_id) > 0){
      app._error('商家不可执行预约服务操作')
      return
    }
    let { form_data, service_data } = this.data
    let is_valid = true
    for (let key in form_data) {
      if (!form_data[key]) {
        is_valid = false
        app._error(errors[key].required)
        break
      }
    }
    if (!is_valid) {
      return
    }
    if (service_data.area !== form_data.area) {
      app._error(errors.area.match)
      return
    }
    if (moment(form_data.time_begin)
      .isAfter(form_data.time_end)) {
      app._error('开始时间不能晚于结束时间')
      return
    }
    let server_res = await app.post({
      url: '/api/v1/service/booking',
      data: form_data
    })

    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '提交成功'
    })
    await app.sleep()
    await app.asyncApi(wx.hideToast)
    wx.navigateBack()
  }
})
