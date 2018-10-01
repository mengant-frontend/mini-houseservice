Component({
  options: { // 启用多slot支持
    multipleSlots: true
  },

  externalClasses: ['bg-color'], // 内容区域背景色

  properties: {
    tabsCurrent: { // 允许显示指定 tabs 项
      type: Number,
      value: 0 // 默认显示 tabs 第一项
    },
    tabsList: Array, // tabs 数据列表，数据模型必须为{name, title, count, ifNoMore}
    ifLoading: { // 是否正在加载内容
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
    paddingBottom: '20px' // 让内容区域超过 scroll-view 的高度才能滚动
  },

  methods: {
    // tabs 切换交互
    tabsChange({ detail }) {
      // swiper 组件为 current， i-tabs 组件为 key
      const tabsCurrent = detail.current || parseInt(detail.key);
      this.setData({ tabsCurrent });
      // 将 tabsCurrent 传递给组件使用者绑定的 tabsChange 监听事件
      this.triggerEvent('tabsChange', { tabsCurrent });
    },

    // 内容区域上拉触底交互
    scrolltolower () {
      var tabsCurrent = this.data.tabsCurrent;
      // 将 tabsCurrent 传递给组件使用者绑定的 scrolltolower 监听事件
      this.triggerEvent('scrolltolower', { tabsCurrent });
    }
  }
});