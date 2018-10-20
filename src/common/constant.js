export const domain = 'https://mengant.cn'
export const command_types = [{
 label: '家政',
 value: 2
}, {
 label: '维修',
 value: 1
}]
export const default_type = '家政'

export const default_region = ['广东省', '广州市', '天河区']

export const size = 15;

export const order_states = {
 '1': {
  label: '服务订单',
  merchant: {
   '1': '待确认',
   '2': '待服务',
   '3': '服务中',
   '4': '已完成'
  },
  common: {
   '1': '待接单',
   '2': '待付款',
   '3': '待确认',
   '4': '待评价',
   '5': '已完成'
  },
  '2': {
   label: '需求订单',
   merchant: {
    '1': '待确认',
    '2': '待服务',
    '3': '服务中',
    '4': '已完成'
   },
   common: {
    '1': '已预约',
    '2': '待付款',
    '3': '待确认',
    '4': '待评价',
    '5': '已完成'
   }
  }
 }
}
