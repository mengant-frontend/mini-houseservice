import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
  data: {
    // 接口地址
    api_url: {
      // 人脸识别
      detect: '/api/v1/image/search',
      // 确认订单
      confirm_order: '/api/v1/village/confirm'
    },
    // 请求锁
    request_lock: {
      confirm_order: true
    },
    if_detect: true,
    if_success: false,
    if_warn: false,
    choose_index: 0
  },

  onLoad() {
    this.ctx = wx.createCameraContext()
  },

  takePhoto() {
    this.ctx.takePhoto({
      quality: 'high',
      success: async res => {
        let src = res.tempImagePath
        this.setData({ src })
        wx.showNavigationBarLoading()
        await app.asyncApi(wx.showLoading, {
          title: '识别中...',
          mask: true
        })
        let task_res = await app._uploadFile({
          url: this.data.api_url.detect,
          filePath: src,
          formData: {
            city: app.global_data.location[1]
          }
        })
        await app.asyncApi(wx.hideLoading)
        if (task_res.success) {
          wx.hideNavigationBarLoading()
          let data = task_res.data
          if (String(data.error_code)
            .indexOf('99') === 0 || !data.shop_info) {
            this.setData({
              if_warn: true,
              if_detect: false,
              src: ''
            })
          } else {
            this.setData({
              if_success: true,
              if_detect: false,
              ...data.shop_info,
              order_list: data.orders,
              src: ''
            })
          }
        }
      }
    })
  },

  // 选中订单
  chooseOrder({ target }) {
    this.setData({
      choose_index: target.dataset.index
    })
  },

  // 确认订单
  async confirmOrder() {
    let order_list = app._deepClone(this.data.order_list)
    let index = this.data.choose_index
    if (order_list.length > 0 && this.data.request_lock.confirm_order) {
      // 提交
      wx.showNavigationBarLoading()
      await app.asyncApi(wx.showLoading, {
        title: '确认中...',
        mask: true
      })
      this.setData({
        'request_lock.confirm_order': false
      })
      let res = await app.post({
        url: this.data.api_url.confirm_order,
        data: {
          o_id: order_list[index].order_id,
          type: order_list[index].type
        }
      })
      wx.hideNavigationBarLoading()
      await app.asyncApi(wx.hideLoading)
      if (!res.success) { // 出错处理debug
        this.setData({
          'request_lock.confirm_order': true
        })
        return
      }
      order_list.splice(index, 1)
      await app.asyncApi(wx.showToast, {
        title: '成功',
        mask: true
      })
      await app.sleep()
      await app.asyncApi(wx.hideToast)
    }
    this.setData({
      order_list: order_list,
      if_success: false,
      if_detect: true,
      if_warn: false,
      choose_index: 0,
      'request_lock.confirm_order': true
    })
  },

  // 返回
  turnBack() {
    this.setData({
      if_warn: false,
      if_detect: true
    })
  }
})
