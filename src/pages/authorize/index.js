import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
    data: {},

    async onLoad(options) {
        await app.asyncApi(wx.setNavigationBarTitle, {
            title: '信息授权'
        })
        this.setData({
            auth_type: options.auth_type,
            user_type: options.user_type || ''
        })
    },
    // 获取用户微信头像昵称，跳转欢迎页
    async getUserInfo({detail}) {
        let {userInfo = false, encryptedData, iv} = detail
        if (userInfo) {
            // 数据库未缓存用户信息
            if (Number(this.data.user_type) === 2) {
                let server_res = await app.post({
                    url: '/api/v1/user/info',
                    data: {encryptedData, iv}
                })
                if (!server_res.success) { // 出错处理debug
                    console.log(server_res)
                    return
                }
            }
            app.global_data.user_info = userInfo
            let had_used = wx.getStorageSync('had_used')
            if(had_used){
                app.asyncApi(wx.redirectTo, {
                    url: '/pages/welcome/index'
                })
            }else{
                app.asyncApi(wx.redirectTo, {
                    url: '/pages/term/index?type=service_term'
                })
            }

        }
    },

    // 打开设置，授权地理位置后跳转首页
    async openSetting() {
        let res = await app.asyncApi(wx.openSetting)
        if (res.success) {
            if (res.authSetting['scope.userLocation']) {
                wx.switchTab({
                    url: '/pages/index/index'
                })
            }
        }
    }
})