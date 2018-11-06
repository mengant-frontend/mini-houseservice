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
    this.setData({
      shop_id: app.global_data.shop_id
    })
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
    this.setData({ tabs_list })
    await this.getOrderList()
    wx.stopPullDownRefresh()
  },
  async onShow(){
    let tabs_current = this.data.tabs_current
    let tabs_list = this.data.tabs_list
    let item = tabs_list[tabs_current]
    item.current_page = 0
    item.total = 0
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
              order_id: tabs_current === 0 ? t.id : t.order_id,
              title: tabs_current === 0 ? t.demand_name : t.source_name,
              origin_money: item.id === 'ordered' ? app._toMoney(t.money) : app._toMoney(t.origin_money),
              update_money: app._toMoney(t.update_money),
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
        console.log(item.order_list)
        tabs_list[tabs_current] = item
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
  },
  async cancelDemand({ currentTarget }) {
    let { dataset: { id } } = currentTarget
    let wx_res = await app.asyncApi(wx.showModal, {
      title: '温馨提示',
      content: '请确认取消订单操作'
    })
    if (!wx_res.confirm) {
      return
    }
    let url = '/api/v1/demand/handel'
    let server_res = await app.post({
      url: url,
      data: {
        id: id
      }
    })
    let { success, msg } = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let tabs_list = app._deepClone(this.data.tabs_list)
    let list = tabs_list[0].order_list
    let index
    for (let i = 0; i < list.length; i++) {
      if (list[i].order_id = id) {
        index = i
        break
      }
    }
    if (index !== undefined) {
      list.splice(index, 1)
    }
    this.setData({
      tabs_list
    })
  },
  doAction({ currentTarget }) {
    let { dataset: { id, state } } = currentTarget
    let current = this.data.tabs_current
    let tabs_list = app._deepClone(this.data.tabs_list)
    let list = tabs_list[current].order_list
    let item
    for (let i = 0; i < list.length; i++) {
      if (list[i].order_id = id) {
        item = list[i]
        break
      }
    }
    if (state == 4) {
      wx.navigateTo({
        url: "/pages/order-detail/index?type=2&state=4&id=" + item.order_id
      })
    } else if (item !== undefined) {
      wx.navigateTo({
        url: "/pages/order-detail/index?type=2&state=" + state + "&id=" + item.order_id
      })
    }
  }
})
