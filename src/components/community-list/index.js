Component({
  properties: {
    // 圈子类型（'house', 'property', 'nous', 'recruit'）
    communityType: String,
    // 需要渲染的圈子列表数据，数据模型必须为{id, imgUrl, title, date, ifView, viewNum}
    list: Array
  }
});