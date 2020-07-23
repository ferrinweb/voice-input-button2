/**
 * Created by lycheng on 2019/8/1.
 * 
 * 语音听写流式 WebAPI 接口调用示例 接口文档（必看）：https://doc.xfyun.cn/rest_api/语音听写（流式版）.html
 * webApi 听写服务参考帖子（必看）：http://bbs.xfyun.cn/forum.php?mod=viewthread&tid=38947&extra=
 * 语音听写流式WebAPI 服务，热词使用方式：登陆开放平台https://www.xfyun.cn/后，找到控制台--我的应用---语音听写---个性化热词，上传热词
 * 注意：热词只能在识别的时候会增加热词的识别权重，需要注意的是增加相应词条的识别率，但并不是绝对的，具体效果以您测试为准。
 * 错误码链接：
 * https://www.xfyun.cn/doc/asr/voicedictation/API.html#%E9%94%99%E8%AF%AF%E7%A0%81
 * https://www.xfyun.cn/document/error-code （code返回错误码时必看）
 * 语音听写流式WebAPI 服务，方言或小语种试用方法：登陆开放平台https://www.xfyun.cn/后，在控制台--语音听写（流式）--方言/语种处添加
 * 添加后会显示该方言/语种的参数值
 * 
 */

import CryptoJS from './hmac-sha256'
import './enc-base64-min'
import recordWorker from './transform.pcm.worker'
import createWorker from '../../utils/create-worker'
import locales from '../mixins/locales.json'

// 音频转码worker
const recorderWorker = createWorker(recordWorker)
// 记录处理的缓存音频
const buffer = []
const AudioContext = window.AudioContext || window.webkitAudioContext
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia

recorderWorker.onmessage = function (e) {
  buffer.push(...e.data.buffer)
}

class IatRecorder {
  constructor (config) {
    this.config = config
    this.state = 'end'
    this.language = config.language || 'zh_cn'
    this.accent = config.accent || 'mandarin'

    //以下信息在控制台-我的应用-语音听写（流式版）页面获取
    this.appId = config.appId
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
    this.isAudioAvailable = !!((navigator.getUserMedia||navigator.mediaDevices.getUserMedia) && AudioContext && recorderWorker)
    this.pd = config.pd
    this.rlang = config.rlang
    this.ptt = config.ptt
    this.nunum = config.nunum
    this.vad_eos = config.vad_eos
  }

  closeTrack () {
    try {
      if (this.recorder) {
        this.recorder.disconnect()
        this.recorder = null
      }
      if (this.mediaStream) {
        this.recorder && this.recorder.context && this.mediaStream.disconnect(this.recorder)
        this.mediaStream.mediaStream.getTracks().forEach(track => {
          track.stop()
        })
      }
    } catch (e) {
      console.warn(e.message)
    }
  }

  initRecorder () {
    if (this.state === 'end') return
    if (!this.context) {
      const context = new AudioContext()
      this.context = context
    }
    this.recorder = this.context.createScriptProcessor(0, 1, 1)

    const getMediaSuccess = (stream) => {
      if (this.state === 'end') {
        this.closeTrack()
        return
      }
      const mediaStream = this.context.createMediaStreamSource(stream)
      this.mediaStream = mediaStream
      this.recorder && (this.recorder.onaudioprocess = (e) => {
        if (this.state === 'end') {
          this.closeTrack()
          return
        }
        this.sendData(e.inputBuffer.getChannelData(0))
      })
      this.connectWebsocket()
    }
    const getMediaFail = (e) => {
      this.recorder = null
      this.mediaStream = null
      this.context = null
      console.warn(e.message || locales[this.language].access_microphone_failed)
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      }).then((stream) => {
        getMediaSuccess(stream)
      }).catch((e) => {
        getMediaFail(e)
      })
    } else {
      navigator.getUserMedia({
        audio: true,
        video: false
      }, (stream) => {
        getMediaSuccess(stream)
      }, function (e) {
        getMediaFail(e)
      })
    }
  }

  start () {
    if (navigator.getUserMedia && AudioContext) {
      this.state = 'init'
      if (!this.recorder) {
        setTimeout(() => {
          this.initRecorder()
        }, 100)
      } else {
        if (this.state === 'end') {
          this.closeTrack()
          return
        }
        this.connectWebsocket()
      }
    } else if (navigator.mediaDevices.getUserMedia && AudioContext) {
      this.state = 'init'
      if (!this.recorder) {
        setTimeout(() => {
          this.initRecorder()
        }, 100)
      } else {
        if (this.state === 'end') {
          this.closeTrack()
          return
        }
        this.connectWebsocket()
      }
    } else {
      alert(locales[this.language].not_supported)
    }
  }

  stop () {
    this.state = 'end'
  }

  sendData (buffer) {
    recorderWorker.postMessage({
      command: 'transform',
      buffer: buffer
    })
  }
  connectWebsocket () {
    const url = 'wss://iat-api.xfyun.cn/v2/iat'
    const host = 'iat-api.xfyun.cn'
    const apiKey = this.apiKey
    const apiSecret = this.apiSecret
    const date = new Date().toGMTString()
    const algorithm = 'hmac-sha256'
    const headers = 'host date request-line'
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)
    const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
    const authorization = btoa(authorizationOrigin)
    const fullPath = `${url}?authorization=${authorization}&date=${date}&host=${host}`
    if ('WebSocket' in window) {
      this.ws = new WebSocket(fullPath)
    } else if ('MozWebSocket' in window) {
      this.ws = new MozWebSocket(fullPath)
    } else {
      alert(locales[this.language].not_supported)
      return null
    }
    this.ws.onopen = (e) => {
      if (!this.mediaStream || !this.recorder) {
        return
      }
      this.mediaStream.connect(this.recorder)
      this.recorder.connect(this.context.destination)
      this.state = 'ready'
      setTimeout(() => {
        this.wsOpened(e)
      }, 100)
      this.config.onStart && this.config.onStart(e)
    }
    this.ws.onmessage = (e) => {
      this.config.onMessage && this.config.onMessage(e)
      this.wsOnMessage(e)
    }
    this.ws.onerror = (e) => {
      this.stop()
      this.config.onError && this.config.onError(e)
    }
    this.ws.onclose = (e) => {
      this.stop()
      this.config.onClose && this.config.onClose(e)
    }
  }

  wsOpened () {
    if (this.ws.readyState !== 1) {
      return
    }
    this.state = 'ing'
    const audioData = buffer.splice(0, 1280)
    const params = {
      'common': {
        'app_id': this.appId
      },
      'business': {
        'language': this.language,
        'domain': 'iat',
        'accent': this.accent,
        'vad_eos': this.vad_eos,
        'dwa': 'wpgs',
        'pd': this.pd,
        'rlang': this.rlang,
        'ptt': this.ptt,
        'nunum': this.nunum
      },
      'data': {
        'status': 0,
        'format': 'audio/L16;rate=16000',
        'encoding': 'raw',
        'audio': this.ArrayBufferToBase64(audioData)
      }
    }
    this.ws.send(JSON.stringify(params))
    this.handlerInterval = setInterval(() => {
      // websocket未连接
      if (this.ws.readyState !== 1) {
        clearInterval(this.handlerInterval)
        return
      }
      if (buffer.length === 0) {
        if (this.state === 'end') {
          this.ws.send(JSON.stringify({
            'data': {
              'status': 2,
              'format': 'audio/L16;rate=16000',
              'encoding': 'raw',
              'audio': ''
            }
          }))
          clearInterval(this.handlerInterval)
        }
        return false
      }
      const audioData = buffer.splice(0, 1280)
      // 中间帧
      this.ws.send(JSON.stringify({
        'data': {
          'status': 1,
          'format': 'audio/L16;rate=16000',
          'encoding': 'raw',
          'audio': this.ArrayBufferToBase64(audioData)
        }
      }))
    }, 40)
  }

  wsOnMessage (e) {
    const jsonData = JSON.parse(e.data)
    // 识别结束
    if (jsonData.code === 0 && jsonData.data.status === 2) {
      this.ws.close()
    }
    if (jsonData.code !== 0) {
      this.ws.close()
      console.log(`${jsonData.code}:${jsonData.message}`)
    }
  }

  ArrayBufferToBase64 (buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

export default IatRecorder
