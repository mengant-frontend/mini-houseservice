Page({
  data: {
    // 打开页面时默认显示第一项列表
    tabsCurrent: 0,
    // tabs 列表数据
    tabsList: [
      {
        name: 'pendingOrder',
        title: '待接单',
        count: 0
      },
      {
        name: 'unpaid',
        title: '待支付',
        count: 0
      },
      {
        name: 'unconfirmed',
        title: '待确认',
        count: 0
      },
      {
        name: 'unevaluate',
        title: '待评价',
        count: 0
      },
      {
        name: 'completed',
        title: '已完成',
        count: 0
      }
    ]
  }
});