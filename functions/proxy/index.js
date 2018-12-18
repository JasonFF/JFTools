// 云函数入口文件
const cloud = require('wx-server-sdk')
const request = require('request')
const cheerio = require('cheerio')
cloud.init()


function parseContent(content) {
  const $ = cheerio.load(content)
  const numberList = $('.c2c-table tbody tr td.num').map((i, el) => {
    return $(el).text().replace(/QC/ig, '') / 1
  }).get()
  const priceList = $('.c2c-table tbody tr td.price').map((i, el) => {
    return $(el).text().split('CNY')[0] / 1
  }).get()
  let totalPrice = 0;
  let totalNum = 0
  priceList.forEach((price, i) => {
    totalPrice += price * numberList[i]
    totalNum += numberList[i]
  })
  return (totalPrice / totalNum).toFixed(4)
}

// 云函数入口函数
exports.main = async (event, context) => {
  const {url, cheerio} = event
  return await new Promise(resolve => {
    request({
      url,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36"
      },
      timeout: 10000
        
    },function (err, res, body) {
      console.log(res)
      if (cheerio) {
        return resolve(parseContent(res.body))
      }
      resolve(res)
    })
  })
}