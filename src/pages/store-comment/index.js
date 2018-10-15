let app = getApp()

Page({
  data: {
    if_loading: true,
    if_no_more: false
  },

  onLoad(options) {
    setTimeout(() => {
      this.setData({
        store_id: options.store_id,
        comment_total: 3,
        comment_list: [
          {
            id: 0,
            avatar_url: '/images/avatar.jpg',
            nick_name: '红红火火',
            date: '2018-10-01',
            if_liked: false,
            likes: 2,
            content: '比酒店更自由，随意安排自己行程',
            comment_someone: {
              nick_name: '绿肥红瘦',
              content: '家庭房比酒店更舒适，跟自己家里一样温馨。加上平时工作繁忙，和家人沟通少，正好利用假日旅游机会，一家人住到一间房子里，更融洽感情。'
            }
          }, {
            id: 1,
            avatar_url: '/images/avatar.jpg',
            nick_name: '绿肥红瘦',
            date: '2018-10-01',
            if_liked: true,
            likes: 2,
            content: '家庭房比酒店更舒适，跟自己家里一样温馨。加上平时工作繁忙，和家人沟通少，正好利用假日旅游机会，一家人住到一间房子里，更融洽感情。',
            comment_someone: {
              nick_name: null,
              content: null
            }
          }
        ],
        if_loading: false
      });
    }, 800);
  },

  // 回复
  reply({ detail }) {
    console.log(detail.index, detail.id)
  },

  // 点赞
  like({ detail }) {
    console.log(detail.index, detail.id)
    let index = detail.index
    let comment_list = this.data.comment_list
    let if_liked = !comment_list[index].if_liked
    comment_list[index].if_liked = if_liked
    if_liked ? comment_list[index].likes++ : comment_list[index].likes--
    this.setData({ comment_list })
  },

  // 获取评论列表
  getCommentList() {
    let if_no_more = this.data.if_no_more
    let oldList = this.data.comment_list
    let oldList_len = oldList.length
    let newItem = { ...oldList[oldList_len - 1] }
    newItem.id++;
    if (!if_no_more) {
      if (oldList_len < 10) {
        this.setData({
          if_loading: true
        });
        setTimeout(() => {
          this.setData({
            if_loading: false,
            comment_list: oldList.concat([newItem])
          });
        }, 800);
      } else {
        this.setData({
          if_loading: false,
          if_no_more: true
        });
      }
    }
  }
})

// app.get({
//   url: '/api/v1/circle/comment/list',
//   data: {
//     page: 1,
//     size: 6,
//     id: 7
//   }
// }).then(res => {
//   if (res.success) {
//     console.log(res)
//   } else { // 出错处理debug
//     console.log(res.msg)
//   }
// })