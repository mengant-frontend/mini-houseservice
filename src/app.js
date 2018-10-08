const regeneratorRuntime = require('./lib/runtime')
App({
  async onLaunch(){
    let system_info = await this.getSystemInfo()    
    this.global_data.system_info = system_info
  },
  //获取设备消息
  async getSystemInfo(){
    let res = await new Promise(resolve => {
      wx.getSystemInfo({
        success(res){
          resolve(res)
        }
      })
    })
    return res
  },
  global_data: {
    system_info: {}
  }
})