import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取圈子内容
      get_community: '/api/v1/circle/cms',
      // 获取评论列表
      get_comment_list: '/api/v1/circle/comment/list',
      // 点赞
      like: '/api/v1/circle/comment/zan',
      // 提交评论
      send: '/api/v1/circle/comment/save'
    },
    // 请求锁
    request_lock: {
      get_comment_list: true,
      like: true,
      send: true
    },
    padding_bottom: 60,
    page: 0,
    total: 0,
    total_add: 0,
    if_no_more: false,
    comment_list: [],
    parent_id: 0,
    parent_nick_name: '',
    parent_content: ''
  },

  async onLoad({ id }) {
    // 获取 #container 节点的高度
    wx.showNavigationBarLoading()
    // 获取圈子内容
    let res = await app.get({
      url: this.data.api_url.get_community,
      data: {
        id: id
      }
    })
    wx.hideNavigationBarLoading()
    if (res.success) {
      let data = res.data
      wx.setNavigationBarTitle({
        title: data.title
      })
      this.setData({
        id: Number(id),
        title: data.title,
        date: data.create_time,
        view_num: data.read_num,
        img_url: data.head_img,
        content: decodeURIComponent(data.content)
      }, () => {
        // 获取评论列表
        this.getCommentList()
      })
      // 记录浏览
      wx.setStorageSync('community_type_id', data.category.id)
      wx.setStorageSync('community_id', id)
    } else { // 出错处理debug
      console.log(res)
    }
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
          page: this.data.page + 1,
          size: 6,
          id: this.data.id
        }
      })
      if(res.success) {
        let data = res.data
        let data_list = data.data
        let total = data.total
        let total_add = this.data.total_add
        if (total > 0) {
          data_list.forEach(item => {
            comment_list.push({
              id: item.id,
              avatar_url: item.avatarUrl,
              nick_name: item.nickName,
              date: item.create_time,
              if_liked: item.state === 0 ? false : true,
              likes: item.zan,
              content: item.content,
              comment_someone: {
                nick_name: item.parent_name,
                content: item.parent_content
              }
            })
          })
          if_no_more = comment_list.length < total + total_add ? false : true
        } else {
          if_no_more = true
        }
        this.setData({
          comment_list,
          total: total,
          page: data.current_page,
          if_no_more
        })
      } else { // 出错处理debug
        console.log(res)
      }
      this.setData({
        if_loading: false,
        'request_lock.get_comment_list': true
      })
    }
  },

  // 点赞，不能取消
  like({ detail }) {
    let id = detail.id
    let comment_list = this.data.comment_list
    comment_list.forEach(item => {
      if (item.id === id && this.data.request_lock.like) {
        this.setData({ 'request_lock.like': false})
        app.post({
          url: this.data.api_url.like,
          data: { id }
        }).then(res => {
          if (res.success && res.data.state === 1) {
            comment_list.map(t => {
              if (t.id === id) {
                t.if_liked = true
                t.likes++
              }
              return t
            })
          } else { // 出错处理debug
            console.log(res)
          }
          this.setData({
            comment_list,
            'request_lock.like': true
          })
        })
      }
    })
  },

  // 回复
  reply({ detail }) {
    let id = detail.id
    let comment_list = this.data.comment_list
    comment_list.forEach(item => {
      if (item.id === id) {
        this.setData({
          input_focus: true,
          parent_id: id,
          parent_nick_name: `@${item.nick_name}：`,
          parent_content: item.content
        })
      }
    })
  },

  // 输入评论
  enterComment({ detail }) {
    let enter_comment = detail.value
    let parent_nick_name = this.data.parent_nick_name
    if (parent_nick_name) {
      if (enter_comment.length < parent_nick_name.length) {
        this.setData({
          parent_id: 0,
          parent_nick_name: '',
          parent_content: ''
        })
        return
      }
      enter_comment = enter_comment.substring(parent_nick_name.length)
    }
    this.setData({ enter_comment })
  },

  // 提交评论
  async send() {
    let enter_comment = this.data.enter_comment
    let comment_list = this.data.comment_list
    let user_info = app.global_data.user_info
    if (enter_comment && this.data.request_lock.send) {
      wx.showNavigationBarLoading()
      this.setData({ 'request_lock.send': false })
      let res = await app.post({
        url: this.data.api_url.send,
        data: {
          parent_id: this.data.parent_id,
          content: enter_comment,
          c_id: this.data.id
        }
      })
      wx.hideNavigationBarLoading()
      if (res.success) {
        let item = {
          id: res.data.id,
          avatar_url: user_info.avatarUrl,
          nick_name: user_info.nickName,
          date: this.getFormatTime(),
          if_liked: false,
          likes: 0,
          content: enter_comment,
          comment_someone: {
            nick_name: this.data.parent_nick_name.slice(1, -1),
            content: this.data.parent_content
          }
        }
        let new_comment_list = []
        comment_list.forEach(t => {
          new_comment_list.push(t)
        })
        if (this.data.parent_id) {
          comment_list.forEach((t, index) => {
            if (t.id === this.data.parent_id) {
              new_comment_list.splice(index + 1, 0, item)
            }
          })
        } else {
          new_comment_list.unshift(item)
        }
        await this.setData({
          comment_list: new_comment_list,
          total_add: this.data.total_add + 1,
          enter_comment: '',
          parent_id: 0,
          parent_nick_name: '',
          parent_content: ''
        })
      } else { // 出错处理debug
        console.log(res)
      }
      this.setData({ 'request_lock.send': true })
    }
  },

  /**
   * 得到格式化的时间
   * @param  {Date}   date 某天的date对象（默认为当天）
   * @return {String}      如"2018-09-17 10:00:00"
   */
  getFormatTime(date) {
    let d = date || new Date()
    let year = d.getFullYear()
    let month = d.getMonth() + 1
    let day = d.getDate()
    let hour = d.getHours()
    let minute = d.getMinutes()
    let second = d.getSeconds()
    let format = v => v = v < 10 ? `0${v}` : v
    return `${year}-${format(month)}-${format(day)} ${format(hour)}:${format(minute)}:${format(second)}`
  }
})
