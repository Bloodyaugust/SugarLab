function include(file)
{
    var script  = document.createElement('script');
    script.src  = file;
    script.type = 'text/javascript';
    script.defer = true;
 
    document.getElementsByTagName('head').item(0).appendChild(script);
}

Object.prototype.clone = function() {
    var newObj = (this instanceof Array) ? [] : {};
    for (i in this) {
        if (i === 'clone') continue;
        if (this[i] && typeof this[i] === "object") {
            newObj[i] = this[i].clone();
        }
        else newObj[i] = this[i]
    }
    return newObj;
};

function game()
{
    this.canvas = document.getElementById('gameCanvas');
    this.sctx = this.canvas.getContext("2d");
    this.windowSize = new point(this.canvas.width, this.canvas.height);
    this.startTime = new Date().getTime();
    this.lastFrameTime = this.startTime;
    this.deltaTime = 0;
    this.fps = 0;
    this.deltaBuffer = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    this.keysDown = [];
    
    window.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    window.addEventListener("keyup", this.handleKeyUp.bind(this), false);
    
    window.setInterval(function() {
        update();
    }, 1);
}

game.prototype.update = function() {
    var now = new Date().getTime();
    this.deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    this.deltaBuffer.shift();
    this.deltaBuffer.push(this.deltaTime);
    
    var avgDelta = 0;
    var dBufLength = this.deltaBuffer.length;
    for (var i = 0; i < dBufLength; i += 1) {
        avgDelta += this.deltaBuffer[i];
    }
    avgDelta = avgDelta / dBufLength;
    this.fps = Math.floor(1000 / avgDelta);
}

game.prototype.handleKeyDown = function (event)
{
    var keyCode = event.keyCode;
    var alreadyCaptured = false;
	
    for (var i = 0; i < this.keysDown.length; i++)
    {
        if (this.keysDown[i] === keyCode)
            alreadyCaptured = true;
    }
	
    if (!alreadyCaptured)
        this.keysDown.push(keyCode);
}

game.prototype.handleKeyUp = function (event)
{
    var keyCode = event.keyCode;
    for (var i = 0; i < this.keysDown.length; i++)
    {
        if (this.keysDown[i] === keyCode)
            this.keysDown.splice(i, 1);
    }
}

game.prototype.isKeyDown = function (keyCode)
{
    for (var i = 0; i < this.keysDown.length; i++)
    {
        if (this.keysDown[i] === keyCode)
            return true;
    }
	
    return false;
}

function point(x, y)
{
    this.x = x;
    this.y = y;
}

function line(p1, p2)
{
    this.p1 = p1;
    this.p2 = p2;
}

line.prototype.intersect = function (L2) 
{
    var d = (L2.p2.y - L2.p1.y) * (this.p2.x - this.p1.x) - (L2.p2.x - L2.p1.x) * (this.p2.y - this.p1.y);
    
    if (d === 0)
        return false;
    
    var n_a = (L2.p2.x - L2.p1.x) * (this.p1.y - L2.p1.y) - (L2.p2.y - L2.p1.y) * (this.p1.x - L2.p1.x);

    var n_b = (this.p2.x - this.p1.x) * (this.p1.y - L2.p1.y) - (this.p2.y - this.p1.y) * (this.p1.x - L2.p1.x);
    
    var ua = n_a / d;
    var ub = n_b / d;
    
    if ((ua >= 0) && (ua <= 1) && (ub >= 0) && (ub <= 1))
    {
        var x = this.p1.x + (ua * (this.p2.x - this.p1.x));
        var y = this.p1.y + (ua * (this.p2.y - this.p1.y));
        var intersect = new point(x, y);
        return intersect;
    }
         
    return false;
}

function polygon(location, origin, structure)
{
    this.location = location.clone();
    this.rotation = 0;
    this.origin = origin.clone();
    this.color = "black";
    this.width = 1;
    this.structurePoints = structure.clone();
    this.points = structure.clone();
    this.lines = [];
    for (var i = 0; i < this.points.length; i++)
    {
        if (i != this.points.length - 1)
        {
            this.lines.push(new line(this.points[i], this.points[i+1]));
        }
                
        else 
        {
            this.lines.push (new line(this.points[i], this.points[0]));
        }
    }
}

polygon.prototype.update = function()
{
    for (var i = 0; i < this.points.length; i++)
    {
        var newX = this.structurePoints[i].x + this.location.x;
        var newY = this.structurePoints[i].y + this.location.y;
        var translatedOrigin = new point(this.origin.x + this.location.x, this.origin.y + this.location.y);
            
        var rotatedX = Math.cos(this.rotation * 0.0174532925) * (newX - translatedOrigin.x) - Math.sin(this.rotation * 0.0174532925) * (newY - translatedOrigin.y) + translatedOrigin.x;
        var rotatedY = Math.sin(this.rotation * 0.0174532925) * (newX - translatedOrigin.x) + Math.cos(this.rotation * 0.0174532925) * (newY - translatedOrigin.y) + translatedOrigin.y;
            
        this.points[i] = new point(rotatedX, rotatedY);
    }
        
    this.lines = [];
    for (var i = 0; i < this.points.length; i++)
    {
        if (i != this.points.length - 1)
        {
            this.lines.push(new line(this.points[i], this.points[i+1]));
        }
                
        else 
        {
            this.lines.push (new line(this.points[i], this.points[0]));
        }
    }
}

polygon.prototype.draw = function(sctx)
{
    sctx.save();
    sctx.strokeStyle = this.color;
    sctx.lineWidth = this.width;
    sctx.beginPath();
    sctx.moveTo(this.points[0].x, this.points[0].y);
    for (i = 1; i < this.points.length; i++)
    {
        sctx.lineTo(this.points[i].x, this.points[i].y);
    }
    sctx.closePath();
    sctx.stroke();
    sctx.restore();
}

polygon.prototype.translate = function(translateBy)
{
    this.location.x += translateBy.x;
    this.location.y += translateBy.y;
}

polygon.prototype.rotate = function(rotateBy)
{
    this.rotation += rotateBy;
	
    if (this.rotation > 360)
    {
        this.rotation = this.rotation - 360;
    }
	
    if (this.rotation < 360)
    {
        this.rotation = 360 + this.rotation;
    }
}

polygon.prototype.intersect = function(poly2)
{
    for (var i = 0; i < this.lines.length; i++)
    {
        for (i2 = 0; i2 < poly2.lines.length; i2++)
        {
            var doesIntersect = this.lines[i].intersect(poly2.lines[i2]);
                    
            if (doesIntersect != false)
                return doesIntersect;
        }
    }
        
    return false;
}

playerStructure = [];
playerStructure[0] = new point(25, 0);
playerStructure[1] = new point(50, 50);
playerStructure[2] = new point(0, 50);
playerPolygon = new polygon(new point(0, 0), new point(25, 25), playerStructure);

polygons = [];

function start()
{
    testGame = new game();
    testGame.sctx.fillStyle = "lightBlue";
    testGame.sctx.rect(0, 0, 800, 800);
    testGame.sctx.fill();
        
    playerPolygon.color = "blue";
    playerPolygon.width = 1;
        
    playerStructure = [];
    playerStructure[0] = new point(25, 0);
    playerStructure[1] = new point(50, 50);
    playerStructure[2] = new point(0, 50);
        
    for (var i = 0; i < 1000; i++)
    {
        polygons[i] = new polygon(randomPoint(), new point(25, 25), playerStructure);
    }
    console.log(polygons.length);
}

function randomPoint()
{
    return new point(Math.floor(Math.random() * 500), Math.floor(Math.random() * 500));
}

function update()
{
    testGame.update();
    
    if (testGame.isKeyDown(87)) //W
        playerPolygon.translate(new point(0, -0.1 * testGame.deltaTime));
	
    if (testGame.isKeyDown(83)) //S
        playerPolygon.translate(new point(0, 0.1 * testGame.deltaTime));
	
    if (testGame.isKeyDown(65)) //A
        playerPolygon.translate(new point(-0.1 * testGame.deltaTime, 0));
	
    if (testGame.isKeyDown(68)) //D
        playerPolygon.translate(new point(0.1 * testGame.deltaTime, 0));
	
    if (testGame.isKeyDown(81)) //Q
    {
        playerPolygon.rotate(-0.1 * testGame.deltaTime);
    }
	
    if (testGame.isKeyDown(69)) //E
    {
        playerPolygon.rotate(0.1 * testGame.deltaTime);
    }
            
    playerPolygon.update();
        
    for (var i = 0; i < polygons.length; i++)
    {
        polygons[i].update();
    }
            
    //Test intersection code
    var doesIntersect = false;
    for (var i = 0; i < polygons.length; i++)
    {
        if (playerPolygon.intersect(polygons[i]) != false)
            doesIntersect = true;
    }
            
    if (doesIntersect)
        playerPolygon.color = 'red';
    else 
        playerPolygon.color = 'blue';
        
    draw(testGame.sctx);
}

function draw(sctx)
{
    clear(sctx);
	
    playerPolygon.draw(sctx);
        
    for (var i = 0; i < polygons.length; i++)
    {
        polygons[i].draw(sctx);
    }
	
    drawText("FPS: " + testGame.fps, 600, 200, 'green', sctx);
}

function clear(sctx)
{
    sctx.fillStyle = "lightBlue";
    sctx.rect(0, 0, 800, 800);
    sctx.fill();
}

function drawText(text, x, y, color, sctx)
{
    sctx.fillStyle = color;
    sctx.font = '30px Sans-Serif';
    sctx.fillText(text, x, y);
}





