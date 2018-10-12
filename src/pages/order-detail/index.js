import regenratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    state: '待付款',
    order_data: {},
    picker_options: ['是', '否'],
    picker_selected: '否',
    current_state: 0,
  },
  onLoad(query){
    if(!query.order_id){
      app._error('缺少order_id')
    }else{
      this.loadOrder(query.order_id)
    }
  },
  async loadOrder(id){
    let server_res = await app.get({
      url: '/test',
      data: {
        id: id
      }
    })
    let { success, msg, data } = server_res
    if(!success){
      app._error(msg)
      return
    }
    this.setData({
      order_data: data
    })
  },
  //商家是否已联系
  bindPicker(e){
    let value = e.detail.value
    this.setData({
      picker_selected: value
    })
  }
})