import Taro, { Component } from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import { AtList, AtListItem, AtCard, AtButton, AtTabBar } from "taro-ui"

import * as Echarts from '../../ec-canvas/echarts'
import fetch from '../../tools/fetch'
import './stress.less'
import 'taro-ui/dist/weapp/css/index.css'

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

function getExact(val) {
  if (!val) {
    return 0
  }
  if ((val/1).toString() === 'NaN') {
    return 0
  }
  if (val.toString().split('.')[1]&&val.toString().split('.')[1].length > 8) {
    return val.toFixed(7)/1
  }
  return val
}

function getStepObj(kline) {
  let minPrice = 999999999999
  let maxPrice = 0
  kline.forEach(it => {
    let price = it[4]/1
    if (price > maxPrice) {
      maxPrice = price
    }
    if (price < minPrice) {
      minPrice = price
    }
  })

  let maxMinStep = getExact((maxPrice - minPrice)/10)
  let stepObj = {}
  for (let i = 0; i < 11; i++) {
    if (i) {
      stepObj[`$${i}`] = {
        price: `${getExact(minPrice + maxMinStep * i)}`,
        totalVol: 0
      }
    }
  }
  
  kline.forEach(it => {
    let price = it[4]/1
    let direct = (it[4] - it[1]) > 0 ? 1 : -1
    let stepCount = parseInt((price - minPrice) / maxMinStep) + 1
    if (stepObj[`$${stepCount}`] == undefined) {
      stepCount = stepCount - 1
    }
    stepObj[`$${stepCount}`].totalVol = getExact(stepObj[`$${stepCount}`].totalVol + it[5]/1 * direct)
    stepObj[`$${stepCount}`].totalVolNoDir = getExact(stepObj[`$${stepCount}`].totalVolNoDir + it[5]/1)
    stepObj[`$${stepCount}`].totalVal = getExact(stepObj[`$${stepCount}`].totalVal + (it[5]/1 * price))
    stepObj[`$${stepCount}`].perPrice = getExact(stepObj[`$${stepCount}`].totalVal / stepObj[`$${stepCount}`].totalVolNoDir).toFixed(4)/1
  })
  return stepObj
}

function getKline() {
  return fetch('https://www.aicoin.net.cn/api/chart/kline/data/period', {
    headers: {
      "referer": "https://www.aicoin.net.cn/chart/bitmex-xbt"
    },
    method: 'POST',
    formData: {
      symbol: 'xbt:bitmex',
      period: 5
    }
  }).then(res => res.data.kline_data)
}

function initChart(canvas, width, height) {
  return getKline().then(kline => {
    const stepObj = getStepObj(kline)
    const chart = Echarts.init(canvas, null, {
      width: width,
      height: height
    });
    canvas.setChart(chart);

    let nowPrice = kline[kline.length -1][4]
    let xAxisData = Object.values(stepObj).map(item => {
      return item.perPrice
    })
    let barData = Object.values(stepObj).map(item => {
      return item.totalVol
    })
    var option = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
      title: {
        text: '压力位测试'
      },
      legend: {
          data: ['bar'],
      },
      // tooltip: {
      //   position: 'top',
      //   formatter(val) {
      //     return `${stepObj[`$${val.dataIndex+1}`].perPrice}<br/>(${val.value})<br/>(${getExact((nowPrice - stepObj[`$${val.dataIndex+1}`].perPrice )/nowPrice*100).toFixed(2)}%)`
      //     console.log(val)
      //   }
      // },
      xAxis: {
          type: 'value'
          // silent: false,
          // splitLine: {
          //     show: false
          // }
      },
      yAxis: {
        type : 'category',
        data: xAxisData,
      },
      series: [{
          name: 'bar',
          type: 'bar',
          data: barData,
          label: {
            normal: {
                show: true,
                position: 'inside'
            }
        },
      }]
    }
    chart.setOption(option);
    return chart;
  })
}

class Index extends Component {

    config = {
      "navigationBarBackgroundColor": "#333333",
      "navigationBarTextStyle": "white",
      "backgroundColor": "#333333",
      "backgroundTextStyle": "light",
      "navigationBarTitleText": 'zb',
      "usingComponents": {
        'ec-canvas': '../../ec-canvas/ec-canvas' // 书写第三方组件的相对路径
      }

  }
  state = {
    ec: {
      onInit: initChart
    }
  }

  componentWillMount () {

  }

  toPage(page) {
    if (page == 0) {
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
    
  }

  render () {
    console.log(this.state)
    return (
      <View style="background-color: #333; min-height: 100vh">
      <View style="width: 100vw;height: 80vh; background-color: #eee">
      <ec-canvas  id="mychart-dom-bar" canvas-id="mychart-bar" ec={ this.state.ec }></ec-canvas>
      </View>
        
        <AtTabBar
          fixed
          tabList={[
            { title: 'otc', iconType: 'shopping-cart'},
            { title: 'stress', iconType: 'analytics'}
          ]}
          onClick={this.toPage.bind(this)}
          current={1}
        />
      </View>
    )
  }
}

export default Index
