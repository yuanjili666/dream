let express = require('express')
let http = require('http')

let app = express()
app.use(express.static(__dirname))
app.get('/', function (res, req) {
    res.header('Content-Type', 'text/html;charset=utf8')
    res.sendFile(path.resolve('index.html'))
})
let server = http.createServer(app)

// 因为websocket协议是要依赖http协议实现握手的，所以需要把httpServer的实例传递给socket.io
let socketIo = require('socket.io')
let io = socketIo(server)
// 在服务器监听客户端的链接
let sockets = {} // 保存用户
let SYS = '系统提示'
let t = new Date() // 用来处理消息发送时间
io.on('connection', socket => {
    console.log('客户端连接到服务器', socket.name)
    let username;
    // 监听接受客户端发过来的消息
    socket.on('message', msg => {
        if (username) {
            username = msg
            let message = {
                name: SYS,
                timer: t.getTime(),
                msg: `${msg} 进入聊天`
            }
            // 将对象保存，方便后期使用
            sockets[username] = socket
            // 像除了自己别的用户广播消息
            socket.broadcast.emit('message', JSON.stringify(message))
        } else {
            // 像客户端发送数据
            let message = {
                name: username,
                timer: t.getTime(),
                msg: msg
            }
            io.emit('message', JSON.stringify(message))
        }
        
    })
    socket.on('disconect', function () {
        console.log('断开连接')
    })
    socket.on('error', () => {
        console.log('连接错误')
    })
})

server.listen(9999)