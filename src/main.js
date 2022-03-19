import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

// 引入中文版element-ui
// import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

import * as api from '@/api'

import CategorySelector from '@/components/CategorySelector'
import HintButton from '@/components/HintButton'
// 注册全局路由组件选择器
Vue.component(CategorySelector.name,CategorySelector);
// 按钮悬浮显示文字
Vue.component(HintButton.name,HintButton);

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

// 引入plugins中的v-charts
import '@/plugins/vCharts'

Vue.config.productionTip = false

// 引入api接口函数到原型上
Vue.prototype.$api = api
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
