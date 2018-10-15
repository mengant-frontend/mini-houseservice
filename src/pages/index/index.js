let app = getApp()

Page({
  data: {
    // 默认地区
    location: ['北京市', '北京市', '朝阳区']
  },

  onLoad() {
    // 轮播图
    app.get({
      url: '/api/v1/banner/mini/list',
      data: {
        type: 1
      }
    }).then(res => {
      if (res.success) {
        let banner_img = []
        for (let v of res.data) {
          banner_img.push(v.url)
        }
        this.setData({
          banner_img
        })
      } else { // 出错处理debug
        console.log(res.msg)
      }
    })
    // 红包攻略
    app.get({
      url: '/api/v1/red/strategy'
    }).then(res => {
      if (res.success) {
        let notice_content = []
        for (let v of res.data) {
          notice_content.push(v.des)
        }
        this.setData({
          notice_content
        })
      } else { // 出错处理debug
        console.log(res.msg)
      }
    })
    // 获取在首页推广的家政、维修服务列表
    this.getServiceList(1, this.data.location[2])
    this.getServiceList(2, this.data.location[2])
  },

  /**
   * 获取在首页推广的家政、维修服务列表，统一展示6条
   * @param  {Number} service_type 服务类型，1为家政，2为维修
   * @param  {String} area         用户选择的地区--区//this.data.location[2]
   */
  getServiceList(service_type, area) {
    app.get({
      url: service_type === 1 ? '/api/v1/extend/house' : '/api/v1/extend/repair',
      data: {
        page: 1,
        size: 6,
        area: area,
        c_id: 0
      }
    }).then(res => {
      if (res.success) {
        console.log(res.data) // debug
        let list = []
        res.data.data.forEach(item => {
          list.push({
            id: item.s_id,
            imgUrl: item.cover,
            title: item.name,
            totalSales: item.sell_num,
            money: item.sell_money
          })
        })
        switch (service_type) {
          case 1:
            this.setData({
              house_service_list: list
            })
            break;
          case 2:
            this.setData({
              maintain_service_list: list
            })
            break;
        }
      } else { // 出错处理debug
        console.log(res.msg)
      }
    })
  },

  // 地区选择，对应更新在首页推广的家政、维修服务列表
  locationChoose({ detail }) {
    let location =  detail.value
    this.setData({ location })
    this.getServiceList(1, location[2])
    this.getServiceList(2, location[2])
  },

  // 扫描
  scan() {
    app.asyncApi(wx.scanCode).then(res => {
      if (res.success) {
        console.log(res) // debug
      } else { // 出错处理debug
        console.log(res)
      }
    })
  }
})