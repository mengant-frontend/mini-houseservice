import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Component({
  properties: {
    height: {
      type: Number,
      value: 360
    }
  },
  data: {
    sign_in: undefined,
    score: 0
  },
  ready(){
    this.checkLoginStatus()
  },
  methods: {
    async checkLoginStatus(){
      let res = await app.get({
        url: '/api/v1/sign/in/check'
      })
      if(!res.success){
        app._error(res.msg, {
          selector: 'login-message'
        })
        return
      }
      let data = res.data
      this.setData({
        sign_in: data.sign_in > 0,
        score: data.score
      })
    },
    async login(){
      let res = await app.post({
        url: '/api/v1/sign/in'
      })
      if(!res.success){
        app._error(res.msg, {
          selector: 'login-message'
        })
        return
      }
      let data = res.data
      this.setData({
        sign_in: true,
        score: data.score
      })
    }
  }
})