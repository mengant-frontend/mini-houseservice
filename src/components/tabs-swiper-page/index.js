Component({
  options: { // 启用多 slot 支持
    multipleSlots: true
  },

  // 允许设置 swiper 区域背景色
  externalClasses: ['bg-color'],

  properties: {
    // 允许显示指定 tabs 项
    tabsCurrent: {
      type: Number,
      value: 0 // 默认显示 tabs 第一项
    },
    // tabs 数据列表，数据模型必须包含{name, title, count}
    tabsList: Array
  },

  methods: {
    // tabs 切换交互
    tabsChange ({ detail }) {
      const tabsCurrent = parseInt(detail.key);
      this.setData({ tabsCurrent }); // 会触发 swiper 组件的 change 事件
    },

    // swiper 切换交互
    swiperChange ({ detail }) {
      const tabsCurrent = detail.current;
      this.setData({ tabsCurrent });
      // 将 tabsCurrent 传递给组件使用者绑定的 swiperChange 监听事件
      this.triggerEvent('swiperChange', { tabsCurrent });
    }
  }
});