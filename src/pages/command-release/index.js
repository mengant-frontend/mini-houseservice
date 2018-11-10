import regeneratorRuntime from '../../lib/runtime'
import { command_types, default_type } from '../../common/constant'
import moment from '../../lib/moment'
const app = getApp()
Page({
  data: {
    command_types: command_types,
    command_type: default_type,
    photo_list: [],
    time_begin: [],
    form_data: {
      type: 2,
      name: '',
      phone: '',
      des: '',
      province: '',
      city: '',
      area: '',
      address: '',
      longitude: '',
      latitude: '',
      time_begin: '',
      time_end: '',
      money: 1,
      imgs: ''
    }
  },
  bindFormChange(e) {
    let { form_key, value } = app._bindFormChange(e)
    let form_data = this.updateFormData(form_key, value)
    let other = {}
    if (form_key === 'time_begin') {
      other.time_begin = value
    }
    if (form_key === 'type') {
      other.command_type = command_types[value].label
    }
    this.setData({
      ...other,
      form_data: form_data
    })
  },
  updateFormData(form_key, value) {
    let form_data = app._deepClone(this.data.form_data)
    switch (form_key) {
      case 'name':
      case 'phone':
      case 'des':
      case 'money':
        form_data[form_key] = value
        break
      case 'type':
        form_data[form_key] = command_types[value].value
        break
      case 'time_begin':
      case 'time_end':
        form_data[form_key] = value[0] + ' ' + value[1] + ':' + value[2]
        break
      case 'imgs':
        let imgs = ''
        if (value.length) {
          imgs = value.filter(img => img.id)
            .map(img => img.id)
            .join(',')
        }
        form_data[form_key] = imgs
        break
      default:
    }
    return form_data
  },
  async release() {
    let form_data = app._deepClone(this.data.form_data)
    let err_msg = ''
    for (let key in form_data) {
      if (!form_data[key]) {
        switch (key) {
          case 'name':
            err_msg = '发布人名称不能为空'
            break;
          case 'phone':
            err_msg = '手机号码不能为空'
            break
          case 'des':
            err_msg = '需求描述不能为空'
            break
          case 'province':
          case 'city':
          case 'area':
            err_msg = '服务区域不能为空'
            break
          case 'address':
            err_msg = '详细地址不能为空'
            break
          case 'time_begin':
            err_msg = '开始时间不能为空'
            break
          case 'time_end':
            err_msg = '结束时间不能为空'
            break
          case 'money':
            err_msg = '酬金不能为空'
            break
          case 'imgs':
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
    if (moment(form_data.time_begin)
      .isAfter(form_data.time_end)) {
      app._error('开始时间不能晚于结束时间')
      return
    }
    let server_res = await app.post({
      url: '/api/v1/demand/save',
      data: form_data
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '成功'
    })
    await app.sleep()
    await app.asyncApi(wx.hideToast)
    wx.redirectTo({
      url: '/pages/command/index'
    })
  },
  async chooseLocation() {
    let wx_res = await app.asyncApi(wx.chooseLocation)
    let { success, name, latitude, longitude, address } = wx_res
    if (!success) {
      return
    }
    let location_res = await app._getAdInfo({
      lat: latitude,
      lng: longitude
    })
    if (!location_res.success) {
      app._error(location_res.errMsg)
      return
    }
    let [province, city, area] = location_res.data
    let form_data = app._deepClone(this.data.form_data)
    form_data.province = province
    form_data.city = city
    form_data.area = area
    form_data.address = address
    form_data.latitude = latitude
    form_data.longitude = longitude

    this.setData({
      form_data: form_data
    })
  }
})
