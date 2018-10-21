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
        app.loadingToast({
          content: '识别中',
          duration: 0,
          mask: false
        })
        let task_res = await app._uploadFile({
          url: this.data.api_url.detect,
          filePath: src,
          formData: {
            file: src,
            city: app.global_data.location[1]
          }
        })
        if (task_res.success) {
          app.hideToast()
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
    let order_list = this.data.order_list
    let index = this.data.choose_index
    if (order_list.length > 0 && this.data.request_lock.confirm_order) {
      // 提交
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
      if (res.success) {
        app.successToast({
          content: '提交成功'
        })
      } else {
        app.errorToast({
          content: '提交失败'
        })
        this.setData({
          'request_lock.confirm_order': true
        })
        return
      }
    }
    this.setData({
      if_success: false,
      if_detect: true,
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
