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
      observer(new_val) {
        if (new_val) {
          this.setData({
            load_more: '',
            padding_bottom: '0'
          })
        } else {
          this.setData({
            load_more: '上拉显示更多',
            padding_bottom: '20px'
          })
        }
      }
    },
    scrollTop: {
      type: String,
      value: '',
      observer(val){
        console.log(35, val)
      }
    }
  },

  data: {
    load_more: '上拉显示更多',
    no_more: '',
    padding_bottom: '20px',
    scroll_top: 0,
    temp_scroll_top: 0
  },

  methods: {
    // 触发触底加载
    scrolltolower() {
      // 执行组件使用者绑定的 scrolltolower 监听事件
      console.log(this.data.temp_scroll_top)
      this.setData({
        scroll_top: this.data.temp_scroll_top + 'px'
      })
      console.log(this.data.scroll_top)
      setTimeout(() => {
        this.triggerEvent('scrolltolower')
      })
    },
    // 滚动
    scroll({ detail }) {
      // 将 detail 传递给执行组件使用者绑定的 scroll 监听事件
      this.setData({
        temp_scroll_top: detail.scrollHeight
      })
      this.triggerEvent('scroll', detail)
    }
  }
})
