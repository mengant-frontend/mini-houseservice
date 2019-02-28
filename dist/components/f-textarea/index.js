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
      observer(newVal) {
        this.setData({
          local_value: newVal,
          len: newVal.length
        })
      }
    },
    show_total: {
      type: Boolean,
      value: true
    },
    height: {
      type: String,
      value: '120px'
    }
  },
  externalClasses: [
    'f-class'
  ],
  data: {
    len: 0,
    local_value: ''
  },
  methods: {
    bindInput(e) {
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
