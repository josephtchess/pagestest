const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

//global vars
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const units = [];
const enemies = [];
const enemyVert = [];
const projectiles = [];
let money = 300;
let frame = 0;
let interval = 600;
let endGame = false;
// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;
})

//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid(){
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid(){
    for (let index = 0; index < gameGrid.length; index++) {
        gameGrid[index].draw();
    }
}

//projectiles
class Projectile {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.dmg = 20;
        this.speed = 5;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();
        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice(i, 1);
            i--;
        }
    }
}

//defenders
class Unit {
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
        this.shooting = false;
        this.health = 100;
        this.timer = 0;
    }
    draw(){
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        printStuff('gold', '30px Arial', Math.floor(this.health), this.x + 15, this.y + 25);
    }
    update(){
        this.timer++;
        if (this.timer % 100 == 0){
            projectiles.push(new Projectile(this.x + cellSize, this.y + 50));
        }
    }
}
canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x - (mouse.x % cellSize);
    const gridPositionY = mouse.y - (mouse.y % cellSize);
    if (gridPositionY < cellSize) return;
    for (let i=0; i < units.length; i++){
        if(units[i].x == gridPositionX && units[i].y == gridPositionY) 
        return;
    }
    let UnitCost = 100;
    if(money >= UnitCost){
        units.push(new Unit(gridPositionX,gridPositionY));
        money -= UnitCost;
    }
});
function handleUnits(){
    for (let i=0; i < units.length; i++){
        units[i].draw();
        units[i].update();
        for (let j = 0; j < enemies.length; j++){
            if (units[i] && collision(units[i], enemies[j])){
                units[i].health -= 0.2;
                enemies[j].movement = 0;
            }
            if (units[i] && units[i].health <= 0){
                units.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

//enemies
class Enemy {
    constructor(vert){
        this.x = canvas.width;
        this.y = vert;
        this.width = cellSize;
        this.height = cellSize;
        this.health = 100;
        this.timer = 0;
        this.speed = Math.random()* 0.2 + 1;
        this.movement = this.speed;
        this.maxHealth = this.health;
    }
    update(){
        this.x -= this.movement;
    }
    draw(){
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        printStuff('gold', '30px Arial', Math.floor(this.health), this.x + 15, this.y + 25);
    }
}
function handleEnemies(){
    for (let i=0; i < enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0){
            endGame = true;
        }
    }
    if (frame % 100 == 0){
        let vert = Math.floor(Math.random() * 5 + 1) * cellSize;
        enemies.push(new Enemy(vert));
        enemyVert.push(vert);
        if (interval > 120) interval -= 50;
    }
}
//recourses
//utilities
function printStuff(color, font_and_size, message, x, y){
    ctx.fillStyle = color;
    ctx.font = font_and_size;
    ctx.fillText(message, x, y);
}

function handleGameStatus(){
    printStuff('gold', '30px Arial', 'Resources ' + money, 20, 55);
    if (endGame){
        printStuff('black', '90px Arial', 'Game OVER', 135, 330);
    }
}

function animate(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleUnits();
    handleProjectiles();
    handleEnemies();
    handleGameStatus();
    frame++;
    if (!endGame) requestAnimationFrame(animate);
}
animate();

function collision(first, second){
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y >= second.y + second.height ||
                first.y + first.height <= second.y)
    ) {
        return true;
    };
};
