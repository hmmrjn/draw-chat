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
    updateTextChat()
    selfParticipant = new Participant("me")
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
    constructor(socketId){
        this.socketId = socketId
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
        rect(pos.x, pos.y - 30, textWidth(this.socketId) + 12, 20, 2)
        fill(255)
        text(this.socketId, pos.x + 6, pos.y -30 + 14)
    }
}

function addNewParticipant(socketId) {
    console.log("joined: " + socketId)
    participants.push(new Participant(socketId))
    console.log(participants.length)
    $('#messages').append($('<li>').text(socketId + 'さんが入室しました'))
}
function disconnectedPaticipant(socketId){
  console.log("disconnected"+ socketId);
    $('#messages').append($('<li>').text(socketId + 'さんが退出しました'))
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

function receiveFormerParticipantIds(formerParticipantSocketIds) {
    for(let fpsi of formerParticipantSocketIds){
        participants.push(new Participant(fpsi))
        console.log("got former participant: " + fpsi)
    }
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

//TODO
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
        $('#messages').append($('<li>').text(msg.id + " : " + msg.msg))
    })
}
