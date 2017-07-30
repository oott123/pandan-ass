const Room = require('pandan/lib/room')
const config = require('../config')
const Record = require('./record')
const axios = require('axios')
const d2a = require('./d2a')
const Promise = require('bluebird')
const { genMeta } = require('./meta')

const room = new Room(config.room)
const record = new Record(room, config)
let timer

// 获取当前开播状态
getLiving()
.then(function ({isLiving, startTime}) {
  // 开播则立即开始，否则等开播再开始
  if (isLiving) {
    console.log('主播正在直播，开始录制弹幕！')
    startRecord(parseInt(startTime))
  } else {
    console.log('主播尚未开播，等待开播后录制弹幕……')
    room.once('room-online', function ({time}) {
      console.log('主播开始直播，开始录制弹幕！')
      startRecord(time)
    })
  }
  // 等待离线 resolve
  return new Promise((resolve, reject) => {
    // 熊猫 API 有毛病，网页状态和弹幕状态不同步
    /*const timer2 = setInterval(function () {
      getLiving()
      .then(function (isLiving) {
        if (!isLiving) {
          console.log('主播离线（API 检查），结束弹幕录制~')
          resolve()
        }
      })
    }, 5*60*1000)*/
    room.once('room-offline', function () {
      console.log('主播离线，结束弹幕录制！')
      clearInterval(timer)
      // clearInterval(timer2)
      resolve()
    })
  })
})
.then(function () {
    const xml = record.stop()
    console.log(`本次录制结果 xml 文件：${xml}`)
    return xml
})
.then(function (xml) {
  return new Promise((resolve, reject) => {
    d2a(config, xml, xml.replace(/xml$/,'ass'))
    .on('close', resolve)
  })
})
.tap(genMeta)
.then(function (code) {
  if (code === 0) {
    console.log('ass 转换完成！')
    process.exit(0)
  } else {
    console.log(`ass 转换失败，错误码：${code}。`)
    process.exit(code)
  }
})
.catch(function (err) {
  console.error(err)
  process.exit(252)
})

room.on('connect', function () {
  console.log('【已连上熊猫弹幕服务器】')
})
room.on('error', function (err) {
  console.error(err)
})

room.join()

function startRecord (time) {
  try {
    record.start(time)
    timer = setInterval(function () {
      console.log('- 当前已录制弹幕数：', record.danmakuAmount)
    }, 10000)
  } catch (err) {
    console.error(err)
    process.exit(9)
  }
}

function getLiving () {
  return Promise.resolve(axios.get(`https://www.panda.tv/${config.room}`))
  .then(function ({data}) {
    const regv = /'videoinfo': (.*),/
    const regr = /'roominfo': (.*),/
    const matchesv = regv.exec(data)
    const matchesr = regr.exec(data)
    let isLiving = false
    let startTime = null
    if (matchesv && matchesv[1]) {
      const videoinfo = JSON.parse(matchesv[1])
      isLiving = videoinfo.status === '2' // 2 开播
    }
    if (matchesr && matchesr[1]) {
      const roominfo = JSON.parse(matchesr[1])
      startTime = roominfo.start_time
    }
    return {isLiving, startTime}
  })
}
