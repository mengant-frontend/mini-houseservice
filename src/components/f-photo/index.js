import regeneratorRuntime from '../../lib/runtime'
import { domain } from '../../common/constant'
const app = getApp()
Component({
  properties: {
    count: {
      type: Number,
      value: 4
    }
  },
  data: {
    photo_list: []
  },
  methods: {
    //选择图片
    async chooseImage() {
      let count = this.data.count,
        photo_list = app._deepClone(this.data.photo_list)
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
      await new Promise(resolve => {
        this.setData({
          photo_list: photo_list.concat(tempFiles)
        }, resolve)
      })
      let promises = []
      tempFiles.forEach(file => {
        let promise = new Promise(resolve => {
          let upload_task = wx.uploadFile({
            url: domain + '/api/v1/image/upload',
            filePath: file.path,
            name: 'file',
            success(res) {
              resolve({
                success: true,
                ...res
              })
            },
            fail(res) {
              resolve({
                success: false,
                ...res
              })
            }
          })
          upload_task.onProgressUpdate(res => {
            file.progress = res.progress
            this.setData({
              photo_list: photo_list.concat(tempFiles)
            })
          })
        }).then(res => {
          try {
            res.data = JSON.parse(res.data)
          } catch (e) { }
          return res
        })
        promises.push(promise)
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
      this.setData({
        photo_list: photo_list.concat(tempFiles)
      })
    },
    //删除图片
    async deleteImage(e) {
      let { currentTarget: { dataset: { index } } } = e
      let photo_list = app._deepClone(this.data.photo_list)
      //如果上传过程中失败，则直接删除
      if (photo_list[index].error) {
        photo_list.splice(index, 1)
        this.setData({
          photo_list: photo_list
        })
        return
      } else {
        photo_list[index].deleting = true
      }
      //展示spining
      await new Promise(resolve => {
        this.setData({
          photo_list: photo_list
        }, resolve)
      })
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
        app._error(msg)
      } else {
        photo_list.splice(index, 1)
      }
      this.setData({
        photo_list: photo_list
      })
    }
  }

})