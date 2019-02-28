import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    title: '',
    content: '',
    img_list: []
  },
  onShow(){
    let global_data = app.global_data,
      { pic_id, pic_url } = global_data,
      img_list = this.data.img_list
    if(pic_url && pic_id){
      img_list.push({
        id: pic_id,
        url: pic_url
      })
    }
    this.setData({
      img_list: img_list
    })
    app.global_data.pic_url = null
    app.global_data.pic_id = null
  },
  bindFormChange(e){
    let { form_key, value } = app._bindFormChange(e)
    let new_data = {}
    new_data[form_key] = value
    this.setData(new_data)
  },
  async add(){
    let { title, content, img_list } = this.data
    if(!title){
      app._warn('请输入标题')
      return false
    }
    if(!content){
      app._warn('请输入内容')
      return false
    }
    let res = await app.post({
      url: '/api/v1/forum/save',
      data: {
        title,
        content,
        imgs: img_list.map(img => img.id).join(',')
      }
    })
    let { success, msg, data } = res
    if(!success){
      app._error(msg)
      return false
    }
    wx.redirectTo({
      url: '/pages/forum/index'
    })
  }
})