import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
  	current: 0,
    tabs_list: [{
      id: 'all',
      title: '全部',
      dot: false,
      count: 0,
      page: 1,
      total: 0,
      if_no_more: false,
      list: [],
			type: 1
    }, {
      id: 'to_be_shipped',
      title: '待发货',
      dot: false,
      page: 1,
      if_no_more: false,
      list: [],
			type: 2
    }, {
      id: 'due_in',
      title: '待收货',
      dot: false,
      page: 1,
      if_no_more: false,
      list: [],
			type: 3
    }, {
      id: 'evaluate',
      title: '待评价',
      dot: false,
      page: 1,
      if_no_more: false,
      list: [],
			type: 4
    }]
  },
	onLoad(){
 		this.getList()
	},
  async getList(){
  	let { current, tabs_list } = this.data,
			tab = tabs_list[current]
		if(tab.if_no_more){
			return
		}
		if(tab.loading){
			return
		}
		tab.loading = true
		this.setData({
			tabs_list: tabs_list
		})
    let res = await app.get({
			url: '/api/v1/goods/order/list/mini',
			data: {
				type: tab.type,
				page: tab.page,
				size: 10
			}
		})
		let data = res.data
		current = this.data.current
		tabs_list = this.data.tabs_list
		tab = tabs_list[current]
		tab.loading = false
		if(!res.success){
			app._error(res.msg)
			this.setData({
				tabs_list: tabs_list
			})
			return
		}
		if(tab.page === 1){
			tab.list = data.data || []
		}else{
			tab.list = tab.list.concat(data.data)
		}
		tab.if_no_more = tab.list.length >= data.total
		this.setData({
			tabs_list: tabs_list
		})
  },
	//切换tab
	swiperChange(e){
  	let { detail } = e
		let { tabs_current } = detail
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