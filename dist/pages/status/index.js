Page({
	data: {
		status: 'success',
		title: '',
		type: '1',
		icon: 'success'
	},
	onLoad(query){
		let { type = '1',status = 'success', val = 0 } = query,
			title = '',
			bar_title = '',
			icon = ''
		switch (status) {
			case 'success':
				bar_title = '成功提示'
				switch (type) {
					case '1':
						title = '积分兑换成功'
						break
					case '2':
						title = '积分购买成功'
						break
				}
				icon = 'success'
				break
			case 'fail':
				bar_title = '失败提示'
				switch (type) {
					case '1':
						title = '兑换码已失效'
						break
				}
				icon = 'warn'
				break
			default:
		}
		wx.setNavigationBarTitle({
			title: bar_title
		})
		this.setData({
			status: status,
			val: val,
			type: type,
			icon: icon,
			title: title
		})
	},
	ensure(){
		wx.navigateBack({
			delta: 1
		})
	}
})