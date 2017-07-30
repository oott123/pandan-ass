const { spawn } = require('child_process')
const { cloneDeep } = require('lodash')
const path = require('path')

module.exports = function (config, source, dest) {
  let args = cloneDeep(config.args.danmaku2ass)
  args.push('-o', dest, source)
  args.unshift(config.path.danmaku2ass)
  return spawn(config.path.python, args, {
    stdio: 'inherit'
  })
}
