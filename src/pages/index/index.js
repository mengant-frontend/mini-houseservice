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
    },
    // 小区管理员标识
    village: 0
  },

  async onLoad() {
    app.loadingToast({
      content: '加载中',
      duration: 0,
      mask: false
    })
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
        if (data.length > 0) {
          data.forEach(item => {
            banner_img.push(item.url)
          })
        } else {
          app.warnToast({
            content: '暂时没有轮播图数据哦~~',
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
    // 获取红包攻略
    app.get({
      url: this.data.api_url.get_strategy
    }).then(res => {
      if (res.success) {
        let data = res.data
        let notice_content = []
        if (data.length > 0) {
          data.forEach(item => {
            notice_content.push(item.des)
          })
        } else {
          app.warnToast({
            content: '暂时没有红包攻略哦~~',
            duration: 0
          })
        }
        this.setData({ notice_content })
      } else { // 出错处理debug
        console.log(res.msg)
        app.errorToast({
          content: '红包攻略加载失败~~',
          duration: 0
        })
      }
    })
    // 获取推广的服务列表
    await this.getServiceList()
    app.hideToast()
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
        if (data.length > 0) {
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
        } else {
          app.warnToast({
            content: '当前地区暂时没有服务推广哦~~',
            duration: 0
          })
        }
        this.setData({
          house_service_list,
          maintain_service_list
        })
      } else { // 出错处理debug
        console.log(res.msg)
        app.errorToast({
          content: '服务推广加载失败~~',
          duration: 0
        })
      }
    })
  },

  // 地区选择，对应更新在首页推广的家政、维修服务列表
  async locationChoose({ detail }) {
    let location =  detail.value
    app.global_data.location = location
    app.loadingToast({
      content: '加载中',
      duration: 0,
      mask: false
    })
    await this.setData({ location })
    // 重新获取推广的服务列表
    await this.getServiceList()
    app.hideToast()
  }
})