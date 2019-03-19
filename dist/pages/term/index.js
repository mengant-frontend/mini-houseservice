import regeneratorRuntime from '../../lib/runtime'
import { domain} from "../../common/constant";
import moment from '../../lib/moment'
const app = getApp()
Page({
  data: {
    type: '',
    src: '',
    view_term: false
  },
  async onLoad(query) {
    let {type = 'service_term'} = query
    let view_term = true
    if(type === "service_term"){
      wx.setStorageSync('last_modified', moment().format('YYYY-MM-DD HH:mm:SS'))
      let wx_res = await app.asyncApi(wx.showModal, {
        title: '温馨提示',
        content: '点击去使用即表示您已同意《盟蚁家政维修平台服务协议》和《盟蚁家政维修平台隐私权政策》',
        cancelText: '查看协议',
        confirmText: '去使用'
      })
      if(wx_res.confirm){
        view_term = false
        wx.redirectTo({
          url: '/pages/welcome/index'
        })
        return
      }
    }
    
    
    let src = domain + `/file/index.html#/${type}?type=${type}`
    this.setData({
      type,
      src,
      view_term
    })
  },
  bindmessage({ detail }){
    let { data } = detail
    if(data.end){
      wx.hideNavigationBarLoading()
    }
  }
})
