var socket

var ownTraces = []
var otherCientsTraces = []

var anotherClientMouseData

function setup() {
    var canvas = createCanvas(800, 600)
    canvas.parent('sketch-holder')
    frameRate(20)
    socket = io()
    socket.on('mouse', receiveOtherClientsMouseData) //receive
    updateTextChat()
}

function mouseMoved() {
    sendOwnMouseData()
}

//once when begun to press
function mousePressed() {
    ownTraces.push(new Trace())
}

//moved while pressed
function mouseDragged() {
    var newestOwnTrace = ownTraces[ownTraces.length - 1]
    newestOwnTrace.points.push(new Point(mouseX, mouseY))
    sendOwnMouseData()
}

function draw() {
    background(255)

    for (trace of ownTraces) {
        trace.show()
    }

    noStroke()

    if (socket.id != null) {
        fill(0)
        text(socket.id, mouseX, mouseY - 10)
    }

    fill(0, 0, 255)
    for (trace of otherCientsTraces) {
        ellipse(trace.x, trace.y, 10, 10)
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

function receiveOtherClientsMouseData(data) {
    console.log(data)
    if (data.pressed) {
        otherCientsTraces.push({ x: data.x, y: data.y })
    }
    anotherClientMouseData = data
}

function sendOwnMouseData() {
    var data = { x: Math.round(mouseX), y: Math.round(mouseY), pressed: mouseIsPressed }
    socket.emit('mouse', data) //send
}

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