wx.cloud.init({
  env: 'env1-37a274'
})

export default function fetch(url, options) {
  const {params, cheerio, method, formData, headers} = options || {}
  let addParams = ''
  if (params) {
    addParams = '?'
    Object.keys(params).forEach(it => {
      addParams += `${it}=${params[it]}&`
    })
    addParams = addParams.replace(/&$/, '')
  }
  return wx.cloud.callFunction({
        name: 'proxy',
        data: {
          url: url+addParams,
          cheerio,
          method,
          formData,
          headers
        }
      }).then(res => {
        try {
          return JSON.parse(res.result.body)
        } catch (e) {
          return res
        }
      })
}