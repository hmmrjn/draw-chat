var socket

var ownTraces = []
var otherCientsTraces = []

var anotherClientMouseData

function setup() {
    var canvas = createCanvas(800, 600)
    canvas.parent('sketch-holder')
    socket = io()
    socket.on('mouse', receiveOtherClientsMouseData) //receive
    updateTextChat()
}

function mouseMoved() {
    sendOwnMouseData()
}

function mouseDragged() {
    fill(255)
    ownTraces.push({ x: mouseX, y: mouseY })
    sendOwnMouseData()
}

function draw() {
    background(255)

    if (socket.id != null) {
        fill(0)
        text(socket.id, mouseX, mouseY - 10)
    }


    for (trace of ownTraces) {
        ellipse(trace.x, trace.y, 20, 20)
    }

    fill(0, 0, 255)
    for (trace of otherCientsTraces) {
        ellipse(trace.x, trace.y, 20, 20)
    }

    if (anotherClientMouseData != null) {
        fill(0, 0, 255)
        text(anotherClientMouseData.id, anotherClientMouseData.x, anotherClientMouseData.y)
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
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg.id + " : " + msg.msg));
    });
}