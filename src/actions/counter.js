import {
  ADD,
  MINUS
} from '../constants/counter'

export const add = () => {
  wx.cloud.callFunction({
    name: 'proxy',
    data: {
      url: '/data/v1/depth?market=usdt_qc&size=100'
    }
  }).then(res => {
    console.log(res)
  })
  return {
    type: ADD
  }
}
export const minus = () => {
  return {
    type: MINUS
  }
}

// 异步的action
export function asyncAdd () {
  return dispatch => {
    setTimeout(() => {
      dispatch(add())
    }, 2000)
  }
}
