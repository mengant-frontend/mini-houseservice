import regeneratorRuntime from '../../lib/runtime'

let app = getApp()
let count = 0
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
    location: [],
    // 获取加盟消息
    join_msg: '',
    list: [],
    red_money: 0
  },

  async onLoad() {
    this.setData({
      red_money: app.global_data.red_money || 0
    })
    wx.showNavigationBarLoading()
    // 获取地理位置
    let res = await app.getLocation()
    if (res.success) {
      await this.setData({
        location: res.location
      })
    } else {
      count++
      // 用户没有授权获取地理位置时跳转到授权页
      if(count > 1){
        await app.asyncApi(wx.showModal, {
          title: '获取地理位置异常',
          showCancel: false,
          content: '请您在下个页面选择并确认您的当前位置'
        })
        let auto_res = await app.asyncApi(wx.chooseLocation)
        if(!auto_res.success){
          app._error(auto_res.msg)
          return
        }
        let location_res = await app._getAdInfo({
          lat: auto_res.latitude,
          lng: auto_res.longitude
        })
        this.setData({
          location: location_res.data
        })
      }else{
        await app.asyncApi(wx.redirectTo, {
          url: '/pages/authorize/index?auth_type=location'
        })
        return
      }

    }
    // 获取轮播图
    app.get({
      url: this.data.api_url.get_banner_img,
      data: {
        type: 1
      }
    })
    .then(res => {
      if (res.success) {
        let data = res.data
        let banner_img = []
        data.forEach(item => {
          banner_img.push(item.url)
        })
        this.setData({banner_img})
      } else { // 出错处理debug
        console.log(res)
      }
    })
    // 获取红包攻略
    app.get({
      url: this.data.api_url.get_strategy
    })
    .then(res => {
      if (res.success) {
        let data = res.data
        let notice_content = []
        data.forEach(item => {
          notice_content.push(item.des)
        })
        notice_content = notice_content.join(' ')
        console.log(notice_content)
        this.setData({notice_content})
      } else { // 出错处理debug
        console.log(res)
      }
    })
    this.getJoinMsg()
    this.getCarouselOrder()
    // 获取推广的服务列表
    await this.getServiceList()
    wx.hideNavigationBarLoading()
  },

  onShow() {
    this.setData({
      village: app.global_data.village
    })
  },
  async onPullDownRefresh() {
    this.getCarouselOrder()
    await this.getServiceList()
    wx.stopPullDownRefresh()
  },
  // 本地是否存在商户
  async getJoinMsg() {
    let location = this.data.location
    let server_res = await app.get({
      url: '/api/v1/check/join',
      data: {
        province: location[0],
        city: location[1],
        area: location[2]
      }
    })
    let {success, msg, data} = server_res
    if (!success) {
      app._error(msg)
      return
    }
    this.setData({
      join_msg: data.join_msg
    })
  },
  async getCarouselOrder() {
    let location = this.data.location
    let server_res = await app.get({
      url: '/api/v1/order/banner',
      data: {
        province: location[0],
        city: location[1],
        area: location[2],
        type: 3
      }
    })
    let {success, msg, data} = server_res
    if (!success) {
      app._error(msg)
      return
    }
    let list = []
    if (data instanceof Array) {
      list = data
    }
    this.setData({
      list: list
    })
  },

  // 获取推广的服务列表
  async getServiceList() {
    app.get({
      url: this.data.api_url.get_service_list,
      data: {
        area: this.data.location[2]
      }
    })
    .then(res => {
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
            money: app._toMoney(item.sell_money),
            extend: item.extend
          }
          switch (item.type) {
            case 2:
              house_service_list.push(list_item)
              break;
            case 1:
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
  async locationChoose({detail}) {
    let location = detail.value
    app.global_data.location = location
    wx.showNavigationBarLoading()
    await this.setData({location})
    // 重新获取推广的服务列表
    this.getJoinMsg()
    await this.getServiceList()
    wx.hideNavigationBarLoading()
  },
  closeRedPacketModal(){
    this.setData({
      red_money: 0
    })
  }
})
