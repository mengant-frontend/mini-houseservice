import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
const types = {
  price_guide: 1,
  sentive_word: 2,
  service_term: 3,
  about_us: 4,
  user_guide: 5
}
Page({
  data: {
    type: '',
    has_btns: true,
    term_data: {}
  },
  onLoad(query){
    let { type = 'service_term' } = query

    let title = '', has_btns = true
    switch(type){
      case 'price_guide':
        title = '价格指导'
        break
      case 'sentive_word':
        title = '敏感词汇'
        break
      case 'service_term':
        title = '服务条款'
        break
      case 'about_us':
        title = '关于我们'
        has_btns = false
        break
      case 'user_guide':
        title = '用户指南'
        has_btns=  false
        break
      default:
    }
    wx.setNavigationBarTitle({
      title: title
    })
    this.setData({
      type: type,
      has_btns
    })
    this.loadTerm()
  },
  async onPullDownRefresh(){
    await this.loadTerm()
    wx.stopPullDownRefresh()
  },

  async loadTerm(){
    let type = this.data.type
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_res = await app.get({
      url: '/api/v1/system/file',
      data: {
        type: types[type]
      }
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data } = server_res
    if(!success){
      app._error(msg)
      return
    }
    data = data || {}
    data.content = decodeURIComponent(data.content)

    let term_data = Object.assign({
      id: '',
      content: ''
    }, data)

    this.setData({
      term_data: term_data
    })
  },

  async confirm(){
    let type = this.data.type
    switch(type){
      case 'price_guide':
        break
      case 'sentive_word':

        break
      case 'service_term':
        wx.setStorageSync('had_used', true)
        wx.redirectTo({
          url: '/pages/welcome/index'
        })
        break
      case 'about_us':
        break
      case 'user_guide':
        break
      default:
    }
  },
  cancel(){
    let type = this.data.type
    switch(type){
      case 'price_guide':
        break
      case 'sentive_word':
        wx.navigateBack({
          delta: 1
        })
        break
      case 'service_term':

        break
      case 'about_us':
        break
      case 'user_guide':
        break
      default:
    }
  },
  // 协商
  async chat(){
    await app.asyncApi(wx.showNavigationBarLoading)
    let server_ res = await app.post({
      url: '/api/v1/order/confirm',
      data: {
        id,
        type,
        confirm
      }
    })
    await app.asyncApi(wx.hideNavigationBarLoading)
    let { success, msg, data} = server_res
    if(!success){
      app._error(msg)
      return
    }
    wx.navigateBack()
  }

})