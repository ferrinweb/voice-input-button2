# voice-input-button2

> New version of voice input button using new interface of iflytek voice dictation (the stream version).

> 基于讯飞新版语音听写(流式版) api 的语音输入按钮 vue 组件。使用 HTML 原生媒体接口，故兼容性依浏览器而定，具体可参考这里 [Can I Use](https://caniuse.com/#search=getUserMedia)

> 按下按钮说话，松开按钮识别。同时支持配置为点击说话，再次点击结束说话。

> 旧版接口请查看 [voice-input-button](https://github.com/ferrinweb/voice-input-button)

## Screenshots / 截屏

![](https://github.com/ferrinweb/voice-input-button2/raw/master/screenshots/voice-input-screen-capture.gif)
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots3.png)
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots4.png)
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots5.png)
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots.png)
![](https://github.com/ferrinweb/voice-input-button/raw/master/screenshots/screenshots2.png)

## How to use / 如何使用

> 使用中遇到问题，欢迎前往 [Issues](https://github.com/ferrinweb/voice-input-button2/issues) 提交问题单或反馈。

### Create APP and get apiKey / 创建一个语音应用

1. 您需要在讯飞开放平台上创建一个基于语音听写 WebApi 的语音应用：[创建应用](https://console.xfyun.cn/app/create?source=WebAPI)
2. 为该应用开通语音听写服务
3. 获取应用的 `appId`、`apiKey`、`APISecret`，这是必须的。

### Install / 安装

```bash
npm install voice-input-button2
# or install from github reponsitory
npm install https://github.com/ferrinweb/voice-input-button2.git

# or use yarn / 推荐使用 yarn
yarn add voice-input-button2
# or install from github reponsitory
yarn add https://github.com/ferrinweb/voice-input-button2.git
```

### Import / 引入

#### Global Import / 全局引入

```javascript
import voiceInputButton from 'voice-input-button2'
Vue.use(voiceInputButton, {
  appId: '', // 您申请的语音听写服务应用的ID
  apiKey: '', // 您开通的语音听写服务的 apiKey
  apiSecret: '', // 您开通的语音听写服务的 apiSecret
  color: '#fff', // 按钮图标的颜色
  tipPosition: 'top' // 提示条位置
  ... // 其他配置项, 参见下方 [Attributes / 属性] 部分
})
```
#### Import On Demand In Your Vue Component File / 按需引入

> 在这种引入方式下，您必须通过在组件标签上设置 appId、apiKey、apiSecret 等属性来配置相关参数

```javascript
import voiceInputButton from 'voice-input-button2'
export default {
  components: {
    voiceInputButton
  },
  ...
}
```

### Use and demo / 使用及示例

> Here is an example of introducing code on demand. You can checkout this repository, run and try this demo.

> 此处演示按需引入方案，你可以直接检出 voice-input-button2 源码到本地，运行并查看示例。

```html
<template>
  <div id="app">
    <div class="result">{{result}}</div>
    <div class="voice-input-button-wrapper">
      <voice-input-button
        appId="您的应用ID"
        apiKey="您开通的语音听写服务 APIKey"
        apiSecret="您开通的语音听写服务的 apiSecret"
        v-model="result"
        @record="showResult"
        @record-start="recordStart"
        @record-stop="recordStop"
        @record-blank="recordNoResult"
        @record-failed="recordFailed"
        @record-ready="recordReady"
        @record-complete="recordComplete"
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
import voiceInputButton from './lib/voice-input-button'

export default {
  name: 'App',
  components: {
    voiceInputButton
  },
  data () {
    return {
      result: ''
    }
  },
  methods: {
    recordReady () {
      console.info('按钮就绪!')
    },
    recordStart () {
      console.info('录音开始')
    },
    showResult (text) {
      console.info('收到识别结果：', text)
    },
    recordStop () {
      console.info('录音结束')
    },
    recordNoResult () {
      console.info('没有录到什么，请重试')
    },
    recordComplete (text) {
      console.info('识别完成! 最终结果：', text)
    },
    recordFailed (error) {
      console.info('识别失败，错误栈：', error)
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

#### 项目源码启动方式

```bash
# 安装依赖
yarn install
# 启动项目
yarn run dev
```

### Slots / 插槽

名称 | 说明 | 默认值
|---|---|---|
recording | 正在录音提示文字，按下按钮时，将显示该录音中提示文本 | 好，请讲...
no-speak | 录音完成但未能识别到有效结果是的提示文本 | 您好像没说什么
wait | 按下录音按钮后，按钮准备好前的提示文本 | 请稍后...

### Attributes / 属性

名称 | 类型 | 说明 | 默认值
|---|---|---|---|
color | String | 麦克风按钮及录音中、识别中图标的颜色 | #333
tipPosition | String | 提示条出现的位置，支持 top/right/left/bottom 四个取值 | top
tipTextColor | String | 提示条文本颜色 | #f2f2f2
tipBackgroundColor | String | 提示条背景色 | #4b667d
tipShadowColor | String | 提示条阴影色 | rgba(0,0,0,.1)
interactiveMode | String | 交互模式: <br>press -> 按下开始录音，放开结束录音; <br>touch -> 点击开始录音，再次点击结束录音 | press
returnMode | String | 识别结果返回模式: <br>increment -> 增量模式，增量返回识别结果。每次返回都是一个阶段性的完整结果，包含对前面识别结果的追加、补充和修正; <br>complete -> 完整模式，完成本次识别后返回最终结果 | increment
appId | String | 您申请的语音听写服务应用的 ID | 无
apiKey | String | 您开通的语音听写服务的 apiKey | 无
apiSecret | String | 您开通的语音听写服务的 apiSecret | 无
language | String | 语种，参见讯飞语音听写[接口文档](https://www.xfyun.cn/doc/asr/voicedictation/API.html#业务参数) | zh_cn
accent | String | 方言，参见讯飞语音听写[接口文档](https://www.xfyun.cn/doc/asr/voicedictation/API.html#业务参数) | mandarin
pd | String | 领域个性化参数，参见讯飞语音听写[接口文档](https://www.xfyun.cn/doc/asr/voicedictation/API.html#业务参数) | 无
rlang | String | 简体: zh_cn<br>繁体: zh-hk | zh_cn
ptt | Number | 是否开启标点符号添加（仅中文支持）：<br>1 -> 开启; 0 -> 关闭 | 1
nunum | Number | 将返回结果的数字格式规则为阿拉伯数字格式:<br>1 -> 开启; 0 -> 关闭 | 1
vad_eos | Number | 用于设置端点检测的静默时间，即静默多长时间后引擎认为音频结束，单位是毫秒 | 3000


### Events / 事件
名称 | 说明 | 参数
|---|---| ---|
record-ready | 录音按钮已就绪 | 无
record-start | 按下按钮开始录音 | 无
record | 收到识别结果。<br>在 `returnMode` 的 `complete` 模式下，表示收到最终结果 | 当前识别结果
input | 收到识别结果，与 `record` 事件同步抛出，用于 `v-model` 绑定变量 | 当前识别结果
record-stop | 录音结束。<br>一般当松开按钮（`press` 模式）或关闭录音（`touch` 模式）时触发；<br>也可能由组件根据静默时长配置（`vad_eos`）触发 | 无
record-blank | 录音识别完成，但无识别结果 | 无
record-complete | 语音识别完成事件。<br>相较于 `record-stop`，该事件表示语音识别已完成并返回了最终结果 | 最终识别结果
record-failed | 录音识别失败 | 错误栈数据

> 注意：新版接口为流式版本，即识别过程中会有多次返回，其中包含对前面识别结果的追加、补充和修正。因此在同一识别过程中会多次触发 `record` 和 `input` 事件，在您将收到的识别结果拼接到其他字符串时，您需要注意到这点。如果仅需要返回最后的结果，则可以监听 `record-complete` 事件或将 `returnMode` 属性设置为 `complete`。

## Lisence
MIT Lisence.
