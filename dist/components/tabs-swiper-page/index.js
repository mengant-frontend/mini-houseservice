Component({
  options: { // 启用多 slot 支持
    multipleSlots: true
  },

  properties: {
    // 允许设置内容区域 swiper 的背景色，默认为白色
    bgColor: {
      type: String,
      value: '#fff'
    },
    // 允许指定显示 tabs 项，默认显示第一项
    tabsCurrent: {
      type: Number,
      value: 0
    },
    // tabs 列表数据，数据模型必须包含{id, title, dot(boolean), count(number)}
    // 其中 id 用于标识 slot 节点，将对应放置在 swiper-item 下
    tabsList: Array,
    fixed: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    // tabs 切换交互
    tabsChange ({ detail }) {
      // key 值已设置为 tabs 索引值
      let tabs_current = parseInt(detail.key)
      // 改变 tabsCurrent 会触发 swiper 组件的 change 事件
      this.setData({ tabsCurrent: tabs_current })
    },
    // swiper 切换交互
    swiperChange ({ detail }) {
      // current 值为 swiper 的子节点 swiper-item 的索引值
      // swiper-item 数量和顺序与 tabs 对应
      let tabs_current = detail.current
      this.setData({ tabsCurrent: tabs_current })
      // 将当前 tabs 索引值 tabs_current 传递给组件使用者绑定的 swiperChange 监听事件
      this.triggerEvent('swiperChange', { tabs_current })
    }
  }
})