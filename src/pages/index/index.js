import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取轮播图
      get_banner_img: '/api/v1/banner/mini/list',
      // 获取红包攻略
      get_strategy: '/api/v1/red/strategy',
      // 获取推广的服务列表
      get_service_list: '/api/v1/service/index'
    }
  },

  async onLoad() {
    wx.showNavigationBarLoading()
    // 获取地理位置
    let res = await app.getLocation()
    if (res.success) {
      await this.setData({
        location: res.location
      })
    } else {
      // 用户没有授权获取地理位置时跳转到授权页
      await app.asyncApi(wx.redirectTo, {
        url: '/pages/authorize/index?auth_type=location'
      })
      return
    }
    // 获取轮播图
    app.get({
      url: this.data.api_url.get_banner_img,
      data: {
        type: 1
      }
    }).then(res => {
      if (res.success) {
        let data = res.data
        let banner_img = []
        data.forEach(item => {
          banner_img.push(item.url)
        })
        this.setData({ banner_img })
      } else { // 出错处理debug
        console.log(res)
      }
    })
    // 获取红包攻略
    app.get({
      url: this.data.api_url.get_strategy
    }).then(res => {
      if (res.success) {
        let data = res.data
        let notice_content = []
        data.forEach(item => {
          notice_content.push(item.des)
        })
        this.setData({ notice_content })
      } else { // 出错处理debug
        console.log(res)
      }
    })
    // 获取推广的服务列表
    await this.getServiceList()
    wx.hideNavigationBarLoading()
  },

  onShow() {
    this.setData({
      village: app.global_data.village
    })
  },

  // 获取推广的服务列表
  async getServiceList() {
    app.get({
      url: this.data.api_url.get_service_list,
      data: {
        area: this.data.location[2]
      }
    }).then(res => {
      if (res.success) {
        let data = res.data
        let house_service_list = []
        let maintain_service_list = []
        data.forEach(item => {
          let list_item = {
            id: item.s_id,
            img_url: item.cover,
            title: item.name,
            sales: item.sell_num,
            money: item.sell_money
          }
          switch (item.type) {
            case 1:
              house_service_list.push(list_item)
              break;
            case 2:
              maintain_service_list.push(list_item)
              break;
          }
        })
        this.setData({
          house_service_list,
          maintain_service_list
        })
      } else { // 出错处理debug
        console.log(res)
      }
    })
  },

  // 地区选择，对应更新在首页推广的家政、维修服务列表
  async locationChoose({ detail }) {
    let location =  detail.value
    app.global_data.location = location
    wx.showNavigationBarLoading()
    await this.setData({ location })
    // 重新获取推广的服务列表
    await this.getServiceList()
    wx.hideNavigationBarLoading()
  }
})