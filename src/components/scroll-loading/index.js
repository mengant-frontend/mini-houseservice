Component({
  // 允许设置背景色
  externalClasses: ['bg-color'],

  properties: {
    // 是否没有更多内容了
    ifNoMore: {
      type: Boolean,
      value: false // 默认为 false
    },
    // 是否正在加载内容
    ifLoading: {
      type: Boolean,
      value: false, // 默认为 false
      observer (newVal) {
        if (newVal) {
          this.setData({
            loadMore: '正在加载',
            paddingBottom: '0'
          });
        } else {
          this.setData({
            loadMore: '上拉显示更多',
            paddingBottom: '20px'
          });
        }
      }
    }
  },

  data: {
    loadMore: '上拉显示更多',
    noMore: '没有更多数据了',
    // 让内容区域超过 scroll-view 的高度才能滚动
    paddingBottom: '20px'
  },

  methods: {
    // 内容区域上拉触底交互
    scrolltolower () {
      // 执行组件使用者绑定的 scrolltolower 监听事件
      this.triggerEvent('scrolltolower');
    }
  }
});