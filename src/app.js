import regeneratorRuntime from './lib/runtime'
import QQMapSdk from './lib/qqmap-wx-jssdk'
import { $Message, $Toast } from './iview/base/index'
import { domain } from './common/constant'

const qq_map = new QQMapSdk({
  key: 'A75BZ-ORRKU-A5NVI-B2WK5-4GYOH-6BFON'
})
App({
  async onLaunch() {
    let system_info = await this.asyncApi(wx.getSystemInfo)
    if (system_info.success) {
      this.global_data.system_info = system_info
    }
  },
  // 登录
  async login() {
    await this.asyncApi(wx.showLoading, {
      title: '登录中'
    })
    let wx_res = await this.asyncApi(wx.login)
    if (!wx_res.success) { // 出错处理debug
      console.log(wx_res)
      return
    }
    let server_res = await this.get({
      // 不用处理 token 失效的问题
      auto: false,
      // 不用校验 token
      token_required: false,
      url: '/api/v1/token/user',
      data: {
        code: wx_res.code
      }
    })
    if (!server_res.success) { // 出错处理debug
      console.log(server_res)
      return
    }
    let { data } = server_res
    this.global_data.token = data.token
    this.global_data.shop_id = data.shop_id
    // 获取用户信息
    if (!this.global_data.user_info) {
      await this.getUserInfo(Number(data.type))
    }
    await this.asyncApi(wx.hideLoading)
    return server_res
  },
  // 获取用户信息
  async getUserInfo(user_type) {
    if (wx.canIUse('button.open-type.getUserInfo')) {
      let wx_res = await this.asyncApi(wx.getSetting)
      if (!wx_res.success) { // 出错处理debug
        console.log(wx_res)
        return
      }
      if (!wx_res.authSetting['scope.userInfo']) {
        // 用户没有授权获取用户信息时跳转到授权页
        await this.asyncApi(wx.redirectTo, {
          url: '/pages/authorize/index?auth_type=userinfo&user_type=' + user_type
        })
        return
      }
    }
    // 用户已授权以及在没有 open-type=getUserInfo 版本直接调用
    let wx_userinfo_res = await this.asyncApi(wx.getUserInfo, {
      withCredentials: true
    })
    if (!wx_userinfo_res.success) { // 出错处理debug
      console.log(wx_userinfo_res)
      return
    }
    let { userInfo, encryptedData, iv } = wx_userinfo_res
    // 数据库未缓存用户信息
    if (user_type === 2) {
      let server_res = await this.post({
        url: '/api/v1/user/info',
        data: { encryptedData, iv }
      })
      if (!server_res.success) { // 出错处理debug
        console.log(server_res)
        return
      }
    }
    this.global_data.user_info = userInfo
  },
  //使用promise包装了一下，跟async搭配
  asyncApi(api, options = {}) {
    let { success, fail, complete, ...other } = options
    if (success || fail || complete) {
      throw new Error('success, fail, complete回调函数已经被屏蔽')
    }
    return new Promise(resolve => {
      api({
        ...other,
        success(res) {
          resolve({
            success: true,
            ...res
          })
        },
        fail(res) {
          resolve({
            success: false,
            ...res
          })
        }
      })
    })
  },
  async request(options) {
    let { url, auto = true, token_required = true, ...params } = options
    if (!url) {
      throw new Error('缺少url参数')
    }
    params.url = domain + url
    if (token_required) {
      if (!this.global_data.token) {
        await this.login()
      }
    }
    let request = () => {
      if (token_required) {
        params.data = params.data || {}
        params.header = params.header || {}
        params.header.token = this.global_data.token
      }
      return this.asyncApi(wx.request, params)
        .then(res => {
          // errMsg是微信wx.request fail回调函数中的参数 res:{ errMsg }
          let { data = {}, statusCode, header, errMsg, success } = res
          data = data || {} // 有些接口data为null
          let response = { data }
          if (!(data instanceof Object)) {
            try {
              response.data = JSON.parse(data)
            } catch (e) {
              response.data = {}
            }
          }
          //接口调用成功都是200
          if (statusCode === 200) {
            response.success = true
            //接口调用失败都是401
          } else if (statusCode > 200) {
            response.success = false
            response.msg = response.data && response.data.msg || `server: ${url} api 调用失败`
          } else {
            //其他错误可能是网络问题或者服务器问题或者微信接口出错
            response.msg = errMsg
            response.success = false
          }
          return response
        })
    }
    let res = await request()
    //此处只做登录失效下自动调用登录接口
    if (Number(res.data.code) === 10001) {
      if (auto) {
        let login = await this.login()
        if (login.success) {
          res = await request()
        }
      }
    }
    return res
  },
  post(options) {
    delete options.method
    return this.request({
      method: 'post',
      ...options
    })
  },
  get(options) {
    delete options.method
    return this.request({
      method: 'get',
      ...options
    })
  },
  // 推荐使用该方法上传图片
  _uploadFile(options = {}) {
    let { url = '/api/v1/image/upload', success, fail, onProgressUpdate = () => {}, ...other } = options
    return new Promise(resolve => {
        let task = wx.uploadFile({
          url: domain + url,
          name: 'file',
          success(res) {
            resolve({
              success: true,
              ...res
            })
          },
          fail(res) {
            resolve({
              success: false,
              ...res
            })
          },
          ...other
        })
        task.onProgressUpdate(onProgressUpdate)
      })
      .then(res => {
        try {
          res.data = JSON.parse(res.data)
        } catch (e) {}
        return res
      })
  },
  _msg(content, options = {}) {
    $Message({
      ...options,
      content
    })
  },
  _success(content, options = {}) {
    $Message({
      ...options,
      type: 'success',
      content
    })
  },
  _warn(content, options = {}) {
    $Message({
      ...options,
      type: 'warning',
      content
    })
  },
  _error(content, options = {}) {
    $Message({
      ...options,
      type: 'error',
      content
    })
  },
  infoToast(options) {
    let { type, ...other } = options
    $Toast({
      type: 'default',
      ...other
    })
  },
  successToast(options) {
    let { type, ...other } = options
    $Toast({
      type: 'success',
      content: '成功',
      ...other
    })
  },
  warnToast(options = {}) {
    let { type, ...other } = options
    $Toast({
      type: 'warning',
      ...other
    })
  },
  errorToast(options = {}) {
    let { type, ...other } = options
    $Toast({
      type: 'error',
      content: '失败',
      ...other
    })
  },
  loadingToast(options = {}) {
    let { type, ...other } = options
    if (this.global_data.token) {
      $Toast({
        type: 'loading',
        ...other
      })
    }
  },
  hideToast() {
    if (this.global_data.token) {
      $Toast.hide()
    }
  },
  sleep(time = 3000) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  },
  //深度克隆，只克隆简单值，对象，数组，对函数过滤
  _deepClone(data) {
    return JSON.parse(JSON.stringify(data))
  },
  //常规的表单处理
  _bindFormChange(e) {
    let { currentTarget, detail } = e
    let { dataset } = currentTarget
    if (detail.detail) {
      detail = detail.detail
    }
    let form_key = dataset.form_key
    let value = detail.value
    return {
      form_key,
      value
    }
  },
  //输入坐标返回地理位置信息和附近poi列表
  async _reverseGeocoder(options) {
    let reverseGeocoder = qq_map.reverseGeocoder.bind(qq_map)

    return this.asyncApi(reverseGeocoder, options)
      .then(res => {
        res.msg = res.message
        return res
      })
  },
  //输入坐标返回省市区[Array]
  async _getAdInfo({ lat, lng }) {
    return this._reverseGeocoder({
        location: {
          latitude: lat,
          longitude: lng
        }
      })
      .then(res => {
        res.data = []
        if (res.success) {
          let result = res.result || {}
          let address_component = result.address_component || {}
          res.data = [address_component.province, address_component.city, address_component.district]
        }

        return res
      })
  },
  // 获取地理位置
  async getLocation() {
    let location = this.global_data.location
    let success = true
    if (!location) {
      let wx_res = await this.asyncApi(wx.getLocation)
      if (wx_res.success) {
        this.global_data.latitude = wx_res.latitude
        this.global_data.longitude = wx_res.longitude
        let res_location = await this._getAdInfo({
          lat: wx_res.latitude,
          lng: wx_res.longitude
        })
        if (res_location.success) {
          this.global_data.location = res_location.data
          location = res_location.data
        } else { // 出错处理debug
          console.log(res_location)
          success = false
        }
      } else { // 出错处理debug
        console.log(wx_res)
        success = false
      }
    }
    return { success, location }
  },
  global_data: {
    system_info: {},
    token: '',
    shop_id: 0, // 0 代表是普通用户，大于 0 的都是商家
    village: 0, // 1 代表用户是小区管理员
    red_packet: null
  }
})
