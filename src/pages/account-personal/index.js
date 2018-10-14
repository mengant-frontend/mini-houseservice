import regeneratorRuntime from '../../lib/runtime' 
const app = getApp()
Page({
  data: {
    form_data: {},
    region: ['广东省', '广州市', '天河区'],
    text: ''
  },
  //绑定表单变化
  bindFormChange(e){
    let { form_key, value } = app._bindFormChange(e)
    let form_data = this.updateFormData(form_key, value)
    let region
    if(form_key === 'region'){
      region = value      
    }
    this.setData({
      form_data,
      region,
      text: JSON.stringify(form_data)
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
        form_data[form_key] = avatar && avatar.id
        break
      default:

    }
    return form_data
  }
})