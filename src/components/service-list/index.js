Component({
  properties: {
    // 需要渲染的服务列表数据，数据模型必须为{id, imgUrl, title, totalSales, money}
    list: Array,
    // 服务类型，1为家政，2为维修
    serviceType: String
  }
});