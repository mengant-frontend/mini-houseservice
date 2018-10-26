import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取圈子类别
      get_community_type: '/api/v1/circle/mini/category/list',
      // 获取圈子列表
      get_community_list: '/api/v1/circle/mini/list'
    },
    // 请求锁
    request_lock: {
      get_community_list: true
    }
  },

  async onLoad() {
    let location = app.global_data.location
    await this.setData({ location })
    await this.getCommunityType()
  },

  async onShow() {
    // 如果缓存中存在刚刚浏览的圈子信息，增加对应的浏览数
    let tabs_list = this.data.tabs_list
    let type_id = wx.getStorageSync('community_type_id')
    let id = wx.getStorageSync('community_id')
    if (type_id) {
      tabs_list.map(item => {
        if (item.id == type_id) {
          item.list.map(t => {
            if (t.id == id) {
              t.view_num++
            }
            return t
          })
        }
        return item
      })
      this.setData({ tabs_list })
      // 清除缓存
      wx.clearStorageSync('community_type_id')
      wx.clearStorageSync('community_id')
    }
    // 判断地理位置是否变化，重新加载数据
    let location = app.global_data.location
    if (location[2] !== this.data.location[2]) {
      await this.setData({ location })
      await this.getCommunityType()
    }
  },

  // 切换 tabs 时，保存当前 tabs_current，当对应圈子类别列表为空则获取数据
  intCommunityList({ detail }) {
    let tabs_current = detail.tabs_current
    let list = this.data.tabs_list[tabs_current].list
    this.setData({ tabs_current }, () => {
      if (list.length === 0) {
        this.getCommunityList()
      }
    })
  },

  // 获取圈子类别列表
  async getCommunityType() {
    wx.showNavigationBarLoading()
    // 获取圈子类别列表
    let res = await app.get({
      url: this.data.api_url.get_community_type,
      data: {
        province: this.data.location[0],
        city: this.data.location[1],
        area: this.data.location[2]
      }
    })
    wx.hideNavigationBarLoading()
    if (res.success) {
      let data = res.data
      let tabs_list = []
      data.forEach(item => {
        tabs_list.push({
          id: item.id,
          title: item.name,
          dot: false,
          count: 0,
          page: 0,
          total: 0,
          if_no_more: false,
          list: []
        })
      })
      this.setData({
        tabs_current: 0,
        tabs_list
      }, () => {
        // 默认让 tabs_current 为 0 以获取第一项圈子类别列表
        if (!tabs_list.length) return
        this.getCommunityList()
      })
    } else { // 出错处理debug
      console.log(res)
    }
  },

  // 根据 tabs_current 获取对应圈子类别列表
  async getCommunityList() {
    let tabs_current = this.data.tabs_current
    console.log('tabs_current', tabs_current)
    let location = this.data.location
    console.log('location', location)
    let tabs_list = this.data.tabs_list
    console.log('tabs_list', tabs_list)
    let item = tabs_list[tabs_current]
    if (!item.if_no_more && this.data.request_lock.get_community_list) {
      this.setData({
        if_loading: true,
        'request_lock.get_community_list': false
      })
      let res = await app.get({
        url: this.data.api_url.get_community_list,
        data: {
          page: item.page + 1,
          size: 6,
          c_id: item.id,
          province: location[0],
          city: location[1],
          area: location[2]
        }
      })
      if (res.success) {
        let data = res.data
        let data_list = data.data
        let total = data.total
        if (total > 0) {
          data_list.forEach(t => {
            item.list.push({
              id: t.id,
              title: t.title,
              img_url: t.head_img,
              date: t.create_time,
              view_num: t.read_num
            })
          })
          item.if_no_more = item.list.length < total ? false : true
        } else {
          item.if_no_more = true
        }
        item.total = total
        item.page = data.current_page
        tabs_list[tabs_current] = item
        this.setData({ tabs_list })
      } else { // 出错处理debug
        console.log(res)
      }
      this.setData({
        if_loading: false,
        'request_lock.get_community_list': true
      })
    }
  }
})
