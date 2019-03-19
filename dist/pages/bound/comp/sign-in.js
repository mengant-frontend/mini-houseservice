import regeneratorRuntime from '../../../lib/runtime'
const app = getApp()
Component({
  properties: {
    height: {
      type: Number,
      value: 360
    },
    show: {
      type: Boolean,
      value: false
    }
  },
  data: {
    sign_in: undefined,
    score: 0,
    loading: false
  },
  ready(){
    this.checkLoginStatus()
  },
	pageLifetimes: {
    show(){
			this.checkLoginStatus()
    }
  },
  methods: {
    async checkLoginStatus(){
      let res = await app.get({
        url: '/house/api/v1/sign/in/check'
      })
      if(!res.success){
        app._error(res.msg, {
          selector: '#message'
        })
        return
      }
      let data = res.data
      this.setData({
        sign_in: data.sign_in > 0,
        score: data.score || 0
      })
    },
    async login(){
      if(this.data.loading){
        return
      }
      this.setData({
        loading: true
      })
      let res = await app.post({
        url: '/house/api/v1/sign/in'
      })
      this.setData({
        loading: false
      })
      if(!res.success){
        app._error(res.msg, {
          selector: '#message'
        })
        return
      }
      let data = res.data,
        score = this.data.score
      wx.showModal({
        title: '签到成功',
        content: '获得' + data.score + '积分',
        showCancel: false,
        mask: true
      })
      this.setData({
        sign_in: true,
        score: parseFloat(score) + parseFloat(data.score)
      })
    }
  }
})