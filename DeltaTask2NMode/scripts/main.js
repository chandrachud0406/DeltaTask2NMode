var body = document.querySelector('body');
var canvas = document.createElement('canvas');

canvas.width = 1840;
canvas.height = 942;
canvas.id = 'myCanvas';

body.appendChild(canvas);

var ctx = canvas.getContext('2d');

//Paddle Charecteristics
var paddleHeight = 50;
var paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth) / 2;
var paddleY = canvas.height-paddleHeight;
var rightPressed = false;
var leftPressed = false;

// Bullet charecteristics 
var vx = 7;
var vy = 0;
var rockX = canvas.width / 2;
var rockY = canvas.height / 2;
var bulletRadius = 3;
var bulletColor = 'rgb(0, 0, 0)';
var playerScore = 0;
var flag = 0;


//TO get random numer between min and max
function getRandomInt(min, max) 
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

//TO generate random colors
var colors = ['#4f0808','#5cf441','#f45841', '#41f4dc','#f441e5', '#415bf4'];
function getRandomColor(){
    return colors[Math.floor(Math.random() * colors.length)];
}

//Create rocks with the given parameters
var rockers = [];
function Rocks(x, y, dx, dy, radius, color)
{
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
    this.strength = Math.floor(this.radius / 5);
    
    this.update = function()
    {
        this.x += this.dx;
        this.y += this.dy;

        if( this.x < this.radius || this.x > (canvas.width - this.radius) )
        this.dx = - this.dx;

        if( this.y < this.radius || this.y > (canvas.height - this.radius) )
        this.dy = -this.dy;

        else
        this.dy += 1;

        if( (this.x > paddleX) && (this.x < paddleX + paddleWidth) && (this.y > paddleY) && (this.y < paddleY + paddleHeight))
        {
            flag = -1;
        }

        this.draw();    
    };

    this.draw = function() 
    {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.beginPath();
        ctx.font = "40px Georgia";
        ctx.fillStyle = 'white';
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.fillText(this.strength, this.x, this.y) ;
        ctx.fill();
    };

}

//Create rocks alternatively from the left and right sides
var c = 0;
function createRocks()
{
    if(c % 2 == 0) {
        var x, y, dx, dy, radius, color;
        x = canvas.width - 100;
        y = canvas.height/2;
        dx = getRandomInt(-4, -1);
        dy = getRandomInt(-2, 2);
        radius = 5 * getRandomInt(5, 10);
        color =  getRandomColor();
        rockers.push(new Rocks(x, y, dx, dy, radius, color));
        c++;
    }

    else {
        var x, y, dx, dy, radius, color;
        x = 100;
        y = canvas.height/2;
        dx = getRandomInt(1, 4);
        dy = getRandomInt(-2, 2);
        radius = 5 * getRandomInt(5, 10);
        color =  getRandomColor();
        rockers.push(new Rocks(x, y, dx, dy, radius, color));
        c++;
    }
}

//To create rocks at interval of three seconds alternatively from left / right
setInterval(createRocks, 3000);


//Redraw rocks position in every frame
function drawRocks() {
    for(let i = 0; i < rockers.length; i++)
    {
        rockers[i].update();
    }
}

//Redraw paddle in every frame
function drawPaddle() 
{
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath(); 
}

//Creates bullets and stores them
var sprites = [];
function bullet()  
{
        this.x = paddleX + (paddleWidth/2),
        this.y = paddleY,
        this.radius =  5,
        this.color = 'black',

        this.init = function() {
            sprites.push(this);
        };
        
        this.redraw = function() 
        {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        };

        this.update = function()
        {
            this.y += -10;
        };
};

//Create bullet when space is pressed
var time = 100;
function createBullet()
{
    var bullets  = new bullet;
    bullets.init();

    clearInterval(inter);
    time = 100 -  (0.9 *playerScore);
    inter = setInterval(createBullet, time);
}
var inter = setInterval(createBullet, time);


//Update the new position of rocks, paddle, bullets etc for the new frame
function update() {
    if(rightPressed && paddleX < canvas.width - paddleWidth)
    paddleX += 7;

    else if(leftPressed && paddleX > 0)
    paddleX -= 7;
    
    for(var ix = sprites.length;  ix--;){
            sprites[ix].update();

            if(sprites[ix].y < 0)
            sprites.splice(ix, 1);
    }

}


//To detect collision of bullet with rocks, decrease strength and track score based on no of bullets hit
function collisionDetection(b, bi) 
{
    for(let k = 0; k < rockers.length; k++)
    {
        var r = rockers[k];
        if(r.radius + b.radius >= (Math.hypot(r.x - b.x, r.y - b.y)))
        {
            if(r.strength == 1)
            {
                sprites.splice(bi, 1);
                rockers.splice(k, 1);
                playerScore += 1;
            }

            else
            {
                r.strength -= 1;
                sprites.splice(bi, 1);
                playerScore += 1;
            }
        }
    }
}

//Update player score
function updateScore()
{
    ctx.font = '30px sans-serif';
    var text = 'Your score: ' + playerScore;
    ctx.fillStyle = 'blue';
    ctx.fillText(text, 1500, 50);    
}

//To redraw rocks, paddle, bullets etc in new frame
function redraw()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);   
    for(var ix = sprites.length; ix--;)
    {
        sprites[ix].redraw();
    }

    drawPaddle();
    drawRocks(); 
    updateScore();
}


//Repeatedly call draw to run every frame and show movement
var raf;
function draw() 
{
    update();
    
    for(let j = 0; j < sprites.length; j++)
    {
        collisionDetection(sprites[j], j);
    }
    redraw();
    if(flag == 0)
    raf = requestAnimationFrame(draw);

    else if(flag == -1)
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var text = "Game over! \n" + "Your score: " + playerScore + ' \n' + "Press space to play new game";
        ctx.fillStyle = 'red';
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        ctx.fill();
        cancelAnimationFrame(raf);
    }
}

requestAnimationFrame(draw);


//To resart game on space bar press
document.addEventListener('keypress', function(e)
{
    if(e.keyCode == 32 && flag == -1)
    document.location.reload();
});

//To detect if right and left are being pressed
document.addEventListener('keydown', keyDownHandler, false);
function keyDownHandler(e) 
{
    if(e.key == "Right" || e.key == "ArrowRight" || e.keyCode == 68) 
        rightPressed = true;

    else if(e.key == "Left" || e.key == "ArrowLeft" || e.keyCode == 65) 
        leftPressed = true;
}

document.addEventListener('keyup', keyUpHandler, false);
function keyUpHandler(e) 
{
    if(e.key == "Right" || e.key == "ArrowRight" || e.keyCode ==68) 
        rightPressed = false;

    else if(e.key == "Left" || e.key == "ArrowLeft" || e.keyCode == 65)
        leftPressed = false;
}


