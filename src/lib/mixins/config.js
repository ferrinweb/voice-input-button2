import locales from './locales.json'
const defaultConfig = {
  color: '#333',
  tipPosition: 'top',
  tipTextColor: '#f2f2f2',
  tipBackgroundColor: '#4b667d',
  tipShadowColor: 'rgba(0,0,0,.1)',
  interactiveMode: 'press',
  returnMode: 'increment',
  language: 'zh_cn',
  vad_eos: 3000
}
export default {
  props: {
    color: String,
    tipPosition: String,
    appId: String,
    apiKey: String,
    apiSecret: String,
    // 交互模式
    // 'press': 按下开始录音，放开结束录音
    // 'touch': 点击开始录音，再次点击结束录音
    interactiveMode: String,
    // 结果返回模式
    // 'increment': 增量模式，增量返回识别结果，但对于每次返回都是一个完整的结果，包含对前面识别结果的追加、补充和修正
    // 'complete': 完整模式，完成本次识别后返回最终结果
    returnMode: String,
    language: String,
    accent: String,
    pd: String,
    rlang: String,
    ptt: Number,
    nunum: Number,
    vad_eos: Number
  },
  methods: {
    getConfig (key) {
      if (!this.IATConfig) this.IATConfig = {}
      return this[key] || this.IATConfig[key] || defaultConfig[key]
    }
  },
  computed: {
    pressMode () {
      return this.getConfig('interactiveMode') !== 'touch'
    },
    touchMode () {
      return this.getConfig('interactiveMode') === 'touch'
    },
    incrementMode () {
      return this.getConfig('returnMode') === 'increment'
    },
    completeMode () {
      return this.getConfig('returnMode') === 'complete'
    },
    locale () {
      const locale = locales[this.getConfig('language')]
      return locale
    }
  }
}
