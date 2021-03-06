//async 需要显式引入regeneratorRuntime
import regeneratorRuntime from '../../lib/runtime'
import {command_types, default_type} from '../../common/constant'

const app = getApp()

const padding_bottom_0 = 64;
const padding_bottom_1 = 0;
const padding_bottom_2 = 64;
Page({
  data: {
    // steps
    steps_list: [{
      label: '填写资料',
      status: ''
    }, {
      label: '审核中',
      status: ''
    }, {
      label: '审核结果',
      status: ''
    }],
    step_current: 0,

    command_types: command_types,
		head_url_list: [],
    //商家图片
    photo_list: [],
    //默认的服务类型
    type_text: default_type,
    //form data
    form_data: {},
    success: false,
    padding_bottom: padding_bottom_0,
    // 图片数量
    count: 4,
    shop_id: '',
    head_url: [],
    join_msg: ''
  },
  async onLoad() {
    let form_data = this.initFormData()
    this.setData({
      form_data: form_data
    })
    await this.checkStatus()
  },
  //下拉事件
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  onShow() {
    let global_data = app.global_data
    let new_data = app._deepClone(this.data)
    if(global_data.pic_id && global_data.pic_url){
			if(global_data.pic_type === 'avatar'){
				new_data.head_url_list = [{
					url: global_data.pic_url,
					id: global_data.pic_id
				}]
			}else{
				new_data.photo_list.push({
					url: global_data.pic_url,
					id: global_data.pic_id
				})
			}
    	app.global_data.pic_type = null
    	app.global_data.pic_id = null
    	app.global_data.pic_url = null
    }
    this.setData(new_data)
  },
	// 删除图片
	confirmDelete(e){
		let photo_list = app._deepClone(this.data.photo_list)
		let { detail:{ index } } = e
		if(index !== undefined){
			photo_list.splice(index, 1)
			this.setData({
				photo_list: photo_list
			})
		}
	},
  initFormData() {
    let form_data = {
      head_url: '',
      type: '',
      name: '',
      province: '',
      city: '',
      area: '',
      address: '',
      phone: '',
      phone_sub: '',
      id_number: '',
      imgs: ''
    }
    let location = app.global_data.location
    if(location[0]){
      form_data.province = location[0]
      form_data.city = location[1]
      form_data.area = location[2]
    }

    command_types.forEach(type => {
      if (type.label === default_type) {
        form_data.type = type.value
      }
    })
    return form_data
  },
  changeHeadUrl() {
    wx.navigateTo({
      url: '/pages/avatar/index?max=1&type=head_url'
    })
  },
  //检查当前状态
  async checkStatus() {
    await app.asyncApi(wx.showLoading, {
      title: '请稍候...'
    })
    await app.asyncApi(wx.showNavigationBarLoading)

    let server_res = await app.get({
      url: '/house/api/v1/shop/info'
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    await app.asyncApi(wx.hideLoading)
    let {success, data, msg} = server_res
    if (!success) {
      app._error(msg)
      return
    }
    //没有申请
    if (Object.keys(data)
      .length === 0) {
      this.setData({
        step_current: 0,
        padding_bottom: padding_bottom_0
      })
    } else {
      let steps_list = app._deepClone(this.data.steps_list)
      let {state, id, ...remote_data} = data
      let new_data = {
        shop_id: id
      }
      switch (Number(state)) {
        //申请中
        case 1:
          new_data.step_current = 1
          new_data.padding_bottom = padding_bottom_1
          break
        // 已审核
        case 2:
          new_data.step_current = 2
          new_data.success = true
          new_data.padding_bottom = padding_bottom_2;
          steps_list[1].status = 'finish'
          break
        // 已被拒绝
        case 3:
          new_data.step_current = 2
          new_data.success = false
          new_data.padding_bottom = padding_bottom_2
          steps_list[1].status = 'error'
          break
        // 审核通过且用户已确认
        case 4:
          app._success('审核通过，正在前往店铺...')
          this.redirectTo()
          break
        default:
          console.error(state, '暂时不想处理')
      }
      let form_data = app._deepClone(this.data.form_data)
      let imgs = []
      let head_url_list = [], photo_list = []
			if(remote_data.head_url){
				head_url_list = [{
					url: remote_data.head_url,
					id: remote_data.head_url
				}]
			}
			
			photo_list = remote_data.imgs.map(photo => {
				return {
					id: photo.img_id,
					url: photo.img_url.url
				}
			})
      Object.keys(form_data)
      .forEach(key => {
        form_data[key] = remote_data[key]
      })
      this.setData({
				photo_list: photo_list,
				head_url_list: head_url_list,
        form_data: form_data,
        steps_list: steps_list,
        ...new_data
      })
    }
  },
  async getTips() {
    await app.asyncApi(wx.showLoading, {
      title: '请稍候...'
    })
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/house/api/v1/system/tip'
    })
    await app.asyncApi(wx.hideLoading)
    await app.asyncApi(wx.hideNavigationBarLoading)
    return server_res
  },
  //绑定表单事件
  bindFormChange(e) {
    let {form_key, value} = app._bindFormChange(e)
    let form_data = this.updateFormData(form_key, value)
    let other_data = {}
    if (form_key === 'type') {
      command_types.forEach((command, index) => {
        if (index == value) {
          other_data.type_text = command.label
        }
      })
    }
    this.setData({
      form_data: form_data,
      ...other_data
    })
  },
  //处理表单数据
  updateFormData(form_key, value) {
    let form_data = app._deepClone(this.data.form_data)
    switch (form_key) {
      case 'name':
      case 'address':
      case 'phone':
      case 'phone_sub':
      case 'id_number':
        form_data[form_key] = value
        break
      case 'type':
        command_types.forEach((command, index) => {
          if (value == index) {
            form_data[form_key] = command.value
          }
        })
        break
      case 'services_region':
        form_data.province = value[0]
        form_data.city = value[1]
        form_data.area = value[2]
        break
      default:
        throw new Error('form_key 无效')
    }
    return form_data
  },

  async confirm() {
    let {step_current, form_data, photo_list} = this.data;
    switch (step_current) {
      case 0:
        let require_params = [{
          key: 'head_url',
          required: '请上传商家头像'
        }, {
          key: 'type',
          required: '请选择经营类型'
        }, {
          key: 'name',
          required: '请输入店铺名称'
        }, {
          key: 'province',
          required: '请选择店铺所在省份'
        }, {
          key: 'city',
          required: '请选择店铺所在地区市'
        }, {
          key: 'area',
          required: '请选择店铺所在地区'
        },  {
          key: 'address',
          required: '请输入店铺详细地址'
        }, {
          key: 'phone',
          required: '请输入商家手机号码'
        }, {
          key: 'phone_sub',
          required: '请输入商家备用手机号码'
        }, {
          key: 'id_number',
          required: '请输入身份证号码'
        }, {
          key: 'imgs',
          required: '请上传商家资料图片'
        }]
				form_data.head_url = this.data.head_url_list.map(photo => photo.id).join(',')
				form_data.imgs = this.data.photo_list.map(photo => photo.id).join(',')
        let error_msg = ''
        for(let i = 0; i < require_params.length; i++){
          if(!form_data[require_params[i].key]){
            error_msg = require_params[i].required
            break
          }
        }

        if (error_msg) {
          app._warn(error_msg)
          return
        }
        let has_error_photo = false
        photo_list.forEach(img => {
          if (!img.id) {
            has_error_photo = true
          }
        })
        if (has_error_photo) {
          app._warn('请先删除上传失败的照片')
          return
        }
        let server_res = await this.sumbit()
        //如果submit返回success:false,则接口出错
        let {success, msg} = server_res
        if (!success) {
          app._error(msg)
          return
        }
        let tip_res = await this.getTips()
        if (!tip_res.success) {
          app._error(tip_res.msg)
        } else {
          await app.asyncApi(wx.showModal, {
            title: '温馨提示',
            content: tip_res.data.register,
            confirmText: '确认',
            showCancel: false
          })
        }
        //提交成功后刷新页面
        this.checkStatus()
        break
      case 1:
        break
      case 2:

        break
      default:
        throw new Error('step_current 不合法')
    }
  },
  //提交请求
  sumbit() {
    let {form_data} = this.data
    return app.post({
      url: '/house/api/v1/shop/apply',
      data: form_data
    })
  },
  redo() {
    let form_data = this.initFormData()
    let steps_list = app._deepClone(this.data.steps_list)
    steps_list[1].status = ''
    this.setData({
      step_current: 0,
      form_data: form_data,
      padding_bottom: padding_bottom_0,
      steps_list: steps_list
    })
  },
  //确认开店
  async ensure() {
    let {shop_id} = this.data
    if (!shop_id) {
      app._warn('缺少shop_id')
      return
    }
    await app.asyncApi(wx.showLoading, {
      title: 'loading...'
    })
    let server_res = await app.get({
      url: '/house/api/v1/shop/handel',
      data: {
        state: 4,
        id: shop_id
      }
    })
    await app.asyncApi(wx.hideLoading)
    let {success, msg, data} = server_res
    if (!success) {
      app._error(msg)
      return
    }
    app.global_data.shop_id = data.shop_id
    let {form_data} = this.data
    app.global_data.province = form_data.province
    app.global_data.city = form_data.city
    app.global_data.area = form_data.area
    this.redirectTo()
  },
  async redirectTo() {
    await app.login()
    await app.asyncApi(wx.showLoading, {
      title: '跳转中...'
    })
    await app.sleep()
    await app.asyncApi(wx.hideLoading)
    wx.redirectTo({
      url: '/pages/shop/index'
    })
  }
})
