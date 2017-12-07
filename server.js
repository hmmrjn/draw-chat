var express = require('express')

var app = express()
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000)

app.use(express.static('public'))

console.log("server running")

var socket = require('socket.io')
var io = socket(server)
io.on('connection', newConnection)

function newConnection(socket){
    console.log('new connection: ' + socket.id)
    socket.broadcast.emit('new participant', socket.id)

    socket.on('mouse moved', (data) => {
        data.id = socket.id
        //send back to other clients excluding the emitter
        socket.broadcast.emit('mouse moved', data)
    })

    socket.on('mouse pressed', (data) => {
        data.id = socket.id
        //send back to other clients excluding the emitter
        socket.broadcast.emit('mouse pressed', data)
    })

    socket.on('mouse dragged', (data) => {
        data.id = socket.id
        //send back to other clients excluding the emitter
        socket.broadcast.emit('mouse dragged', data)
    })

    socket.on('chat message', (msg) => {
        console.log('message:' + msg)
        io.emit('chat message', {id : socket.id, msg : msg})
    })
}