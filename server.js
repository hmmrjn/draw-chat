var express = require('express')

var app = express()
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000)

app.use(express.static('public'))

console.log("server running")

//var participantSocketIds = []
var participantSocketIdsAndNames =[]
var counter = 0

var socket = require('socket.io')
var io = socket(server)
io.on('connection', newConnection)

function newConnection(socket){
    console.log('new connection: ' + socket.id+":"+socket.id)
    var newname = namedParticipants()
    socket.broadcast.emit('new participant', {socketId:socket.id, name:newname})
    // send back only to the emitter
    io.to(socket.id).emit('former participant ids',  participantSocketIdsAndNames)
    //participantSocketIds.push(socket.id)
    participantSocketIdsAndNames.push({socketId:socket.id, name:newname})
    //participantSocketIdAndNames.name = namedParticipants()
    console.log(participantSocketIdsAndNames)

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
        console.log('disconnected: ' + socket.id+":"+socket.id);
        //TODO
        removeValueFromArray(participantSocketIdsAndNames, socket.id)
        console.log(participantSocketIdsAndNames)
        io.emit('disconnect',socket.id)
    });
}

//TODO
function removeValueFromArray(arr, val) {
    var index = arr.indexOf(val)
    if (index >= 0) {
        arr.splice( index, 1 )
    }
}
function namedParticipants(){
  // var token = ["ねこ","いぬ","とり","きりん","さる","らいおん","とら"]
  //  for (var i = 0; i < token.length; i++) {
  //    if (participantSocketIds.indexOf(token[i])== -1) {
  //      name = token[i]
  //      break
  //    }
  //  }
  // name = token[counter]
  // //counter++
  name ="animal" + Math.floor(Math.random()*100)
  return name
}
