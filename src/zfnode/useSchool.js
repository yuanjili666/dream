//common.js规范 规定了没一个文件都是一个模块，模块之间是相互独立的
//规范规定了 导出的时候使用module.exports
//定义了如何引用一个模块require

//一个模块外边给你加了一个闭包(function (exports, require, module, __dirname, __filename) {})
//模块可以省略后缀 如果是js或者json或者node文件可以省略后缀
console.time('school');
// let res = require('./school')
// 同步读取，并且为了节约性能，还有缓存，将 module.exports 后边的结果进行缓存， 如果又缓存，直接返回结果

let path = require('path')
let fs = require('fs')
let vm = require('vm')
//1.定义模块
function Module (filename) {
  this.filename = filename
  this.exports = {}
}
//2.设置模块可以解析的文件后缀
Module._extentions = ['.js', '.json', '.node']
//3.创建缓存对象
Module._cache = {}

/**
 * #desc 文件路径处理模块
 * @param  {string} filename 解析的文件名或文件名+路径
 * @return {none}
 */
Module.resolvePathName = filename => {
  // 1.拿到路径,进行解析绝对路径
  let p = path.resolve(__dirname, filename)
  //2.判断路径里是路径还是文件名,如果是文件名的话查找文件
  if(!path.extname(p)) {
    //4.如果有文件名,则确定是一个文件,开始
    for(var i =0, arr = Module._extentions, len = arr.length; i < len; i++) {
      let newPath = `${p}${arr[i]}`
      //如果访问的文件不存在， 就会发生异常
      try {
        fs.accessSync(newPath)
        return newPath
      } catch(e) {}
    }
  } else {
    // 3.如果没有文件名,则进行模块化加载:查找同名文件夹下的package.json || index.js
    // 这里没有做处理,只是做了防止报错
    try {
        fs.accessSync(p)
        return p
      } catch(e) {}
  }
}

/**
 * @desc js文件读取模块
 * @param  {object} module 文件引用对象,
 * @return {none}     没有返回值
 */
Module._extentions['js'] = module => {
  // 1.读取js文件的内容
  let script = fs.readFileSync(module.filename, {charset:'utf-8'});
  // 2.使用wrap方法拼接成一个字符串function
  let fnStr = Module.wrap(script)

  //3.在这里拿到函数执行后的结果通过
  //module.exports 当前方法执行的上下文对象
  //module.exports 解析后的值赋值给这个对象那个
  //req 文件加载方法，相当于require
  //module 当前的实例对象
  vm.runInThisContext(fnStr).call(module.exports, module.exports,req, module)

}
/**
 * @desc module 模块解析json文件的方法
 * @param  {object} module 当前的module实例
 * @return {string}        module.exports对象
 */
Module._extentions['json'] = module => {
  // 1.使用fs读取到文件内容
  let script = fs.readFileSync(module.filename);
  // 2.使用JSON的parse方法将字符串转为对象并且赋值给module.expors对象
  module.exports = JSON.parse(script)
  return module.exports
}
/**
 * @desc 函数执行字符串拼接使用的字符串
 * @type {Array}
 */
Module.wrapper = [
  '(function (exports, require, module, __dirname, __filename) {', '})'
]
/**
 * @desc 包裹函数，用来封装执行js的函数
 * @param  {string} script js文件代码
 * @return {string} 拼接好的字符串function
 */
Module.wrap = script => {
  return `${Module.wrapper[0]}${script}${Module.wrapper[1]}`
}
/**
 * @desc 文件引入方法
 * @param  {string} filename 文件名或者文件名+路径
 * @return {none}
 */
Module.prototype.load = function (filename) {
  //模块可能是json 也有可能是js
  let ext = path.extname(filename).slice(1) //去掉拿到文件后缀名上多余的. .js || .json
  //这里的this是Module的实例对象, 根据不同的文件后缀，调用不同的解析方法
  Module._extentions[ext](this)
}

/**
 * @desc 文件引用方法
 * @param  {string} filename 文件名或者文件名+路径
 * @return {object}          返回module,exports对象
 */
function req (filename) {
  //1.我们需要一个绝对路径来，缓存是根据绝对路径的来的
 filename =  Module.resolvePathName(filename)
 if(!filename) return new Error('not find file')
  //判断是否有缓存，有的话返回缓存对象
 let cacheModule = Module._cache[filename]
 if(cacheModule) return cacheModule

  // 2,没有模块 创建模块
  let module = new Module(filename) //创建模块

  //3.加载这个模块{filename: 'c:xx', exports: 'hello world'}
  module.load(filename)
  //4.把夹在好的模块加入缓存
  Module._cache[filename] = module
  return module.exports

}

// let str = req('./school')
let json = req('./school.json')
console.log(json);
console.time('school');



