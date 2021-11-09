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
const gravity = 0.98;
const friction = 0.9;
let intervalId;

// Clases del juego con propiedades y métodos.

// Clase genérica.
class GameAsset {
    constructor(x, y, width, height, img) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = img;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Board extends GameAsset {
    constructor(x, y, width, height, img) {
        super(x, y, width, height, img);
        
    }

    draw () {
        this.x--;
        if (this.x < -this.width) this.x = 0;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage (this.image, this.x + this.width, this.y, this.width, this.height);
    } 
}

// Instancias. 

const boardImage = "/images/Background.jpg";
const board = new Board(0, 0, $canvas.width, $canvas.height, boardImage);
const coro = new Character (30, $canvas.height / 3, 60, 60);
const coroImage = "/images/coroface.png";
const allEnemies = [];
const allFriends = [];
const keys = {};
const bullets = [];
let isGameOver = false;
let score = new Score;

// Funciones principales.

function start() {
    if (intervalId) return;
    intervalId = setInterval(() => {
        update();
    }, 1000 / 60);
}

function update() {
    frames++;
    generateEnemies();
    generateFriends();
    generateVaccine();
    checkCollitions();
    clearCanvas();
    board.draw();
    coro.draw();
    drawEnemy();
    gameOver();
    checkKeys();
}

function gameOver() {
    if (isGameOver) {
        ctx.font = "40px sans-serif";
        ctx.fillText("Game Over", $canvas.width / 3, $canvas.height / 2);
    }
}

// Funciones de apoyo

function clearCanvas() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
}

function generateEnemies() {
    if (frames % 200 === 0) {
        const x = Math.floor(Math.random() * 380);
        const enemy = new Enemy (y, 910);
            allEnemies.push(enemy);
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

function checkCollitions() {
    allEnemies.forEach((enemy) => {
        if (coro.isTouching(enemy)) {
            clearInterval(intervalId);
            isGameOver = true;
        }
    });
}

function drawScore() {
    allEnemies.forEach((enemy) => {
        if(enemy.y + enemy.height > coro.y + coro.height) {
            score.scoreIncrement ()
        }
    })
    score.draw()
}

// Funciones de interacción con el usuario.

function checkKeys() {
    document.onkeydown = (event) => {
        switch (event.key) {
            case "ArrowLeft":
                coro.moveLeft();
            break;
            case "ArrowRigth":
                coro.moveRight();
            break;
            case "ArrowUp":
                coro.moveUp();
            break;
            case "ArrowDown":
                coro.moveDown();
            break;
        
            default:
                break;
        }
    };
}

$button.onclick = startGame;