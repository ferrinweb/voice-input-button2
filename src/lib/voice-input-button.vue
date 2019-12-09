<!-- Author: ferrinweb -->
<!-- Create Time: 2018/12/5 10:33 -->
<!-- Description: voice-input-btn -->
<template>
  <div class="voice-input-button" :class="{active: recording, ready: isAudioAvailable}">
    <div class="record-btn"
      @contextmenu="menuPop"
      @mousedown="pressMode ? start($event) : toggle($event)"
      @mouseup="pressMode && stop($event)"
      @mouseleave="pressMode && stop($event)"
      @touchstart="pressMode ? start($event) : toggle($event)"
      @touchend="pressMode && stop($event)"
      @touchleave="pressMode && stop($event)"
    >
      <microphone v-if="!recording" :color="color"></microphone>
      <recording-icon v-else-if="state === 'ing' || responding || result" :color="color"></recording-icon>
      <loading v-else :color="color"></loading>
      <transition name="fade">
        <recording-tip v-if="state === 'ing' || responding || result" :position="tipPosition">
          <slot name="recording">{{ result || locale.recording }}</slot>
        </recording-tip>
        <recording-tip v-if="state === 'init'" :position="tipPosition">
          <slot name="wait">{{ locale.wait }}</slot>
        </recording-tip>
        <recording-tip v-if="blank" :position="tipPosition">
          <slot name="no-speak">{{ locale.say_nothing }}</slot>
        </recording-tip>
      </transition>
    </div>
  </div>
</template>

<script>
import locales from './locales.json'
import Recorder from './recorder'
import loading from './components/icons/loading'
import recordingIcon from './components/icons/recording-icon'
import microphone from './components/icons/microphone'
import recordingTip from './components/recording-tip'
const freezeProperty = (obj, key) => {
  Object.defineProperty(obj, key, {
    configurable: false
  })
}
const buffer = []

export default {
  name: 'voice-input-button',
  components: {
    loading,
    recordingIcon,
    microphone,
    recordingTip
  },
  props: {
    color: {
      type: String,
      default: '#333'
    },
    tipPosition: String,
    appId: String,
    apiKey: String,
    apiSecret: String,
    // 交互模式
    // 'press': 按下开始录音，放开结束录音
    // 'touch': 点击开始录音，再次点击结束录音
    interactiveMode: {
      type: String,
      default: 'press'
    },
    // 结果返回模式
    // 'increment': 增量模式，增量返回识别结果，但对于每次返回都是一个完整的结果，包含对前面识别结果的追加、补充和修正
    // 'complete': 完整模式，完成本次识别后返回最终结果
    returnMode: {
      type: String,
      defualt: 'increment'
    },
    language: {
      type: String,
      default: 'zh_cn'
    },
    accent: String,
    pd: String,
    rlang: String,
    ptt: Number,
    nunum: Number,
    vad_eos: {
      type: Number,
      default: 3000
    }
  },
  data () {
    return {
      recorder: null,
      processing: false,
      startTime: 0,
      time: 0,
      timer: null,
      recording: false,
      inputTarget: null,
      isAudioAvailable: false,
      blank: false,
      resultCache: {},
      result: '',
      responding: false
    }
  },
  methods: {
    menuPop () {
      window.event.returnValue = false
      return false
    },
    toggle (e) {
      this.recording ? this.stop(e) : this.start(e)
    },
    start (e) {
      e.preventDefault()
      if (!this.isAudioAvailable) {
        alert(this.locale.not_supported)
        return
      }
      if (this.recording || (e.which !== 1 && e.which !== 0)) return
      this.reset()
      this.recording = true
      this.startTime = new Date().getTime()
      this.timer = setInterval(() => {
        this.time = new Date().getTime() - this.startTime
      }, 20)
      this.recorder.start()
      this.$emit('record-start')
    },
    stop (e) {
      e && e.preventDefault()
      if (!this.recording || e && (e.which !== 1 && e.which !== 0)) return
      this.recording = false
      this.timer && clearInterval(this.timer)
      this.time = 0
      this.$emit('record-stop')
      this.processing = true
      this.recorder.stop()
    },
    reset () {
      buffer.splice(0)
      this.resultCache = {}
      this.responding = false
      setTimeout(() => {
        this.result = ''
      }, 500)
    },
    appendResult (text, sn) {
      this.resultCache[sn] = { text }
    },
    replaceResult (text, sn, start, end) {
      this.appendResult(text, sn)
      const resultCache = this.resultCache
      for (let i = start; i <= end; i++) {
        resultCache[i].discarded = true
      }
    },
    getResult () {
      return Object.values(this.resultCache).filter(item => !item.discarded).map(item => item.text).join('')
    },
    setResult (data) {
      this.responding = true
      let str = ''
      const ws = data.ws
      for (let i = 0; i < ws.length; i++) {
        str = str + ws[i].cw[0].w
      }
      const pgs = data.pgs
      const sn = data.sn
      const ls = data.ls
      if (pgs) {
        // 开启 wpgs 会有此字段(前提：在控制台开通动态修正功能)
        // 取值为 apd 时表示该片结果是追加到前面的最终结果
        // 取值为 rpl 时表示替换前面的部分结果，替换范围为 rg 字段
        if (pgs === 'apd') {
          this.appendResult(str, sn)
        } else {
          var [s, e] = data.rg
          this.replaceResult(str, sn, s, e)
        }
      } else {
        this.appendResult(str, sn)
      }
      const result = this.getResult()
      this.result = result

      // 如果是完成模式，则仅在识别结束时返回最终结果
      if (this.completeMode && !ls) return
      
      ls && this.reset()

      if (result) {
        this.$emit('record', result)
        this.$emit('input', result)
      } else {
        this.$emit('record-blank')
        this.blank = true
        setTimeout(() => {
          this.blank = false
        }, 1000)
      }
    }
  },
  computed: {
    pressMode () {
      return this.interactiveMode !== 'touch'
    },
    touchMode () {
      return this.interactiveMode === 'touch'
    },
    incrementMode () {
      return this.returnMode === 'increment'
    },
    completeMode () {
      return this.returnMode === 'complete'
    },
    locale () {
      const locale = locales[(this.IATConfig || {}).language || this.language]
      return locale
    },
    state () {
      return this.recorder ? this.recorder.state : 'end'
    }
  },
  created () {
    const IATConfig = this.IATConfig || {}
    const recorder = new Recorder({
      onClose: () => {
        this.stop()
        this.processing = false
      },
      onError: () => {
        this.stop()
        this.reset()
        this.processing = false
        this.$emit('record-failed', error)
        alert(this.locale.socket_error)
      },
      onMessage: (e) => {
        const jsonData = JSON.parse(e.data)
        if (jsonData.data && jsonData.data.result) {
          this.setResult(jsonData.data.result)
        }
      },
      onStart: () => {},
      appId: IATConfig.appId || this.appId,
      apiKey: IATConfig.apiKey || this.apiKey,
      apiSecret: IATConfig.apiSecret || this.apiSecret,
      accent: IATConfig.accent || this.accent,
      language: IATConfig.language || this.language,
      pd: IATConfig.pd || this.pd,
      rlang: IATConfig.rlang || this.rlang,
      ptt: IATConfig.ptt || this.ptt,
      nunum: IATConfig.nunum || this.nunum,
      vad_eos: IATConfig.vad_eos || this.vad_eos
    })
    const freezKeys = [
      'appId', 'apiSecret', 'apiKey', 'accent', 'language',
      'pd', 'rlang', 'ptt', 'nunum', 'vad_eos', 'config'
    ]
    freezKeys.forEach(key => {
      freezeProperty(recorder, key)
    })
    this.recorder = recorder
    this.isAudioAvailable = this.recorder.isAudioAvailable
  },
  beforeDestroy () {
    this.recorder.stop()
    this.recorder = null
  }
}
</script>

<style lang="scss" scoped>
  .voice-input-button{
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: .5;
    &.ready{
      opacity: 1;
    }
    .record-btn{
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      &.disabled{
        pointer-events: none;
        cursor: not-allowed;
      }
      > * {
        pointer-events: none;
      }
    }
  }
  .loader{
    display: inline-block;
    margin: 0 5px;
  }
  .pop{
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 40%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0,0,0,.5);
    pointer-events: none;
    opacity: 0;
    transition: opacity .1s;
    &.recording{
      opacity: 1;
    }
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
