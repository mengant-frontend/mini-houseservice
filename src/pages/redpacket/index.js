import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    list: [],
    type: '',
    active_index: -1
  },
  onLoad(query) {
    this.setData({
      type: query.type || ''
    })
    this.loadList()
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  //获取红包列表
  async loadList() {
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.get({
      url: '/api/v1/red/list'
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    // 做点容错处理
    data.forEach(item => {
      item.detail = item.detail || {}
    })
    this.setData({
      list: data
    })
  },
  select(e) {
    let { type } = this.data
    if (type !== 'select') {
      return
    }
    let { currentTarget: { dataset: { index } } } = e
    this.setData({
      active_index: index
    })
  },
  ensure() {
    let list = app._deepClone(this.data.list)
    let active_index = this.data.active_index
    app.global_data.red_packet = list[active_index]
    wx.navigateBack()
  },
  cancel() {
    app.global_data.red_packet = null
    wx.navigateBack()
  }
})
