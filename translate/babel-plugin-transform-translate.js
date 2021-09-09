const fs = require('fs')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')

function parse(code) {
  const ast = parser.parse(code,{
    sourceType: 'script'
  })
  traverse(ast, {
    StringLiteral(path) {
      console.log('enter')
      if(t.isStringLiteral(path)){
        console.log('path',path.node.value.match(/\\u533A/))
      }
      
    },
  });

}


const originPath = './main/mine.js'
const newfile = `${originPath}.copy`
var file = fs.createReadStream(originPath)
var out = fs.createWriteStream(newfile)
let totalChunk = ''
file.on('data',function(chunk){
  totalChunk += chunk
});
file.on('end',function(){
  parse(totalChunk.toString())

  // out.write()
  out.end();
  // fs.rmSync(originPath)
  
  console.log('处理完成')
  // fs.rename(newfile, originPath, ()=>{
  //   console.log('处理完成')
  // })
})