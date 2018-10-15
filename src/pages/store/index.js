let app = getApp()

Page({
  data: {
    if_loading: true,
    if_no_more: false
  },

  onLoad(options) {
    setTimeout(() => {
      this.setData({
        store_id: 0,
        banner_img: ['/images/404.png'],
        name: '大拇指家政',
        if_collected: false,
        score: '4.5',
        comment: 3,
        location: '台儿庄区运河大道邮政局南60米',
        phone: '13415012786',
        service_list: [
          {
            id: 0,
            type: 1,
            img_url: '/images/404.png',
            title: '美的格力海尔空调维修',
            money: 60,
            sales: 10
          }
        ],
        if_loading: false
      });
    }, 800);
  },

  // 收藏
  collect() {
    this.setData({
      if_collected: !this.data.if_collected
    }, () => {
      if (this.data.if_collected) {
        app._success('收藏成功！')
      } else {
        app._warn('您取消了收藏~~')
      }
    })
  },

  // 调起拨号面板拨打电话
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.phone
    })
  },

  // 获取服务列表
  getServiceList() {
    let if_no_more = this.data.if_no_more
    let oldList = this.data.service_list
    let oldList_len = oldList.length
    let newItem = { ...oldList[oldList_len - 1] }
    newItem.id++;
    if (!if_no_more) {
      if (oldList_len < 10) {
        this.setData({
          if_loading: true
        });
        setTimeout(() => {
          this.setData({
            if_loading: false,
            service_list: oldList.concat([newItem])
          });
        }, 800);
      } else {
        this.setData({
          if_loading: false,
          if_no_more: true
        });
      }
    }
  }
})