Page({
  data: {
    tabs_list: [{
      id: 'income',
      title: '收入',
      dot: false,
      count: 0,
      current_page: 0,
      total: 0,
      if_no_more: false,
      order_list: []
    }, {
      id: 'outcome',
      title: '支出',
      dot: false,
      count: 0,
      current_page: 0,
      total: 0,
      if_no_more: false,
      order_list: []
    }]
  },
  //切换tab
  changeTab(){
  
  },
  getList(){
    console.log('getList')
  }
})