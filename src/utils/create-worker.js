const createWorker = func => {
  // 加载并启动 record worker
  let workerString = func.toString()
  // 移除函数包裹
  workerString = workerString.substr(workerString.indexOf('{') + 1)
  workerString = workerString.substr(0, workerString.lastIndexOf('}'))
  const workerBlob = new Blob([workerString])
  const workerURL = URL.createObjectURL(workerBlob)
  const worker = new Worker(workerURL)
  URL.revokeObjectURL(workerURL)
  return worker
}

export default createWorker
