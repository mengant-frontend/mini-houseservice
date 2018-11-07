//async 需要显式引入regeneratorRuntime
import regeneratorRuntime from '../../lib/runtime'
import {command_types, default_region, default_type} from '../../common/constant'

const app = getApp()

const padding_bottom_0 = 64;
const padding_bottom_1 = 0;
const padding_bottom_2 = 64;
Page({
    data: {
        // steps
        steps_list: [{
            label: '填写资料',
            status: ''
        }, {
            label: '审核中',
            status: ''
        }, {
            label: '审核结果',
            status: ''
        }],
        step_current: 0,

        command_types: command_types,
        //商家图片
        photo_list: [],
        //默认的服务类型
        type_text: default_type,
        //form data
        form_data: {},
        success: false,
        padding_bottom: padding_bottom_0,
        // 图片数量
        count: 4,
        shop_id: '',
        head_url: [],
        join_msg: ''
    },
    async onLoad() {
        let form_data = this.initFormData()
        this.setData({
            form_data: form_data
        })
        await this.checkStatus()
        let { step_current } = this.data
        if(step_current == 0){
            this.getTips()
        }

    },
    //下拉事件
    onPullDownRefresh() {
        wx.stopPullDownRefresh()
    },
    onShow() {
        let head_url_list = app.global_data.head_url_list || []
        let global_head_url_list = app._deepClone(head_url_list)
        if (!global_head_url_list.length) return
        let form_data = app._deepClone(this.data.form_data)
        form_data.head_url = global_head_url_list.filter(img => !!img.id)
            .map(img => img.id)
            .join(',')
        this.setData({
            head_url: global_head_url_list,
            form_data
        })
    },
    initFormData() {
        let form_data = {
            head_url: '',
            type: '',
            name: '',
            province: '',
            city: '',
            area: '',
            address: '',
            phone: '',
            phone_sub: '',
            id_number: '',
            imgs: ''
        }
        form_data.province = default_region[0]
        form_data.city = default_region[1]
        form_data.area = default_region[2]
        command_types.forEach(type => {
            if (type.label === default_type) {
                form_data.type = type.value
            }
        })
        return form_data
    },
    changeHeadUrl() {
        wx.navigateTo({
            url: '/pages/avatar/index?max=1&type=head_url'
        })
    },
    //检查当前状态
    async checkStatus() {
        await app.asyncApi(wx.showLoading, {
            title: '请稍候...'
        })
        await app.asyncApi(wx.showNavigationBarLoading)

        let server_res = await app.get({
            url: '/api/v1/shop/info'
        })
        await app.asyncApi(wx.hideNavigationBarLoading)
        await app.asyncApi(wx.hideLoading)
        let {success, data, msg} = server_res
        if (!success) {
            app._error(msg)
            return
        }
        //没有申请
        if (Object.keys(data)
            .length === 0) {
            this.setData({
                step_current: 0,
                padding_bottom: padding_bottom_0
            })
        } else {
            let steps_list = app._deepClone(this.data.steps_list)
            let {state, id, ...remote_data} = data
            let new_data = {
                shop_id: id
            }
            switch (Number(state)) {
                //申请中
                case 1:
                    new_data.step_current = 1
                    new_data.padding_bottom = padding_bottom_1
                    break
                // 已审核
                case 2:
                    new_data.step_current = 2
                    new_data.success = true
                    new_data.padding_bottom = padding_bottom_2;
                    steps_list[1].status = 'finish'
                    break
                // 已被拒绝
                case 3:
                    new_data.step_current = 2
                    new_data.success = false
                    new_data.padding_bottom = padding_bottom_2
                    steps_list[1].status = 'error'
                    break
                // 审核通过且用户已确认
                case 4:
                    app._success('审核通过，正在前往店铺...')
                    this.redirectTo()
                    break
                default:
                    console.error(state, '暂时不想处理')
            }
            let form_data = app._deepClone(this.data.form_data)
            let imgs = []
            if (remote_data.imgs instanceof Array) {
                remote_data.imgs.forEach(item => {
                    let img = {
                        id: item.img_id
                    }
                    let img_url = item.img_url || {}
                    img.path = img_url.url
                    imgs.push(img)
                })
            }
            Object.keys(form_data)
                .forEach(key => {
                    form_data[key] = remote_data[key]
                })
            form_data.imgs = imgs
            this.setData({
                form_data: form_data,
                steps_list: steps_list,
                ...new_data
            })
        }
    },
    async getTips() {
        await app.asyncApi(wx.showLoading, {
            title: '请稍候...'
        })
        await app.asyncApi(wx.showNavigationBarLoading)
        let server_res = await app.get({
            url: '/api/v1/system/tip'
        })
        await app.asyncApi(wx.hideLoading)
        await app.asyncApi(wx.hideNavigationBarLoading)
        let {success, msg, data} = server_res
        if (!success) {
            app._error(msg)
            return
        }
        let wx_res = await app.asyncApi(wx.showModal, {
            title: '温馨提示',
            content: data.register,
            confirmText: '同意',
            cancelText: '拒绝'
        })
        if(!wx_res.confirm){
            wx.navigateBack({
                delta: 1
            })
            return
        }
    },
    //绑定表单事件
    bindFormChange(e) {
        let {form_key, value} = app._bindFormChange(e)
        let form_data = this.updateFormData(form_key, value)
        let other_data = {}
        if (form_key === 'imgs') {
            other_data.photo_list = value
        }
        if (form_key === 'type') {
            command_types.forEach((command, index) => {
                if (index == value) {
                    other_data.type_text = command.label
                }
            })
        }
        if (form_key === 'head_url') {
            other_data.head_url = value
        }
        console.log(other_data)
        this.setData({
            form_data: form_data,
            ...other_data
        })
    },
    //处理表单数据
    updateFormData(form_key, value) {
        let form_data = app._deepClone(this.data.form_data)
        switch (form_key) {
            case 'name':
            case 'address':
            case 'phone':
            case 'phone_sub':
            case 'id_number':
                form_data[form_key] = value
                break
            case 'type':
                command_types.forEach((command, index) => {
                    if (value == index) {
                        form_data[form_key] = command.value
                    }
                })
                break
            case 'services_region':
                form_data.province = value[0]
                form_data.city = value[1]
                form_data.area = value[2]
                break
            case 'head_url':
                form_data.head_url = value.filter(img => !!img.id)
                    .map(img => img.id)
                    .join(',')
                break
            case 'imgs':
                form_data.imgs = value.filter(img => !!img.id)
                    .map(img => img.id)
                    .join(',')
                break;
            default:
                throw new Error('form_key 无效')
        }
        return form_data
    },

    async confirm() {
        let {step_current} = this.data;
        switch (step_current) {
            case 0:
                let server_res = await this.sumbit()
                //如果submit返回undefined，则为提交被暂停
                if (!server_res) return
                //如果submit返回success:false,则接口出错
                let {success, msg} = server_res
                if (!success) {
                    app._error(msg)
                    return
                }
                //提交成功后刷新页面
                this.checkStatus()
                break
            case 1:
                break
            case 2:

                break
            default:
                throw new Error('step_current 不合法')
        }
    },
    //提交请求
    sumbit() {
        let {form_data, photo_list} = this.data
        let is_valid = true
        Object.keys(form_data)
            .forEach(key => {
                if (!form_data[key]) {
                    is_valid = false
                }
            })
        if (!is_valid) {
            app._warn('请完善您的店铺信息')
            return
        }
        let has_error_photo = false
        photo_list.forEach(img => {
            if (!img.id) {
                has_error_photo = true
            }
        })
        if (has_error_photo) {
            app._warn('上传失败的照片将不会被提交')
        }
        return app.post({
            url: '/api/v1/shop/apply',
            data: form_data
        })
    },
    redo() {
        let form_data = this.initFormData()
        let steps_list = app._deepClone(this.data.steps_list)
        steps_list[1].status = ''
        this.setData({
            step_current: 0,
            form_data: form_data,
            padding_bottom: padding_bottom_0,
            steps_list: steps_list
        })
    },
    //确认开店
    async ensure() {
        let {shop_id} = this.data
        if (!shop_id) {
            app._warn('缺少shop_id')
            return
        }
        await app.asyncApi(wx.showLoading, {
            title: 'loading...'
        })
        let server_res = await app.get({
            url: '/api/v1/shop/handel',
            data: {
                state: 4,
                id: shop_id
            }
        })
        await app.asyncApi(wx.hideLoading)
        let {success, msg, data} = server_res
        if (!success) {
            app._error(msg)
            return
        }
        app.global_data.shop_id = data.shop_id
        let {form_data} = this.data
        app.global_data.province = form_data.province
        app.global_data.city = form_data.city
        app.global_data.area = form_data.area
        this.redirectTo()
    },
    async redirectTo() {
        await app.asyncApi(wx.showLoading, {
            title: '跳转中...'
        })
        await app.sleep()
        await app.asyncApi(wx.hideLoading)
        wx.redirectTo({
            url: '/pages/shop/index'
        })
    }
})
