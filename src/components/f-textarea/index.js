Component({
  properties: {
    placeholder: {
      type: String,
      value: '请输入'
    },
    maxLength: {
      type: Number,
      value: -1
    },
    value: {
      type: String,
      value: '',
      observer(newVal){
        this.setData({
          len: newVal.length
        })
      }
    },
    show_total:{ 
      type: Boolean,
      value: true
    }
  },
  externalClasses: [
    'f-class'
  ],
  data: {
    len: 0
  },
  methods: {
    bindInput(e){
      let value = e.detail.value
      this.setData({
        len: value.length
      })
      this.triggerEvent('update', {
        value: value
      })
    }
  }
})