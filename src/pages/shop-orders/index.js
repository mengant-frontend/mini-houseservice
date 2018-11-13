import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取订单列表
      get_order_list: '/api/v1/order/service/list'
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
        id: 'unconfirmed',
        title: '待确认',
        dot: false,
        count: 0,
        current_page: 0,
        if_no_more: false,
        order_list: []
      },
      {
        id: 'unserviced',
        title: '待服务',
        dot: false,
        count: 0,
        current_page: 0,
        if_no_more: false,
        order_list: []
      },
      {
        id: 'servicing',
        title: '服务中',
        dot: false,
        count: 0,
        current_page: 0,
        if_no_more: false,
        order_list: []
      },
      {
        id: 'completed',
        title: '已完成',
        dot: false,
        count: 0,
        current_page: 0,
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
    item.count = 0
    item.if_no_more = false
    item.order_list = []
    tabs_list[tabs_current] = item
    this.setData({ tabs_list })
    await this.getOrderList()
    wx.stopPullDownRefresh()
  },
  async onShow(){
    let tabs_current = this.data.tabs_current
    let tabs_list = this.data.tabs_list
    let item = tabs_list[tabs_current]
    item.current_page = 0
    item.count = 0
    item.if_no_more = false
    item.order_list = []
    tabs_list[tabs_current] = item
    this.setData({ tabs_list })
    await this.getOrderList()
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
          list_type: 2
        }
      })
      if (res.success) {
        let data = res.data
        let data_list = data.data
        let total = data.total
        let count_all = data.count
        if (total > 0) {
          data_list.forEach(t => {
            item.order_list.push({
              order_id: t.order_id,
              id: t.id,
              title: t.source_name,
              origin_money: app._toMoney(t.origin_money),
              update_money: app._toMoney(t.update_money),
              date: t.time_begin
            })
          })
          item.if_no_more = item.order_list.length < total ? false : true
        } else {
          item.if_no_more = true
        }
        item.current_page = data.current_page
        tabs_list[tabs_current] = item
        tabs_list.forEach(tab => {
          switch (tab.id) {
            case 'unconfirmed':
              tab.count = count_all.shopConfirm
              break
            case 'unserviced':
              tab.count =  count_all.service
              break
            case 'servicing':
              tab.count = count_all.serviceIng
              break
            case 'completed':
              tab.count = count_all.shopComplete
                break
            default:
            
          }
        })
        this.setData({ tabs_list })
      } else { // 出错处理debug
        console.log(res)
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
