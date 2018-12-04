import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Component({
  externalClasses: ['f-class'],
  properties: {
    btn: {
      type: Boolean,
      value: true
    }
  },
  methods: {
    async formSubmit(e){
      this.triggerEvent('submit', e)
      let { currentTarget, detail } = e
      let { dataset } = currentTarget
      if (detail.detail) {
        detail = detail.detail
      }
      let formId = detail.formId
      let server_res = await app.post({
        url: '/api/v1/token/formid',
        data: {
          id: formId
        }
      })
      if(!server_res.success){
        this._error(server_res.msg, {
          selector:'formIdMessage'
        })
        return
      }
      let error_code = server_res.data.error_code || server_res.data.errorCode
      if(parseInt(error_code) !== 0){
        this._error(server_res.msg, {
          selector:'formIdMessage'
        })
        return
      }
    }
  }
})
