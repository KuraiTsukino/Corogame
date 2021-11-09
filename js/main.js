// Elementos del DOM.

window.onload = () => {
    document.getElementsByClassName('start').onclick = () => {
        startGame();
    }
}

const $canvas = document.querySelector("canvas");
const $button = document.querySelector("button");
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
        this.image.src = "./../images/background.png"
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
        this.image.src = "./../images/coroface-removebg-preview.png"
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

    isTouching(enemy) {
        return (
            this.x+20 < enemy.x + enemy.width-7 &&
			this.x + this.width-20 > enemy.x-7 &&
			this.y-20 < enemy.y + enemy.height-7 &&
			this.y + this.height-20 > enemy.y-7
        );
    }
    isTouching(friend) {
        return (
            this.x+20 < friend.x + friend.width-7 &&
			this.x + this.width-20 > friend.x-7 &&
			this.y-20 < friend.y + friend.height-7 &&
			this.y + this.height-20 > friend.y-7
        );
    }
    isTouching(vaccine) {
        return (
            this.x < vaccine.x + vaccine.width &&
			this.x + this.width > vaccine.x &&
			this.y < vaccine.y + vaccine.height &&
			this.y + this.height > vaccine.y
        );
    }
}

class Enemy extends Character {
    constructor(x, y) {
        super(x, y);
        this.image = new Image ();
        this.image.src = "./../images/enemyface-removebg-preview.png"
        this.height = 60
        this.width = 60
    }
    
    draw() {
        this.x--;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Friend extends Character {
    constructor(x, y) {
        super(x, y);
        this.image = new Image ();
        this.image.src = "./../images/happyface.png"
        this.height = 60
        this.width = 60
    }
    
    draw() {
        this.x--; 
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);       
    }
}

class Vaccine extends Character {
    constructor(x, y) {
        super(x, y);
        this.image = new Image ();
        this.image.src = "./../images/vaccine.png"
        this.height = 80
        this.width = 80
    }
    
    draw() {
        this.x--; 
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);       
    }
}
/*
class Bullet {
    constructor(x, y) {

    }
}*/

class Score {
    constructor() {
        this.x = $canvas.width / 2
        this.y = 700
        this.score = 0
    };

    draw () {
        ctx.font = "40px sans-serif";
        ctx.fillText (this.score, $canvas.width / 2, 700)
        ctx.fillText = "darkviolet"
    }

    scoreIncrement() {
        this.score++
    }
}

// Instancias de las clases

const board = new Board();
const coro = new Character (30, 0, 60);
const allEnemies = [];
const allFriends = [];
const allVaccines = [];
const keys = {};
let score = new Score
/*const bullets = [];
let isGameOver = false;
;*/

// Funciones del flujo del juego.

function startGame() {
    if (intervalId) return;
    intervalId = setInterval(() => {
        update();
    }, 1000 / 60);
}
/*
function gameOver() {
    if (isGameOver) {
        ctx.font = "40px sans-serif";
        ctx.fillText("Game Over", $canvas.width / 3, $canvas.height / 2);
    }
}
*/
// Funciones de apoyo

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
            // para limpiar el array de los enemigos.
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
            // para limpiar el array de los enemigos.
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
        if (coro.isTouching(enemy)) {
            clearInterval(intervalId);
            isGameOver = true;
        }
    });
    allFriends.forEach((friend) => {
        if (coro.isTouching(friend)) {
            clearInterval(intervalId);
            isGameOver = true;
        }
    });
    allVaccines.forEach((vaccine) => {
        if (coro.isTouching(vaccine)) {
            clearInterval(intervalId);
            isGameOver = true;
        }
    });
}
/*
function drawScore() {
    allEnemies.forEach((enemy) => {
        if(enemy.y + enemy.height > coro.y + coro.height) {
            score.scoreIncrement ()
        }
    })
    score.draw()
}
*/
// Funciones de interacción con el usuario.

function checkKeys() {
    if (keys.ArrowLeft) coro.moveLeft();
    if (keys.ArrowRigth) coro.moveRight();
    if (keys.ArrowUp) coro.jump();
    if (keys.ArrowDown) coro.moveDown();
    /* if (keys.z) {
       const bullet = new Bullet (coro.x + 15, coro.y);
       bullet.shootSound();
       bullets.push*/
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
    checkCollitions();
    //gameOver();
    //drawScore();
}

$button.onclick = startGame;