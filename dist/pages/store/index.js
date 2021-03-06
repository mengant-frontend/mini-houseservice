import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取店铺详情
      get_store_detail: '/house/api/v1/shop/info/normal',
      // 获取服务列表
      get_service_list: '/house/api/v1/shop/service/normal/list',
      // 收藏
      collect: '/house/api/v1/collection/save',
      // 取消收藏
      collect_cancel: '/house/api/v1/collection/handel'
    },
    // 请求锁
    request_lock: {
      collect: true,
      get_service_list: true
    },
    service_page: 0,
    service_total: 0,
    if_no_more: false,
    service_list: [],
		can_call: false, //是否可以联系商家
		params:{ 
			id: 'id'
		},
    show_home: false
  },

  async onLoad(options) {
    let store_id = options.id
    this.setData({
      show_home: !!options.share
    })
    wx.showNavigationBarLoading()
    // 获取店铺详情
    let res = await app.get({
      url: this.data.api_url.get_store_detail,
      data: {
        id: store_id
      }
    })
    wx.hideNavigationBarLoading()
    if (res.success) {
      let data = res.data
      let img_list = []
      data.info.imgs.forEach(item => {
        img_list.push(item.img_url.url)
      })
      this.setData({
        store_id,
        banner_img: img_list,
        name: data.info.name,
        location: data.info.address,
        phone: data.info.phone,
        comment_count: data.comment_count,
        score: data.score ? data.score : 5,
        collection: data.collection,
        if_collected: data.collection > 0 ? true : false,
				can_call: data.phone_check == '1'
      }, () => {
        // 获取服务列表
        this.getServiceList()
      })
    }
  },
  // 收藏
  async collect() {
    if (!this.data.request_lock.collect) {
      return
    }
    wx.showNavigationBarLoading()
    let if_collected = !this.data.if_collected
    let url = '',
    data = {
      id: this.data.store_id,
      type: 2
    }
    if (if_collected) {
      url = this.data.api_url.collect

    } else {
      url = this.data.api_url.collect_cancel
    }
    this.setData({
      'request_lock.collect': false
    })
    let res = await app.post({ url, data })
    if (res.success) {
      let collection = 0
      if (if_collected) {
        collection = res.data.id
      }
      this.setData({ if_collected, collection })
    }
    wx.hideNavigationBarLoading()
    this.setData({
      'request_lock.collect': true
    })
  },

  // 调起拨号面板拨打电话
  callPhone() {
		if(!this.data.can_call){
			app._error('请预约后再联系商家')
			return 
		}
    app.asyncApi(wx.makePhoneCall, {
      phoneNumber: this.data.phone
    })
  },

  // 获取服务列表
  async getServiceList() {
    let service_list = this.data.service_list
    let if_no_more = this.data.if_no_more
    if (!if_no_more && this.data.request_lock.get_service_list) {
      this.setData({
        if_loading: true,
        'request_lock.get_service_list': false
      })
      let res = await app.get({
        url: this.data.api_url.get_service_list,
        data: {
          page: this.data.service_page + 1,
          size: 6,
          id: this.data.store_id
        }
      })
      if (res.success) {
        let data = res.data
        let data_list = data.data
        let service_total = data.total
        if (service_total > 0) {
          data_list.forEach(item => {
            service_list.push({
              id: item.id,
              img_url: item.cover,
              title: item.name,
              money: app._toMoney(item.price),
              sales: item.sell_num,
							unit: item.unit
            })
          })
          if_no_more = service_list.length < service_total ? false : true
        } else {
          if_no_more = true
        }
        this.setData({
          service_list,
          service_total,
          service_page: data.current_page,
          if_no_more
        })
      }
      this.setData({
        if_loading: false,
        'request_lock.get_service_list': true
      })
    }
  }
})
