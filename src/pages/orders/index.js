Page({
  data: {
    current: 0,
    unpaidNum: 2,
    unconfirmedNum: 0,
    unevaluateNum: 0,
    unpaidList: [
      {
        id: 0,
        orderNum: '54387654343456',
        imgUrl: '../../images/404.png',
        money: '1.00',
        state: '待付款'
      }
    ],
    loadingText: '正在加载',
    noMoreText: '暂无数据',
    unpaidNoMore: false,
    unconfirmedNoMore: false,
    unevaluateNoMore: false,
    completedNoMore: false
  },

  // 菜单区域点击交互
  tabsChange ({ detail }) {
    const current = parseInt(detail.key);
    this.setData({ current });
    switch (current) {
      case 1:
        this.unconfirmedScroll();
        break;
      case 2:
        this.unevaluateScroll();
        break;
      case 3:
        this.completedScroll();
        break;
    }
  },

  // 内容区域左右滑动交互
  swiperChange ({ detail }) {
    const current = detail.current;
    this.setData({ current });
    switch (current) {
      case 1:
        this.unconfirmedScroll();
        break;
      case 2:
        this.unevaluateScroll();
        break;
      case 3:
        this.completedScroll();
        break;
    }
  },

  // 待付款列表上拉触底加载更多
  unpaidScroll () {
    var that = this,
        oldList = that.data.unpaidList,
        oldList_len = oldList.length,
        newItem = { ...oldList[oldList_len - 1] };
    newItem.id++;
    that.setData({
      unpaidShow: true
    });
    if (oldList_len < 10) {
      setTimeout(function () {
        that.setData({
          unpaidShow: false,
          unpaidList: oldList.concat([newItem])
        });
      }, 800);
    } else {
      that.setData({
        unpaidNoMore: true
      });
    }
  },

  // 待确认列表上拉触底加载更多
  unconfirmedScroll () {
    var that = this;
    that.setData({
      unconfirmedShow: true
    });
    setTimeout(function () {
      that.setData({
        unconfirmedNoMore: true
      });
    }, 800);
  },

  // 待评价列表上拉触底加载更多
  unevaluateScroll () {
    var that = this;
    that.setData({
      unevaluateShow: true
    });
    setTimeout(function () {
      that.setData({
        unevaluateNoMore: true
      });
    }, 800);
  },

  // 已完成列表上拉触底加载更多
  completedScroll () {
    var that = this;
    that.setData({
      completedShow: true
    });
    setTimeout(function () {
      that.setData({
        completedNoMore: true
      });
    }, 800);
  },

  // 删除订单
  deleteOrder ({ target }) {
    console.log(`删除id=${target.dataset.id}`);
  },

  // 付款
  pay ({ target }) {
    console.log(`付款id=${target.dataset.id}`);
  }
});