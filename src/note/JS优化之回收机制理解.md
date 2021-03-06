# JS优化之回收机制理解

> 回忆这几年，经常使用的技术栈从jq，bootstarp，cmd, 到MVVM(vue, react, angular). 我们的js从最开始的几百K到现在动辄几兆，处理对的数据也越来越复杂，随之而来的就是对性能的优化。围绕着优化，肯定要不开内存占用的问题。。。
>
> 首先如下：科普一下简单的技术概念

### JS中的栈（stack）

> 栈的特点是**"LIFO，即后进先出（Last in, first out）"**。数据存储时只能从顶部逐个存入，取出时也需从顶部逐个取出。打个比喻，当我们洗盘子得时候，会边洗边摞一起，等第二遍清理的时候再从最上边一个一个的清洗，然后重新放一摞(假如你喜欢从最下边往出来拿，就当我没说这句话)
>
> // 主要存放 键值对数据，是number， string， Boolean等

```javascript
// 数组模拟栈：
var arr = [1, 2, 3, 4, 5];
 
arr.push(6); // 存入数据 arr -> [1, 2, 3, 4, 5, 6]
arr.pop();   // 取出数据 arr -> [1, 2, 3, 4, 5]
```

### JS 中的堆（heap）

> 堆的特点是**"无序"**的`key-value`**"键值对"**存储方式。主要是在代码运行用保存引用类型的数据，
>
> 嗯么么，这简单了，今年地摊经济很火，你看拿些摊位上老板会将自己的商品平摊全部展示出来，你只需要问老板，要 xxx，然后老板直接会从那一堆商品里给你将你需要的拿出供你挑选
>
> 如： Array， Object， Function等



### JS执行上下文

> 当一段代码运行时，会产生一个对应的执行环境，在这个环境中，所有变量会被事先提出来（变量提升），有的直接赋值，有的为默认值 undefined，代码从上往下开始执行，就叫做执行上下文。
>
> js中运行环境大概分为三种：
>
> 	- 全局变量： 代码首先进入的环境
> 	- 函数环境 ：函数被调用时执行的环境
> 	- eval函数

### 内存限制

> 内存的大小和操作系统有关，64位为1.4G，32位为0.7G。
>
> - 64位下新生代的空间为 64MB ，老生代为 1400MB。
> - 32位下新生代的空间为 16MB ，老生代为 700MB。
>
> 举个例子；内存限制就像每个人的饭量。我们吃饭的时候可以挑自己喜欢的东西吃，但肯定只能吃一部分，不能一直吃，比如我们吃完早饭，就需要等到中午，才能吃午饭，不然胃会被撑爆(内存溢出了)



### 新生代内存

> 新生代(semi space From & semi space To)就是复制
>
- 存放的是 存活时间比较短的变量，会频繁发生垃圾回收。
- 标记活着的变量。首先会将 From 中活着的变量 复制到 To 中，然后将 From 清空，下一次会将 To 中活着的变量 复制到 From 中，并将 To 清空

### 老生代内存
> 老生代空间大，大部分是活着的对象GC耗时比较长， 在GC期间无法响应。 STOP-THE-WORLD
>
> V8的优化方案，增量处理。把一个大的暂停换成火哥小的暂停	INCREMENT-GC



### 变量晋升机制

> 新生代内存空间用来存放存活时间较短的对象，老生代内存空间用来存放存活时间较长的对象。新生代中的对象可以晋升到老生代中，具体有两种方式

- 在垃圾回收的过程中，如果发现某个对象之前被清理过(连续五次清理的时候都存活)，那么会将其晋升到老生代内存空间中
- 在 From 空间和 To 空间进行反转的过程中，如果 To 空间中的使用量已经超过了 25%，那么就将 From 中的对象直接晋升到老生代内存空间中

### 垃圾回收管理

> v8引擎在运行时，会将内存分为两个模块
>
> 新生代内存，老生代内存空间

### 新生代垃圾清理

> 首先 ，浏览器会将新生代的内容创建两个模块A， B；
>
> A - B 这个过程是使用二叉树层级遍历的，如果说上一级没有别引用，下一级直接不做检查，直接销毁
>
> 代码在运行结束后，v8引擎会把当前A内存中的拷贝到B内存中去，在拷贝的时候回检测当前属性是否被引用，如果没有被引用，这说明已经失效，直接销毁
>
> 第二次运行则将会从B内存空间往A内存空间拷贝遍历，并进行存活校验。。。

```javascript
// 执行结束被立即销毁
function fnA（） {
    let str = 'fnA'
    console.log(str)
}

fnA() // 当fn执行完毕， str 没有被继续引用，则被回收

function fnB() {
    let str = 'fnB'
    console.log(str)
    return () => {
        console.log('inner', str)
    }
}
let fnC = fnB() // fnB 执行结束，返回匿名函数赋值给fnC，函数内部应用变量str，所以 fnB作用于不会被销毁，str，存活，匿名函数存活，
```



### 老生代内存回收

- mark-sweep 标记清楚
- mark-compact 标记整理

```javascript
// 假设我们有一个老生代内存空间A， 里边有内存若干，1400MB
let A = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// 标记清除
// 假设内存空间中的偶数内存已经失效，那么GC做回收处理的时候
A = [1,'', 3, '', 5, '', 7, '', 9, '']
// 内存清理完成后，我们看到将刚才存放偶数的内存已经释放， 当我们在下次需要使用的时候，不许重新分配内存，直接使用已经空出来的内存即可

// 上述这种方案的好处就是处理时间很短，不会造成系统太大的消耗，但是会形成多个内存碎片，例如我们可用内存空间有800M，然后又300M是内存碎片，如上述偶数位置被清除后的样子，那么我们当需要一个新的内存空间600M的时候，会发现因为连续的内存空间只有500M，不够用，这种情况下就需要使用标记整理
// 1. 模拟内存空间B
let B = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// 2. 假设 奇数的位上的数据已经失效， 这个时候，会将失效的内存模块移动到后边，将还存活的内存移动至前边
// 3.首次整理完
B = [2, 4, 6, 8, 10, 1, 3, 5, 7, 9]
// 此时我们看到已经失活的内存是从B的1内存位置开始的，我们直接从这个位置将后边的失活内存全部清理即可
B = [2, 4, 6, 8, 10, '', '', '', '', '']
// 4. 整理后得到的内存如上
```

### 结束语

> 内存清理机制介绍到此结束了，如何进行优化，防止内存泄漏，请自行面向百度学习