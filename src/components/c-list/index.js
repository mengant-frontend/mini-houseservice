Component({
	properties: {
		data: {
			type: Array,
			value: [],
			observer(val){
				let { url, params } = this.data
				let list = val.map(item => {
					let params_arr = []
					Object.keys(params).forEach((key) => {
						params_arr.push(key + '=' + item[params[key]])
					})
					return Object.assign({}, item, {
						url: url + '?' + params_arr.join('&')
					})
				})
				this.setData({
					list: list
				})
			}
		},
		url: {
			type: String,
			value: ''
		},
		params: {
			type: Object,
			value: {}
		},
		type: {
			type: String,
			value: 'shop'
		},
		btns: {
			type: Array,
			value: [{
				type: 'warning-ghost',
				value: '我要预约'
			}]
		}
	},
	data: {
		list: []
	}
})