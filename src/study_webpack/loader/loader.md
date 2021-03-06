## loader运行的总体流程

![loader](http://img.zhufengpeixun.cn/loader.jpg)

## loader配置

`loader`是导出为一个函数的`node`模块。该函数在`loader`转换资源的时候调用。给定的函数将调用`loader API`，并通过`this`上下文访问。

### 匹配(test)单个 loader

匹配(test)单个 loader，你可以简单通过在 rule 对象设置 path.resolve 指向这个本地文件

```js
{
  test: /\.js$/
  use: [
    {
      loader: path.resolve('path/to/loader.js'),
      options: {/* ... */}
    }
  ]
}
```

### 匹配(test)多个 loaders

你可以使用 resolveLoader.modules 配置，webpack 将会从这些目录中搜索这些 loaders。

```js
resolveLoader: {
   modules: [path.resolve('node_modules'), path.resolve(__dirname, 'src', 'loaders')]
},
```

### npm link

- 确保正在开发的本地 Npm 模块（也就是正在开发的 Loader）的 package.json 已经正确配置好； 在本地 Npm 模块根目录下执行 npm link，把本地模块注册到全局；

- 在项目根目录下执行 npm link loader-name，把第2步注册到全局的本地 Npm 模块链接到项目的 node_moduels 下，其中的 - loader-name 是指在第1步中的 package.json 文件中配置的模块名称。

  ```js
  npm link
  ```

### alias

```js
resolveLoader: {
        alias: {
            "babel-loader": resolve('./loaders/babel-loader.js'),
            "css-loader": resolve('./loaders/css-loader.js'),
            "style-loader": resolve('./loaders/style-loader.js'),
            "file-loader": resolve('./loaders/file-loader.js'),
            "url-loader": resolve('./loaders/url-loader.js')
        }
    },
```

## loader用法

### 单个loader用法

- 当一个 loader 在资源中使用，这个 loader 只能传入一个参数 - 这个参数是一个包含包含资源文件内容的字符串
- 同步 loader 可以简单的返回一个代表模块转化后的值。
- 在更复杂的情况下，loader 也可以通过使用 this.callback(err, values...) 函数，返回任意数量的值。错误要么传递给这个 this.callback 函数，要么扔进同步 loader 中。
- loader只能传入一个包含包含资源文件内容的字符串
- 同步 loader 可以简单的返回一个代表模块转化后的值
- loader 也可以通过使用 this.callback(err, values...) 函数，返回任意数量的值
- loader 会返回一个或者两个值。第一个值的类型是 JavaScript 代码的字符串或者 buffer。第二个参数值是 SourceMap，它是个 JavaScript 对象

### 多个loader

当链式调用多个 loader 的时候，请记住它们会以相反的顺序执行。取决于数组写法格式，从右向左或者从下向上执行。

- 最后的 loader 最早调用，将会传入原始资源内容。
- 第一个 loader 最后调用，期望值是传出 JavaScript 和 source map（可选）。
- 中间的 loader 执行时，会传入前一个 loader 传出的结果。

### 单个loader用法

- 最后的 loader 最早调用，将会传入原始资源内容。
- 第一个 loader 最后调用，期望值是传出 JavaScript 和 source map（可选）。
- 中间的 loader 执行时，会传入前一个 loader 传出的结果。

## 用法准则

- 简单

> loaders 应该只做单一任务。这不仅使每个 loader 易维护，也可以在更多场景链式调用。

- 链式(Chaining)

> 利用 loader 可以链式调用的优势。写五个简单的 loader 实现五项任务，而不是一个 loader 实现五项任务

- 模块化(Modular)

>  保证输出模块化。loader 生成的模块与普通模块遵循相同的设计原则。

- 无状态(Stateless)

> 确保 loader 在不同模块转换之间不保存状态。每次运行都应该独立于其他编译模块以及相同模块之前的编译结果。

### loader 工具库(Loader Utilities)

- [loader-utils](https://github.com/webpack/loader-utils) 包。它提供了许多有用的工具，但最常用的一种工具是获取传递给 loader 的选项
- [schema-utils](https://github.com/webpack-contrib/schema-utils) 包配合 loader-utils，用于保证 loader 选项，进行与 JSON Schema 结构一致的校验

- loader 依赖(Loader Dependencies)

> 如果一个 loader 使用外部资源（例如，从文件系统读取），必须声明它。这些信息用于使缓存 loaders 无效，以及在观察模式(watch mode)下重编译。

- 模块依赖(Module Dependencies)

根据模块类型，可能会有不同的模式指定依赖关系。例如在 CSS 中，使用 @import 和 url(...) 语句来声明依赖。这些依赖关系应该由模块系统解析。

### 4.8 绝对路径(Absolute Paths)

不要在模块代码中插入绝对路径，因为当项目根路径变化时，文件绝对路径也会变化。`loader-utils` 中的 `stringifyRequest` 方法，可以将绝对路径转化为相对路径。

### 4.9 同等依赖(Peer Dependencies)

- 如果你的 loader 简单包裹另外一个包，你应该把这个包作为一个 peerDependency 引入。
- 这种方式允许应用程序开发者在必要情况下，在 package.json 中指定所需的确定版本。



## API

### 缓存结果

webpack充分地利用缓存来提高编译效率

```js
 this.cacheable();
```

### 异步

当一个 Loader 无依赖，可异步的时候我想都应该让它不再阻塞地去异步

```js
// 让 Loader 缓存
module.exports = function(source) {
    var callback = this.async();
    // 做异步的事
    doSomeAsyncOperation(content, function(err, result) {
        if(err) return callback(err);
        callback(null, result);
    });
};
```

### raw loader

默认的情况源文件是以 `UTF-8` 字符串的形式传入给 Loader,设置`module.exports.raw = true`可使用 buffer 的形式进行处理

```js
module.exports.raw = true;
```

### 获得 Loader 的 options

```js
const loaderUtils = require('loader-utils');
module.exports = function(source) {
  // 获取到用户给当前 Loader 传入的 options
  const options = loaderUtils.getOptions(this);
  return source;
};
```

### 返回其它结果

Loader有些场景下还需要返回除了内容之外的东西。

```js
module.exports = function(source) {
  // 通过 this.callback 告诉 Webpack 返回的结果
  this.callback(null, source, sourceMaps);
  // 当你使用 this.callback 返回内容时，该 Loader 必须返回 undefined，
  // 以让 Webpack 知道该 Loader 返回的结果在 this.callback 中，而不是 return 中 
  return;
};
```

完整格式

```js
this.callback(
    // 当无法转换原内容时，给 Webpack 返回一个 Error
    err: Error | null,
    // 原内容转换后的内容
    content: string | Buffer,
    // 用于把转换后的内容得出原内容的 Source Map，方便调试
    sourceMap?: SourceMap,
    // 如果本次转换为原内容生成了 AST 语法树，可以把这个 AST 返回，
    // 以方便之后需要 AST 的 Loader 复用该 AST，以避免重复生成 AST，提升性能
    abstractSyntaxTree?: AST
);
```

### 同步与异步

Loader 有同步和异步之分，上面介绍的 Loader 都是同步的 Loader，因为它们的转换流程都是同步的，转换完成后再返回结果。 但在有些场景下转换的步骤只能是异步完成的，例如你需要通过网络请求才能得出结果，如果采用同步的方式网络请求就会阻塞整个构建，导致构建非常缓慢。

```js
module.exports = function(source) {
    // 告诉 Webpack 本次转换是异步的，Loader 会在 callback 中回调结果
    var callback = this.async();
    someAsyncOperation(source, function(err, result, sourceMaps, ast) {
        // 通过 callback 返回异步执行后的结果
        callback(err, result, sourceMaps, ast);
    });
};
```

#### 处理二进制数据

在默认的情况下，Webpack 传给 Loader 的原内容都是 UTF-8 格式编码的字符串。 但有些场景下 Loader 不是处理文本文件，而是处理二进制文件，例如 file-loader，就需要 Webpack 给 Loader 传入二进制格式的数据。 为此，你需要这样编写 Loader：

```js
module.exports = function(source) {
    // 在 exports.raw === true 时，Webpack 传给 Loader 的 source 是 Buffer 类型的
    source instanceof Buffer === true;
    // Loader 返回的类型也可以是 Buffer 类型的
    // 在 exports.raw !== true 时，Loader 也可以返回 Buffer 类型的结果
    return source;
};
// 通过 exports.raw 属性告诉 Webpack 该 Loader 是否需要二进制数据 
module.exports.raw = true;
```

### 缓存

在有些情况下，有些转换操作需要大量计算非常耗时，如果每次构建都重新执行重复的转换操作，构建将会变得非常缓慢。 为此，Webpack 会默认缓存所有 Loader 的处理结果，也就是说在需要被处理的文件或者其依赖的文件没有发生变化时， 是不会重新调用对应的 Loader 去执行转换操作的。

```js
module.exports = function(source) {
  // 关闭该 Loader 的缓存功能
  this.cacheable(false);
  return source;
};
```

### 其它 Loader API

- [完整API](https://webpack.js.org/api/loaders/)

| 方法名                          | 含义                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| `this.context`                  | 当前处理文件的所在目录，假如当前 Loader 处理的文件是 /src/main.js，则 this.context 就等于 /src |
| `this.resource`                 | 当前处理文件的完整请求路径，包括 querystring，例如 /src/main.js?name=1。 |
| `this.resourcePath`             | 当前处理文件的路径，例如 /src/main.js                        |
| `this.resourceQuery`            | 当前处理文件的 querystring                                   |
| `this.target`                   | 等于 Webpack 配置中的 Target                                 |
| `this.loadModule`               | 但 Loader 在处理一个文件时，如果依赖其它文件的处理结果才能得出当前文件的结果时,就可以通过 this.loadModule(request: string, callback: function(err, source, sourceMap, module)) 去获得 request 对应文件的处理结果 |
| `this.resolve`                  | 像 require 语句一样获得指定文件的完整路径，使用方法为 resolve(context: string, request: string, callback: function(err, result: string)) |
| `this.addDependency`            | 给当前处理文件添加其依赖的文件，以便再其依赖的文件发生变化时，会重新调用 Loader 处理该文件。使用方法为 addDependency(file: string) |
| `this.addContextDependency`     | 和 addDependency 类似，但 addContextDependency 是把整个目录加入到当前正在处理文件的依赖中。使用方法为 addContextDependency(directory: string) |
| `this.clearDependencies`        | 清除当前正在处理文件的所有依赖，使用方法为 clearDependencies() |
| `this.emitFile`                 | 输出一个文件，使用方法为 emitFile(name: string, content: Buffer/string, sourceMap: {...}) |
| `loader-utils.stringifyRequest` | Turns a request into a string that can be used inside require() or import while avoiding absolute paths. Use it instead of JSON.stringify(...) if you're generating code inside a loader 把一个请求字符串转成一个字符串，以便能在require或者import中使用以避免绝对路径。如果你在一个loder中生成代码的话请使用这个而不要用JSON.stringify() |
| `loader-utils.interpolateName`  | Interpolates a filename template using multiple placeholders and/or a regular expression. The template and regular expression are set as query params called name and regExp on the current loader's context. 使用多个占位符或一个正则表达式转换一个文件名的模块。这个模板和正则表达式被设置为查询参数，在当前loader的上下文中被称为name或者regExp |

## loader实战

- loader-utils
- schema-utils
- this.async
- this.cacheable
- getOptions
- validateOptions
- addDependency

### babel-loader

- [babel-core](https://babeljs.io/docs/en/babel-core/)
- [babel-loader](https://github.com/babel/babel-loader/blob/master/src/index.js)
- [babel-plugin-transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx/)
- this.request=/loaders/babel-loader.js!/src/index.js'
- this.userRequest /src/index.js
- this.rawRequest ./src/index.js
- this.resourcePath /src/index.js

```js
const babel=require('babel-core');
const path=require('path');

module.exports=function (source) {
    const options = {
        presets: ['env'],
        sourceMap: true,
        filename:this.request.split('/').pop()
    }
    let result=babel.transform(source,options);
    return this.callback(null,result.code,result.map);
}
resolveLoader: {
    alias: {
      "babel-loader": resolve('./build/babel-loader.js')
    }
},
```

### BannerLoader

```js
const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');
const fs = require('fs');
function loader(source) {
    //把loader改为异步,任务完成后需要手工执行callback
    let cb = this.async();
    //启用loader缓存
    this.cacheable && this.cacheable();
    //用来验证options的合法性
    let schema = { 
        type: 'object',
        properties: {
            filename: {
                type: 'string'
            },
            text: {
                type: 'string'
            }
        }
    }
    //通过工具方法获取options
    let options = loaderUtils.getOptions(this);
    //用来验证options的合法性
    validateOptions(schema, options, 'Banner-Loader');
    let { text, filename } = options;
    if (text) {
        cb(null, text + source);
    } else if (filename) {
        fs.readFile(filename, 'utf8', (err, text) => {
            cb(err, text + source);
        });
    }
}

module.exports = loader;
```

banner.js

```js
/*zfpx*/
options:{
  filename:"./src/loaders/banner.js"
}
```

###  pitch

> The loaders are called from right to left. But in some cases loaders do not care about the results of the previous loader or the resource. They only care for metadata. The pitch method on the loaders is called from left to right before the loaders are called. If a loader delivers a result in the pitch method the process turns around and skips the remaining loaders, continuing with the calls to the more left loaders. data can be passed between pitch and normal call.

- 比如a!b!c!module, 正常调用顺序应该是c、b、a，但是真正调用顺序是 a(pitch)、b(pitch)、c(pitch)、c、b、a,如果其中任何一个pitching loader返回了值就相当于在它以及它右边的loader已经执行完毕
- 比如如果b返回了字符串"result b", 接下来只有a会被系统执行，且a的loader收到的参数是result b

> In the complex case, when multiple loaders are chained, only the last loader gets the resource file and only the first loader is expected to give back one or two values (JavaScript and SourceMap). Values that any other loader give back are passed to the previous loader.

- loader根据返回值可以分为两种，一种是返回js代码（一个module的代码，含有类似module.export语句）的loader，还有不能作为最左边loader的其他loader
- 有时候我们想把两个第一种loader chain起来，比如style-loader!css-loader! 问题是css-loader的返回值是一串js代码，如果按正常方式写style-loader的参数就是一串代码字符串
- 为了解决这种问题，我们需要在style-loader里执行require(css-loader!resouce)

pitch与loader本身方法的执行顺序图

```js
|- a-loader `pitch`
  |- b-loader `pitch`
    |- c-loader `pitch`
      |- requested module is picked up as a dependency
    |- c-loader normal execution
  |- b-loader normal execution
|- a-loader normal execution
```

####  log-loader1.js

```js
//source就是接收到的源文件的内容
let loader = function (source, sourceMaps, extra) {
    let cb = this.async();
    console.log('loader1');
    cb(null, source);
}
module.exports = loader;
loader.pitch = function (remainingRequest,previousRequest,data) {
    console.log('pitch1');
}
```

#### log-loader2.js

```js
//source就是接收到的源文件的内容
let loader = function (source, sourceMaps, extra) {
    let cb = this.async();
    console.log('loader2');
    cb(null, source);
}

module.exports = loader;
loader.pitch = function (remainingRequest,previousRequest,data) {
    console.log('pitch2');
    return "2";
}
```

####  log-loader3.js

```js
//source就是接收到的源文件的内容
const loaderUtils = require('loader-utils');
let loader = function (source) {
    let cb = this.async();
    console.log('loader3');
    cb(null, source);
}
module.exports = loader;
loader.pitch = function () {
    console.log('pitch3');
}
{
  test: /\.less$/,
  use:[path.resolve('src/loaders/log-loader1'),path.resolve('src/loaders/log-loader2'),path.resolve('src/loaders/log-loader3')]
}
```

### css

- [css-loader](https://github.com/webpack-contrib/css-loader/blob/master/lib/loader.js) 的作用是处理css中的 @import 和 url 这样的外部资源
- [style-loader](https://github.com/webpack-contrib/style-loader/blob/master/index.js) 的作用是把样式插入到 DOM中，方法是在head中插入一个style标签，并把样式写入到这个标签的 innerHTML里
- [less-loader](https://github.com/webpack-contrib/less-loader) Compiles Less to CSS
- [pitching-loader](https://webpack.js.org/api/loaders/#pitching-loader)
- [loader-utils](https://github.com/webpack/loader-utils)
- [!!](https://webpack.js.org/concepts/loaders/#configuration)
- post(后置)+inline(内联)+normal(正常)+pre(前置)
- `!` noAutoLoaders 所有的普通loader都不要执行
- `!!` noPrePostAutoLoaders 不要前后置loader
- `-!` noPreAutoLoaders 不要前置loader

####  less-loader.js

```js
let less = require('less');
module.exports = function (source) {
    let callback = this.async();
    less.render(source, { filename: this.resource }, (err, output) => {
        this.callback(err, output.css);
    });
}
```

有些时间我们希望less-loader可以放在use数组最左边，最左边要求返回一个JS脚本

```js
let less=require('less');
module.exports=function (source) {
  let callback = this.async();
    less.render(source,(err,output) => {
        callback(err, `module.exports = ${JSON.stringify(output.css)}`);
    });
}
```

####  style-loader

```js
let loaderUtils=require("loader-utils");
 function loader(source) {
    let script=(`
      let style = document.createElement("style");
      style.innerHTML = ${JSON.stringify(source)};
      document.head.appendChild(style);
    `);
    return script;
} 
//pitch里的参数可不是文件内容，而是文件的请求路径
//pitch request就是你要加载的文件路径 //index.less
loader.pitch = function (request) {
    let style = `
    var style = document.createElement("style");
    style.innerHTML = require(${loaderUtils.stringifyRequest(this, "!!" + request)});
    document.head.appendChild(style);
 `;
    return style;
}
module.exports = loader;
```

#### css-loader.js

```js
function loader(source) {
    let reg = /url\((.+?)\)/g;
    let current;
    let pos = 0;
    let arr = [`let lists = [];`];
    while (current = reg.exec(source)) {
        let [matchUrl, p] = current;
        let index = reg.lastIndex - matchUrl.length;
        arr.push(`lists.push(${JSON.stringify(source.slice(pos, index))})`);
        pos = reg.lastIndex;
        arr.push(`lists.push("url("+require(${p})+")")`);
    }
    arr.push(`lists.push(${JSON.stringify(source.slice(pos))})`);
    arr.push(`module.exports = lists.join('')`);
    return arr.join('\r\n');
}
module.exports = loader;
```

#### bundle.js

```js
{
 "./loaders/css-loader.js!./loaders/less-loader.js!./src/index.less":
/*!*************************************************************************!*\
  !*** ./loaders/css-loader.js!./loaders/less-loader.js!./src/index.less ***!
  \*************************************************************************/
 (function(module, exports, __webpack_require__) {
eval("let lists = [];\r\nlists.push(\"div {\\n  color: red;\\n}\\nbody {\\n  background: \")\r\nlists.push(\"url(\"+__webpack_require__(/*! ./baidu.png */ \"./src/baidu.png\")+\")\")\r\nlists.push(\";\\n}\\n\")\r\nmodule.exports = lists.join('')\n\n//# sourceURL=webpack:///./src/index.less?./loaders/css-loader.js!./loaders/less-loader.js");

 }),
 "./src/baidu.png":
 (function(module, exports, __webpack_require__) {
eval("module.exports = __webpack_require__.p + \"b15c113aeddbeb606d938010b88cf8e6.png\";\n\n//# sourceURL=webpack:///./src/baidu.png?");
 }),
 "./src/index.js":
 (function(module, __webpack_exports__, __webpack_require__) {
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.less */ \"./src/index.less\");\n/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_0__);\n\n\n//# sourceURL=webpack:///./src/index.js?");
 }),
 "./src/index.less":
 (function(module, exports, __webpack_require__) {
eval("\n    var style = document.createElement(\"style\");\n    style.innerHTML = __webpack_require__(/*! !../loaders/css-loader.js!../loaders/less-loader.js!./index.less */ \"./loaders/css-loader.js!./loaders/less-loader.js!./src/index.less\");\n    document.head.appendChild(style);\n \n\n//# sourceURL=webpack:///./src/index.less?");
 }
```

#### exact-loader.js

```js
//把CSS文件单独放置到一个文件中去，然后在页面中通过link标签去引入
let loader = function (source) {
    //发射或者说输出一个文件，这个文件的内容 就是css文件的内容
    this.emitFile('main.css', source);
    let script = `
     let link  = document.createElement('link');
     link.setAttribute('rel','stylesheet');
     link.setAttribute('href','main.css');
     document.head.appendChild(link);
  `;
    return script;
}
module.exports = loader;
```

###  file

`file-loader` 并不会对文件内容进行任何转换，只是复制一份文件内容，并根据配置为他生成一个唯一的文件名。

#### file-loader

- [file-loader](https://github.com/webpack-contrib/file-loader/blob/master/src/index.js)
- [public-path](https://webpack.js.org/guides/public-path/#on-the-fly)

```js
const { getOptions, interpolateName } = require('loader-utils');
function loader(content) {
    let options=getOptions(this)||{};
    let url = interpolateName(this, options.filename || "[hash]", {content});
    url = url  + this.resourcePath.slice(this.resourcePath.lastIndexOf('.'));
    //发射一个文件 向输出里保存一个文件
    this.emitFile(url, content);
    return `module.exports = ${JSON.stringify(url)}`;
}
loader.raw = true;
module.exports = loader;
```

- 通过 `loaderUtils.interpolateName` 方法可以根据 options.name 以及文件内容生成一个唯一的文件名 url（一般配置都会带上hash，否则很可能由于文件重名而冲突）
- 通过 `this.emitFile(url, content)` 告诉 webpack 我需要创建一个文件，webpack会根据参数创建对应的文件，放在 `public path` 目录下
- 返回 `module.exports = ${JSON.stringify(url)}`,这样就会把原来的文件路径替换为编译后的路径

#### url-loader

```js
let { getOptions } = require('loader-utils');
var mime = require('mime');
function loader(source) {
    let options=getOptions(this)||{};
    let { limit, fallback='file-loader' } = options;
    if (limit) {
      limit = parseInt(limit, 10);
    }
    const mimetype=mime.getType(this.resourcePath);
    if (!limit || source.length < limit) {
        let base64 = `data:${mimetype};base64,${source.toString('base64')}`;
        return `module.exports = ${JSON.stringify(base64)}`;
    } else {
        let fileLoader = require(fallback || 'file-loader');
        return fileLoader.call(this, source);
    }
}
loader.raw = true;
module.exports = loader;
```

### html-layout-loader

### webpack.config.js

```js
{
  test: /\.html$/,
     use: {
          loader: 'html-layout-loader',
          options: {
              layout: path.join(__dirname, 'src', 'layout.html'),
              placeholder: '{{__content__}}'
     }
  }
}

plugins: [
        new HtmlWebpackPlugin({
            template: './src/login.html',
            filename: 'login.html'
        }),
        new HtmlWebpackPlugin({
            template: './src/home.html',
            filename: 'home.html'
        })
]
```

### html-layout-loader

```js
const path = require('path');
const fs = require('fs');
const loaderUtils = require('loader-utils');
const defaultOptions = {
    placeholder: '{{__content__}}',
    decorator: 'layout'
}
module.exports = function (source) {
    let callback = this.async();
    this.cacheable && this.cacheable();
    const options = Object.assign(loaderUtils.getOptions(this), defaultOptions);
    const { placeholder, decorator, layout } = options;
    fs.readFile(layout, 'utf8', (err, html) => {
        html = html.replace(placeholder, source);
        callback(null, `module.exports = ${JSON.stringify(html)}`);
    })
}
const path = require('path');
const fs = require('fs');
const loaderUtils = require('loader-utils');
const defaultOptions = {
    placeholder:'{{__content__}}',
    decorator:'layout'
}
module.exports = function(source){
    let callback = this.async();
    this.cacheable&& this.cacheable();
    const options = {...loaderUtils.getOptions(this),...defaultOptions};
    const {placeholder,layout,decorator} = options;
    const layoutReg = new RegExp(`@${decorator}\\((.+?)\\)`);
    let result = source.match(layoutReg);
    if(result){
        source = source.replace(result[0],'');
        render(path.resolve(this.context,result[1]), placeholder, source, callback)
    }else{
        render(layout, placeholder, source, callback);
    }

}
function render(layout, placeholder, source, callback) {
    fs.readFile(layout, 'utf8', (err, html) => {
        html = html.replace(placeholder, source);
        callback(null, `module.exports = ${JSON.stringify(html)}`);
    })
}
```

## loader测试

###  安装依赖

```js
cnpm install --save-dev jest babel-jest babel-preset-env
cnpm install --save-dev webpack memory-fs
```

### src/loader.js

```js
let {getOptions} = require('loader-utils');
function loader(source){
   const options = getOptions(this);
   source=source.replace(/\[name\]/g,options.name);
   return `module.exports = ${JSON.stringify(source)}`;
}
module.exports=loader;
```

### test/example.txt

```js
hello [name]
```

### test/compile.js

```js
const path=require('path');
const webpack=require('webpack');
let MemoryFs=require('memory-fs');
module.exports = function(fixture,options={}) {
    const compiler=webpack({
        mode:'development',
        context: __dirname,
        entry: `./${fixture}`,
        output: {
            path: path.resolve(__dirname),
            filename:'bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.txt$/,
                    use: {
                        loader: path.resolve(__dirname,'../src/loader.js'),
                        options:{name:'Alice'}
                    }
                }
            ]
        }
    });
    compiler.outputFileSystem=new MemoryFs();
    return new Promise(function (resolve,reject) {
        compiler.run((err,stats) => {
            if (err) reject(err);
            else resolve(stats);
        });
    });
}
```

### test/loader.test.js

```js
let compile=require('./compile');
test('replace name',async () => {
    const stats=await compile('example.txt');
    const data=stats.toJson();
    const source=data.modules[0].source;
    expect(source).toBe(`module.exports = "hello Alice"`);
});
```

###  package.json

```json
"scripts": {
  "test":"jest"
}
```

##  loader源码

loader是用来加载处理各种形式的资源,本质上是一个函数, 接受文件作为参数,返回转化后的结构。

- loader 用于对模块的源代码进行转换
- loader 可以使你在 import 或"加载"模块时预处理文件

### NormalModuleFactory

- `!` noAutoLoaders 所有的loader都不要执行
- `!!` noPrePostAutoLoaders 不要前后置loader
- `-!` noPreAutoLoaders 不要前置loader

```js
this.hooks.resolver.tap("NormalModuleFactory", () => (data, callback) => {
            const contextInfo = data.contextInfo;
            const context = data.context;
            const request = data.request;
            debugger /*resolve钩子上注册的方法较长，其中还包括了模块资源本身的路径解析。resolver有两种，分别是loaderResolver和normalResolver。*/
            const loaderResolver = this.getResolver("loader");
            const normalResolver = this.getResolver("normal", data.resolveOptions);
            //匹配的资源
            let matchResource = undefined;
            let requestWithoutMatchResource = request;//这是原始的请求
            const matchResourceMatch = MATCH_RESOURCE_REGEX.exec(request);//"^([^!]+)!=!"
            if (matchResourceMatch) {//如果能匹配上
                matchResource = matchResourceMatch[1];//取得匹配到的资源 
                if (/^\.\.?\//.test(matchResource)) {//如果是一个相对路径,则转成绝对路径
                    matchResource = path.join(context, matchResource);
                }//把匹配到的部分截取掉
                requestWithoutMatchResource = request.substr(
                    matchResourceMatch[0].length
                );
            }
            debugger /*noPreAuto指的是只用行内loader,禁用配置文件中的loader配置*/
            const noPreAutoLoaders = requestWithoutMatchResource.startsWith("-!");
            const noAutoLoaders =
                noPreAutoLoaders || requestWithoutMatchResource.startsWith("!");//!表示不走配置
            const noPrePostAutoLoaders = requestWithoutMatchResource.startsWith("!!");//表示禁用前后loader
            let elements = requestWithoutMatchResource
                .replace(/^-?!+/, "")//把-!替换成空
                .replace(/!!+/g, "!")//把!!替换成一个!
                .split("!"); debugger /*webpack会从request中解析出所需的loader,包括资源本身 */
            let resource = elements.pop();//取得资源
            elements = elements.map(identToLoaderRequest);//剩下的全转成loader对象
```

### webpack/lib/NormalModule.js:263

```js
runLoaders({
                resource: this.resource,
                loaders: this.loaders,
                context: loaderContext
},
(err, result) => {
const resourceBuffer = result.resourceBuffer;
const source = result.result[0];
const sourceMap = result.result.length >= 1 ? result.result[1] : null;
const extraInfo = result.result.length >= 2 ? result.result[2] : null;//ast
this._source = this.createSource(
                    this.binary ? asBuffer(source) : asString(source),
                    resourceBuffer,
                    sourceMap
);
this._ast = typeof extraInfo === "object" &&
                    extraInfo !== null &&
                    extraInfo.webpackAST !== undefined? extraInfo.webpackAST: null;
} 
```

### LoaderRunner.js

loader-runner/lib/LoaderRunner.js

```js
iteratePitchingLoaders(processOptions, loaderContext, function(err, result) {
callback(null, {
            result: result,//结果
            resourceBuffer: processOptions.resourceBuffer,
            cacheable: requestCacheable,
            fileDependencies: fileDependencies,
            contextDependencies: contextDependencies
});
}
```

###  LoaderRunner.js:155

```js
if(loaderContext.loaderIndex >= loaderContext.loaders.length)
        return processResource(options, loaderContext, callback);
var fn = currentLoaderObject.pitch;

runSyncOrAsync(fn,loaderContext);

function runSyncOrAsync(fn, context, args, callback) {
    var isSync = true;
    var isDone = false;
    var isError = false; // internal error
    var reportedError = false;
    context.async = function async() {
        if (isDone) {
            if (reportedError) return; // ignore
            throw new Error("async(): The callback was already called.");
        }
        isSync = false;
        return innerCallback;
    };
    var innerCallback = context.callback = function () {
        if (isDone) {
            if (reportedError) return; // ignore
            throw new Error("callback(): The callback was already called.");
        }
        isDone = true;
        isSync = false;
        try {
            callback.apply(null, arguments);
        } catch (e) {
            isError = true;
            throw e;
        }
    };
    try {
        var result = (function LOADER_EXECUTION() {
            return fn.apply(context, args);
        }());
        if (isSync) {
            isDone = true;
            if (result === undefined)
                return callback();
            if (result && typeof result === "object" && typeof result.then === "function") {
                return result.catch(callback).then(function (r) {
                    callback(null, r);
                });
            }
            return callback(null, result);
        }
    } catch (e) {
        if (isError) throw e;
        if (isDone) {
            // loader is already "done", so we cannot use the callback function
            // for better debugging we print the error on the console
            if (typeof e === "object" && e.stack) console.error(e.stack);
            else console.error(e);
            return;
        }
        isDone = true;
        reportedError = true;
        callback(e);
    }

}
function runSyncOrAsync(fn, context, callback) {
    var isSync = true;
    context.callback = callback;
    context.async = function async() {
        isSync = false;
        return context.callback;
    };

    var result = fn.apply(context);
    if (isSync) {
        return callback(null, result);
    }
}

function say() {
    return this.name;
}
function say2() {
    let cb = this.async();
    cb(null);
}
let context = { name: 'zfpx' };
runSyncOrAsync(say2, context, function () {
    console.log('over');
});
```

### loadLoader.js:13

loader-runner/lib/loadLoader.js:13

```js
var module = require(loader.path);
loader.normal = typeof module === "function" ? module : module.default;
loader.pitch = module.pitch;
loader.raw = module.raw;
```

### LoaderRunner.js

loader-runner/lib/LoaderRunner.js

```js
runSyncOrAsync(
            fn,
            loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoaderObject.data = {}],
            function(err) {
                if(err) return callback(err);
                var args = Array.prototype.slice.call(arguments, 1);
                if(args.length > 0) {
                    loaderContext.loaderIndex--;
                    iterateNormalLoaders(options, loaderContext, args, callback);
                } else {
                    iteratePitchingLoaders(options, loaderContext, callback);
                }
            }
        );
```

## 参考

- [loader-utils](https://github.com/webpack/loader-utils)
- [schema-utils](https://github.com/webpack-contrib/schema-utils)