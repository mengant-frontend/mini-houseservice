Component({
	properties: {
		showService: {
			type: Boolean,
			value: false,
			observer(){
				this.reRender()
			}
		},
		showCommand: {
			type: Boolean,
			value: false,
			observer(val){
				console.log(val)
				this.reRender()
			}
		},
		showGuide:{ 
			type: Boolean,
			value: false,
			observer(val){
				this.reRender()
			}
		},
		backgroundColor: {
			type: String,
			value: '#EFEFF4'
		}
	},
	data: {
		width: '300px',
		height: '150px',
		right: '-300px'
	},
	ready(){
		this.reRender()
	},
	methods: {
		reRender(){
			const query = wx.createSelectorQuery().in(this)
			query.select('#cover').boundingClientRect()
			query.exec((res) => {
			this.setData({
				right: '25rpx',
				width: res[0].width,
				height: res[0].height
			})
			})
		},
		goNextPage(e){
			let { currentTarget: { dataset } } = e
			if(dataset.url){
				wx.navigateTo({
					url: dataset.url
				})
			}
		}
	}
})