import Vue from "vue";
import App from "./App.vue";
import VueCookie from 'vue-cookie';

Vue.use(VueCookie);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");

 
