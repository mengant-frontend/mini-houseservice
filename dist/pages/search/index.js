import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取列表
      get_list: '/house/api/v1/index/search'
    },
    // 请求锁
    request_lock: {
      get_list: true
    },
    choose_type: '服务',
    choose_colligate: '综合',
    choose_sales: '销量',
    key: '',
    search_type: 2,
    type: 1,
    page: 0,
    if_no_more: false,
    list: []
  },

  onLoad() {
    this.getList()
  },

  // 输入
  enter({ detail }) {
    let key = detail.value
    this.setData({ key })
  },

  // 搜索
  async search() {
    if (this.data.key) {
      await this.setData({
        page: 0,
        if_no_more: false,
        list: []
      })
      // 获取列表
      this.getList()
    }
  },

  // 选择类型
  async changeType() {
    let type_list = ['店铺', '服务']
    let res = await app.asyncApi(wx.showActionSheet, {
      itemList: type_list
    })
    if (res.success) {
      await this.setData({
        choose_type: type_list[res.tapIndex],
        search_type: res.tapIndex + 1,
        page: 0,
        if_no_more: false,
        list: []
      })
      // 获取列表
      this.getList()
    }
  },

  // 选择综合
  async changeColligate() {
    let colligate_list = ['综合', '价格由高到低', '价格由低到高']
    let res = await app.asyncApi(wx.showActionSheet, {
      itemList: colligate_list
    })
    if (res.success) {
      await this.setData({
        choose_colligate: colligate_list[res.tapIndex],
        type: res.tapIndex + 1,
        page: 0,
        if_no_more: false,
        list: []
      })
      // 获取列表
      this.getList()
    }
  },

  // 选择销量
  async changeSales() {
    let sales_list = ['销量', '销量由低到高', '销量由高到低']
    let res = await app.asyncApi(wx.showActionSheet, {
      itemList: sales_list
    })
    if (res.success) {
      await this.setData({
        choose_sales: sales_list[res.tapIndex],
        type: res.tapIndex + 4,
        page: 0,
        if_no_more: false,
        list: []
      })
      // 获取列表
      this.getList()
    }
  },

  // 获取列表
  async getList() {
    let list = this.data.list
    let if_no_more = this.data.if_no_more
    if (!if_no_more && this.data.request_lock.get_list) {
      this.setData({
        if_loading: true,
        'request_lock.get_list': false
      })
      let res = await app.get({
        url: this.data.api_url.get_list,
        data: {
          page: this.data.page + 1,
          size: 6,
          area: app.global_data.location[2],
          key: this.data.key,
          search_type: this.data.search_type,
          type: this.data.type
        }
      })
      if (res.success) {
        let data = res.data
        let data_list = data.data
        let total = data.total
        if (total > 0) {
          data_list.forEach(item => {
            list.push({
              id: item.id,
              img_url: item.cover,
              title: item.name,
              price: app._toMoney(item.price)
            })
          })
          if_no_more = list.length < total ? false : true
        } else {
          if_no_more = true
        }
        this.setData({
          list,
          page: data.current_page,
          if_no_more
        })
      }
      this.setData({
        if_loading: false,
        'request_lock.get_list': true
      })
    }
  }
})
