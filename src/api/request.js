import axios from 'axios'

const service = axios.create({
  baseURL: process.env.BASE_API,
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(config => {
  // config.headers['token'] = getToken()
  return config
}, error => {
  console.log(error)
  Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(response => {
  if (response.data.returnCode === '0000') {
    // 数据退层
    return response.data
  } else {
    if (response.data.returnCode) {
      return response.data
    }
    return response
  }
}, error => {
  console.log(new Date().getTime() + ' Api: ' + error.config.url + ', ' + error)// for debug
  return Promise.reject(error)
})

export default service
