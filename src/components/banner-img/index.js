Component({
  properties: {
    // 需要渲染的 banner 图片列表数据，数据模型必须为['图片 http 链接地址']
    list: Array
  },

  methods: {
    // 点击图片预览图片列表
    previewImg ({ target }) {
      wx.previewImage({
        current: target.dataset.src,
        urls: this.data.list
      });
    }
  }
});