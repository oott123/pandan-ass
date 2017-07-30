const config = require('../config')
const fs = require('fs')
const path = require('path')

function genMeta () {
  const files = fs.readdirSync(config.path.output).filter((v) => {
    return v.endsWith('.xml') || v.endsWith('.ass')
  })
  const json = JSON.stringify(files, null, 2)
  const filename = path.join(config.path.output, 'meta.js')
  fs.writeFileSync(filename, `window._fileList = ${json};`)
}

module.exports = { genMeta }