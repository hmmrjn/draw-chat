var socket

var ownTraces = []

//TODO
var anotherClientMouseData

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
    updateTextChat()
}

function mouseMoved() {
    sendMouseMovedData()
}

//once when begun to press
function mousePressed() {
    ownTraces.push(new Trace())
    sendMousePressedData()
}

//moved while pressed
function mouseDragged() {
    var newestOwnTrace = ownTraces[ownTraces.length - 1]
    newestOwnTrace.points.push(new Point(mouseX, mouseY))
    sendMouseDraggedData()
}

function draw() {
    background(255)

    for (let trace of ownTraces) {
        trace.show()
    }

    for (let pa of participants) {
        for(let trace of pa.traces){
            trace.show()
        }
    }

    noStroke()

    if (socket.id != null) {
        fill(0)
        text(socket.id, mouseX, mouseY - 10)
    }

    if (anotherClientMouseData != null) {
        fill(0, 0, 255)
        text(anotherClientMouseData.id, anotherClientMouseData.x, anotherClientMouseData.y)
    }
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
    }
}

function addNewParticipant(socketId) {
    console.log("joined: " + socketId)
    participants.push(new Participant(socketId))
    console.log(participants.length)
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
    //TODO
    anotherClientMouseData = data
}

function receiveMousePressedData(data) {
    let participant = getParticipantBySocketId(data.id)
    participant.traces.push(new Trace())
}

function receiveMouseDraggedData(data) {
    let participant = getParticipantBySocketId(data.id)
    let participantNewestTrace = participant.traces[participant.traces.length - 1]
    participantNewestTrace.points.push(new Point(data.x, data.y))
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