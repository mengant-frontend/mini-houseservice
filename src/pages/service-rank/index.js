import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 获取服务列表
      get_service_list: '/api/v1/service/mini/list'
    },
    tabs_current: 0,
    // tabs 列表数据
    tabs_list: [
      {
        id: 'house',
        title: '家政服务排行',
        count: 0,
        dot: false,
        list: [] // 列表项目
      }, {
        id: 'maintanin',
        title: '维修服务排行',
        count: 0,
        dot: false,
        list: []
      }
    ]
  },

  onLoad() {
    // 获取家政服务列表
    this.getServiceList()
  },

  // 切换 tabs 时，当对应服务列表为空则获取数据
  async intServiceList({ detail }) {
    let tabs_current = detail.tabs_current
    await this.setData({ tabs_current })
    let list = this.data.tabs_list[tabs_current].list
    if (list.length === 0) {
      this.getServiceList()
    }
  },

  // 获取服务列表，统一展示10条
  async getServiceList() {
    let tabs_current = this.data.tabs_current
    wx.showNavigationBarLoading()
    let res = await app.get({
      url: this.data.api_url.get_service_list,
      data: {
        page: 1,
        size: 10,
        area: app.global_data.location[2],
        c_id: 0,
        type: tabs_current === 0 ? 2 : 1
      }
    })
    wx.hideNavigationBarLoading()
    if (res.success) {
      let data = res.data
      let list = []
      data.data.forEach(item => {
        list.push({
          id: item.id,
          img_url: item.cover,
          title: item.name,
          sales: item.sell_num
        })
      })
      switch (tabs_current) {
        case 0:
          this.setData({
            'tabs_list[0].list': list
          })
          break;
        case 1:
          this.setData({
            'tabs_list[1].list': list
          })
          break;
      }
    } else { // 出错处理debug
      console.log(res)
    }
  }
})
