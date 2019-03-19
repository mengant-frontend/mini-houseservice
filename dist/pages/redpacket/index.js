import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    list: [],
    type: '',
    active_index: -1,
    money: 0,
    loading: false
  },
  onLoad(query) {
    this.setData({
      type: query.type || '',
      money: query.money || 0
    })
    this.loadList()
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  //获取红包列表
  async loadList() {
    let { type, money } = this.data
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    this.setData({
      loading: true
    })
    let server_res = await app.get({
      url: '/house/api/v1/red/list'
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    this.setData({
      loading: false
    })
    if (!success) {
      app._error(msg)
      return
    }
    // 做点容错处理
    data.forEach(item => {
      item.detail = item.detail || {}
    })
    data.forEach(item => {
      item.money = app._toMoney(item.money)
    })
    if(type === 'select'){
      money = parseFloat(money)
      data = data.filter(item => {
        return item.money < money
      })
    }
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
    wx.navigateBack({
      delta: 1
    })
  },
  cancel() {
    app.global_data.red_packet = null
    wx.navigateBack({
      delta: 1
    })
  }
})
