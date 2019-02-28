import regeneratorRuntime from '../../lib/runtime'
import { size } from '../../common/constant'
const app = getApp()
Page({
  data: {
    screen_width: 0,
    tabs_list: [{
      id: 'all',
      title: '全部帖子',
      page: 1,
      total: 0,
      list: [],
      type: '2',
      ifNoMore: false,
      scroll_top: '',
      scroll_top_temp: ''
    }, {
      id: 'mine',
      title: '我的帖子',
      page: 1,
      total: 0,
      list: [],
      type: '1',
      ifNoMore: false,
      scroll_top: '',
      scroll_top_temp: ''
    }],
    current: 0,
    comment: {
      parent_id: 0,
      content: '',
      f_id: '',
      parent_name: '',
      index: 0
    },
    focus: false,
    temp_input: ''
  },
  onLoad(){
    this.getSystemInfo()
    this.getList()
  },
  getSystemInfo(){
    let res = wx.getSystemInfoSync()
    this.setData({
      screen_width: res.screenWidth
    })
  },
  swiperChange(e){
    let { detail: { tabs_current } } = e
    this.setData({ current: tabs_current })
    this.getList()
  },
  async getList(){
    let { current, tabs_list } = this.data,
      tab = tabs_list[current]
    if(tab.ifNoMore){
      return
    }
    tab.loading = true
    this.setData({
      tabs_list: tabs_list
    })
    let res = await app.get({
      url: '/api/v1/forum/mini/list',
      data: {
        page: tab.page,
        size: size,
        type: tab.type
      }
    })
    let { data, success, msg } = res
    if(!success){
      app._error(msg)
      return
    }
    let new_list = data.data || [],
      total = data.total
    if(tab.page > 1){
      tab.list = tab.list.concat(new_list)
    }else{
      tab.list = new_list
    }
    tab.list.forEach(item => {
      let comment = item.comment || {}
      if(Array.isArray(comment)){
        comment = {
          total: 0
        }
      }
      comment.data = comment.data || []
      item.comment = comment
      item.imgs = (item.imgs || []).map(img => {
        return {
          id: img.id,
          url: img.img_url && img.img_url.url
        }
      })
    })

    tab.total = total || 0
    tab.ifNoMore = tab.total <= tab.list.length
    tab.scroll_top = tab.scroll_top_temp
    this.setData({
      tabs_list: tabs_list
    })
    this.generateMore()
  },
  bindScroll(e){
    let { current, tabs_list } = this.data,
      tab = tabs_list[current]
    let { detail: { scrollHeight }} = e
    tab.scroll_top_temp = scrollHeight
  },
  handleScrolltolower(e){
    let { current, tabs_list } = this.data,
      tab = tabs_list[current],
      list = tab.list
    tab.page = tab.page + 1
    this.setData({
      tabs_list
    })
    wx.nextTick(() => {
      this.getList()
    })
  },
  async viewMoreComment(e, idx, page){
    let { current, tabs_list } = this.data,
      tab = tabs_list[current],
      index
    if(e){
      index = e.currentTarget.dataset.index
    }else{
      index = idx
    }
    let f = tab.list[index],
      { id, comment } = f
    let p = page || comment.current_page + 1
    let res = await app.get({
      url: '/api/v1/forum/comments/mini',
      data: {
        page: p,
        size: 5,
        f_id: id
      }
    })
    let { success, msg, data } = res
    if(!success){
      app._error(msg)
      return false
    }
    if(p === 1){
      comment.data = data.data || []
    }else{
      comment.data = comment.data.concat(data.data)
    }
    console.log('p', p)
    comment.current_page = p
    comment.total = data.total
    this.setData({
      tabs_list
    })
  },
  closeComment(e){
    let { current, tabs_list } = this.data,
      tab = tabs_list[current],
      { currentTarget: { dataset: { index } } } = e
    console.log(tab, index)
    let f = tab.list[index],
      { comment } = f
    comment.data = comment.data.slice(0, 5)
    comment.current_page = 1
    this.setData({
      tabs_list
    })
  },
  generateMore(){
    let { tabs_list, current, screen_width } = this.data,
      list = tabs_list[current].list,
      self = this
    wx.nextTick(() => {
      let query = this.createSelectorQuery()
      query.selectAll(`#tab_${current} .main-text`).fields({
        computedStyle: ['height']
      }).exec(res =>{
        let origin = 115 / 750
        res[0].forEach((item, index) => {
          console.log(parseFloat(item.height) / screen_width > origin)
          list[index].show_more = parseFloat(item.height) / screen_width > origin
          list[index].height = 'height: ' + item.height + '; max-height: ' + item.height
        })
        self.setData({
          tabs_list: tabs_list
        })
      })
    })
  },
  getMore(e){
    let { currentTarget: { dataset: { index } }} = e,
      { tabs_list, current } = this.data,
      list = tabs_list[current].list
    list[index].active = true
    list[index].show_more = false
    this.setData({
      tabs_list: tabs_list
    })
  },
  inputComment(e){
    let { comment, focus } = this.data,
      { currentTarget: { dataset: { f_id, parent_id, nick_name, can_reply, index } } } = e
    if(focus){
      this.setData({
        focus: false
      })
    }
    if(!can_reply){
      return
    }
    wx.nextTick(() => {
      comment.f_id = f_id
      comment.parent_id = parent_id
      comment.nick_name = nick_name
      comment.index = index
      this.setData({
        comment: comment,
        focus: true
      })
    })
  },
  updateCommentContent(e){
    let { detail: { value } } = e,
      comment = this.data.comment
    comment.content = value
    this.setData({
      comment
    })

  },
  async addComment() {
    let {current, tabs_list, comment} = this.data,
      tab = tabs_list[current],
      f = tab.list[comment.index]
    console.log(current, comment, f)
    if (!comment.content) {
      app._warn('请输入评论内容')
      return false
    }
    let res = await app.post({
      url: '/api/v1/forum/comment/save',
      data: {
        f_id: comment.f_id,
        content: comment.content,
        parent_id: comment.parent_id
      }
    })
    let {success, msg, data} = res
    if (!success) {
      app._error(msg)
      return false
    }
    let len = Math.ceil(f.comment.data.length / 5)
    app._success('评论成功')
    let promise = null
    for(let i = 1; i <= len; i++){
      if(promise){
        await promise
      }
      promise = this.viewMoreComment(null, comment.index, i)
    }
    await promise
    comment = {}
    this.setData({
      comment: comment
    })
  }
});