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
    },
    tabs_list: []
  },

  async onLoad() {
    let location = app.global_data.location
    await this.setData({ location })
    await this.getCommunityType()
  },

  async onShow() {
    // 判断地理位置是否变化，重新加载数据
    let location = app.global_data.location
    if (location[2] !== this.data.location[2]) {
      await this.setData({ location })
      await this.getCommunityType()
    }else{
        this.getCommunityList(true)
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
          list: [],
					top_5: [],
					top_5_titles: []
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
    }
  },

  // 根据 tabs_current 获取对应圈子类别列表
  async getCommunityList(reload) {
    let tabs_current = this.data.tabs_current
    let location = this.data.location
    let tabs_list = this.data.tabs_list
    let item = tabs_list[tabs_current]
    let page = reload ? 1 : item.page + 1
    this.setData({
        if_loading: true,
        'request_lock.get_community_list': false
      })
      let res = await app.get({
        url: this.data.api_url.get_community_list,
        data: {
          page: page,
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
            if(page === 1){
                item.list = data_list.map(t => {
                    return {
                      id: t.id,
                      title: t.title,
                      img_url: t.head_img,
                      date: t.create_time,
                      view_num: t.read_num
                    }
                })
            }else{
                data_list.forEach(t => {
                    item.list.push({
                      id: t.id,
                      title: t.title,
                      img_url: t.head_img,
                      date: t.create_time,
                      view_num: t.read_num
                    })
                  })
            }
          
          item.if_no_more = item.list.length < total ? false : true
        } else {
          item.if_no_more = true
        }
        item.total = total
        item.page = data.current_page
        if(item.top_5.length < 5){
					if(item.list.length < 5){
						item.top_5 = item.list.map(itm => itm.img_url)
						item.top_5_titles = item.list.map(itm => itm.title)
					}else{
						item.top_5 = item.list.slice(0, 5).map(itm => itm.img_url)
						item.top_5_titles = item.list.slice(0, 5).map(itm => itm.title)
					}
				}
				tabs_list[tabs_current] = item
				
        this.setData({ tabs_list })
      }
      this.setData({
        if_loading: false,
        'request_lock.get_community_list': true
      })
  }
})
