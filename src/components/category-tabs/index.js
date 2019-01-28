Component({
	properties: {
		data: {
			type: Array,
			value: [],
			observer(val){
				this.setTitles()
			}
		},
		serviceList: {
			type: Array,
			value: []
		}
	},
	data: {
		is_close: true,
		active_id: 0,
		titles: []
	},
	methods: {
		// 展开或者收起
		toggleStatus(bool){
			let is_close = !this.data.is_close
			if(typeof bool === "boolean"){
				is_close = bool
			}
			this.setData({
				is_close: is_close
			})
		},
		// 激活
		select({ currentTarget }){
			let { dataset } = currentTarget
			let id = dataset.id > 0 ? dataset.id : 0
			this.setData({
				is_close: true,
				active_id: dataset.id
			})
			this.setTitles()
			this.triggerEvent('select', {
				category_id: dataset.id
			})
		},
		// 设置显示的titles
		setTitles(){
			let { data, active_id } = this.data
			let index = 0
			for(let i = 0; i < data.length; i++){
				if(data[i].id === active_id){
					index = i
					break
				}
			}
			let titles = data
			if(index > 0){
				titles = data.slice(index).concat(data.slice(0, index))	
			}
			this.setData({
				titles: titles
			})
		},
		// 关闭遮罩层
		closeMask(e){
			this.toggleStatus(true)
		}
	}
})