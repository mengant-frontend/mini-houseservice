import regeneratorRuntime from  '../../lib/runtime'

const app = getApp()

Page({
  data: {
    // 默认位置
    location: ['北京市', '北京市', '朝阳区'],
    noticeContent: [
      '分享功能开启，每一次您的分享都会得到系统赠送的随机现金红包！',
      '店铺首次好评将获得随机现金红包！',
      '首次下单将获得随机现金红包！',
      '首次登录注册，将获得随机现金红包！'
    ],
    houseServiceList: [
      {
        id: 0,
        imgUrl: '/images/404.png',
        title: '新房开荒保洁，装修保洁（测试多文字排版）',
        totalSales: 0,
        money: 0.00
      },
      {
        id: 1,
        imgUrl: '/images/404.png',
        title: '地面清洗加保养',
        totalSales: 0,
        money: 0.00
      },
      {
        id: 2,
        imgUrl: '/images/404.png',
        title: '空调清洗',
        totalSales: 0,
        money: 0.00
      },
      {
        id: 3,
        imgUrl: '/images/404.png',
        title: '抽油烟机清洗',
        totalSales: 0,
        money: 0.00
      }
    ],
    maintainServiceList: [
      {
        id: 0,
        imgUrl: '/images/404.png',
        title: '楼顶卫生间防水制作',
        totalSales: 0,
        money: 0.00
      },
      {
        id: 1,
        imgUrl: '/images/404.png',
        title: '美的格力海尔空调维修',
        totalSales: 0,
        money: 0.00
      },
      {
        id: 2,
        imgUrl: '/images/404.png',
        title: '（测试单数项排版）',
        totalSales: 0,
        money: 0.00
      }
    ]
  },

  onLoad() {
    app.get({
      url: '/api/v1/banner/mini/list',
      data: {
        type: 1
      }
    }).then(res => {
      if(res.success) {
        let banner_img = []
        let data = res.data
        for(let i in data) {
          banner_img.push(data[i].url)
        }
        this.setData({ banner_img })
      }
    })
  },

  // 地区选择
  locationChoose({ detail }) {
    this.setData({
      location: detail.value
    })
  },

  // 扫描
  async scan() {
    let res = await app.asyncApi(wx.scanCode)
    if(res.success) {
      console.log(res)
    }else {
      console.log(res.errMsg)
    }
  }
})