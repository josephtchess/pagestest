const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

const currUser = document.getElementById("u1").innerHTML;
console.log("user is " + currUser);

//global vars
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const units = [];
const enemies = [];
const enemyVert = [];
const projectiles = [];
const resources = [];
let money = 300;
let frame = 0;
let interval = 600;
let endGame = false;
let score = 0;
let level = 1;
let chosenUnit = 1;
const winningScore = 100;
// mouse
const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
  clicked: false,
};
canvas.addEventListener("mousedown", function () {
  mouse.clicked = true;
});
canvas.addEventListener("mouseup", function () {
  mouse.clicked = false;
});
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

//game board
const controlsBar = {
  width: canvas.width,
  height: cellSize,
};
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new Cell(x, y));
    }
  }
}
createGrid();
function handleGameGrid() {
  for (let index = 0; index < gameGrid.length; index++) {
    gameGrid[index].draw();
  }
}

//projectiles
class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.dmg = 20;
    this.speed = 5;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
  }
}
function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();
    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        collision(projectiles[i], enemies[j])
      ) {
        enemies[j].health -= projectiles[i].dmg;
        projectiles.splice(i, 1);
        i--;
      }
    }
    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

//defenders
const unit1attack = new Image();
unit1attack.src = "/static/content/catJump.png";
const unit1idle = new Image();
unit1idle.src = "/static/content/catIdle.png";
const unit2attack = new Image();
unit2attack.src = "/static/content/dogJump.png";
const unit2idle = new Image();
unit2idle.src = "/static/content/dogIdle.png";
class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.shooting = false;
    this.health = 100;
    this.timer = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.canShoot = true;
    this.spriteWidth = 544;
    this.spriteHeight = 476;
    this.minFrame = 0;
    this.maxFrame = 9;
    this.unitType = unit1idle;
    this.hasShot = false;
    this.chosenUnit = chosenUnit;
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    printStuff(
      "gold",
      "30px Arial",
      Math.floor(this.health),
      this.x + 15,
      this.y + 25
    );
    ctx.drawImage(
      this.unitType,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (this.chosenUnit == 1) {
      this.maxFrame = 9;
      this.unitType = unit1idle;
    }
    if (this.chosenUnit == 2) {
      this.maxFrame = 9;
      this.unitType = unit2idle;
    }
  }
  update() {
    this.timer++;
    if (this.canShoot) {
      this.hasShot = false;
      for (let i = 0; i < enemyVert.length; i++) {
        if (this.y == enemyVert[i]) {
          if (this.chosenUnit == 1) {
            this.maxFrame = 10;
            this.unitType = unit1attack;
          }
          if (this.chosenUnit == 2) {
            this.maxFrame = 7;
            this.unitType = unit2attack;
          }
          if (!this.hasShot) {
            if (this.timer % 100 == 0) {
              this.hasShot = true;
              projectiles.push(
                new Projectile(this.x + cellSize / 2, this.y + 50)
              );
            }
          }
        }
      }
    }

    if (frame % 15 == 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
}
function handleUnits() {
  for (let i = 0; i < units.length; i++) {
    units[i].draw();
    units[i].update();
    for (let j = 0; j < enemies.length; j++) {
      if (units[i] && collision(units[i], enemies[j])) {
        units[i].health -= enemies[j].dmg;
        enemies[j].movement = 0;
      }
      if (units[i] && units[i].health <= 0) {
        units.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
}
const select1 = {
  x: 10,
  y: 10,
  width: 70,
  height: 85,
};
const select2 = {
  x: 90,
  y: 10,
  width: 70,
  height: 85,
};

function chooseUnit() {
  let select1stroke = "black";
  let select2stroke = "black";
  if (collision(mouse, select1) && mouse.clicked) {
    chosenUnit = 1;
  } else if (collision(mouse, select2) && mouse.clicked) {
    chosenUnit = 2;
  }
  if (chosenUnit == 1) {
    select1stroke = "gold";
    select2stroke = "black";
  } else if (chosenUnit == 2) {
    select1stroke = "black";
    select2stroke = "gold";
  } else {
    select1stroke = "black";
    select2stroke = "black";
  }
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(select1.x, select1.y, select1.width, select1.height);
  ctx.strokeStyle = select1stroke;
  ctx.strokeRect(select1.x, select1.y, select1.width, select1.height);
  ctx.drawImage(unit1idle, 0, 0, 544, 476, 0, 10, 544 / 6, 476 / 6);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(select2.x, select2.y, select2.width, select2.height);
  ctx.strokeStyle = select2stroke;
  ctx.strokeRect(select2.x, select2.y, select2.width, select2.height);
  ctx.drawImage(unit2idle, 0, 0, 544, 476, 80, 10, 544 / 6, 476 / 6);
}

// Floating Messages
const floatingMessages = [];
class floatingMessage {
  constructor(value, x, y, size, color) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifespan = 0;
    this.color = color;
    this.opacity = 1;
  }
  update() {
    this.y -= 0.3;
    this.lifespan += 1;
    if (this.opacity > 0.01) this.opacity -= 0.01;
  }
  draw() {
    ctx.globalAlpha = this.opacity;
    printStuff(this.color, this.size + "px Arial", this.value, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}
function handleFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    floatingMessages[i].update();
    floatingMessages[i].draw();
    if (floatingMessages[i] && floatingMessages[i].lifespan >= 50) {
      floatingMessages.splice(i, 1);
      i--;
    }
  }
}

//enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = "/static/content/enemy1.png";
enemyTypes.push(enemy1);
class Enemy {
  constructor(vert) {
    this.x = canvas.width;
    this.y = vert;
    this.dmg = 0.2;
    this.width = cellSize;
    this.height = cellSize;
    this.health = 100;
    this.timer = 0;
    this.speed = Math.random() * 0.2 + 0.5;
    this.movement = this.speed;
    this.maxHealth = this.health;
    this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    if (this.enemyType == enemy1) {
      this.spriteWidth = 682;
      this.spriteHeight = 474;
    } else if (this.enemyType == enemy2) {
      this.spriteWidth = 547;
      this.spriteHeight = 481;
    }
    //this.enemyType = enemyTypes[0];
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 7;
  }
  update() {
    this.x -= this.movement;
    if (frame % 10 == 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
  draw() {
    //ctx.fillStyle = 'red';
    //ctx.fillRect(this.x, this.y, this.width, this.height);
    //printStuff('gold', '30px Arial', Math.floor(this.health), this.x + 15, this.y + 25);
    ctx.drawImage(
      this.enemyType,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].draw();
    if (enemies[i].x + cellSize / 3 < 0) {
      endGame = true;
    }
    if (enemies[i].health <= 0) {
      money += enemies[i].maxHealth / 10;
      score += enemies[i].maxHealth / 10;
      const myIndex = enemyVert.indexOf(enemies[i].y);
      enemyVert.splice(myIndex, 1);
      enemies.splice(i, 1);
      i--;
    }
  }
  if (frame % 200 == 0 && score < winningScore) {
    let vert = Math.floor(Math.random() * 5 + 1) * cellSize;
    enemies.push(new Enemy(vert));
    enemyVert.push(vert);
    if (interval > 120) interval -= 50;
  }
}
//resources
const amounts = [20, 30, 40];
class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.5;
    this.height = cellSize * 0.5;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
  }
  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    printStuff("black", "20px Arial", this.amount, this.x + 15, this.y + 25);
  }
}
function handleResources() {
  if (frame % 500 == 0 && frame != 0 && enemies[0]) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
      money += resources[i].amount;
      floatingMessages.push(
        new floatingMessage(
          "+" + resources[i].amount,
          resources[i].x,
          resources[i].y,
          30,
          "black"
        )
      );
      floatingMessages.push(
        new floatingMessage("+" + resources[i].amount, 250, 80, 30, "gold")
      );
      resources.splice(i, 1);
      i--;
    }
  }
}

//utilities
function printStuff(color, font_and_size, message, x, y) {
  ctx.fillStyle = color;
  ctx.font = font_and_size;
  ctx.fillText(message, x, y);
}

function handleGameStatus() {
  printStuff("gold", "30px Arial", "Resources: " + money, 180, 80);
  printStuff("gold", "30px Arial", "Score: " + score, 180, 30);
  if (endGame) {
    printStuff("black", "90px Arial", "Game OVER", 135, 330);
  }
  if (score >= winningScore && enemies.length == 0) {
    printStuff("black", "60px Arial", "LEVEL COMPLETE", 130, 300);
    printStuff(
      "black",
      "30px Arial",
      "You win with " + score + " points! ",
      135,
      340
    );
    endGame = !endGame;

    let player = {
      name: currUser,
      score: score,
    };

    fetch(`${window.origin}/game`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(player),
      cache: "no-cache",
      headers: new Headers({
        "content-type": "application/json",
      }),
    });
  }
}

canvas.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize);
  const gridPositionY = mouse.y - (mouse.y % cellSize);
  if (gridPositionY < cellSize) return;
  for (let i = 0; i < units.length; i++) {
    if (units[i].x == gridPositionX && units[i].y == gridPositionY) return;
  }
  let UnitCost = 100;
  if (money >= UnitCost) {
    units.push(new Unit(gridPositionX, gridPositionY));
    money -= UnitCost;
  } else {
    floatingMessages.push(
      new floatingMessage("need more resources", mouse.x, mouse.y, 20, "blue")
    );
  }
});

function animate() {
  if (!paused && !endGame) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleUnits();
    handleResources();
    handleProjectiles();
    handleEnemies();
    chooseUnit();
    handleGameStatus();
    handleFloatingMessages();
    frame++;
  } else {
    printStuff("black", "60px Arial", "PAUSED", 130, 300);
    printStuff("black", "30px Arial", "Press Esc to unpause!", 135, 340);
  }
  if (!endGame) requestAnimationFrame(animate);
}

//getMoney();
animate();

function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y >= second.y + second.height ||
      first.y + first.height <= second.y
    )
  ) {
    return true;
  }
}

window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});

function getMoney() {
  fetch(`/getMoney/${currUser}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (text) {
      console.log("GET response:");
      console.log(text);
      if (text > 0) {
        money = text;
      } else {
        money = 300;
      }
    });
}

document.addEventListener(
  "keydown",
  (event) => {
    var name = event.key;
    if (name !== "Escape") {
      // Do nothing.
      return;
    }
    paused = !paused;
  },
  false
);
