import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Component({
  properties: {
    count: {
      type: Number,
      value: 4
    },
    type: {
      type: String,
      value: 'picture'
    },
    remote: {
      type: Array,
      value: [],
      observer(newVal) {
        if (!this.data.photo_list.length) {
          this.setData({
            photo_list: newVal
          })
        }
      }
    },
    alaways_new: {
      type: Array,
      value: [],
      observer(newVal) {
        this.setData({
          photo_list: newVal
        })
      }
    },
    delete_url: {
      type: String,
      value: ''
    },
    delete_params: {
      type: Array,
      value: []
    },
    source: {
      type: Array,
      value: ['album', 'camera']
    },
    add: {
      type: Boolean,
      value: true
    }
  },
  data: {
    photo_list: [],
    default_photo_list: [{}]
  },
  ready() {
    let remote = app._deepClone(this.data.remote)
    let alaways_new = app._deepClone(this.data.alaways_new)
    let defaults = []
    if (alaways_new.length > 0) {
      defaults = alaways_new
    } else if (remote.length > 0) {
      defaults = remote
    }
    this.setData({
      photo_list: defaults
    })
  },
  methods: {
    //更新数据
    update(photo_list) {
      return new Promise(resolve => {
        this.triggerEvent('update', {
          value: photo_list
        })
        this.setData({
          photo_list: photo_list
        }, resolve)
      })
    },
    //选择头像
    async chooseAvatar() {
      let avatar = app._deepClone(this.data.photo_list)[0]
      if (avatar) {
        await this.update([])
      }
      let res = await this.chooseImage(1)
      if (!!res) {
        if (res.cancel && avatar) {
          this.update([avatar])
        }
      }
    },
    //选择图片
    async chooseImage(count) {
      if (!this.data.add) {
        this.triggerEvent('add')
        return
      }
      let photo_list = app._deepClone(this.data.photo_list)
      count = count || this.data.count
      let rest = count - photo_list.length
      if (rest < 1) {
        return
      }
      let wx_res = await app.asyncApi(wx.chooseImage, {
        sizeType: ['original', 'compressed'],
        sourceType: this.data.source,
        count: rest
      })
      let { success, tempFiles } = wx_res
      if (!success) {
        //失败原因包括用户取消了操作
        console.error('wx: chooseImage api 调用失败')
        return Promise.resolve({
          cancel: true
        })
      }
      await this.update(photo_list.concat(tempFiles))
      let promises = []
      tempFiles.forEach(file => {
        promises.push(
          app._uploadFile({
            filePath: file.path,
            onProgressUpdate: res => {
              let photo_list = app._deepClone(this.data.photo_list)
              photo_list.forEach(photo => {
                if (photo.path === file.path) {
                  photo.progress = res.progress
                }
              })
              this.update(photo_list)
            }
          })
        )
      })
      let server_promises = await Promise.all(promises)
      photo_list = app._deepClone(this.data.photo_list)
      tempFiles.forEach((file, index) => {
        photo_list.forEach(photo => {
          if (photo.path === file.path) {
            photo.loaded = true
            let promise = server_promises[index]
            if (promise.success) {
              photo.id = promise.data.id
            } else {
              photo.error = true
            }
          }
        })
      })
      this.update(photo_list)
    },
    //删除图片
    async deleteImage(e) {
      let { currentTarget: { dataset: { index } } } = e
      let photo_list = app._deepClone(this.data.photo_list)
      if (!this.data.delete_url) {
        // 没有删除接口
        photo_list.splice(index, 1)
        this.update(photo_list)
        return
      }
      //如果上传过程中失败，则直接删除
      if (photo_list[index].error) {
        photo_list.splice(index, 1)
        this.update(photo_list)
        return
      } else {
        photo_list[index].deleting = true
      }
      //展示spining
      await this.update(photo_list)
      let delete_params = this.data.delete_params

      let params = {}
      delete_params.forEach(p => {
        if (p in photo_list[index]) {
          params[p] = photo_list[index][p]
        }
      })
      if (Object.keys(params)
        .length !== delete_params.length) {
        photo_list.splice(index, 1)
      } else {
        let server_res = await app.post({
          url: this.data.delete_url,
          data: params
        })
        console.log(server_res)
        let { msg, success } = server_res
        if (!success) {
          photo_list[index].deleting = false
        } else {
          photo_list.splice(index, 1)
        }
      }
      this.update(photo_list)
    }
  }

})
