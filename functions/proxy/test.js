// 云函数入口文件
const axios = require('axios')


// axios({
//   url: "https://www.aicoin.net.cn/api/chart/kline/data/period",
//   method: 'POST',
//   headers: {
//     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36",
//     "Content-Type": "application/json;charset=UTF-8",
//     "referer": "https://www.aicoin.net.cn/chart/bitmex-xbt"
//   },
//   data: {
//     symbol: 'xbt:bitmex',
//     period: 15
//   }
// }).then(res => {
//   console.log(res)
// }).catch(e => {
//   console.log(e)
// })

axios({
  url: 'http://api.zb.cn/data/v1/depth?market=usdt_qc&size=100',
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36",
      // "Content-Type": "application/json;charset=UTF-8",
      // "referer": "https://www.aicoin.net.cn/chart/bitmex-xbt"
    },
}).then(res => {
  console.log(res)
})

