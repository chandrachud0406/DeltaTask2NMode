var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

//Bakcground image
var background = new Image();
background.src = "images/12345.jpg"

var bulletImage = new Image();
bulletImage.src = "images/image.png";

//Audio 
var bgScore = new Audio("audio/bgscore.mp3")
var gameOver = new Audio("audio/gameover.wav");


//Paddle Charecteristics
var paddleHeight = 50;
var paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth) / 2;
var paddleY = canvas.height-paddleHeight;
var rightPressed = false;
var leftPressed = false;

// Bullet charecteristics 
var bulletRadius = 3;
var bulletColor = 'rgb(0, 0, 0)';
var playerScore = 0;
var flag = 0;
var flagScore = 0;

//To score high scores
var scoreArray = [0, 0, 0, 0, 0];

//localStorage.setItem('highscore', JSON.stringify(scoreArray));
function highScoreTable()
{
    if(!localStorage.getItem('highscore')) 
    {
        localStorage.setItem('highscore', JSON.stringify(scoreArray));
    }

    var localArray = JSON.parse(localStorage.getItem('highscore'));
    
    if(flagScore == 0)
    {
        localArray.push(playerScore);
        localArray.sort( (a, b) =>  b - a);
        localArray = localArray.slice(0, 5);
    }
    flagScore = -1;

    scoreArray = localArray;
    localStorage.setItem('highscore', JSON.stringify(scoreArray));    
}

//To view the high scores of the played games
var highScoreButton = document.getElementById('highscore');
highScoreButton.onclick = function() 
{   
    highScoreTable();
    var item = document.getElementById('scoretable');
    
    if(item.className == 'hidden') 
    item.className = 'unhidden';

    else  if(item.className == 'unhidden')
    item.className = 'hidden';
    
    for(let i = 1; i <= 5; i++)
    {
        var idRow = "row" + i;
        var scoreRow = document.getElementById(idRow);

        scoreRow.textContent = String(i) +". " + String(scoreArray[i-1]);
    }
}


//To get random numer between min and max
function getRandomInt(min, max) 
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

//TO generate random colors
var colors = ['#4f0808','#5cf441','#f45841', '#41f4dc','#f441e5', '#415bf4'];
function getRandomColor()
{
    return colors[Math.floor(Math.random() * colors.length)];
}

//Create rocks with the given parameters
var rockers = [];
function Rocks(x, y, dx, dy, radius, color, parent)
{
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
    this.strength = Math.floor(this.radius);
    this.parent = parent;

    this.update = function()
    {
        this.x += this.dx;
        this.y += this.dy;

        if( this.x < this.radius || this.x > (canvas.width - this.radius) )
        this.dx = - this.dx;

        if( this.y < this.radius || this.y > (canvas.height - this.radius) )
        this.dy = -this.dy;

        else
        this.dy += 0.05;

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
        ctx.font = "20px Georgia";
        ctx.fillStyle = 'white';
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.fillText(this.strength, this.x, this.y) ;
        ctx.fill();
    };

}

//Create rocks alternatively from the left and right sides
var c = 0;
var timeRocks = 8000;
function createRocks()
{
    clearInterval(interRocks);
    if(c % 2 == 0) 
    {
        var x, y, dx, dy, radius, color;
        x = canvas.width - 100;
        y = canvas.height/2;
        dx = getRandomInt(-4, -1);
        dy = getRandomInt(-2, 2);
        radius = getRandomInt(30, 70);
        color =  getRandomColor();
        rockers.push(new Rocks(x, y, dx, dy, radius, color, true));
        c++;
    }

    else 
    {
        var x, y, dx, dy, radius, color;
        x = 100;
        y = canvas.height/2;
        dx = getRandomInt(1, 4);
        dy = getRandomInt(-2, 2);
        radius = 5 * getRandomInt(5, 10);
        color =  getRandomColor();
        rockers.push(new Rocks(x, y, dx, dy, radius, color, true));
        c++;
    }

    timeRocks = 10000 -  (5 *playerScore);

    if(timeRocks < 4000 )
    timeRocks = 10000;

    interRocks = setInterval(createRocks, timeRocks);

    console.log(rockers);
}
var interRocks = setInterval(createRocks, timeRocks);


//Redraw rocks position in every frame
function drawRocks() 
{
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
            /*
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();*/
            ctx.drawImage(bulletImage,this.x,this.y-30,10,30);

        };

        this.update = function()
        {
            this.y += -20;
        };
};

//Create bullet at an increasing rate is pressed
var time = 100;
function createBullet()
{
    var bullets  = new bullet;
    bullets.init();

    clearInterval(inter);
    time = 100 -  (0.9 *playerScore);

    if(time < 50)
    time = 50;

    inter = setInterval(createBullet, time);
}
var inter = setInterval(createBullet, time);

//Update the new position of rocks, paddle, bullets etc for the new frame
function update() 
{
    if(rightPressed && paddleX < canvas.width - paddleWidth)
    paddleX += 12;

    else if(leftPressed && paddleX > 0)
    paddleX -= 12;
    
    for(var ix = sprites.length;  ix--;)
    {
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
        var strength = r.strength;

        if(r.radius + b.radius >= (Math.hypot(r.x - b.x, r.y - b.y)))
        {
            //When it is obtained from some other rock destroy it on zero value
            if(r.strength == 1 && r.parent == false)
            {
                sprites.splice(bi, 1);
                rockers.splice(k, 1);
                playerScore += 1;
            }

            //When is is created from sides split into two
            else if(r.strength == 1 && r.parent == true)
            {
                sprites.splice(bi, 1);
                rockers.push(new Rocks(r.x, r.y, r.dx, r.dy, r.radius/2, r.color, false));
                rockers.push(new Rocks(r.x, r.y, -r.dx, r.dy, r.radius - (r.radius/2), r.color, false));
                rockers.splice(k, 1);
                playerScore += 1;
            }
            //Reduce the strength by 1 on bullet contact
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
    ctx.drawImage(background,0,0,canvas.width, canvas.height);    
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
    
    if(mute == false)
    bgScore.play();  
    
    if(mute == true)
    bgScore.pause();

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
        bgScore.pause();
        gameOver.play();
        ctx.drawImage(background,0,0, canvas.width, canvas.height);
        var text = "Game over! \n" + "Your score: " + playerScore + ' \n' + "Press space to play new game";
        ctx.fillStyle = 'red';
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        ctx.fill();
        cancelAnimationFrame(raf);
    }
}

requestAnimationFrame(draw);


//To resart game on space bar press
var gamePause = false;
var playButton = document.getElementById('play');
document.addEventListener('keypress', function(e)
{
    if(e.keyCode == 32 && flag == -1)
    {
        document.location.reload();
        gameOver.pause();
        //flagScore = -1;
    }

    if(e.keyCode == 32 && flag == 0) 
    {
        gamePause = !gamePause;
        if(gamePause == true)
        {
            cancelAnimationFrame(raf);
        }     
        
        else
        {
            draw();
        }
    }

});

var mute = false;
var muteButton = document.getElementById('mute');

muteButton.onclick = function() 
{
    if(mute == false && gamePause == false)
    {
        muteButton.textContent = "Unmute";
        mute = true;
    }

    else if(mute == true && gamePause == false)
    {
        muteButton.textContent = "Mute";
        mute = false;
    }

    else if(mute == true && gamePause == true)
    {
        bgScore.play();
        muteButton.textContent = "Mute";
        mute = false;
    }

    else if(mute == false && gamePause == true)
    {
        bgScore.pause();
        muteButton.textContent = "Unmute";
        mute = true;
    }

}

var resetButton = document.getElementById('reset');

resetButton.onclick = function()
{
    document.location.reload(); 
}

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
