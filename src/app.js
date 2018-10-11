import regeneratorRuntime from  './lib/runtime'
import { $Message } from './iview/base/index'
import { domain } from './common/constant'
App({
  async onLaunch(){
    await this.login()
    let system_info = await this.asyncApi(wx.getSystemInfo)    
    if(system_info.success){
      this.global_data.system_info = system_info
    }
  },
  //登录
  async login(){
    await this.asyncApi(wx.showLoading, {
      title: '登录中...'
    })
    let wx_res = await this.asyncApi(wx.login)
    if(!wx_res.success){
      await this.asyncApi(wx.hideLoading)
      return 
    }
    console.log('wx: login', wx_res)
    let server_res = await this.get({
      // auto: false接口调用失败不会自动重新调用
      auto: false,
      // token_required: false 接口不校验token是否存在
      token_required: false,
      url: '/api/v1/token/user',
      data: {
        code: wx_res.code
      }
    })
    await this.asyncApi(wx.hideLoading)
    if(!server_res.success){
      return 
    }
    let { data } = server_res
    this.global_data.token = data.token
    //type: 2 未缓存用户的userInfo, 需要调用userInfo
    //每个页面的根元素bindtap, 调用userInfo
    if(Number(data.type) === 2){
      this.global_data.type = 2
    }
    return server_res
  },
  //获取用户信息
  async getUserInfo(){
    let wx_res = await this.asyncApi(wx.getSetting)
    if(!wx_res.success){
      return
    }
    if(!wx_res.authSetting['scope.userInfo']){
      this._error('wx: 用户拒绝授权')
      return
    }
    wx_res = await this.asyncApi(wx.getUserInfo)
    if(!wx_res.success){
      this._error('wx: getUserInfo api 调用失败')
      return
    }
    let { encryptedData, iv } = wx_res
    let server_res = await this.post({
      url: '/api/v1/user/info',
      data: {
        encryptedData: encryptedData,
        iv: iv
      }
    })
    if(!server_res.success){
      this._error('server: /user/info api 调用失败')
      return
    }
    this.global_data.type = 1
  },
  //使用promise包装了一下，跟async搭配
  asyncApi(api, options = {}){
    let { success, fail, complete, ...other } = options
    if(success || fail || complete){
      throw new Error('success, fail, complete回调函数已经被屏蔽')
    }
    return new Promise(resolve => {
      api({
        ...other,
        success(res){
          resolve({
            success: true,
            ...res
          })
        },
        fail(res){
          resolve({
            success: false,
            ...res
          })
        }
      })
    })
  },
  async request(options){
    let { url, auto = true, token_required = true, ...params } = options
    if(!url){
      throw new Error('缺少url参数')
    }
    params.url = domain + url
    if(token_required){
      if(!this.global_data.token){
        await this.login()
      }
    }
    let request = () => {
      if(token_required){
        params.data = params.data || {}
        params.data.token = this.global_data.token
      }
      return this.asyncApi(wx.request, params).then(res => {
        // errMsg是微信wx.request fail回调函数中的参数 res:{ errMsg }
        let { data = {}, statusCode, header, errMsg, success } = res
        let response = { data }
        if(!(data instanceof Object)){
          response.data = {}
        }
        //接口调用成功都是200
        if(statusCode === 200){
          response.success = true
          //接口调用失败都是401
        }else if(statusCode === 401){
          response.success = false
          response.msg = response.data && response.data.msg
        }else{
          //其他错误可能是网络问题或者服务器问题或者微信接口出错
          response.msg = errMsg
          response.success = false
        }
        return response
      })
    }
    let res = await request()
    //此处只做登录失效下自动调用登录接口
    if(Number(res.data.code) === 10001){
      if(auto){
        let login = await this.login()
        if(login.success){
          res = await request()
        }
      }
    }
    return res
  },
  post(options){
    delete options.method
    return this.request({
      method: 'post',
      ...options
    })
  },
  get(options){
    delete options.method
    return this.request({
      method: 'get',
      ...options
    })
  },
  uploadFile(options){
    let { url, ...other } = options
    return this.asyncApi(wx.uploadFile, {
      url: domain + url,
      ...other
    })
  },
  _msg(content, options){
    $Message({
      ...options,
      content
    })
  },
  _success(content, options = {}){
    $Message({
      ...options,
      type: 'success',
      content
    })
  },
  _warn(content, options = {}){
    $Message({
      ...options,
      type: 'warning',
      content
    })
  },
  _error(content, options = {}){
    $Message({
      ...options,
      type: 'error',
      content
    })
  },
  //深度克隆，只克隆简单值，对象，数组，对函数过滤
  _deepClone(data){
    return JSON.parse(JSON.stringify(data))
  },
  global_data: {
    system_info: {},
    token: '',
    type: 1
  }
})