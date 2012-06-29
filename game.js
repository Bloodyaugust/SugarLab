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
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  }return newObj;
};

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
    
    if (d == 0)
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

startTime = new Date();
startTime = startTime.getTime();
lastTime = startTime;
deltaTime = 0;
deltaSeconds = 0;
frames = 0;
lastFps = 0;

keysDown = [];

playerStructure = [];
playerStructure[0] = new point(25, 0);
playerStructure[1] = new point(50, 50);
playerStructure[2] = new point(0, 50);
playerPolygon = new polygon(new point(0, 0), new point(25, 25), playerStructure);

debugDot = [];
debugDot[0] = new point(25, 0);
debugDot[1] = new point(50, 50);
debugDot[2] = new point(0, 50);
debugPolygon = new polygon(new point(150, 150), new point(25, 25), debugDot)

polygons = [];

function start()
{
	var screen = document.getElementById("gameCanvas");
	var sctx = screen.getContext("2d");
	sctx.fillStyle = "lightBlue";
	sctx.rect(0, 0, 800, 800);
	sctx.fill();
	
	window.setInterval(function() {update(sctx);}, 0);
	
	window.addEventListener("keydown", function(event) {handleKeyDown(event.keyCode)});
	window.addEventListener("keyup", function(event) {handleKeyUp(event.keyCode)});
        
        playerPolygon.color = "blue";
        playerPolygon.width = 1;
        
        debugPolygon.color = "red";
        debugPolygon.width = 1;
        
        playerStructure = [];
        playerStructure[0] = new point(25, 0);
        playerStructure[1] = new point(50, 50);
        playerStructure[2] = new point(0, 50);
        
        for (var i = 0; i < 2000; i++)
            {
                polygons[i] = new polygon(randomPoint(), new point(25, 25), playerStructure);
            }
        console.log(polygons.length);
}

function randomPoint()
{
    return new point(Math.floor(Math.random() * 500), Math.floor(Math.random() * 500));
}

function handleKeyDown(keyCode)
{
	var alreadyCaptured = false;
	
	for (var i = 0; i < keysDown.length; i++)
		{
			if (keysDown[i] == keyCode)
				alreadyCaptured = true;
		}
	
	if (!alreadyCaptured)
		keysDown.push(keyCode);
}

function handleKeyUp(keyCode)
{
	for (var i = 0; i < keysDown.length; i++)
		{
			if (keysDown[i] == keyCode)
				keysDown.splice(i, 1);
		}
}

function isKeyDown(keyCode)
{
	for (var i = 0; i < keysDown.length; i++)
	{
		if (keysDown[i] == keyCode)
			return true;
	}
	
	return false;
}

function update(sctx)
{
	now = new Date().getTime();
	deltaTime = now - lastTime;
	lastTime = now;
	deltaSeconds += deltaTime;
	frames++;
	
	if (deltaSeconds >= 1000)
		{
			deltaSeconds = 0; 
			lastFps = frames;
			frames = 0;
		}
	
	if (isKeyDown(87)) //W
		playerPolygon.translate(new point(0, -0.1 * deltaTime));
	
	if (isKeyDown(83)) //S
		playerPolygon.translate(new point(0, 0.1 * deltaTime));
	
	if (isKeyDown(65)) //A
		playerPolygon.translate(new point(-0.1 * deltaTime, 0));
	
	if (isKeyDown(68)) //D
		playerPolygon.translate(new point(0.1 * deltaTime, 0));
	
	if (isKeyDown(81)) //Q
            {
		playerPolygon.rotate(-0.1 * deltaTime);
                debugPolygon.rotate(-0.1 * deltaTime);
            }
	
	if (isKeyDown(69)) //E
            {
		playerPolygon.rotate(0.1 * deltaTime);
                debugPolygon.rotate(0.1 * deltaTime);
            }
            
        playerPolygon.update();
        debugPolygon.update();
        
        for (var i = 0; i < polygons.length; i++)
            {
                polygons[i].update();
            }
            
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
        
	draw(sctx);
}

function draw(sctx)
{
	clear(sctx);
	
	playerPolygon.draw(sctx);
        debugPolygon.draw(sctx);
        
        for (var i = 0; i < polygons.length; i++)
            {
                polygons[i].draw(sctx);
            }
	
	drawText("FPS: " + lastFps, 0, 200, sctx);
}

function clear(sctx)
{
    sctx.fillStyle = "lightBlue";
    sctx.rect(0, 0, 800, 800);
    sctx.fill();
}

function drawText(text, x, y, sctx)
{
    sctx.fillStyle = 'black';
    sctx.font = '30px Sans-Serif';
    sctx.fillText(text, x, y);
}





