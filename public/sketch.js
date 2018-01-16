var socket

var selfParticipant
var participants = []

function setup() {
    var canvas = createCanvas(800, 600)
    canvas.parent('sketch-holder')
    frameRate(20)
    socket = io()
    socket.on('former participant ids', receiveFormerParticipantIds)
    socket.on('mouse moved', receiveMouseMovedData)
    socket.on('mouse pressed', receiveMousePressedData)
    socket.on('mouse dragged', receiveMouseDraggedData)
    socket.on('new participant', addNewParticipant)
    socket.on('disconnect',disconnectedPaticipant )
    selfParticipant = new Participant("dummy","dummyname")
    socket.on('assign name',receiveSelfName)
    updateTextChat()
}

function mouseMoved() {
    sendMouseMovedData()
    selfParticipant.updateMousePosition(mouseX, mouseY)
}

//once when begun to press
function mousePressed() {
    selfParticipant.traces.push(new Trace())
    sendMousePressedData()
}

//moved while pressed
function mouseDragged() {
    selfParticipant.addPointToLastTrace(mouseX, mouseY)
    selfParticipant.updateMousePosition(mouseX, mouseY)
    sendMouseDraggedData()
}

function draw() {
    background(255)

    for (let pa of participants) {
        pa.showTraces()
        pa.showMousePositionPoint()
    }
    selfParticipant.showTraces()
    selfParticipant.showMousePositionPoint()
}


class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Trace {
    constructor(){
        this.points = []
    }
    show() {
        stroke(0)
        strokeWeight(3)
        for (var i = 0; i < this.points.length - 1; i++){
            var p1 = this.points[i]
            var p2 = this.points[i+1]
            line(p1.x, p1.y, p2.x, p2.y)
        }
    }
}

class Participant {
    constructor(socketId, name){
        this.socketId = socketId
        this.name = name
        this.traces = []
        this.mousePositionPoint = new Point(0, 0)
    }
    addPointToLastTrace(x, y) {
        let newestOwnTrace = this.traces[this.traces.length - 1]
        newestOwnTrace.points.push(new Point(x, y))
    }
    showTraces() {
        for(let trace of this.traces){
            trace.show()
        }
    }
    updateMousePosition(x, y) {
        this.mousePositionPoint = new Point(x, y)
    }
    showMousePositionPoint() {
        noStroke()
        let pos = this.mousePositionPoint
        fill(255, 100, 0)
        rect(pos.x, pos.y - 30, textWidth(this.name) + 12, 20, 2)
        fill(255)
        text(this.name, pos.x + 6, pos.y -30 + 14)
    }
}

function addNewParticipant(socketIdAndName) {
    console.log("joined: " + socketIdAndName.socketId)
    participants.push(new Participant(socketIdAndName.socketId,socketIdAndName.name))
    console.log(participants.length)
    $('#messages').append($('<li>').text(socketIdAndName.name + 'が入室しました'))
}

function disconnectedPaticipant(name){
  console.log("disconnected"+ name);
    $('#messages').append($('<li>').text(name + 'が退出しました'))
}

function sendMouseMovedData() {
    var data = { x: Math.round(mouseX), y: Math.round(mouseY) }
    socket.emit('mouse moved', data)
}

function sendMousePressedData() {
    var data = { x: Math.round(mouseX), y: Math.round(mouseY) }
    socket.emit('mouse pressed', data)
}

function sendMouseDraggedData() {
    var data = { x: Math.round(mouseX), y: Math.round(mouseY) }
    socket.emit('mouse dragged', data)
}

function receiveFormerParticipantIds(formerParticipantSocketIdsAndNames) {
    for(let fpsin of formerParticipantSocketIdsAndNames){
        participants.push(new Participant(fpsin.socketId, fpsin.name))
        console.log("got former participant: " + fpsin)
    }
}

function receiveSelfName(name){
  selfParticipant.name=name
}

function receiveMouseMovedData(data) {
    getParticipantBySocketId(data.id).updateMousePosition(data.x, data.y)
}

function receiveMousePressedData(data) {
    let participant = getParticipantBySocketId(data.id)
    participant.traces.push(new Trace())
}

function receiveMouseDraggedData(data) {
    let participant = getParticipantBySocketId(data.id)
    let participantNewestTrace = participant.traces[participant.traces.length - 1]
    participantNewestTrace.points.push(new Point(data.x, data.y))
    getParticipantBySocketId(data.id).updateMousePosition(data.x, data.y)
}

function getParticipantBySocketId(socketId) {
    for(let participant of participants){
        if(participant.socketId == socketId){
            return participant
        }
    }
}

//
// chat below
//
function updateTextChat() {
    $('form').submit(function () {
        socket.emit('chat message', $('#m').val())
        $('#m').val('')
        return false
    })
    socket.on('chat message', function (msg) {
        $('#messages').append($('<li class="chat-log">').text(msg.name + " : " + msg.msg))
        //自動スクロール！
        var tl = $('#messages')
        if (tl[0].scrollHeight > tl[0].scrollTop + tl.outerHeight()) {
            tl.scrollTop(tl[0].scrollHeight);
            console.log('ｱーｯ!')
        }
        console.log('ンン'+tl[0].scrollHeight + ', ' + tl[0].scrollTop + ', ' + tl.outerHeight())
    })
}
