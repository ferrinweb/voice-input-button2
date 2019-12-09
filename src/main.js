import Vue from 'vue'
import App from './App.vue'

import voiceInputButton from './lib'

Vue.use(voiceInputButton, {
  appId: '',
  apiKey: '',
  apiSecret: ''
})

new Vue({
  el: '#app',
  render: h => h(App)
})
