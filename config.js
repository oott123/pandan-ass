const fs = require('fs')
const path = require('path')

module.exports = (function () {
  const localConfig = path.join(process.cwd(), 'config.json')
  if (fs.existsSync(localConfig)) {
    return require(localConfig)
  }

  try {
    return require('./config.json')
  } catch (err) {
    return require('./config.example.json')
  }
})()
