Component({
  properties: {
    // categoryList 列表数据，数据模型必须包含{id, name}
    categoryList: Array
  },

  data: {
    if_show: false,
    category_name: '全部',
    category_id: 0
  },

  methods: {
    // toggle 显示与隐藏
    toggleLeft() {
      let height = this.data.height
      if (!height) {
        this.setData({
          height: wx.getSystemInfoSync().windowHeight
        })
      }
      this.setData({
        if_show: !this.data.if_show
      })
    },
    // 选择项目
    choose({ target }) {
      let category_id = target.dataset.id
      let category_name = target.dataset.name
      this.setData({
        if_show: false,
        category_id: 0,
        category_name
      })
      // 将 category_id 传递给组件使用者绑定的 tabsChange 监听事件
      this.triggerEvent('tabsChange', { category_id })
    },
    // tabs 切换交互
    tabsChange({ detail }) {
      let category_id = detail.key
      this.setData({ category_id, category_name: '全部' })
      // 将 category_id 传递给组件使用者绑定的 tabsChange 监听事件
      this.triggerEvent('tabsChange', { category_id })
    }
  }
})