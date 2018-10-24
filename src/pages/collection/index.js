import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取列表
      get_list: '/api/v1/collection/list'
    },
    // 请求锁
    request_lock: {
      get_list: true
    },
    // 记录当前 tabs_current
    tabs_current: 0,
    // tabs 列表数据
    tabs_list: [
      {
        id: 'service',
        title: '服务',
        dot: false,
        count: 0,
        current_page: 0,
        if_no_more: false,
        list: []
      },
      {
        id: 'store',
        title: '店铺',
        dot: false,
        count: 0,
        current_page: 0,
        if_no_more: false,
        list: []
      }
    ]
  },

  async onLoad() {
    this.getList()
  },

  // 下拉刷新
  async onPullDownRefresh() {
    let tabs_current = this.data.tabs_current
    let tabs_list = this.data.tabs_list
    let item = tabs_list[tabs_current]
    item.current_page = 0
    item.if_no_more = false
    item.list = []
    tabs_list[tabs_current] = item
    await this.setData({ tabs_list })
    this.getList()
    wx.stopPullDownRefresh()
  },

  // swiper 切换，记录 tabs_current，如果当前列表为空则加载数据
  async swiperChange({ detail }) {
    let tabs_current = detail.tabs_current
    await this.setData({ tabs_current })
    let tabs_list = this.data.tabs_list
    if (tabs_list[tabs_current].list.length === 0) {
      await this.getList()
    }
  },

  // 获取需求列表
  async getList() {
    let tabs_current = this.data.tabs_current
    let tabs_list = this.data.tabs_list
    let item = tabs_list[tabs_current]
    if (!item.if_no_more && this.data.request_lock.get_list) {
      this.setData({
        if_loading: true,
        'request_lock.get_list': false
      })
      let res = await app.get({
        url: this.data.api_url.get_list,
        data: {
          page: item.current_page + 1,
          size: 6,
          type: tabs_current + 1
        }
      })
      if (res.success) {
        let data = res.data
        let data_list = data.data
        let total = data.total
        if (total > 0) {
          data_list.forEach(t => {
            item.list.push({
              p_id: t.s_id,
              id: t.id,
              img_url: tabs_current === 0 ? t.service.cover : t.shop.head_url,
              title: tabs_current === 0 ? t.service.name : t.shop.name,
              money: tabs_current === 0 ? t.service.price : '',
              address: tabs_current === 0 ? '' : t.shop.address,
              phone: tabs_current === 0 ? '' : t.shop.phone
            })
          })
          item.if_no_more = item.list.length < total ? false : true
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
        'request_lock.get_list': true
      })
    }
  }
})