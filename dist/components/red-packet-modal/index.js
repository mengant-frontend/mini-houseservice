Component({
  properties: {
    money: {
      type: Number,
      value: 0
    },
    title: {
      type: String,
      value: ''
    }
  },
  data: {
    load_end: false
  },
  methods: {
    close(){
      this.triggerEvent('close')
    },
    load(){
      this.setData({
        load_end: true
      })
    }
  }
})
