import voiceInputButton from './voice-input-button.vue'

voiceInputButton.install = function (Vue, Options) {
  Vue.prototype.ASRConfig = Options
  console.info(Options)
  Vue.component(voiceInputButton.name, voiceInputButton)
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(voiceInputButton)
}

export default voiceInputButton
