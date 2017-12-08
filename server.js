var express = require('express')

var app = express()
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000)

app.use(express.static('public'))

console.log("server running")

var participantSocketIds = []

var socket = require('socket.io')
var io = socket(server)
io.on('connection', newConnection)

function newConnection(socket){
    console.log('new connection: ' + socket.id)
    participantSocketIds.push(socket.id)
    socket.broadcast.emit('new participant', socket.id)
    console.log(participantSocketIds)
    // send back only to the emitter
    io.to(socket.id).emit('former participant ids', participantSocketIds)

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

    socket.on('disconnect', function() {
        console.log('disconnected: ' + socket.id);
        removeValueFromArray(participantSocketIds, socket.id)
        console.log(participantSocketIds)
    });
}

function removeValueFromArray(arr, val) {
    var index = arr.indexOf(val)
    if (index >= 0) {
        arr.splice( index, 1 )
    }
}