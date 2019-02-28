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
		showForum:{
			type: Boolean,
			value: false,
			observer(val){
				this.reRender()
			}
		},
		showForumEntry:{
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
				if(!res[0]) return false
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