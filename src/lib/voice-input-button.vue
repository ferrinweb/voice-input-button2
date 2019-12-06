<!-- Author: ferrinweb -->
<!-- Create Time: 2018/12/5 10:33 -->
<!-- Description: voice-input-btn -->
<template>
  <div class="voice-input-button" :class="{active: recording, ready: isAudioAvailable}">
    <div class="record-btn"
      v-if="!processing"
      @contextmenu="menuPop"
      @mousedown="pressMode ? start($event) : toggle($event)"
      @mouseup="pressMode && stop($event)"
      @mouseleave="pressMode && stop($event)"
      @touchstart="pressMode ? start($event) : toggle($event)"
      @touchend="pressMode && stop($event)"
      @touchleave="pressMode && stop($event)"
    >
      <microphone v-if="!recording" :color="color"></microphone>
      <recording-icon v-else :color="color"></recording-icon>
      <recording-tip v-if="recording" :position="tipPosition"><slot name="recording">录音中…</slot></recording-tip>
      <recording-tip v-if="blank" :position="tipPosition"><slot name="no-speak">您好像没说什么</slot></recording-tip>
    </div>
    <loading v-else :color="color"></loading>
  </div>
</template>

<script>
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
    APIKey: String,
    apiSecret: String,
    // 交互模式
    // 'press': 按下开始录音，放开结束录音
    // 'touch': 点击开始录音，再次点击结束录音
    interactiveMode: {
      type: String,
      default: 'press'
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
      resultText: ''
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
        alert('无法录音：未找到录音设备、当前浏览器不支持录音或用户未授权！')
        return
      }
      if (this.recording || (e.which !== 1 && e.which !== 0)) return
      this.recording = true
      this.startTime = new Date().getTime()
      this.timer = setInterval(() => {
        this.time = new Date().getTime() - this.startTime
      }, 20)
      this.recorder.clear()
      this.recorder.start()
      this.$emit('record-start')
    },
    stop (e) {
      e.preventDefault()
      if (!this.recording || (e.which !== 1 && e.which !== 0)) return
      this.recording = false
      this.timer && clearInterval(this.timer)
      this.time = 0
      this.recorder.stop()
      this.$emit('record-stop')
      this.processing = true
      this.recorder.getSource().then(data => {
        this.dictation(data)
      })
    },
    dictation (data) {
      let server = this.server
      let appId = this.appId
      let APIKey = this.APIKey
      IAT(data, {server, appId, APIKey}).then(response => {
        this.processing = false
        let data = response.data.data
        if (data) {
          this.$emit('record', data)
          this.$emit('input', data)
        } else {
          this.$emit('record-blank')
          this.blank = true
          setTimeout(() => {
            this.blank = false
          }, 1000)
        }
      }).catch(error => {
        this.$emit('record-failed', error)
        console.warn(error)
        this.processing = false
      })
    }
  },
  computed: {
    pressMode () {
      return this.interactiveMode !== 'touch'
    },
    touchMode () {
      return this.interactiveMode === 'touch'
    }
  },
  watch: {
    'recorder.ready' (value) {
      this.isAudioAvailable = value
      value && this.$emit('record-ready')
    }
  },
  created () {
    const recorder = new Recorder({
      onClose: () => {
        this.stop()
        this.reset()
      },
      onError: () => {
        this.stop()
        this.reset()
        alert('WebSocket连接失败')
      },
      onMessage: (e) => {
        const jsonData = JSON.parse(e.data)
        if (jsonData.data && jsonData.data.result) {
          this.setResult(jsonData.data.result)
        }
      },
      onStart: () => {},
      appId: this.appId,
      apiKey: this.apiKey,
      apiSecret: this.apiSecret
    })
    this.recorder = recorder
  },
  mounted () {
    let {sampleRate, sampleBits} = ASRConfig
    const recorder = new Recorder({sampleRate, sampleBits})
    const freezKeys = ['worker', 'config', 'callback', 'createTime']
    freezKeys.forEach(key => {
      freezeProperty(recorder, key)
    })
    this.recorder = recorder
    this.recorder.init()
  },
  beforeDestroy () {
    this.recorder.destroy()
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
</style>
