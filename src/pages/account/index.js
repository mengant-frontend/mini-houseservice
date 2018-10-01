Page({
  data: {
    panels: [{
      title: '消息',
      key: 'message'
    }, {
      title: '余额',
      key: 'balance'
    }, {
      title: '需求',
      key: 'demand'
    }],
    panel_data: {
      message: '37',
      balance: '0.00',
      demand: '1'
    },
    urls: [{
      title: '进入商家',
      url: '/pages/seller/index'
    }, {
      title: '短租订单',
      url: ''
    }, {
      title: '我的收藏',
      url: ''
    }, {
      title: '我的红包',
      url: ''
    }, {
      title: '留言',
      url: ''
    }, {
      title: '设置',
      url: ''
    }, {
      title: '实名验证'
    }],
    messages: [{
      title: '昵称',
      key: 'nickname'
    }, {
      title: '电话',
      key: 'phone'
    }, {
      title: '所在地',
      key: 'area'
    }],
    message_data: {
      nickname: '李福招',
      phone: '18219112831',
      area: '广州市'
    }

  },
  //点击编辑
  edit(){
    console.log(123)
  }
})