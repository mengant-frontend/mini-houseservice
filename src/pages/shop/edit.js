import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    photo_list: [],
    form_data: {}
  },
  // 加载店铺信息
  async loadData() {
    // let server_res =
  },
  async modify() {
    let form_data = app._deepClone(this.data.form_data)
    app.post({
      url: '/api/v1/shop/update',
      data: form_data
    })
  }
})
