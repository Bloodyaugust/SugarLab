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
    this.screenSize = new point(this.canvas.width, this.canvas.height);
    this.startTime = new Date().getTime();
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.framesThisSecond = 0;
    this.lastFrameAggregation = new Date;
    this.deltaBuffer = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    this.keysDown = [];
    this.mouseLocation = new point(0, 0);
    this.mouseButton = 0;
    
    window.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    window.addEventListener("keyup", this.handleKeyUp.bind(this), false);
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this), false);
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this), false);
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this), false);
    window.setInterval(function() {
        update();
    }, 1);
}

game.prototype.update = function() {
    var now = new Date;
    this.deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    
    this.deltaBuffer.shift();
    this.deltaBuffer.push(this.deltaTime);
    
    var avgDelta = 0;
    var dBufLength = this.deltaBuffer.length;
    for (var i = 0; i < dBufLength; i += 1) {
        avgDelta += this.deltaBuffer[i];
    }
    avgDelta = avgDelta / dBufLength;
    
    this.framesThisSecond++;
    if (now - this.lastFrameAggregation >= 1000) {
        this.fps = this.framesThisSecond;
        this.framesThisSecond = 0;
        this.lastFrameAggregation = now;
    }
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

game.prototype.handleMouseMove = function (event)
{
    this.mouseLocation = new point(event.clientX - 7, event.clientY - 7); //Sevens account for mouse hotspot offset
}

game.prototype.handleMouseDown = function (event)
{
    this.mouseButton = event.keyCode;
}

game.prototype.handleMouseUp = function (event)
{
    this.mouseButton = 0;
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

game.prototype.isMouseButtonDown = function (mouseButton)
{
    if (this.mouseButton === 1 && mouseButton === 'left') {
        return true;
    }
    
    if (this.mouseButton === 2 && mouseButton === 'middle') {
        return true;
    }
    
    if (this.mouseButton === 3 && mouseButton === 'right') {
        return true;
    }
    
    return false;
}

game.prototype.clearScreen = function (clearColor)
{
    this.sctx.fillStyle = clearColor;
    this.sctx.rect(0, 0, this.screenSize.x, this.screenSize.x);
    this.sctx.fill();
}

function point(x, y)
{
    this.x = x;
    this.y = y;
}

point.prototype.translate = function (translateBy)
{
    this.x += translateBy.x;
    this.y += translateBy.y;
}

point.prototype.getRotated = function (origin, angle)
{
    var cos = Math.cos(angle * 0.0174532925);
    var sin = Math.sin(angle * 0.0174532925);
        
    var newX = this.x - origin.x;
    var newY = this.y - origin.y;
            
    var rotatedX = newX * cos - newY * sin;
    var rotatedY = newX * sin + newY * cos;
        
    var finalX = rotatedX + origin.x;
    var finalY = rotatedY + origin.y;
    
    return new point(finalX, finalY);
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
    this.points = this.structurePoints.clone(); //Re-write to add location
    this.lines = [];
    for (i = 0; i < this.points.length; i++)
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
        var newPoint = this.structurePoints[i].getRotated(this.origin, this.rotation);
        newPoint.translate(this.location);
        this.points[i] = newPoint.clone();
    }
        
    this.lines = [];
    for (i = 0; i < this.points.length; i++)
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
    for (var i = 1; i < this.points.length; i++)
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

function randomPoint()
{
    return new point(Math.floor(Math.random() * 500), Math.floor(Math.random() * 500));
}

function drawText(text, location, color, sctx)
{
    sctx.fillStyle = color;
    sctx.font = '30px Sans-Serif';
    sctx.fillText(text, location.x, location.y);
}





