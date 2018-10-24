import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取需求列表
      get_demand_list: '/api/v1/demand/list'
    },
    // 请求锁
    request_lock: {
      get_demand_list: true
    },
    // 记录当前 tabs_current
    tabs_current: 0,
    // tabs 列表数据
    tabs_list: [
      {
        id: 'house',
        title: '家政',
        dot: false,
        count: 0,
        current_page: 0,
        if_no_more: false,
        grade: 1,
        demand_list: []
      },
      {
        id: 'maintain',
        title: '维修',
        dot: false,
        count: 0,
        current_page: 0,
        if_no_more: false,
        grade: 1,
        demand_list: []
      }
    ]
  },

  async onLoad() {
    this.setData({
      shop_id: app.global_data.shop_id
    })
    this.getDemandList()
  },

  // 下拉刷新
  async onPullDownRefresh() {
    let tabs_current = this.data.tabs_current
    let tabs_list = this.data.tabs_list
    let item = tabs_list[tabs_current]
    item.current_page = 0
    item.if_no_more = false
    item.demand_list = []
    tabs_list[tabs_current] = item
    await this.setData({ tabs_list })
    this.getDemandList()
    wx.stopPullDownRefresh()
  },

  // swiper 切换，记录 tabs_current，如果当前需求列表为空则加载数据
  async swiperChange({ detail }) {
    let tabs_current = detail.tabs_current
    await this.setData({ tabs_current })
    let tabs_list = this.data.tabs_list
    if (tabs_list[tabs_current].demand_list.length === 0) {
      await this.getDemandList()
    }
  },

  // 获取需求列表
  async getDemandList() {
    let tabs_current = this.data.tabs_current
    let tabs_list = this.data.tabs_list
    let item = tabs_list[tabs_current]
    let location = app.global_data.location
    if (!item.if_no_more && this.data.request_lock.get_demand_list) {
      this.setData({
        if_loading: true,
        'request_lock.get_demand_list': false
      })
      let res = await app.get({
        url: this.data.api_url.get_demand_list,
        data: {
          province: location[0],
          city: location[1],
          area: location[2],
          latitude: app.global_data.latitude,
          longitude: app.global_data.longitude,
          page: item.current_page + 1,
          size: 6,
          type: tabs_current === 0 ? 2 : 1
        }
      })
      if (res.success) {
        let data = res.data
        let data_list = data.data
        let total = data.total
        if (total > 0) {
          data_list.forEach(t => {
            item.demand_list.push({
              demand_id: t.id,
              title: t.des,
              money: t.money,
              area: t.area,
              distance: t.distance
            })
          })
          item.if_no_more = item.demand_list.length < total ? false : true
        } else {
          item.if_no_more = true
        }
        item.current_page = data.current_page
        tabs_list[tabs_current] = item
        this.setData({ tabs_list })
      } else { // 出错处理debug
        console.log(res)
      }
      this.setData({
        if_loading: false,
        'request_lock.get_demand_list': true
      })
    }
  }
})