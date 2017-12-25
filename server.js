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
    var newname = generateName()
    socket.broadcast.emit('new participant', {socketId:socket.id, name:newname})
    // send back only to the emitter
    io.to(socket.id).emit('former participant ids',  participantSocketIdsAndNames)
    io.to(socket.id).emit('assign name', newname)
    //participantSocketIds.push(socket.id)
    participantSocketIdsAndNames.push({socketId:socket.id, name:newname})
    //participantSocketIdAndNames.name  = generateName()
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
        io.emit('chat message', {name : getParticipantNameBySocketId(socket.id), msg : msg})
    })

    socket.on('disconnect', function() {
        console.log('disconnected: ' + socket.id+":"+getParticipantNameBySocketId(socket.id));
        io.emit('disconnect', getParticipantNameBySocketId(socket.id))
        removeParticipantBySocketId(socket.id)
        console.log(participantSocketIdsAndNames)
    });
}


function removeParticipantBySocketId(socketId) {
  for (let index in participantSocketIdsAndNames) {
    if (participantSocketIdsAndNames[index].socketId == socketId) {
      participantSocketIdsAndNames.splice(index,1)
    }
  }
}

function getParticipantNameBySocketId(socketId) {
  for (let psin of participantSocketIdsAndNames) {
    if (psin.socketId == socketId) {
      return psin.name
    }
  }
}

function generateName(){
  var token = ["ねこ","いぬ","とり","きりん","さる","らいおん","とら","ぞう","くま","ぱんだ","へび","ひと","サーバルキャット","かばんちゃん","つちのこ","すなねこ","かば","とき"]
  if (participantSocketIdsAndNames.length >= token.length) {
    return "oosugi---"
  }
      do{
        var num =Math.floor(Math.random()*token.length)
        var temp = token[num]
        var isUnique = true
        for(let psin of participantSocketIdsAndNames){
          if (temp==psin.name) {
            isUnique =false
            break
          }else {
            isUnique =true
          }
        }
      }while (!isUnique)
  return temp
}
