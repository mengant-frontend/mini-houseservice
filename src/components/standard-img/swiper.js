Component({
	properties: {
		autoplay: {
			type: Boolean,
			value: true
		},
		data: {
			type: Array,
			value: []
		},
		titles:{
			type: Array,
			value: []
		}
	},
	data: {
		max_img_height: 0,
		interval: 3000
	},
	methods: {
		// 图片加载，取最大宽度
		imgLoad(e){
			let { max_img_height } = this.data
			let { detail } = e
			let height_encode = detail.height / (detail.width / 750)
			if(height_encode > max_img_height){
				// 高度最高取442rpx
				if(height_encode > 442){
					height_encode = 442
				}
				this.setData({
					max_img_height: height_encode
				})
			}			
		},
		// 
		swiperChange({ detail }){
			let { source } = detail,
				interval = 3000
			if(source === 'touch'){
				interval = 5000
			}
			this.setData({
				interval: interval
			})
		}
	}
})