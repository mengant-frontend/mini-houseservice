Component({
  properties: {
    show: {
      type: Boolean,
      value: true
    }
  },
  methods: {
    goHome(){
      wx.redirectTo({
        url: '/pages/welcome/index',
      })
    }
   }
})