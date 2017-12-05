var express = require('express')

var app = express()
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000)

app.use(express.static('public'))

console.log("server running")

var socket = require('socket.io')
var io = socket(server)
io.sockets.on('connection', newConnection)
function newConnection(socket){
    console.log('new connection: ' + socket.id)
    socket.on('mouse', (data) => {
        //send back to other clients excluding the emitter
        socket.broadcast.emit('mouse', data)
        //we can send to everyone incudng the emitter too
        //io.sockets.emit('mouse', data)
        console.log(data)
    })
}