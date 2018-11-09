<template>
    <div class="page card">
        <Spin v-if="loading" fix size="large"></Spin>
        <div id="rich-text" v-html="term_data.content"></div>
        <Checkbox v-model="confirm_disabled" v-if="type == 'service_term'">
            <span class="label">您已阅读并同意遵守《<span class="strong">久房通服务条款说明</span>》</span>
        </Checkbox>
        <div class='fixed' v-if="type == 'service_term'">
            <div class='flex-btn'>
                <div class='container__btn'>
                    <Button type='primary' @click='confirm' size='small' size="large" :disabled="!confirm_disabled" long>同意</Button>
                </div>
            </div>
        </div>
        <div id="test">
            <span v-if="is_type">t</span>
            <span v-else>p</span>
        </div>
    </div>
</template>
<script>
  import axios from 'axios'
  const types = {
    price_guide: 1,
    sentive_word: 2,
    service_term: 3,
    about_us: 4,
    user_guide: 5,
    shop_term: 6
  }
  export default {
    name: 'page',
    data: () => {
      return {
        type: '',
        has_btns: false,
        term_data: {},
        confirm_disabled: true,
        is_type: false,
        loading: true
      }
    },
    mounted() {
      let {query, path} = this.$route
      let {type} = query
      path = path.slice(1)
      let is_type = true
      if(!type){
        type = path
        is_type = false
      }
      let title = '', has_btns = true
      switch (type) {
        case 'price_guide':
          title = '价格指导'
          has_btns = false
          break
        case 'sentive_word':
          title = '敏感词汇'
          break
        case 'service_term':
          title = '服务条款'
          break
        case 'about_us':
          title = '关于我们'
          has_btns = false
          break
        case 'user_guide':
          title = '用户指南'
          has_btns = false
          break
        case 'shop_term':
          title = '商家协议'
          has_btns = false
        default:
      }
      document.title = title
      this.type = type
      this.has_btns = has_btns
      this.is_type = is_type
      this.loadTerm()
    },
    methods: {
      loadTerm() {
        axios.get('/api/v1/system/file', {
          params: {
            type: types[this.type]
          }
        })
        .then(res => {
          this.loading = false
          let {data} = res
          data.content = decodeURIComponent(data.content)
          this.term_data = data
        }, res => {
          this.loading = false
        }).then(res => {
          this.loading = false
        })
      },
      confirm() {
        wx.miniProgram.redirectTo({
          url: '/pages/welcome/index'
        })
      }
    }
  }
</script>
<style type="text/css">
    .page {
        width: 100%;
        min-height: 100%;
        padding: 15px 10px 64px;
        box-sizing: border-box;
        margin-bottom: 0 !important;
        background-color: #fff;
        position: relative;
    }

    .flex-btn {
        width: 100%;
        display: flex;
        flex-direction: row;
    }

    .container__btn {
        flex-grow: 1;
        flex-shrink: 1;
    }

    .container__checkbox {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .label {
        font-size: 12px;
        color: #80848f;
    }

    .strong {
        font-size: 13px;
        color: #1c2438;
    }

    .fixed {
        position: fixed;
        bottom: 10px;
        left: 0;
        width: 100%;
        padding: 0 15px;
    }
    #test{
        position: fixed;
        left: 0;
        bottom: 0;
    }
    .ivu-btn-long{
        height: 42px;
        font-size: 14px;
    }
    .loader{
        width: 60px;
        height: 60px;
        position: relative;
        margin: 0 auto;
    }
    .circular{
        -webkit-animation: rotate 2s linear infinite;
        animation: rotate 2s linear infinite;
        height: 100%;
        -webkit-transform-origin: center center;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
    }
</style>