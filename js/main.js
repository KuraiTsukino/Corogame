window.onload = () => {
    document.getElementsByClassName('start').onclick = () => {
        startGame(); 
    }

const $canvas = document.querySelector("#canvas");
const $button = document.querySelector(".button");
const ctx = $canvas.getContext("2d");

// Variables globales.

let frames = 0;
const GRAVITY = 0.98;
const friction = 0.7;
let intervalId;

// Clases del juego con propiedades y métodos.
class Board {
    constructor() {
        this.x = 0; 
        this.y = 0;
        this.width = $canvas.width;
        this.height = $canvas.height;
        this.image = new Image();
        this.image.src = "images/Background.jpg"
    }

    draw () {
        this.x--;
        // Efecto de fondo infinito.
        if (this.x < -this.width) this.x = 0;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage (this.image, this.x + this.width, this.y, this.width, this.height);
    } 
}

class Character {
    constructor(x, y) {
        this.x = x; 
        this.y = y;
        this.width = 170;
        this.height = 170;
        this.image = new Image ();
        this.image.src = "images/coronavirus.png"
        this.move = 10;
        // caída
        this.vy = 0;
        this.jumpStrength = 8;
        this.jumps = 0; 
        this.jumping = false;
    }
    
    draw() {
        this.vy += GRAVITY;
        this.y += this.vy;
        // para que no se salga del margen inferior
        if (this.y > $canvas.height - this.height)
            this.y = $canvas.height - this.height;
            this.jumps = 0; 
            this.jumping = false;
        // para que no se salga del margen lateral derecho
        if (this.x > 900)
            this.x = 840;
        // para que no se salga del margen lateral izquierdo
        if (this.x < 0)
            this.x = 0;
        // para que no se salga del margen superior
        if (this.y < 0 )
            this.y = 0;

        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    jump() {
        if (this.jumps >=1) {
            this.jumping = true;
        }
        if (!this.jumping) {
            this.jumps++;
            this.vy = -this.jumpStrength;
        }
    }

    // métodos de movimientos.

    moveDown() {
        this.y += this.move;
    }
    moveLeft() {
        this.x -= this.move;
    }
    moveRight() {
        this.x += this.move;
    }
    moveUp() {
        this.y -= this.jump; 
    }
    stop() {
        this.vx = 0;
    }

    // método para el toque con los obstáculos.

    isTouchingEnemy(enemy) {
        return (
            this.x+25 < enemy.x + enemy.width-7 &&
            this.x + this.width-25 > enemy.x-7 &&
            this.y+25 < enemy.y + enemy.height-7 &&
            this.y + this.height-25 > enemy.y-7
        );
    }
    isTouchingFriend(friend) {
        return (
            this.x+25 < friend.x + friend.width-7 &&
            this.x + this.width-20 > friend.x-7 &&
            this.y+25 < friend.y + friend.height-7 &&
            this.y + this.height-20 > friend.y-7
        );
    }
    isTouchingVaccine(vaccine) {
        return (
            this.x+30 < vaccine.x + vaccine.width &&
            this.x + this.width-30 > vaccine.x &&
            this.y+30 < vaccine.y + vaccine.height &&
            this.y + this.height-30 > vaccine.y
        );
    }
}

class Enemy extends Character {
    constructor(x, y) {
        super(x, y);
        this.image = new Image ();
        this.image.src = "images/enemy.png"
        this.height = 60
        this.width = 60
        this.liveStatus = true;
    }
    
    draw() {
        this.x--;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    isTouching(obj) {
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y);
        }
}

class Friend extends Character {
    constructor(x, y) {
        super(x, y);
        this.image = new Image ();
        this.image.src = "images/friend.png"
        this.height = 60
        this.width = 60
        this.liveStatus = true;
    }
    
    draw() {
        this.x--; 
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);       
    }

    isTouching(obj) {
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y);
        }
}

class Vaccine extends Character {
    constructor(x, y) {
        super(x, y);
        this.image = new Image ();
        this.image.src = "images/vaccine.png"
        this.height = 80
        this.width = 80
        this.liveStatus = true;
    }
    
    draw() {
        this.x--; 
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);       
    }

    isTouching(obj) {
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y);
        }
}

class Bullet {
    constructor(x, y) {
        this.x = coro.x+98;
        this.y = coro.y+95;
        /*this.width = 10;
        this.height = 10;
        this.color = "yellow"*/
        this.image = new Image();
        this.image.src = "images/gota.png"
        this.width = 20; 
        this.height = 20;
        this.audio = new Audio();
        this.audio.src = "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-61905/zapsplat_cartoon_laser_shoot_64776.mp3"
    }

    draw() {
        this.x++;
        /*ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);*/
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    
    isTouchEnemy(enemy) {
        return (
            this.x < enemy.x + enemy.width-7 &&
            this.x + this.width > enemy.x-7 &&
            this.y < enemy.y + enemy.height-7 &&
            this.y + this.height > enemy.y-7
        );
    }
    isTouchFriend(friend) {
        return (
            this.x < friend.x + friend.width-7 &&
            this.x + this.width > friend.x-7 &&
            this.y < friend.y + friend.height-7 &&
            this.y + this.height > friend.y-7
        );
    }
    isTouchVaccine(vaccine) {
        return (
            this.x < vaccine.x + vaccine.width &&
            this.x + this.width > vaccine.x &&
            this.y < vaccine.y + vaccine.height &&
            this.y + this.height > vaccine.y
        );
    }
    // sonido del bullet.
    shootSound() {
        this.audio.volume = 0.5;
        this.audio.play()
    }
}

class Score {
    constructor() {
        this.x = $canvas.width-100
        this.y = 20;
        this.score = 0
    };

    draw () {
        ctx.font = "40px sans-serif";
        ctx.strokeText(this.score, $canvas.width -100, 100)
        ctx.fillText = "white";
    }

    scoreIncrement() {

        if (bullets.isTouchingEnemy) {this.score++}
        if (bullets.isTouchingVaccine) {this.score++}
        if (bullets.isTouchingFriend) {this.score--}
    }

    //diedEnemies.length + diedVaccines.length - diedFriends.length;
}

class GameOvered {
    constructor() {
        this.x = 0
        this.y = 0
        this.width = $canvas.width
        this.height = $canvas.height
        this.image = new Image
        this.image.src = "images/gameOvered.png"
        this.audio = new Audio
        this.audio.src = "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-61905/zapsplat_multimedia_game_sound_plucked_warm_bold_short_end_complete_riff_63801.mp3"
    }

    draw () {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
}

// Instancias de las clases.

const board = new Board();
const coro = new Character (30, 0, 60);
const gameOvered = new GameOvered();
const allEnemies = [];
const allFriends = [];
const allVaccines = [];
const bullets = [];
const keys = {};
let score = new Score;
let isGameOver = false;
let deadEnemies = [];
let deadFriends = [];
let deadVaccines = [];

// Funciones del flujo del juego.

function startGame() {
    if (intervalId) return;
    intervalId = setInterval(() => {
        update();
    }, 1000 / 60);
}

// Funciones de apoyo.

function clearCanvas() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
}

function generateEnemies() {
    if (frames % 200 === 0) {
        const y = Math.floor(Math.random() * 380);
        const enemy = new Enemy (900, y);
            allEnemies.push(enemy);
            // para limpiar el array de los enemigos.
            allEnemies.forEach((enemy, index) => {
                if (enemy.x + enemy.width < 0) allEnemies.splice(1, index);
            });
    }
}

function drawEnemy() {
    allEnemies.forEach((enemy) => {
        enemy.draw()
    })
}

function generateFriends() {
    if (frames % 300 === 0) {
        const y = Math.floor(Math.random() * 380);
        const friend = new Friend (900, y);
            allFriends.push(friend);
            // para limpiar el array de los amigos.
            allFriends.forEach((friend, index) => {
                if (friend.x + friend.width < 0) allFriends.splice(1, index);
            });
    }
}

function drawFriend() {
    allFriends.forEach((friend) => {
        friend.draw()
    })
}

function generateVaccine() {
    if (frames % 350 === 0) {
        const y = Math.floor(Math.random() * 380);
        const vaccine = new Vaccine (900, y);
            allVaccines.push(vaccine);
            // para limpiar el array de las vacunas.
            allVaccines.forEach((vaccine, index) => {
                if (vaccine.x + vaccine.width < 0) allVaccines.splice(1, index);
            });
    }
}

function drawVaccine() {
    allVaccines.forEach((vaccine) => {
        vaccine.draw()
    })
}

function checkCollitions() {
    allEnemies.forEach((enemy) => {
        if (coro.isTouchingEnemy(enemy)) {
            clearInterval(intervalId);
            isGameOver = true;
        }
    });
    allFriends.forEach((friend) => {
        if (coro.isTouchingFriend(friend)) {
            clearInterval(intervalId);
            isGameOver = true;
        }
    });
    allVaccines.forEach((vaccine) => {
        if (coro.isTouchingVaccine(vaccine)) {
            clearInterval(intervalId);
            isGameOver = true;
        }
    });
}

function printBullets() {
    bullets.forEach(bullets => bullets.draw())

    // Para desaparecer las balas del arreglo.
/*
    bullets.forEach((bullets, index) => {
        if (bullets.x + bullets.width > $canvas.width) {
            bullets.splice(1, index);
        }
    });
*/
    // Matar enemigos.

    bullets.forEach ((bullet) => {
        allEnemies.forEach((enemy) => {
            if (enemy.isTouching(bullet)) {
                allEnemies.splice(enemy) && bullets.splice(bullet) && deadEnemies.push(enemy);
            }
        });
    });

    // Matar amigos.

    bullets.forEach ((bullet) => {
        allFriends.forEach((friend) => {
            if (friend.isTouching(bullet)) {
                allFriends.splice(friend) && bullets.splice(bullet) && deadFriends.push(friend);
            }
        });
    });

    // Matar vacunas.

    bullets.forEach ((bullet) => {
        allVaccines.forEach((vaccine) => {
            if (vaccine.isTouching(bullet)) {
                allVaccines.splice(vaccine) && bullets.splice(bullet) && deadVaccines.push;
            }
        });
    });
}

function dieEnemy() {
    allEnemies.forEach((enemy, index) => {
        if (enemy.liveStatus === false) {
            allEnemies.splice (index,1);
        }
    });
}

function dieFriend() {
    allFriends.forEach((friend, index) => {
        if (friend.liveStatus === false) {
            allFriends.splice (index,1);
        }
    });
}

function dieVaccine() {
    allVaccines.forEach((vaccine, index) => {
        if (vaccine.liveStatus === false) {
            allVaccines.splice (index,1);
        }
    });
}
function drawScore() {
    allEnemies.forEach((enemy) => {
        if(enemy.y + enemy.height > coro.y + coro.height) {
            score.scoreIncrement ()
        }
    });
    score.draw()
}

/*
function drawScore(deadEnemies, deadFriends, deadVaccines, finalScore, otherScore) {
     let finalScore = deadEnemies.concat(deadVaccines).reduce((x, y) => x + y); 
     let otherScore = finalScore.concat(deadFriends).reduce((x, y) => x - y);

    score.draw() {
        return otherScore
    }
}*/

function gameOver() {
    if (isGameOver) {
        gameOvered.draw()
        /*ctx.font = "50px sans-serif";
        ctx.fillStyle = "white";
        ctx.strokeText("Game Over", $canvas.width / 3, $canvas.height / 2);*/
    }
}

// Funciones de interacción con el usuario.

function checkKeys() {
    if (keys.ArrowLeft) coro.moveLeft();
    if (keys.ArrowRigth) coro.moveRight();
    if (keys.ArrowUp) coro.jump();
    if (keys.ArrowDown) coro.moveDown();
    if (keys.z && frames % 20 === 0 ) {
       const bullet = new Bullet (coro.x+98, coro.y+95);
       bullets.push(bullet);
       bullet.shootSound();
    }
}

document.onkeydown = (event) => {
    keys[event.key] = true;
}

document.onkeyup = (event) => {
    keys[event.key] = false;
    coro.stop();
}

// Inicializa el juego.

function update() {
    frames++;
    startGame();
    checkKeys();
    generateEnemies();
    generateFriends();
    generateVaccine();
    clearCanvas();
    board.draw();
    coro.draw();
    drawEnemy();
    drawFriend();
    drawVaccine();
    printBullets()
    checkCollitions();
    dieEnemy();
    dieFriend();
    dieVaccine();
    drawScore();
    gameOver();
}

$button.onclick = startGame; 

}