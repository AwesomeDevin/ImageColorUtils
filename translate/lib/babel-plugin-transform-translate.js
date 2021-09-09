const babel = require('@babel/core');

const traverse = require('@babel/traverse').default;

const ast = babel.parseSync('const a = 1');
let depth = 0;
traverse(ast, {
  enter(path) {
    console.log(`enter ${path.type}(${path.key})`);
    depth++;
  },

  exit(path) {
    depth--;
    console.log(`  exit ${path.type}(${path.key})`);
  },

  // 访问标识符
  Identifier(path) {
    console.log(`enter Identifier`);
  },

  ExpressionStatement(path) {},

  // 访问调用表达式
  CallExpression(path) {
    console.log(`enter CallExpression`);
  },

  // 上面是enter的简写，如果要处理exit，也可以这样
  // 二元操作符
  BinaryExpression: {
    enter(path) {},

    exit(path) {}

  },

  // 更高级的, 使用同一个方法访问多种类型的节点
  "ExportNamedDeclaration|Flow"(path) {}

});