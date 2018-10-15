import regeneratorRuntime from '../../lib/runtime'
import { command_types } from '../../common/constant'
import { bindFormChange } from '../../helpers/index'
const app = getApp()
Page({
  data: {
    command_types: command_types,
    command_type: '家政',
    photo_list: [],
    form_data: {
      type: 1
    }
  },
  bindFormChange(e){
    let { form_key, value } = bindFormChange(e)
    this.updateFormData(form_key, value)
  },
  updateFormData(form_key, value){
    let form_data = app._deepClone(this.data.form_data)
    switch(form_key){
      case 'name':
      case 'phone':
      case 'desc':
      case 'money':
        form_data[form_key] = value
        break
      case 'type':

    }
  },
  updateDateTime(){
    console.log(arguments)
  }
})