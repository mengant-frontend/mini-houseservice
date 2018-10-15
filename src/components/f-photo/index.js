import regeneratorRuntime from '../../lib/runtime'
import { domain } from '../../common/constant'
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
      value: []
    }
  },
  data: {
    photo_list: [],
    default_photo_list: [{}]
  },
  ready(){
    let remote = app._deepClone(this.data.remote)
    if(remote instanceof Array){
      
    }else if(remote instanceof Object){
      remote = [remote]
    }
    this.setData({
      photo_list: remote
    })
  },
  methods: {
    //更新数据
    update(photo_list){
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
      await this.chooseImage(1)
    },
    //选择图片
    async chooseImage(count) {
      let photo_list = app._deepClone(this.data.photo_list)
      count = count || this.data.count
      let rest = count - photo_list.length
      if (rest < 1) {
        return
      }
      let wx_res = await app.asyncApi(wx.chooseImage, {
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        count: rest
      })
      let { success, tempFiles } = wx_res
      if (!success) {
        //失败原因包括用户取消了操作
        console.error('wx: chooseImage api 调用失败')
        return
      }
      await this.update(photo_list.concat(tempFiles))
      let promises = []
      tempFiles.forEach(file => {
        
        promises.push(
          app._uploadFile({
            filePath: file.path,
            onProgressUpdate: res => {
              console.log(123)
              file.progress = res.progress
              this.update(photo_list.concat(tempFiles))
            }
          })
        )
      })
      let server_promises = await Promise.all(promises)
      server_promises.forEach((promise, index) => {
        tempFiles[index].loaded = true
        if (promise.success) {
          tempFiles[index].id = promise.data.id
        } else {
          tempFiles[index].error = true
        }
      })
      this.update(photo_list.concat(tempFiles))
    },
    //删除图片
    async deleteImage(e) {
      let { currentTarget: { dataset: { index } } } = e
      let photo_list = app._deepClone(this.data.photo_list)
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
      //Todo 删除接口
      let server_res = await app.post({
        url: '/test',
        data: {
          id: photo_list[index].id || ' '
        }
      })
      let { msg, success } = server_res
      if (!success) {
        photo_list[index].deleting = false
      } else {
        photo_list.splice(index, 1)
      }
      this.update(photo_list)
    }
  }

})