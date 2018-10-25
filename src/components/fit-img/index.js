let app = getApp()

Component({
  // 允许设置图片更多样式
  externalClasses: ['more-style'],

  properties: {
    // 需要显示的宽高，单位rpx，只需定义其一
    width: Number,
    height: Number,
    // 显示比例
    ratio: {
      type: Number,
      value: 16/9
    },
    // 图片地址
    src: String,
    // 是否能预览，默认能
    canPreview: {
      type: Boolean,
      value: true
    }
  },

  data: {
    view_width: 0,
    view_height: 0
  },

  methods: {
    // 预览
    previewImg() {
      app.asyncApi(wx.previewImage, {
        urls: [this.data.src]
      })
    },
    // 按原图比例计算图片的显示大小
    imgLoad({ detail }) {
      let ratio = this.data.ratio //detail.width / detail.height
      let width = Number(this.data.width)
      let height = Number(this.data.height)
      let view_width = 0
      let view_height = 0
      // 如果定义了宽度
      if (width) {
        view_width = width
        view_height = width / ratio
      }
      // 如果定义了高度
      if (height) {
        view_width = height * ratio
        view_height = height
      }
      this.setData({
        view_width,
        view_height
      }, () => {
        // 将 view_width、view_height 传递给组件使用者绑定的 imgLoad 监听事件
        this.triggerEvent('imgLoad', { view_width, view_height })
      })
    }
  }
})