import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    id: '',
    type: '',
    rate: 0,
    remark: '',
    order_data: {},
    evaluate_type: '',
    imgs: '',
    red_money: 0,
		photo_list: []
  },
  onLoad(query) {
    this.setData({
      id: query.id,
      type: query.type
    })
    this.loadOrder()
  },
	onShow(){
		let global_data = app.global_data
		let new_data = app._deepClone(this.data)
		if(global_data.pic_id && global_data.pic_url){
			new_data.photo_list.push({
				id: global_data.pic_id,
				url: global_data.pic_url
			})
			app.global_data.pic_id = null
			app.global_data.pic_url = null
		}
		this.setData(new_data)
	},
	// 删除图片
	confirmDelete(e){
		let photo_list = app._deepClone(this.data.photo_list)
		let { detail:{ index } } = e
		if(index !== undefined){
			photo_list.splice(index, 1)
			this.setData({
				photo_list: photo_list
			})
		}
	},
  async loadOrder() {
    let { id, type } = this.data
    let err_msg = ''
    if (!id) {
      err_msg = '缺少订单id'
    } else if (!type) {
      err_msg = '缺少订单type'
    }

    let server_res = await app.get({
      url: '/house/api/v1/order',
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
    let { rate, evaluate_type, remark, id, type, order_data, photo_list } = this.data
    if (!rate) {
      app._warn('请对本次服务进行打分')
      return
    }
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.post({
      url: '/house/api/v1/order/comment',
      data: {
        score: rate,
        o_id: id,
        s_id: order_data.shop_id,
        content: remark,
        score_type: evaluate_type,
        order_type: type,
        imgs: photo_list.map(photo => photo.id).join(',')
      }
    })
    await app.asyncApi(wx.hideLoading)
    let { success, msg, data } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    if(data.red_money && data.red_money > 0){
      this.setData({
        red_money: data.red_money
      })
    }else{
      this.goNext()
    }

  },
  async closeRedPacketModal(){
    this.setData({
      red_money: 0
    })
    this.goNext()
  },
  async goNext(){
    let { rate, evaluate_type, remark, id, type, order_data, imgs } = this.data
    await app.asyncApi(wx.showToast, {
      title: '已提交'
    })
    await app.sleep()
    wx.redirectTo({
      url: `/pages/order-detail/index?id=${id}&type=${type}`
    })
  }
})
