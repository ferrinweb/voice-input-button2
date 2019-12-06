# voice-input-button2

> New version of voice input button using new interface of iflytek voice dictation (the stream version).

> 基于讯飞新版语音听写(流式版) api 的语音输入按钮 vue 组件。使用 HTML 原生媒体接口，故兼容性依浏览器而定，具体可参考这里 [Can I Use](https://caniuse.com/#search=getUserMedia)

> 按下按钮说话，松开按钮识别。同时支持配置为点击说话，再次点击结束说话。

> 旧版接口请查看[voice-input-button](https://github.com/ferrinweb/voice-input-button)

## Screenshots / 截屏
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots3.png)
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots4.png)
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots5.png)
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots.png)
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots2.png)

## How to use / 如何使用

### Create APP and get APIKey / 创建一个语音应用

1. 您需要在讯飞开放平台上创建一个基于语音听写 WebApi 的语音应用：[创建应用](https://console.xfyun.cn/app/create?source=WebAPI)
2. 为该应用开通语音听写服务
3. 获取应用的 **appId**、**APIKey**、**APISecret**，这是必须的。

### Install / 安装

```javascript
npm install voice-input-button
// or install from github reponsitory
npm install https://github.com/ferrinweb/voice-input-button.git

// or use yarn / 推荐使用 yarn
yarn add voice-input-button
// or install from github reponsitory
yarn add https://github.com/ferrinweb/voice-input-button.git
```

### Import / 引入

```javascript
// global import / 全局引入
import voiceInputButton from 'voice-input-button'
Vue.use(voiceInputButton, {
  server: '', // 您启动的代理服务地址
  appId: '', // 您申请的语音听写服务应用的ID
  APIKey: '' // 您开通的语音听写服务的 APIKey
})

// import on demand in your vue component file. / 按需引入
// 在这种引入方式下，您必须通过在组件标签上设置 server、appId、APIKey 属性来配置相关参数
import voiceInputButton from 'voice-input-button'
export default {
  components: {
    voiceInputButton
  },
  ...
}
```

### Use and demo / 使用及示例
> You can ckeckout this repository and try this demo.

> 你可以直接检出 voice-input-button 源码到本地，查看示例。

```html
<template>
  <div id="app">
    <div class="result">{{result}}</div>
    <div class="voice-input-button-wrapper">
      <voice-input-button
          server="您的代理地址"
          appId="您的应用ID"
          APIKey="您开通的语音听写服务APIKey"
          v-model="result"
          @record="showResult"
          @record-start="recordStart"
          @record-stop="recordStop"
          @record-blank="recordNoResult"
          @record-failed="recordFailed"
          @record-ready="recordReady"
          interactiveMode="touch"
          color="#fff"
          tipPosition="top"
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
      result: ''
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
```

### Slots / 插槽
名称 | 说明 | 默认值
|---|---|---|
recording | 正在录音提示文字，按下按钮时，将显示该录音中提示文本 | 无
no-speak | 录音完成但未能识别到有效结果是的提示文本 | 无

### Attributes / 属性
名称 | 说明 | 默认值
|---|---|---|
color | 麦克风按钮及录音中、识别中图标的颜色 | #333
tipPosition | 正在录音及未识别提示出现的位置，支持 top/right/left/bottom 四个取值 | top
interactiveMode | 交互模式: press -> 按下开始录音，放开结束录音; touch -> 点击开始录音，再次点击结束录音 | press

### Events / 事件
名称 | 说明
|---|---|
record | 录音识别完成，事件携带识别结果
input | 录音识别完成，事件携带识别结果，用于 v-model 绑定变量
record-start | 按下按钮开始录音
record-stop | 录音结束，开始上传语音数据进行识别
record-blank | 录音识别完成，但无识别结果
record-failed | 录音识别失败，事件携带错误栈数据
record-ready | 录音按钮已就绪

## Lisence
MIT Lisence.
