import regeneratorRuntime from '../../lib/runtime' 
import { default_region } from '../../common/constant'
const app = getApp()
Page({
  data: {
    form_data: {}
  },
  onLoad(){
    let form_data = app._deepClone(this.data.form_data)
    form_data.province = default_region[0]
    form_data.city = default_region[1]
    form_data.area = default_region[2]
    this.setData({
      form_data: form_data
    })
  },
  //获取个人信息
  async getInfo(){
    let server_res = await app.get({
      url: '/test'
    })
    let { success, msg, data } = server_res
    if(!success){
      app._error(msg)
      return
    }
    this.setData({
      form_data: data
    })
  },
  // 更新个人信息
  async updateInfo(){
    let form_data = app._deepClone(this.data.form_data)
    let server_res = await app.post({
      url: '/test',
      data: form_data
    })
    let { success, msg } = server_res
    
  },
  //绑定表单变化
  bindFormChange(e){
    let { form_key, value } = app._bindFormChange(e)
    let form_data = this.updateFormData(form_key, value)
    this.setData({
      form_data
    })
  },
  updateFormData(form_key, value){
    let form_data = app._deepClone(this.data.form_data)
    switch(form_key){
      case 'nickname':
      case 'phone':
        form_data[form_key] = value
        break
      case 'region':
        form_data.province = value[0]
        form_data.city = value[1]
        form_data.area = value[2]
        break
      case 'head_url':
        let avatar = value[0] 
        form_data[form_key] = avatar && avatar.id || ''
        break
      default:

    }
    return form_data
  }
})