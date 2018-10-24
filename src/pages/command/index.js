import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取订单列表
      get_order_list: '/api/v1/order/demand/list'
    },
    // 请求锁
    request_lock: {
      get_order_list: true
    },
    // 记录当前 tabs_current
    tabs_current: 0,
    // tabs 列表数据
    tabs_list: [
      {
        id: 'ordered',
        title: '待接单',
        dot: false,
        count: 0,
        current_page: 0,
        total: 0,
        if_no_more: false,
        order_list: []
      },
      {
        id: 'unpaid',
        title: '待付款',
        dot: false,
        count: 0,
        current_page: 0,
        total: 0,
        if_no_more: false,
        order_list: []
      },
      {
        id: 'unconfirmed',
        title: '待确认',
        dot: false,
        count: 0,
        current_page: 0,
        total: 0,
        if_no_more: false,
        order_list: []
      },
      {
        id: 'unevaluated',
        title: '待评价',
        dot: false,
        count: 0,
        current_page: 0,
        total: 0,
        if_no_more: false,
        order_list: []
      },
      {
        id: 'completed',
        title: '已完成',
        dot: false,
        count: 0,
        current_page: 0,
        total: 0,
        if_no_more: false,
        order_list: []
      }
    ]
  },

  async onLoad() {
    await this.getOrderList()
  },

  // 下拉刷新
  async onPullDownRefresh() {
    let tabs_current = this.data.tabs_current
    let tabs_list = this.data.tabs_list
    let item = tabs_list[tabs_current]
    item.current_page = 0
    item.total = 0
    item.count = 0
    item.if_no_more = false
    item.order_list = []
    tabs_list[tabs_current] = item
    await this.setData({ tabs_list })
    this.getOrderList()
    wx.stopPullDownRefresh()
  },

  // 加载订单列表
  async getOrderList() {
    let tabs_current = this.data.tabs_current
    let tabs_list = this.data.tabs_list
    let item = tabs_list[tabs_current]
    if (!item.if_no_more && this.data.request_lock.get_order_list) {
      this.setData({
        if_loading: true,
        'request_lock.get_order_list': false
      })
      let res = await app.get({
        url: this.data.api_url.get_order_list,
        data: {
          page: item.current_page + 1,
          size: 6,
          order_type: tabs_current + 1,
          list_type: 1
        }
      })
      if (res.success) {
        let data = res.data
        let data_list = data.data
        let total = data.total
        if (total > 0) {
          data_list.forEach(t => {
            item.order_list.push({
              state: t.state,
              order_id: t.order_id,
              title: t.source_name,
              origin_money: item.id === 'ordered' ? t.money : t.origin_money,
              update_money: t.update_money,
              date: t.time_begin
            })
          })
          item.if_no_more = item.order_list.length < total ? false : true
        } else {
          item.if_no_more = true
        }
        item.count = item.id !== 'completed' ? total : 0
        item.total = total
        item.current_page = data.current_page
        tabs_list[tabs_current] = item
        this.setData({ tabs_list })
      } else { // 出错处理debug
        console.log(res.msg)
        app.errorToast({
          content: '加载失败~~',
          duration: 0
        })
      }
      this.setData({
        if_loading: false,
        'request_lock.get_order_list': true
      })
    }
  },

  // swiper 切换，记录 tabs_current，如果当前订单列表为空则加载数据
  async swiperChange({ detail }) {
    let tabs_current = detail.tabs_current
    await this.setData({ tabs_current })
    let tabs_list = this.data.tabs_list
    if (tabs_list[tabs_current].order_list.length === 0) {
      await this.getOrderList()
    }
  }
})
