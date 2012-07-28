Object.prototype.clone = function() {
    var newObj = (this instanceof Array) ? [] : {};
    for (var i in this) {
        if (i === 'clone') continue;
        if (this[i] && typeof this[i] === "object") {
            newObj[i] = this[i].clone();
        }
        else newObj[i] = this[i]
    }
    return newObj;
};

Array.prototype.last = function() {
    return this[this.length - 1];
}
    
Array.prototype.lastIndex = function() {
    return this.length - 1;
}

var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}


floatEquals = function(f1, f2) {
    if (Math.abs(f1 - f2) < 0.00000001)
        return true;
    return false;
}

requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
        window.setTimeout(callback, 1000/60);
    };
})();

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
    this.keysDownLength = [];
    this.mouseLocation = new point(0, 0);
    this.mouseButton = 3;
    this.mouseDownThisFrame = 0;
    this.mouseUpThisFrame = 0;
    this.browser = '';
    
    window.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    window.addEventListener("keyup", this.handleKeyUp.bind(this), false);
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this), false);
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this), false);
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this), false);
    
    if(window.mozRequestAnimationFrame) {
        this.browser = 'mozilla';
        window.mozRequestAnimationFrame(update);
    }
    
    else
    if(window.webkitRequestAnimationFrame) {
        this.browser = 'webkit';
        window.webkitRequestAnimationFrame(update);
    }
            
    else {
        this.browser = 'ie';
        window.setInterval(function() {
            update();
        }, 1);
    }
    
    this.sctx.fillStyle = 'rgb(0, 0, 0)';
}

game.prototype.loop = function() {
    if (this.browser === 'mozilla') {
        window.mozRequestAnimationFrame(update);
    }
    
    if (this.browser === 'webkit') {
        window.webkitRequestAnimationFrame(update);
    }
    
    if (this.browser === 'ie') {
        
    }
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
    
    this.mouseDownThisFrame -= 1;
    this.mouseUpThisFrame -= 1;
    
    if (this.mouseDownThisFrame < 0)
        this.mouseDownThisFrame = 0;
    if (this.mouseUpThisFrame < 0)
        this.mouseUpThisFrame = 0;
    
    for (i = 0; i < this.keysDownLength.length; i++) {
        this.keysDownLength[i]++;
    }
}

game.prototype.handleKeyDown = function (event)
{
    var keyCode = event.keyCode;
    var alreadyCaptured = false;
	
    for (var i = 0; i < this.keysDown.length; i++)
    {
        if (this.keysDown[i] === keyCode) {
            alreadyCaptured = true;
        }
    }
	
    if (!alreadyCaptured) {
        this.keysDownLength.push(0);
        this.keysDown.push(keyCode);
    }
}

game.prototype.handleKeyUp = function (event)
{
    var keyCode = event.keyCode;
    for (var i = 0; i < this.keysDown.length; i++)
    {
        if (this.keysDown[i] === keyCode) {
            this.keysDownLength.splice(i, 1);
            this.keysDown.splice(i, 1);
        }
    }
}

game.prototype.handleMouseMove = function (event)
{
    this.mouseLocation = new point(event.clientX - 7, event.clientY - 7); //Sevens account for mouse hotspot offset
}

game.prototype.handleMouseDown = function (event)
{
    this.mouseDownThisFrame += 2;
    
    this.mouseButton = event.button;
}

game.prototype.handleMouseUp = function ()
{
    this.mouseDownThisFrame += 2;
    
    this.mouseButton = 3;
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

game.prototype.onKeyDown = function (keyCode)
{
    for (var i = 0; i < this.keysDown.length; i++)
    {
        if (this.keysDown[i] === keyCode)
            if (this.keysDownLength[i] === 1)
                return true;
    }
	
    return false;
}

game.prototype.isMouseDown = function (mouseButton)
{
    if (this.mouseButton === 0 && mouseButton === 'left') {
        return true;
    }
    
    if (this.mouseButton === 1 && mouseButton === 'middle') {
        return true;
    }
    
    if (this.mouseButton === 2 && mouseButton === 'right') {
        return true;
    }
    
    return false;
}

game.prototype.onMouseDown = function() 
{
    if (this.mouseDownThisFrame > 0) 
        return true;
    return false;
}

game.prototype.onMouseUp = function() 
{
    if (this.mouseUpThisFrame > 0) 
        return true;
    return false;
}

game.prototype.clearScreen = function (clearColor)
{
    this.sctx.save();
    this.sctx.fillStyle = clearColor;
    this.sctx.rect(0, 0, this.screenSize.x, this.screenSize.x);
    this.sctx.fill();
    this.sctx.restore();
}

function point(x, y)
{
    this.x = x;
    this.y = y;
    this.pName = 'point';
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

point.prototype.distance = function (p2)
{
    return Math.sqrt(((p2.x - this.x) * (p2.x - this.x)) + ((p2.y - this.y) * (p2.y - this.y)));
}

point.prototype.equals = function (p2)
{
    if (this.x === p2.x && this.y === p2.y)
        return true;
    return false;
}

function line(p1, p2)
{
    this.p1 = p1;
    this.p2 = p2;
}

line.prototype.intersects = function (L2) 
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

function rectangle(location, size)
{
    this.location = location.clone();
    this.size = size.clone();
    this.color = 'black';
    this.points = [
    new point(location.x, location.y), new point(location.x + size.x, location.y), new point(location.x + size.x, location.y + size.y), new point(location.x, location.y + size.y)
    ];
    this.lines = [
    new line(this.points[0], this.points[1]), new line(this.points[1], this.points[2]), new line(this.points[2], this.points[3]), new line(this.points[3], this.points[0])
    ];
    this.origin = new point(this.location.x + this.size.x / 2, this.location.y + this.size.y / 2);
    this.pName = 'rectangle';
}

rectangle.prototype.draw = function (sctx)
{
    sctx.save();
    sctx.strokeStyle = this.color;
    sctx.lineWidth = 1;
    sctx.beginPath();
    sctx.moveTo(Math.floor(this.location.x) + 0.5, Math.floor(this.location.y) + 0.5);
    sctx.lineTo(Math.floor(this.location.x + this.size.x - 1) + 0.5, Math.floor(this.location.y) + 0.5);
    sctx.lineTo(Math.floor(this.location.x + this.size.x - 1) + 0.5, Math.floor(this.location.y + this.size.y - 1) + 0.5);
    sctx.lineTo(Math.floor(this.location.x) + 0.5, Math.floor(this.location.y + this.size.y - 1) + 0.5);
    sctx.closePath();
    sctx.stroke();
    sctx.restore();
}

rectangle.prototype.intersects = function (r2)
{
    if (this.location.x > r2.location.x + r2.size.x || this.location.x + this.size.x < r2.location.x || this.location.y > r2.location.y + r2.size.y || this.location.y + this.size.y < r2.location.y)
        return false;
    return true;
}

rectangle.prototype.transform = function (transform)
{
    this.location.add(transform);
    this.points = [
    new point(this.location.x, this.location.y), new point(this.location.x + this.size.x, this.location.y), 
    new point(this.location.x + this.size.x, this.location.y + this.size.y), new point(this.location.x, this.location.y + this.size.y)
    ];
    this.lines = [
    new line(this.points[0], this.points[1]), new line(this.points[1], this.points[2]), new line(this.points[2], this.points[3]), new line(this.points[3], this.points[0])
    ];
}

rectangle.prototype.setLocation = function (location)
{
    this.location = location.clone();
    this.points = [
    new point(this.location.x, this.location.y), new point(this.location.x + this.size.x, this.location.y), 
    new point(this.location.x + this.size.x, this.location.y + this.size.y), new point(this.location.x, this.location.y + this.size.y)
    ];
    this.lines = [
    new line(this.points[0], this.points[1]), new line(this.points[1], this.points[2]), new line(this.points[2], this.points[3]), new line(this.points[3], this.points[0])
    ];
}

rectangle.prototype.equals = function (r2)
{
    for (var i = 0; i < this.points.length; i++) {
        if (!this.points[i].equals(r2.points[i])) 
            return false;
    }
    
    return true;
}

function polygon(location, origin, structure)
{
    this.location = location.clone();
    this.rotation = 0;
    this.origin = origin.clone();
    this.color = "black";
    this.width = 2;
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

polygon.prototype.intersects = function(poly2)
{
    for (var i = 0; i < this.lines.length; i++)
    {
        for (i2 = 0; i2 < poly2.lines.length; i2++)
        {
            var doesIntersect = this.lines[i].intersects(poly2.lines[i2]);
                    
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
    sctx.save();
    sctx.font = '30px Sans-Serif';
    sctx.fillStyle = color;
    sctx.fillText(text, location.x, location.y);
    sctx.restore();
}

function getLines(points) 
{
    var lines = [];
    for (var i = 0; i < points.length; i++) {
        if (i != points.length - 1)
        {
            lines.push(new line(points[i], points[i+1]));
        }
                
        else 
        {
            lines.push (new line(points[i], points[0]));
        }
    }
    return lines;
}