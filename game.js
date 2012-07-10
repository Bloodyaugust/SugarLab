function start() {
    app = new game();
}

testStructure = [
    new point(0, 0),
    new point(10, 0),
    new point(20, 10),
    new point(20, 20),
    new point(10, 30),
    new point(0, 30),
    new point(-10, 20),
    new point(-10, 10)
];
test = new polygon(new point(0, 0), new point(5,15), testStructure);
test2 = new polygon(new point(100, 100), new point(5, 15), testStructure);
function update() {
    app.update();
    
    if (app.isKeyDown(69)) {
        test2.rotate(360 * app.deltaTime);
        test.rotate(360 * app.deltaTime);
    }
    
    test.location = app.mouseLocation;
    test.update();
    test2.update();
    
    if(test.intersect(test2)) {
        test.color = 'green';
    }
    
    else {
        test.color = 'black';
    }
    
    draw();
}

function draw() {
    app.clearScreen('blue');
    
    test.draw(app.sctx);
    test2.draw(app.sctx);
    
    drawText("Mouse Button: " + app.mouseButton, new point(100, 200), 'green', app.sctx);
    
    drawText("Mouse Location: " + "(" + app.mouseLocation.x + ", " + app.mouseLocation.y + ")", new point(100, 100), 'green', app.sctx);
    
    drawText("FPS: " + app.fps, new point(100, 300), 'green', app.sctx);
}