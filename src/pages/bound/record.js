Page({
  data: {
    tabs_list: [{
      id: 'all',
      title: '全部',
      dot: false,
      count: 0,
      current_page: 0,
      total: 0,
      if_no_more: false,
      list: []
    }, {
      id: 'to_be_shipped',
      title: '待发货',
      dot: false,
      count: 0,
      current_page: 0,
      total: 0,
      if_no_more: false,
      list: []
    }, {
      id: 'due_in',
      title: '待收货',
      dot: false,
      count: 0,
      current_page: 0,
      total: 0,
      if_no_more: false,
      list: []
    }, {
      id: 'evaluate',
      title: '待评价',
      dot: false,
      count: 0,
      current_page: 0,
      total: 0,
      if_no_more: false,
      list: []
    }]
  },
  //切换tab
  changeTab(){
  
  },
  getList(){
    console.log('getList')
  }
})