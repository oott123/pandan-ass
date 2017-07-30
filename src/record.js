const fs = require('fs')
const path = require('path')
const moment = require('moment-timezone')

module.exports = class Record {
  constructor (room, config) {
    this._room = room
    this._config = config
    this._danmakuAmount = 0
  }
  /**
   * 已经录制的弹幕数
   */
  get danmakuAmount () {
    return this._danmakuAmount
  }
  /**
   * 给 xml stream 写入带换行的字符串
   * @param {string} str 要写入的字符串
   */
  _write (str) {
    this._xmlStream.write(str)
    this._xmlStream.write('\n')
  }
  /**
   * 结束写入
   */
  _end () {
    this._xmlStream.write('</i>')
    this._xmlStream.end()
  }
  /**
   * 写入弹幕
   * @param {object} line 熊猫弹幕格式
   */
  _writeDanmaku (line) {
    this._danmakuAmount += 1
    const p = [
      line.time - this._startTime + this._config.timeOffset,
      1,
      25,
      16777215,
      line.time,
      0,
      line.data.from.rid,
      233666
    ].join(',')
    this._write(`<d p="${p}">${escapeXml(line.data.content)}</d>`)
  }
  /**
   * 开始录制弹幕
   * @param {number} time 熊猫弹幕服务器时间
   */
  start (time) {
    const config = this._config
    this._startTime = time
    const today = moment(time*1000).tz('Asia/Shanghai').format('YYYY-MM-DD-HH-mm-ss')
    const prefix = `${config.room}-${today}-danmaku`
    this._xml = path.join(config.path.output, `${prefix}.xml`)
    const fileExists = fs.existsSync(this._xml)
    let shouldWriteHead = true
    let start = undefined
    if (fileExists) {
      const fileBuffer = fs.readFileSync(this._xml)
      const fileContent = fileBuffer.toString()
      start = fileBuffer.length
      if (fileContent.startsWith('<?xml')) {
        shouldWriteHead = false
        if (fileContent.indexOf('</i>') > 0) {
          start = fileBuffer.lastIndexOf('</i>')
        }
      } else {
        shouldWriteHead = true
        start = 0
      }
    }
    this._xmlStream = fs.createWriteStream(this._xml, {
      flags: fileExists ? 'r+' : 'w',
      start: start
    })
    if (shouldWriteHead) {
      this._write('<?xml version="1.0" encoding="UTF-8"?><i><chatserver>chat.bilibili.com</chatserver><chatid>233333</chatid><mission>0</mission><maxlimit>6666666</maxlimit><source>k-v</source>')
    }
    this._danmakuHandler = (d) => {
      try {
        this._writeDanmaku(d)
      } catch (err) {
        console.error(err)
        process.exit(6)
      }
    }
    this._room.on('room-danmaku', this._danmakuHandler)
  }
  /**
   * 停止录制
   * @return string 录制结果的 xml 文件地址
   */
  stop () {
    this._room.removeListener('room-danmaku', this._danmakuHandler)
    this._end()
    return this._xml
  }
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
