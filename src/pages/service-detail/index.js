import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取服务详情
      get_service_detail: '/api/v1/extend/mini/service',
      // 获取评论列表
      get_comment_list: '/api/v1/comment/service',
      // 收藏
      collect: '/api/v1/collection/save',
      // 取消收藏
      collect_cancel: '/api/v1/collection/handel'
    },
    // 请求锁
    request_lock: {
      get_comment_list: true,
      collect: true
    },
    comment_page: 0,
    comment_total: 0,
    if_no_more: false,
    comment_list: []
  },

  async onLoad(options) {
    let service_id = options.service_id
    app.loadingToast({
      content: '加载中',
      duration: 0,
      mask: false
    })
    // 获取服务详情
    let res = await app.get({
      url: this.data.api_url.get_service_detail,
      data: {
        id: service_id
      }
    })
    app.hideToast()
    if (res.success) {
      app.successToast({
        content: '加载成功'
      })
      let data = res.data
      let img_list = []
      data.imgs.forEach(item => {
        img_list.push(item.img_url.url)
      })
      this.setData({
        service_id,
        store_id: data.shop_id,
        banner_img: img_list,
        name: data.name,
        money: data.price,
        unit: data.unit,
        location: data.shop.address,
        phone: data.shop.phone,
        des: data.des,
        score: data.score ? data.score : 5,
        if_collected: data.collection === 1 ? true : false
      }, () => {
        // 获取评论列表
        this.getCommentList()
      })
    } else { // 出错处理debug
      console.log(res.msg)
      app.errorToast({
        content: '加载失败~~',
        duration: 0
      })
    }
  },

  // 收藏
  async collect() {
    if (!this.data.request_lock.collect) {
      return
    }
    let if_collected = !this.data.if_collected
    let content = ''
    let url = ''
    let data = {
      id: this.data.service_id,
      type: 1
    }
    if (if_collected) {
      url = this.data.api_url.collect
      content = '收藏成功'
    } else {
      url = this.data.api_url.collect_cancel
      content = '取消收藏成功'
    }
    this.setData({
      'request_lock.collect': false
    })
    let res = await app.post({ url, data })
    if (res.success && res.data.errorCode === 0) {
      this.setData({ if_collected })
      app.successToast({ content })
    } else { // 出错处理debug
      console.log(res.msg)
      app.errorToast({
        content: '操作失败~~',
        duration: 0
      })
    }
    this.setData({
      'request_lock.collect': true
    })
  },

  // 调起拨号面板拨打电话
  callPhone() {
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
            comment_list.push({
              id: len + index,
              avatar_url: item.user.avatarUrl,
              nick_name: item.user.nickName,
              date: item.create_time,
              content: item.content
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
      } else { // 出错处理debug
        console.log(res.msg)
        app.errorToast({
          content: '加载失败~~',
          duration: 0
        })
      }
      this.setData({
        if_loading: false,
        'request_lock.get_comment_list': true
      })
    }
  }
})