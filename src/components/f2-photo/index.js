import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Component({
	properties: {
		list: {
			type: Array,
			value: []
		},
		add: {
			type: Boolean,
			value: true
		},
		shape: {
			type: String,
			value: 'square'
		},
		count: {
			type: Number,
			value: 9
		},
		canTap: {
			type: Boolean,
			value: true
		},
		type: {
			type: String,
			value: 'normal'
		},
		url: {
			type: String,
			value: ''
		},
		params: {
			type: Array,
			value: []
		},
		path:{ 
			type: String,
			value: '/pages/cropper/upload'
		}
	},
	methods: {
		chooseImg(){
			app.global_data.pic_type = this.data.type
			wx.navigateTo({
				url: this.data.path + '?type=' + this.data.shape
			})
		},
		confirmDelete(e){
			if(this.data.type === 'avatar'){
				this.chooseImg()
				return 
			}
			if(!this.data.canTap){
				return
			}
			let { currentTarget:{ dataset }} = e
			wx.showModal({
				title: '删除提示',
				content: '删除本张图片',
				showCancel: true,
				success: async (res) => {
					if(res.confirm){
						let index = dataset.index
						if(this.data.url){
							let params = {}
							this.data.params.forEach(param => {
								params[param.key] = this.data.list[index][param.value]
							})
							let server_res = await app.post({
								url: this.data.url,
								data: params
							})
							let { success, msg, data } = server_res
							if(!success){
								app._error(msg)
								return
							}
						}
						this.triggerEvent('delete', {
							index: index
						})
					}
				}
			})
		}
	}
})