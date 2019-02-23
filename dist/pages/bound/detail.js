import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    current: 0,
    tabs_list: [{
      id: 'income',
      title: '收入',
      dot: false,
      count: 0,
      page: 1,
      if_no_more: false,
      list: [],
			type: 1
    }, {
      id: 'outcome',
      title: '支出',
      dot: false,
      page: 1,
      if_no_more: false,
      list: [],
			type: 2
    }]
  },
  onLoad(){
    this.getList()
  },
	async getList(){
  	let { current, tabs_list } = this.data,
			tab = tabs_list[current]
		if(tab.loading){
			return
		}
		if(tab.if_no_more){
			return
		}
		tab.loading = true
		this.setData({
			tabs_list: tabs_list
		})
 		let res = await app.get({
			url: '/api/v1/score/user/list',
			data: {
				type: tab.type,
				page: tab.page,
				size: 10
			}
		})
		tabs_list = this.data.tabs_list
		current = this.data.current
		tab = tabs_list[current]
		tab.loading = false
		if(!res.success){
			app._error(res.msg)
			this.setData({
				tabs_list: tabs_list
			})
			return
		}
		let { data, total } = res.data
		if(tab.page === 1){
			tab.list = 	data || []
		}else{
			tab.list = tab.list.concat(data)
		}
		tab.if_no_more = tab.list.length >= total
		this.setData({
			tabs_list
		})
	},
	swiperChange(e){
  	let { detail } = e,
			tabs_current = detail.tabs_current
		this.setData({
			current: tabs_current
		})
		this.getList()
	},
	reachBottom(){
  	let { current, tabs_list } = this.data,
			tab = tabs_list[current]
		tab.page = tab.page + 1
		this.setData({
			tabs_list
		})
		this.getList()
	}
})