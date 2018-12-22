import Taro, { Component } from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import { AtList, AtListItem, AtCard, AtButton, AtTabBar } from "taro-ui"
import fetch from '../../tools/fetch'
import './index.less'
import 'taro-ui/dist/weapp/css/index.css'

// require("taro-ui/dist/weapp/css/index.css")

function _getQcOtc(type) {
  return fetch(`https://vip.zb.cn/otc/trade/qc_cny?type=${type}`, {
    cheerio: true
  }).then(res => res.result)
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

function _getHbOtc(params) {
  // return sleep(1000).then(() => {
    return fetch(`https://otc-api.eiijo.cn/v1/otc/trade/list/public`, {params})
  // })
}

function _getHbOtcByPage(pageIndex) {
  return Promise.all([sleep(1000 * pageIndex).then(() => {
    return _getHbOtc({
      country: 0,
      currency: 1,
      payMethod: 0,
      currPage: pageIndex || 1,
      coinId: 2,
      tradeType: 0,
      merchant: 1,
      online: 1,
    })
  }), sleep(1700 * pageIndex).then(() => {
    return _getHbOtc({
      country: 0,
      currency: 1,
      payMethod: 0,
      currPage: pageIndex || 1,
      coinId: 2,
      tradeType: 1,
      merchant: 1,
      online: 1
    })
  })])
}

function _parseHbOtcList(hbList, type) {
  const list = hbList.sort((a, b) => {
    return  (b.price - a.price) * type
  })
    let resultObj = {}
    let resultList = []
    let resultCount = {}
    list.forEach(it => {
      if (resultObj[`$${it.price}`]) {
        resultObj[`$${it.price}`] += it.tradeCount
        resultCount[`$${it.price}`] += 1
      } else {
        resultObj[`$${it.price}`] = it.tradeCount
        resultCount[`$${it.price}`] = 1
      }
    })
    Object.keys(resultObj).forEach(it => {
      resultList.push({
        price: it.replace('$',''),
        amount: ((resultObj[it]/1).toFixed(0)/1).toLocaleString(),
        count: resultCount[it]
      })
    })
    return resultList
}


class Index extends Component {

    config = {
      "navigationBarBackgroundColor": "#333333",
      "navigationBarTextStyle": "white",
      "backgroundColor": "#333333",
      "backgroundTextStyle": "light",
      "navigationBarTitleText": 'zb'
  }
  state = {
    usdtQc: {
      ask: '',
      bid: ''
    },
    usdthusd: {
      ask: '',
      bid: ''
    },
    usdtQcAsks: [],
    usdtQcBids: [],
    qcOtc: [],
    hl: '',
    hbBuyList: [],
    hbSellList: []
  }

  componentWillMount () {
    this.getHl()
    this.getUsdtQcData()
    this.getQcOtc()
    this.getHbOtc()
  }
  updateData() {
    this.getHl()
    this.getUsdtQcData()
    this.getQcOtc()
    this.getHbOtc()
  }

  getHbOtc() {
    let hbBuyList = []
    let hbSellList = []
    for (let i = 0; i < 2; i++) {
      _getHbOtcByPage(i + 1).then(res => {
        console.log(res)
        hbBuyList = hbBuyList.concat(res[0].data)
        hbSellList = hbSellList.concat(res[1].data)
        this.setState({
          hbBuyList: _parseHbOtcList(hbBuyList, 1),
          hbSellList: _parseHbOtcList(hbSellList, -1)
        })
      })
    }
  }

  

  getUsdtQcData() {
    return fetch('http://api.zb.cn/data/v1/depth?market=usdt_qc&size=100').then(res => {
      this.setState({
        usdtQcAsks: res.asks,
        usdtQcBids: res.bids,
        usdtQc: {
          ask: res.asks[49][0],
          bid: res.bids[0][0]
        }
      })
    })
  }
  
  getHl() {
    return fetch('https://api.money.126.net/data/feed/FX_USDCNY').then(res => {
      let price = res.result.body.match(/"price":\d+\.\d+/)[0].replace('"price":', '')
      this.setState({
        hl: price+''
      })
    })
  }

  getQcOtc() {
    return Promise.all([_getQcOtc(1), sleep(1000).then(() => _getQcOtc(2))]).then(res => {
      this.setState({
        qcOtc: res
      })
    })
  }

  toPage(page) {
    if (page == 1) {
      wx.redirectTo({
        url: '/pages/stress/stress'
      })
    }
  }

  render () {
    console.log(this.state)
    return (
      <View style={{paddingBottom: '15vh', backgroundColor: '#333'}}>
        <AtList>
          <AtListItem title='usdt-qc' onClick={this.getUsdtQcData} extraText={`${this.state.usdtQc.ask} / ${this.state.usdtQc.bid}`} />
          <AtListItem title='qc-otc' onClick={this.getQcOtc} extraText={`${this.state.qcOtc[0]} / ${this.state.qcOtc[1]}`} />
          {/* <AtListItem title='usdt-husd' extraText={`${this.state.usdthusd.ask} / ${this.state.usdthusd.bid}`} /> */}
          <AtListItem title='usd-cny' onClick={this.getHl} extraText={this.state.hl} />
        </AtList>
        <AtCard
         isFull
          title='usdt-qc 大挂单(>5000)'
        >
          <View className='at-row'>
            <View className='at-col'>
            {
              this.state.usdtQcAsks.reverse().filter(it => it[1]>=5000).map(it => {
                  return (
                    <View style={{padding: '20rpx'}} className='at-row' key={it[0]}>
                      <View className='at-col'>{it[0]}</View>
                      <View className='at-col'>{it[1]}</View>
                    </View>
                  )
              })
            }
            </View>
            <View className='at-col'>
            {
              this.state.usdtQcBids.filter(it => it[1]>=5000).map(it => {
                  return (
                    <View style={{padding: '20rpx'}} className='at-row' key={it[0]}>
                      <View className='at-col'>{it[0]}</View>
                      <View className='at-col'>{it[1]}</View>
                    </View>
                  )
              })
            }
            </View>
          </View>
        </AtCard>
        <AtCard
         isFull
          title='hb商家挂单'
        >
          <View className='at-row'>
            <View className='at-col'>
            {
              this.state.hbBuyList.reverse().map(it => {
                  return (
                    <View style={{padding: '20rpx'}} className='at-row' key={it.price}>
                      <View className='at-col'>{it.price} | </View>
                      <View className='at-col'>{it.amount} | </View>
                      <View className='at-col'>{it.count}</View>
                    </View>
                  )
              })
            }
            </View>
            <View className='at-col'>
            {
              this.state.hbSellList.map(it => {
                  return (
                    <View style={{padding: '20rpx'}} className='at-row' key={it.price}>
                      <View className='at-col'>{it.price} | </View>
                      <View className='at-col'>{it.amount} | </View>
                      <View className='at-col'>{it.count}</View>
                    </View>
                  )
              })
            }
            </View>
          </View>
        </AtCard>
        <View style="padding: 3vh 0" >
          <AtButton onClick={this.updateData} type='primary'>刷新数据</AtButton>
        </View>
        
        <AtTabBar
          fixed
          tabList={[
            { title: 'otc', iconType: 'shopping-cart'},
            { title: 'stress', iconType: 'analytics'}
          ]}
          onClick={this.toPage.bind(this)}
          current={0}
        />
      </View>
    )
  }
}

export default Index
