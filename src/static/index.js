import Vue from 'vue'
import Router from 'vue-router'
import { Spin, Checkbox, Button } from 'iview'
import 'iview/dist/styles/iview.css';
Vue.component('Button', Button);
Vue.component('Checkbox', Checkbox);
Vue.component('Spin', Spin);
Vue.use(Router)
let router = new Router()
import App from './app.vue'
new Vue({
  el: '#app',
  render: h => h(App),
  router
})