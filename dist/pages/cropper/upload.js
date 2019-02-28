import regeneratorRuntime from '../../lib/runtime'
import WeCropper from '../../we-cropper/we-cropper.js'
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50

let cut_width = width - 20
let cut_height = cut_width * 9 / 16

const app = getApp()
Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - cut_width) / 2,
        y: (height - cut_height) / 2,
        width: cut_width,
        height: cut_height
      }
    },
		is_selected: false
  },
  touchStart (e) {
    this.wecropper.touchStart(e)
  },
  touchMove (e) {
    this.wecropper.touchMove(e)
  },
  touchEnd (e) {
    this.wecropper.touchEnd(e)
  },
  getCropperImage () {
		if(!this.data.is_selected){
			wx.navigateBack({
				delta: 1
			})
			return
		}
    this.wecropper.getCropperImage(async (src) => {
      if (src) {
				await app.asyncApi(wx.showLoading, {
					title: '上传中',
					mask: true
				})
				let server_res = await app._uploadFile({
					filePath: src
				})
				await app.asyncApi(wx.hideLoading)
				let { success, msg, data } = server_res
				if(!success){
					app._error(msg)
					return
				}
				app.global_data.pic_id = data.id
				app.global_data.pic_url = src
				wx.navigateBack({
					delta: 1
				})
      } else {
				app._error('获取图片地址失败，请稍后重试')
      }
    })
  },
  uploadTap () {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success (res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值
        self.setData({
					is_selected: true
				})
				self.wecropper.pushOrign(src)
      }
    })
  },
  onLoad (option) {
		let type = option.type
		switch(type){
			case 'square':
				cut_height = cut_width
				break
			case '16-9':
			default:
				cut_height = cut_width * 9 / 16
		}
		let cropperOpt = {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - cut_width) / 2,
        y: (height - cut_height) / 2,
        width: cut_width,
        height: cut_height
      }
    }
		this.setData({
			cropperOpt: cropperOpt
		})
    new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
				this.uploadTap()
			})
      .on('beforeImageLoad', (ctx) => {
        wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 20000
        })
      })
      .on('imageLoad', (ctx) => {
        wx.hideToast()
      })
      .on('beforeDraw', (ctx, instance) => {})
      .updateCanvas()
  }
})