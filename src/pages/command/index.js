const app = getApp()
Page({
  data: {
    current: 0,
    titles: ['待接单', '待支付', '待确认', '待评价', '已完成'],
    tab_data: [{
      bottom_loading: false,
      tip: '下拉获取更多',
      list: [{
        desc: '这是一条需求',
        money: '0.20',
        create_time: '2018-10-04',
        seller: '李福招',
        id: 1
      }]
    }],
    touches: []
  },
  setCurrentTab({ detail: { key }}){
    this.setData({
      current: Number(key)
    })
  },
  setCurrentSwiper({ detail: { current }}){
    this.setData({
      current: current
    })
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
  },
  onReachBottom(){
    console.log('123')
  },
  //只考虑单点触摸
  touchStart(e){
    let touches = e.touches
    this.setData({
      touches: touches
    })
  },
  touchMove(e){
    console.log('move', e)
  },
  touchEnd(e){
    console.log('end', e)
  }
})