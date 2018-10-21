Component({
  properties: {
    // 允许设置背景色，默认为白色
    bgColor: {
      type: String,
      value: '#fff'
    },
    // 是否加载全部，默认不是
    ifNoMore: {
      type: Boolean,
      value: false
    },
    // 是否正在加载，默认不是
    ifLoading: {
      type: Boolean,
      value: false,
      observer (new_val) {
        if (new_val) {
          this.setData({
            load_more: '正在加载',
            padding_bottom: '0'
          })
        } else {
          this.setData({
            load_more: '上拉显示更多',
            padding_bottom: '20px'
          })
        }
      }
    }
  },

  data: {
    load_more: '上拉显示更多',
    no_more: '没有更多数据了',
    padding_bottom: '20px'
  },

  methods: {
    // 触发触底加载
    scrolltolower () {
      // 执行组件使用者绑定的 scrolltolower 监听事件
      this.triggerEvent('scrolltolower')
    },
    // 滚动
    scroll({ detail }) {
      // 将 detail 传递给执行组件使用者绑定的 scroll 监听事件
      this.triggerEvent('scroll', detail)
    }
  }
})