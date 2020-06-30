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
      <microphone v-if="!recording" :color="getConfig('color')"></microphone>
      <recording-icon v-else-if="state === 'ing' || responding || result" :color="getConfig('color')"></recording-icon>
      <loading v-else :color="getConfig('color')"></loading>
      <transition name="fade">
        <recording-tip
          v-if="state === 'ing' || state === 'init' || responding || result || blank"
          :position="getConfig('tipPosition')"
          :tipTextColor="getConfig('tipTextColor')"
          :tipBackgroundColor="getConfig('tipBackgroundColor')"
          :tipShadowColor="getConfig('tipShadowColor')"
        >
          <slot v-if="state === 'ing' || responding || result" name="recording">{{ result || locale.recording }}</slot>
          <slot v-if="state === 'init'" name="wait">{{ locale.wait }}</slot>
          <slot v-if="blank" name="no-speak">{{ locale.say_nothing }}</slot>
        </recording-tip>
      </transition>
    </div>
  </div>
</template>

<script>
import Recorder from './recorder'
import loading from './components/icons/loading'
import recordingIcon from './components/icons/recording-icon'
import microphone from './components/icons/microphone'
import recordingTip from './components/recording-tip'
import config from './mixins/config'
const freezeProperty = (obj, key) => {
  Object.defineProperty(obj, key, {
    configurable: false
  })
}
const buffer = []

export default {
  name: 'voice-input-button',
  mixins: [config],
  components: {
    loading,
    recordingIcon,
    microphone,
    recordingTip
  },
  data () {
    return {
      recorder: null,
      processing: false,
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
      e.cancelable && e.preventDefault()
      if (this.recording || (e && e.type === 'mousedown' && e.which !== 1)) return
      if (!this.isAudioAvailable) {
        const config = this.getConfig
        if (!config('appId') || !config('apiKey') || !config('apiSecret')) {
          alert(this.locale.missing_configuration)
          return
        }
        alert(this.locale.not_supported)
        return
      }
      this.reset()
      this.recording = true
      this.recorder.start()
      this.$emit('record-start')
    },
    stop (e) {
      e && e.cancelable && e.preventDefault()
      if (e && e.type === 'mousedown' && e.which !== 1) return
      this.recording = false
      this.recorder && this.recorder.stop()
      this.$emit('record-stop')
      this.processing = true
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
        ls && this.$emit('record-complete', result)
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
    state () {
      return this.recorder ? this.recorder.state : 'end'
    }
  },
  created () {
    const config = this.getConfig
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
      appId: config('appId'),
      apiKey: config('apiKey'),
      apiSecret: config('apiSecret'),
      accent: config('accent'),
      language: config('language'),
      pd: config('pd'),
      rlang: config('rlang'),
      ptt: config('ptt'),
      nunum: config('nunum'),
      vad_eos: config('vad_eos')
    })
    const freezKeys = [
      'appId', 'apiSecret', 'apiKey', 'accent', 'language',
      'pd', 'rlang', 'ptt', 'nunum', 'vad_eos', 'config'
    ]
    freezKeys.forEach(key => {
      freezeProperty(recorder, key)
    })
    this.recorder = recorder
    this.isAudioAvailable = this.recorder.isAudioAvailable && config('appId') && config('apiKey') && config('apiSecret')
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
