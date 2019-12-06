<!-- Author: ferrinweb -->
<!-- Create Time: 2019/01/03 11:42 -->
<!-- Description: voice-input-button-demo -->
<template>
  <div id="app">
    <div class="result" @click="show = !show">{{result}}</div>
    <div class="voice-input-button-wrapper">
      <voice-input-button
          ref="recorderButton"
          v-if="show"
          v-model="result"
          @record="showResult"
          @record-start="recordStart"
          @record-stop="recordStop"
          @record-blank="recordNoResult"
          @record-failed="recordFailed"
          @record-ready="recordReady"
          color="#fff"
          tipPosition="top"
          interactiveMode="touch"
          server=""
          appId=""
          APIKey=""
      >
        <template slot="no-speak">没听清您说的什么</template>
      </voice-input-button>
    </div>
  </div>
</template>

<script>
import VoiceInputButton from './lib/voice-input-button'

export default {
  name: 'App',
  components: {
    VoiceInputButton
  },
  data () {
    return {
      result: '',
      show: true
    }
  },
  methods: {
    showResult (text) {
      console.info('收到识别结果：', text)
    },
    recordStart () {
      console.info('录音开始')
    },
    recordStop () {
      console.info('录音结束')
    },
    recordNoResult () {
      console.info('没有录到什么，请重试')
    },
    recordFailed (error) {
      console.info('识别失败，错误栈：', error)
    },
    recordReady () {
      console.info('按钮就绪!')
    }
  }
}
</script>

<style>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
  }
  *{
    box-sizing: border-box;
  }
  #app {
    position: absolute;
    top: 100px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 400px;
  }
  .voice-input-button-wrapper{
    width: 42px;
    height: 42px;
    background-color: mediumpurple;
    border-radius: 50%;
  }
  .result{
    width: 100%;
    padding: 25px;
    border: #e2e2e2 1px solid;
    border-radius: 5px;
    line-height: 2;
    font-size: 16px;
    color: #727272;
    min-height: 24px;
    margin-bottom: 25px;
  }
</style>
