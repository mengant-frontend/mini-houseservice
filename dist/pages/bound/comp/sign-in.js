import regeneratorRuntime from '../../../lib/runtime'
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
      if(this.data.loading){
        return
      }
      this.setData({
        loading: true
      })
      let res = await app.post({
        url: '/api/v1/sign/in'
      })
      this.setData({
        loading: false
      })
      if(!res.success){
        app._error(res.msg, {
          selector: 'login-message'
        })
        return
      }
      let data = res.data,
        score = this.data.score
      this.setData({
        sign_in: true,
        score: parseFloat(score) + parseFloat(data.score)
      })
    }
  }
})