import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取轮播图
      get_banner_img: '/api/v1/banner/mini/list',
      // 获取服务类别
      get_service_category: '/api/v1/category/mini/list',
      // 获取服务列表
      get_service_list: '/api/v1/service/mini/list'
    },
    // 请求锁
    request_lock: {
      get_service_list: true
    },
    category_id: 0,
    if_no_more: false,
    page: 0,
    total: 0,
    service_list: []
  },

  async onLoad({ service_type }) {
    // 服务类型，1为家政，2为维修
    if (service_type == 1) {
      service_type = 3
      app.asyncApi(wx.setNavigationBarTitle, {
        title: '家政服务'
      })
    } else {
      service_type = 4
      app.asyncApi(wx.setNavigationBarTitle, {
        title: '维修服务'
      })
    }
    let location = app.global_data.location
    await this.setData({ service_type, location })
    app.loadingToast({
      content: '加载中',
      duration: 0,
      mask: false
    })
    // 获取轮播图
    app.get({
      url: this.data.api_url.get_banner_img,
      data: {
        type: 2,
        province: location[0],
        city: location[1],
        area: location[2],
        category: service_type
      }
    }).then(res => {
      if (res.success) {
        let data = res.data
        let banner_img = []
        if (data.length > 0) {
          data.forEach(item => {
            banner_img.push(item.url)
          })
        } else {
          app.warnToast({
            content: '当前地区暂时没有轮播图数据哦~~',
            duration: 0
          })
        }
        this.setData({ banner_img })
      } else { // 出错处理debug
        console.log(res.msg)
        app.errorToast({
          content: '轮播图数据加载失败~~',
          duration: 0
        })
      }
    })
    // 获取服务类别
    app.get({
      url: this.data.api_url.get_service_category,
      data: {
        type: service_type - 2
      }
    }).then(res => {
      if (res.success) {
        let data = res.data
        let category_list = []
        if (data.length > 0) {
          data.forEach(item => {
            category_list.push({
              id: item.id,
              name: item.name
            })
          })
        } else {
          app.warnToast({
            content: '当前地区暂时没有服务数据哦~~',
            duration: 0
          })
        }
        this.setData({ category_list })
      } else { // 出错处理debug
        console.log(res.msg)
        app.errorToast({
          content: '服务数据加载失败~~',
          duration: 0
        })
      }
    })
    // 获取服务列表
    await this.getServiceList()
    app.hideToast()
  },

  tabsChange({ detail }) {
    this.setData({
      category_id: detail.category_id,
      if_no_more: false,
      page: 0,
      total: 0,
      service_list: []
    }, () => {
      // 获取服务列表
      this.getServiceList()
    })
  },

  // 根据 category_id 获取服务列表
  async getServiceList() {
    let if_no_more = this.data.if_no_more
    let service_list = this.data.service_list
    if (!if_no_more && this.data.request_lock.get_service_list) {
      this.setData({
        if_loading: true,
        'request_lock.get_service_list': false
      })
      let res = await app.get({
        url: this.data.api_url.get_service_list,
        data: {
          page: this.data.page + 1,
          size: 6,
          area: this.data.location[2],
          c_id: this.data.category_id,
          type: this.data.service_type - 2
        }
      })
      if (res.success) {
        let data = res.data
        let data_list = data.data
        let total = data.total
        if (total > 0) {
          data_list.forEach(item => {
            service_list.push({
              id: item.id,
              img_url: item.cover,
              title: item.name,
              sales: item.sell_num,
              money: item.sell_money
            })
          })
          if_no_more = service_list.length < total ? false : true
        } else {
          if_no_more = true
        }
        this.setData({
          service_list,
          total,
          if_no_more,
          page: data.current_page
         })
      } else { // 出错处理debug
        console.log(res.msg)
        app.errorToast({
          content: '加载失败~~',
          duration: 0
        })
      }
      this.setData({
        if_loading: false,
        'request_lock.get_service_list': true
      })
    }
  }
})