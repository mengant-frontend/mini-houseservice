import regeneratorRuntime from '../../lib/runtime'
const app = getApp()
Page({
  data: {
    score: 0,
    list: []
  },
  onLoad(){
    this.getList()
  },
	onShow(){
  	this.getList()
	},
  getScore(e){
    // Todo 暂时想不到更好的做法 此处待定
    let { detail } = e
    let { score } = detail
    this.setData({
      score: score
    })
  },
  //获取我的积分下的商品列表
  //只取前九条
  async getList(){
    let res = await app.get({
      url: '/api/v1/goods/list/mini',
      data: {
        page: 1,
        size: 9
      }
    })
    if(!res.success){
      app._error(res.msg)
      return
    }
    let score = this.data.score,
      data = res.data
    this.setData({
      list: data.data || []
    })
  }
})