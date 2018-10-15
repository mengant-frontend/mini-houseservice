let app = getApp()

Page({
  data: {
    // 默认展示家政服务排行
    tabs_current: 0,
    // tabs 列表数据
    tabs_list: [
      {
        name: 'house',
        title: '家政服务排行',
        count: 0,
        list: [] // 列表项目
      }, {
        name: 'maintanin',
        title: '维修服务排行',
        count: 0,
        list: []
      }
    ]
  },

  // 初始化数据
  onLoad(options) {
    let area = options.area
    this.setData({ area })
    this.getServiceList(1, area)
    this.getServiceList(2, area)
  },

  /**
   * 获取家政、维修服务排行列表，统一展示10条
   * @param  {Number} service_type 服务类型，1为家政，2为维修
   * @param  {String} area         用户选择的地区--区
   */
  getServiceList(service_type, area) {
    app.get({
      url: '/api/v1/service/mini/list',
      data: {
        page: 1,
        size: 10,
        area: area,
        c_id: 0,
        type: service_type
      }
    }).then(res => {
      if (res.success) {
        console.log(res.data) // debug
        let list = []
        res.data.data.forEach(item => {
          list.push({
            id: item.id,
            img_url: item.cover,
            title: item.name,
            sales: item.sell_num
          })
        })
        switch (service_type) {
          case 1:
            this.setData({
              'tabs_list[0].list': this.data.tabs_list[0].list.concat(list)
            })
            break;
          case 2:
            this.setData({
              'tabs_list[1].list': this.data.tabs_list[1].list.concat(list)
            })
            break;
        }
      } else { // 出错处理debug
        console.log(res.msg)
      }
    })
  }
})