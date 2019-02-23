//async 需要显式引入regeneratorRuntime
const regeneratorRuntime = require('../../lib/runtime')
Page({
  data: {
    record_list: [],
    bottom_loading: false,
    current: 1,
    tip: ''
  },
  onReady(){
    this.loadData(this.data.current)
  },
  //下拉更新
  async onPullDownRefresh(){
    this.setData({
      current: 1
    })
    await this.loadData(this.data.current)
    wx.stopPullDownRefresh()
  },
  //触底更新
  onReachBottom(){
    let current = this.data.current
    this.setData({
      current: current + 1,
    })
    this.loadData(this.data.current)
  },
  //拉取数据
  async loadData(page){
    let size = 2 // 每次加载15条数据
    if(page === 1){
      wx.showLoading({
        title: 'loading...'
      })
    }else{
      this.setData({
        bottom_loading: true,
        tip: 'loading...'
      })
    }
    let res =  await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 0,
          msg: '获取成功',
          data: [{
            id: 1,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          }, {
            id: 2,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          }, {
            id: 3,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 4,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 5,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 6,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 7,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 8,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 9,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 10,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 11,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 12,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          },{
            id: 13,
            title: '提现(申请中)',
            label: '0.90',
            value: '2018-10-03 16:45'
          }]
        })
      }, 3000)
    })
    wx.hideLoading()
    let { code, data, msg } = res
    let record_list = this.data.record_list || [], tip = ''
    if(page === 1){
      record_list = data
    }else{
      record_list = record_list.concat(data)
    }
    //如果当次返回数据的量少于size，即为已经加载全部数据
    if(data.length < size){
      tip = '已加载全部记录'
    }else{
      tip = '下拉获取更多'
    }
    if(!record_list.length){
      tip = '暂无数据'
    }
    this.setData({
      bottom_loading: false,
      record_list: record_list,
      tip: tip
    })
  }
})

/**
 * 关于tip
 * 1. 加载时：tip = 'loading...'
 * 2. 加载完成：tip = '下拉获取更多'
 * 3. 空数据： tip = '暂无数据'
 */


