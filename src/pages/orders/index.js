Page({
  data: {
    // 打开页面时默认显示第一项列表
    tabsCurrent: 0,
    ifLoading: true,
    // tabs 列表数据
    tabsList: [
      {
        name: 'unpaid',
        title: '待付款',
        count: 10,
        ifNoMore: false
      },
      {
        name: 'unconfirmed',
        title: '待确认',
        count: 0,
        ifNoMore: false
      },
      {
        name: 'unevaluate',
        title: '待评价',
        count: 0,
        ifNoMore: false
      },
      {
        name: 'completed',
        title: '已完成',
        count: 0,
        ifNoMore: false
      }
    ]
  },
  
  // 模拟数据加载过程
  onLoad () {
    var that = this;
    setTimeout(function () {
      that.setData({
        unpaidList: [
          {
            id: 0,
            orderNum: '54387654343456',
            imgUrl: '../../images/404.png',
            money: '1.00',
            state: '待付款'
          }
        ],
        ifLoading: false
      });
    }, 800);
  },

  // 初次切换 tabs 交互（加载对应类型的订单数据列表）
  intOrderList ({ detail }) {
    switch (detail.tabsCurrent) {
      case 0:
        this.data.unpaidList? '': this.getUnpaidList();
        break;
      case 1:
        this.data.unconfirmedList ? '': this.getUnconfirmedList();
        break;
      case 2:
        this.data.unevaluateList ? '': this.getUnevaluateList();
        break;
      case 3:
        this.data.completedList ? '': this.getCompletedList();
        break;
    }
  },

  // 加载待付款列表
  getUnpaidList () {
    var that = this,
        ifNoMore = that.data.tabsList[0].ifNoMore,
        oldList = that.data.unpaidList,
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
            unpaidList: oldList.concat([newItem])
          });
        }, 800);
      } else {
        that.setData({
          ifLoading: false,
          'tabsList[0].ifNoMore': true
        });
      }
    }
  },

  // 加载待确认列表
  getUnconfirmedList () {
    var that = this,
        ifNoMore = that.data.tabsList[1].ifNoMore;
    if (!ifNoMore) {
      that.setData({
        ifLoading: true
      });
      setTimeout(function () {
        that.setData({
          ifLoading: false,
          'tabsList[1].ifNoMore': true
        });
      }, 800);
    }
  },

  // 加载待评价列表
  getUnevaluateList () {
    var that = this,
        ifNoMore = that.data.tabsList[2].ifNoMore;
    if (!ifNoMore) {
      that.setData({
        ifLoading: true
      });
      setTimeout(function () {
        that.setData({
          ifLoading: false,
          'tabsList[2].ifNoMore': true
        });
      }, 800);
    }
  },

  // 加载已完成列表
  getCompletedList () {
    var that = this,
        ifNoMore = that.data.tabsList[3].ifNoMore;
    if (!ifNoMore) {
      that.setData({
        ifLoading: true
      });
      setTimeout(function () {
        that.setData({
          ifLoading: false,
          'tabsList[3].ifNoMore': true
        });
      }, 800);
    }
  },

  // 删除订单
  deleteOrder ({ target }) {
    console.log(`删除id=${target.dataset.id}`);
  },

  // 付款
  payOrder ({ target }) {
    console.log(`付款id=${target.dataset.id}`);
  }
});