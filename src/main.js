import Vue from 'vue';
import App from './App.vue';
import router from './plugins/router/router';
import store from './plugins/store/store';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/assets/style/main.scss';
import '@/assets/style/datepicker.scss';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import YmapPlugin from 'vue-yandex-maps';
import VueMask from 'v-mask';
import { ConfigProvider, ENVIRONMENT_VARS } from './config/config-provider';

Vue.config.productionTip = false;

const settings = {
  apiKey: ConfigProvider.value(ENVIRONMENT_VARS.VUE_APP_YANDEX_API_KEY)
    ? ConfigProvider.value(ENVIRONMENT_VARS.VUE_APP_YANDEX_API_KEY)
    : '',
  lang: 'ru_RU',
  coordorder: 'latlong',
  version: '2.1'
};

Vue.use(YmapPlugin, settings);
Vue.use(VueMask);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
