//async 需要显式引入regeneratorRuntime
const regeneratorRuntime = require('../../lib/runtime')
const app = getApp()
Component({
  options: {
    multipleSlots: true
  },
  properties: {
    titles: {
      type: Array,
      value: []
    }
  },
  data: {
    start_touches: [],
    current: 0,
    //拉动的距离
    slide_width: 0,
    promise: null
  },
  methods: {
    setCurrentTab({ detail: { key } }){
      this.setData({
        current: key
      })
    },
    touchStart(e){
      this.setData({
        start_touches: e.touches
      })
    },
    touchMove(e){
      //这里依赖全局变量system_info
      let system_info = app.global_data.system_info
      let touches = e.touches
      let { start_touches, promise } = this.data
      promise = new Promise(resolve => {
        //考虑到多点触控
        let widths = start_touches.map((start_touch, index) => {
          //slide_width 正数为页面向右滑动 负数为页面向左滑动
          let slide_width = start_touch.clientX - touches[index].clientX
          return slide_width
        })
        //取多点触控的最大值
        let max_width = Math.max.call(null, widths)
        let slide_width = parseInt(max_width / system_info.screenWidth * 100) / 100
        if(slide_width < 0.5){
          slide_width = slide_width * 2
        }
        this.setData({
          slide_width: slide_width,
          promise: null
        }, resolve)
      })
      this.setData({
        promise: promise
      })
    },
    async touchEnd(){
      let { promise } = this.data
      if(promise){
        await promise
      }
      let { slide_width, current } = this.data
      let new_items = {
        slide_width: 0,
        start_touches: []
      }
      if(Math.abs(slide_width) > 0.5){
        current = current + Math.round(slide_width)
      }
      if(current < 0) {
        current = 0
      }else if(current >= this.data.titles.length){
        current = this.data.titles.length - 1
      }
      new_items.current = current
      this.setData(new_items)
    }
  }
});