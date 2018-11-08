import regeneratorRuntime from '../../lib/runtime'

let app = getApp()

Page({
    data: {
        // 接口地址
        api_url: {
            // 获取轮播图
            get_banner_img: '/api/v1/banner/mini/list',
            // 获取服务类别
            get_service_category: '/api/v1/category/mini/list',
            // 获取服务列表
            get_service_list: '/api/v1/service/mini/list'
        },
        // 请求锁
        request_lock: {
            get_service_list: true
        },
        category_id: 0,
        if_no_more: false,
        page: 0,
        total: 0,
        service_list: [],
        list: []
    },

    async onLoad({service_type}) {
        // 服务类型，2为家政，1为维修
        if (service_type == 1) {
            service_type = 3
            app.asyncApi(wx.setNavigationBarTitle, {
                title: '维修服务'
            })
        } else {
            service_type = 4
            app.asyncApi(wx.setNavigationBarTitle, {
                title: '家政服务'
            })
        }
        let location = app.global_data.location
        await this.setData({service_type, location})
        wx.showNavigationBarLoading()
        // 获取轮播图
        app.get({
            url: this.data.api_url.get_banner_img,
            data: {
                type: 2,
                province: location[0],
                city: location[1],
                area: location[2],
                category: service_type
            }
        }).then(res => {
            if (res.success) {
                let data = res.data
                let banner_img = []
                data.forEach(item => {
                    banner_img.push(item.url)
                })
                this.setData({banner_img})
            } else { // 出错处理debug
                console.log(res)
            }
        })
        // 获取服务类别
        app.get({
            url: this.data.api_url.get_service_category,
            data: {
                type: service_type - 2
            }
        }).then(res => {
            if (res.success) {
                let data = res.data
                let category_list = []
                data.forEach(item => {
                    category_list.push({
                        id: item.id,
                        name: item.name
                    })
                })
                this.setData({category_list})
            } else { // 出错处理debug
                console.log(res)
            }
        })
        // 获取服务列表
        this.getCarouselOrder()
        await this.getServiceList()
        wx.hideNavigationBarLoading()
    },

    tabsChange({detail}) {
        this.setData({
            category_id: detail.category_id,
            if_no_more: false,
            page: 0,
            total: 0,
            service_list: []
        }, () => {
            // 获取服务列表
            this.getServiceList()
        })
    },

    // 根据 category_id 获取服务列表
    async getServiceList() {
        let if_no_more = this.data.if_no_more
        let service_list = this.data.service_list
        if (!if_no_more && this.data.request_lock.get_service_list) {
            this.setData({
                if_loading: true,
                'request_lock.get_service_list': false
            })
            let res = await app.get({
                url: this.data.api_url.get_service_list,
                data: {
                    page: this.data.page + 1,
                    size: 6,
                    area: this.data.location[2],
                    c_id: this.data.category_id,
                    type: this.data.service_type - 2
                }
            })
            if (res.success) {
                let data = res.data
                let data_list = data.data
                let total = data.total
                if (total > 0) {
                    data_list.forEach(item => {
                        service_list.push({
                            id: item.id,
                            img_url: item.cover,
                            title: item.name,
                            sales: item.sell_num,
                            money: app._toMoney(item.sell_money),
                            extend: item.extend
                        })
                    })
                    if_no_more = service_list.length < total ? false : true
                } else {
                    if_no_more = true
                }
                this.setData({
                    service_list,
                    total,
                    if_no_more,
                    page: data.current_page
                })
            } else { // 出错处理debug
                console.log(res)
            }
            this.setData({
                if_loading: false,
                'request_lock.get_service_list': true
            })
        }
    },
    async getCarouselOrder() {
        let { service_type, location } = this.data

        let server_res = await app.get({
            url: '/api/v1/order/banner',
            data: {
                province: location[0],
                city: location[1],
                area: location[2],
                type: service_type - 2
            }
        })
        let {success, msg, data} = server_res
        if (!success) {
            app._error(msg)
            return
        }
        let list = []
        if (data instanceof Array) {
            list = data
        }
        this.setData({
            list: list
        })
    }
})
