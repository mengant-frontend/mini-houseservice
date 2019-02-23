Component({
  properties: {
    // 允许设置背景色，默认为白色
    bgColor: {
      type: String,
      value: '#fff'
    },
    // 是否能回复，默认不能
    canReply: {
      type: Boolean,
      value: false
    },
    // 需要渲染的评论列表数据，数据模型应该包含
    // 不能回复时{id,avatar_url,nick_name,date,content}
    // 能回复时{id,avatar_url,nick_name,date,if_liked,likes,content,comment_someone:{nick_name,content}}
    list: Array
  },

  methods: {
    // 回复
    reply({ target }) {
      let id = target.dataset.id
      // 将 id 传递给组件使用者绑定的 reply 监听事件
      this.triggerEvent('reply', { id });
    },
    // 点赞
    like({ target }) {
      let id = target.dataset.id
      // 将 id 传递给组件使用者绑定的 like 监听事件
      this.triggerEvent('like', { id });
    }
  }
})