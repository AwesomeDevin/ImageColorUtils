const pluginTester = require('babel-plugin-tester').default
const pluginTranslate = require('./babel-plugin-transform-translate')

pluginTester({
  plugin: pluginTranslate,
  tests: [
    {code: '123专区123', output: '123zone123'},
  ],
})