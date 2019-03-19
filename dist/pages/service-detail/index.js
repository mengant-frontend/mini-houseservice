import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取服务详情
      get_service_detail: '/house/api/v1/extend/mini/service',
      // 获取评论列表
      get_comment_list: '/house/api/v1/comment/service',
      // 收藏
      collect: '/house/api/v1/collection/save',
      // 取消收藏
      collect_cancel: '/house/api/v1/collection/handel'
    },
    // 请求锁
    request_lock: {
      get_comment_list: true,
      collect: true
    },
    comment_page: 0,
    comment_total: 0,
    if_no_more: false,
    comment_list: [],
    if_collected: false,
		can_call: false, //是否可以联系商家
    show_home: false
	},

  async onLoad(options) {
    let service_id = options.id
    this.setData({
      show_home: !!options.share
    })
    wx.showNavigationBarLoading()
    // 获取服务详情
    let res = await app.get({
      url: this.data.api_url.get_service_detail,
      data: {
        id: service_id
      }
    })
    wx.hideNavigationBarLoading()
    if (res.success) {
      let data = res.data
      let img_list = []
      data.imgs.forEach(item => {
        img_list.push(item.img_url.url)
      })
      let extend = data.extend || {}
      if (extend.extend == 1) {
        extend.extend_price = app._toMoney(extend.extend_price)
      }
      this.setData({
        service_id,
        store_id: data.shop_id,
        banner_img: img_list,
        name: data.name,
        money: app._toMoney(data.price),
        unit: data.unit,
        location: data.shop.address,
        phone: data.shop.phone,
        des: data.des,
        score: data.score ? data.score : 5,
        collection: data.collection,
        if_collected: data.collection > 0 ? true : false,
				can_call: data.phone_check == '1',
        ...extend
      }, () => {
        // 获取评论列表
        this.getCommentList()
      })
    }
  },
	onShareAppMessage(){
		return {
			title: this.data.name,
			path: "/pages/service-detail/index?share=true&id=" + this.data.service_id
		}
	},
	onReachBottom(){
		this.getCommentList()
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
        id: this.data.service_id,
        type: 1
      }

    if (if_collected) {
      url = this.data.api_url.collect
    } else {
      url = this.data.api_url.collect_cancel
    }
    this.setData({
      'request_lock.collect': false
    })
    let res = await app.post({url, data})
    if (res.success) {
      let collection = 0
      if (if_collected) {
        collection = res.data.id
      }
      this.setData({if_collected, collection})
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

  // 获取评论列表
  async getCommentList() {
    let comment_list = this.data.comment_list
    let if_no_more = this.data.if_no_more
    if (!if_no_more && this.data.request_lock.get_comment_list) {
      this.setData({
        if_loading: true,
        'request_lock.get_comment_list': false
      })
      let res = await app.get({
        url: this.data.api_url.get_comment_list,
        data: {
          page: this.data.comment_page + 1,
          size: 6,
          id: this.data.service_id
        }
      })
      if (res.success) {
        let data = res.data
        let data_list = data.data
        let comment_total = data.total
        let len = comment_list.length
        if (comment_total > 0) {
          data_list.forEach((item, index) => {
            item.imgs = item.imgs || []
            let imgs = item.imgs.map(img => {
              return img.img_url.url
            })
            comment_list.push({
              id: len + index,
              avatar_url: item.avatarUrl,
              nick_name: item.nickName,
              date: item.create_time,
              content: item.content,
              imgs: imgs,
              score_type: item.score_type
            })
          })
          if_no_more = comment_list.length < comment_total ? false : true
        } else {
          if_no_more = true
        }
        this.setData({
          comment_list,
          comment_total,
          comment_page: data.current_page,
          if_no_more
        })
      }
      this.setData({
        if_loading: false,
        'request_lock.get_comment_list': true
      })
    }
  },
  // 点击预约
  booking(e) {
    let shop_id = app.global_data.shop_id
    if (Number(shop_id) > 0) {
      app._error('商家不可执行预约服务操作')
      return
    }
    let {currentTarget: {dataset: {s_id}}} = e
    wx.navigateTo({
      url: '/pages/booking/index?s_id=' + s_id
    })
  }
})
