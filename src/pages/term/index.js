import { domain} from "../../common/constant";

Page({
  data: {
    type: '',
    src: ''
  },
  onLoad(query) {
    let {type = 'service_term'} = query
    let src = domain + `/file/index.html#/${type}?type=${type}`
    this.setData({
      type,
      src
    })
  },
  bindmessage({ detail }){
    let { data } = detail
    console.log(detail)
    if(data.end){
      wx.hideNavigationBarLoading()
    }
  }
})
