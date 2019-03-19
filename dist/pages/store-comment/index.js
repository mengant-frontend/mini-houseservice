import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取评论列表
      get_comment_list: '/house/api/v1/order/comments'
    },
    // 请求锁
    request_lock: {
      get_comment_list: true
    },
    comment_page: 0,
    comment_total: 0,
    if_no_more: false,
    comment_list: []
  },

  async onLoad(options) {
    await this.setData({
      store_id: options.store_id
    })
    this.getCommentList()
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
          size: 10,
          id: this.data.store_id
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
  }
})
