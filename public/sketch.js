var socket;

function setup() {
    createCanvas(400, 400)
    background(0)
    socket = io.connect('http://localhost:3000')
    socket.on('mouse', newDrawing) //receive
}

// own drawings
function mouseDragged() {
    fill(255)
    ellipse(mouseX, mouseY, 40, 40)
    var data = { x: mouseX, y: mouseY }
    socket.emit('mouse', data) //send
}

// others clients drawings
function newDrawing(data) {
    fill(100)
    ellipse(data.x, data.y, 40, 40)
}