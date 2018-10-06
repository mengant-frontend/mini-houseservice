Page({
  data: {
    bannerImg: [
      '/images/404.png',
      '/images/404.png',
      '/images/404.png'
    ],
    ifNoMore: false,
    ifLoading: true,
  },

  // 模拟数据加载过程
  onLoad (options) {
    var that = this,
        serviceType = options.type,
        serviceList = [];

    switch (serviceType) { // 服务类型，1为家政，2为维修
      case '1':
        wx.setNavigationBarTitle({
          title: '家政服务'
        });
        serviceList.push({
          id: 0,
          imgUrl: '/images/404.png',
          title: '新房开荒保洁，装修保洁（测试多文字排版）',
          totalSales: 0,
          money: 0.00
        });
        break;
      case '2':
        wx.setNavigationBarTitle({
          title: '维修服务'
        });
        serviceList.push({
          id: 0,
          imgUrl: '/images/404.png',
          title: '楼顶卫生间防水制作',
          totalSales: 0,
          money: 0.00
        });
        break;
    }
    setTimeout(function () {
      that.setData({
        serviceType: serviceType,
        serviceList: serviceList,
        ifLoading: false
      });
    }, 800);
  },

  // 上拉触底加载数据
  getServiceList () {
    var that = this,
        serviceType = that.data.serviceType,
        ifNoMore = that.data.ifNoMore,
        oldList = that.data.serviceList,
        oldList_len = oldList.length,
        newItem = { ...oldList[oldList_len - 1] };
    newItem.id++;
    if (!ifNoMore) {
      if (oldList_len < 10) {
        that.setData({
          ifLoading: true
        });
        setTimeout(function () {
          that.setData({
            ifLoading: false,
            serviceList: oldList.concat([newItem])
          });
        }, 800);
      } else {
        that.setData({
          ifLoading: false,
          ifNoMore: true
        });
      }
    }
  }
});