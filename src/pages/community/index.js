Page({
  data: {
    tabsCurrent: 0, // 打开页面时默认显示第一项列表
    ifLoading: true, // 打开页面时是否显示正在加载数据
    tabsList: [ // tabs 列表数据
      {
        name: 'house',
        title: '久房通',
        count: 10,
        ifNoMore: false
      },
      {
        name: 'property',
        title: '物业通知',
        count: 0,
        ifNoMore: false
      },
      {
        name: 'nous',
        title: '生活常识',
        count: 0,
        ifNoMore: false
      },
      {
        name: 'recruit',
        title: '失物招领',
        count: 0,
        ifNoMore: false
      }
    ],
    houseUrl: '',
    propertyUrl: '',
    nousUrl: '',
    recruitUrl: '',
  },

  // 模拟数据加载过程
  onLoad() {
    var that = this;
    setTimeout(function () {
      that.setData({
        houseList: [
          {
            id: 0,
            title: '短租房的特点',
            imgUrl: '../../images/404.png',
            date: '2018-07-09',
            ifView: false,
            viewNum: 28
          }
        ],
        ifLoading: false
      });
    }, 800);
  },

  // 初次切换 tabs 交互（加载对应类型的圈子数据列表）
  intCommunityList({ detail }) {
    switch (detail.tabsCurrent) {
      case 0:
        this.data.houseList ? '' : this.getHouseList();
        break;
      case 1:
        this.data.propertyList ? '' : this.getPropertyList();
        break;
      case 2:
        this.data.nousList ? '' : this.getNousList();
        break;
      case 3:
        this.data.recruitList ? '' : this.getRecruitList();
        break;
    }
  },

  // 内容区域上拉触底交互（加载对应类型的圈子数据列表）
  getCommunityList({ detail }) {
    switch (detail.tabsCurrent) {
      case 0:
        this.getHouseList();
        break;
      case 1:
        this.getPropertyList();
        break;
      case 2:
        this.getNousList();
        break;
      case 3:
        this.getRecruitList();
        break;
    }
  },

  // 加载久房通列表
  getHouseList() {
    var that = this,
      ifNoMore = that.data.tabsList[0].ifNoMore,
      oldList = that.data.houseList,
      oldList_len = oldList.length,
      newItem = { ...oldList[oldList_len - 1] };
    newItem.id++;
    if (!ifNoMore) {
      if (oldList_len < 10) {
        that.setData({
          ifLoading: true
        });
        setTimeout(function () {
          that.setData({
            ifLoading: false,
            houseList: oldList.concat([newItem])
          });
        }, 800);
      } else {
        that.setData({
          ifLoading: false,
          'tabsList[0].ifNoMore': true
        });
      }
    }
  },

  // 加载物业通知列表
  getPropertyList() {
    var that = this,
      ifNoMore = that.data.tabsList[1].ifNoMore;
    if (!ifNoMore) {
      that.setData({
        ifLoading: true
      });
      setTimeout(function () {
        that.setData({
          ifLoading: false,
          'tabsList[1].ifNoMore': true
        });
      }, 800);
    }
  },

  // 加载生活常识列表
  getNousList() {
    var that = this,
      ifNoMore = that.data.tabsList[2].ifNoMore;
    if (!ifNoMore) {
      that.setData({
        ifLoading: true
      });
      setTimeout(function () {
        that.setData({
          ifLoading: false,
          'tabsList[2].ifNoMore': true
        });
      }, 800);
    }
  },

  // 加载失物招领列表
  getRecruitList() {
    var that = this,
      ifNoMore = that.data.tabsList[3].ifNoMore;
    if (!ifNoMore) {
      that.setData({
        ifLoading: true
      });
      setTimeout(function () {
        that.setData({
          ifLoading: false,
          'tabsList[3].ifNoMore': true
        });
      }, 800);
    }
  }
});