import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    id: '',
    type: '',
    state: '',
    rate: 0,
    remark: '',
    order_data: {},
    evaluate_type: '',
    imgs: ''
  },
  onLoad(query) {
    this.setData({
      id: query.id,
      type: query.type,
      state: query.state
    })
    this.loadOrder()
  },
  async loadOrder() {
    let { id, type, state } = this.data
    let err_msg = ''
    if (!id) {
      err_msg = '缺少订单id'
    } else if (!type) {
      err_msg = '缺少订单type'
    }

    let server_res = await app.get({
      url: '/api/v1/order',
      data: {
        id: id,
        type
      }
    })
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    data.origin_money = app._toMoney(data.origin_money)
    if(data.update_money){
      data.update_money = app._toMoney(data.update_money)
    }
    this.setData({
      order_data: data
    })

  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  updateRate(e) {
    let index = e.detail.index
    let evaluate_type
    if (index < 3) {
      evaluate_type = '1'
    } else if (index < 5) {
      evaluate_type = '2'
    } else {
      evaluate_type = '3'
    }
    this.setData({
      rate: index,
      evaluate_type
    })
  },
  updateRemark(e) {
    const value = e.detail.value
    this.setData({
      remark: value
    })
  },
  selectEvaluate(e) {
    let { currentTarget: { dataset: { type } } } = e
    let rate
    switch (type) {
      case '1':
        rate = 5
        break;
      case '2':
        rate = 3
        break
      case '3':
        rate = 1
      default:
    }
    this.setData({
      evaluate_type: type,
      rate: rate
    })
  },
  updateImgs(e) {
    let { detail: { value } } = e
    let imgs = ''
    value = value || []
    imgs = value.filter(img => img.id)
      .map(img => img.id)
      .join(',')
    this.setData({
      imgs: imgs
    })
  },
  async confirm() {
    let { rate, evaluate_type, remark, id, type, order_data, imgs, state } = this.data
    if (!rate) {
      app._warn('请对本次服务进行打分')
      return
    }
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.post({
      url: '/api/v1/order/comment',
      data: {
        score: rate,
        o_id: id,
        s_id: order_data.shop_id,
        content: remark,
        score_type: evaluate_type,
        order_type: type,
        imgs: imgs
      }
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    await app.asyncApi(wx.showToast, {
      title: '已提交'
    })
    await app.sleep()
    state = Number(state) + 1
    wx.redirectTo({
      url: `/pages/order-detail/index?id=${id}&type=${type}&state=${state}`
    })
  }
})
