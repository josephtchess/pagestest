const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

const currUser = document.getElementById("u1").innerHTML;
console.log("user is " + currUser);

let level = parseInt(document.getElementById("levelID").innerHTML);
console.log("level is " + level);
let lvlaval = 0;

let theme = new Audio("/static/content/cat_theme.wav");
theme.loop = true;
theme.play();
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
let paused = false;
let frame = 0;
let endGame = false;
let score = 0;
let levelcap = 3;
let chosenUnit = 1;
let maxTime = 90;
if (level == 3) maxTime = Number.MAX_SAFE_INTEGER;
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
const spear = new Image();
spear.src = "/static/content/spear.PNG";
const spear2 = new Image();
spear2.src = "/static/content/spear2.png";
//projectiles
class Projectile {
  constructor(x, y, dmg, sType) {
    this.x = x;
    this.y = y - 40;
    this.width = 100;
    this.height = 70;
    this.dmg = dmg;
    this.speed = 5;
    this.sType = sType;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.drawImage(this.sType, this.x, this.y, this.width, this.height);
    /*
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
    */
  }
}
function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    //update and draw each projectile
    projectiles[i].update();
    projectiles[i].draw();
    for (let j = 0; j < enemies.length; j++) {
      //iterate through enemies and if they make contact decrease health and remove projectile
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
    //remove projectile if out of range
    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

//defenders
const unit1attack = new Image();
unit1attack.src = "/static/content/cat1Attack.png";
const unit1idle = new Image();
unit1idle.src = "/static/content/cat1idle.png";
const unit2attack = new Image();
unit2attack.src = "/static/content/cat2Attack.png";
const unit2idle = new Image();
unit2idle.src = "/static/content/cat2idle.png";
class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.shooting = false;
    this.health = 100;
    this.maxHealth = this.health;
    this.timer = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.canShoot = true;
    this.spriteWidth = 240;
    this.spriteHeight = 230;
    this.minFrame = 0;
    this.maxFrame = 5;
    this.unitType = unit1idle;
    this.hasShot = false;
    this.chosenUnit = chosenUnit;
    this.isBoosted = 0;
    this.boostTime = 0;
    if (this.chosenUnit == 1) {
      this.ogdmg = 20;
      this.sType = spear;
    }
    if (this.chosenUnit == 2) {
      this.ogdmg = 40;
      this.sType = spear2;
    }
    this.dmg = this.ogdmg;
  }
  draw() {
    //ctx.fillStyle = 'blue';
    //ctx.fillRect(this.x, this.y, this.width, this.height);
    // printStuff(
    //   "black",
    //   "30px Arial",
    //   Math.floor(this.health),
    //   this.x + 15,
    //   this.y + 25
    // );
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
      this.maxFrame = 0;
      this.unitType = unit1idle; //unit 1 is idle
    }
    if (this.chosenUnit == 2) {
      this.maxFrame = 0;
      this.unitType = unit2idle; //unit 2 is idle
    }
  }
  update() {
    this.timer++;
    if (this.isBoosted) this.boostTime--;
    if (this.isBoosted && this.boostTime <= 0) {
      this.dmg = this.ogdmg;
      this.isBoosted = 0;
    }
    if (this.canShoot) {
      //some units might not shoot
      this.hasShot = false; //flag to check if unit has shot enemy
      for (let i = 0; i < enemyVert.length; i++) {
        if (this.y == enemyVert[i]) {
          if (this.chosenUnit == 1) {
            //unit one is shooting
            this.maxFrame = 1;
            this.unitType = unit1attack;
          }
          if (this.chosenUnit == 2) {
            //unit two is shooting
            this.maxFrame = 1;
            this.unitType = unit2attack;
          }
          if (!this.hasShot) {
            //shoot projectile
            if (this.frameX == 1 && this.timer % 45 == 0) {
              this.hasShot = true;
              projectiles.push(
                new Projectile(this.x + cellSize / 2, this.y + 50, this.dmg, this.sType)
              );
            }
          }
        }
      }
    }

    if (frame % 15 == 0) {
      //update frame of sprite
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
}
function handleUnits() {
  for (let i = 0; i < units.length; i++) {
    //draw and update units
    units[i].draw();
    units[i].update();
    for (let j = 0; j < enemies.length; j++) {
      //iterate through enemies and do collision stuff
      if (units[i] && collision(units[i], enemies[j])) {
        units[i].health -= enemies[j].dmg;
        enemies[j].movement = 0;
      }
      if (units[i] && units[i].health <= 0) {
        enemies[j].movement = enemies[j].speed;
      }
    }
    if (units[i].health <= 0) {
      units.splice(i, 1);
      i--;
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
  } else if (level >= 2 && collision(mouse, select2) && mouse.clicked) {
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
  // ctx.lineWidth = 1;
  // ctx.fillStyle = "rgba(0,0,0,0.2)";
  // ctx.fillRect(select1.x, select1.y, select1.width, select1.height);
  // ctx.strokeStyle = select1stroke;
  // ctx.strokeRect(select1.x, select1.y, select1.width, select1.height);
  // ctx.drawImage(unit1idle, 0, 0, 544, 476, 0, 10, 544 / 6, 476 / 6);
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(select1.x, select1.y, select1.width, select1.height);
  ctx.strokeStyle = select1stroke;
  ctx.strokeRect(select1.x, select1.y, select1.width, select1.height);
  ctx.drawImage(unit1idle, 0, 0, 320, 210, 0, 10, 320 / 3, 210 / 3);
  if (level >= 2) {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(select2.x, select2.y, select2.width, select2.height);
    ctx.strokeStyle = select2stroke;
    ctx.strokeRect(select2.x, select2.y, select2.width, select2.height);
    ctx.drawImage(unit2idle, 0, 0, 320, 210, 80, 10, 320 / 3, 210 / 3);
  }
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
//enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = "/static/content/enemy1.png";
enemyTypes.push(enemy1);

const enemy2 = new Image();
enemy2.src = "/static/content/enemy2.png";
enemyTypes.push(enemy2);

class Enemy {
  constructor(vert) {
    this.x = canvas.width;
    this.y = vert;
    this.dmg = 0.2;
    this.width = cellSize;
    this.height = cellSize;
    this.health = 100;
    this.timer = 0;
    this.maxHealth = this.health;
    if (level >= 2){
      this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    }
    else {
      this.enemyType = enemy1;
    }
    if (this.enemyType == enemy1){
      this.speed = 0.5;
    }
    else{
      this.speed = 0.75;
    }
    this.movement = this.speed;
    this.isSlowed = 0;
    this.slowTime = 0;
    if (this.enemyType == enemy1) {
      this.spriteWidth = 645;
      this.spriteHeight = 640;
    } else if (this.enemyType == enemy2) {
      this.spriteWidth = 484;
      this.spriteHeight = 484;
    }
    //this.enemyType = enemyTypes[0];

    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 6;
  }
  update() {
    if (this.isSlowed) this.slowTime--;
    if (this.isSlowed && this.slowTime <= 0) {
      this.isSlowed = 0;
      this.movement = this.speed;
    }
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
let spawnRate = (4 - level) * 100;
let changed = false;
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
  if ((frame / 60) % 30 == 0 && frame / 60 != 0 && !changed) {
    spawnRate = Math.floor((spawnRate * 2) / 3);
    changed = true;
  }
  if ((frame / 61) % 30 == 0 && frame / 61 != 0 && changed) {
    changed = false;
  }
  //console.log("Spawn rate is ", spawnRate);
  if (spawnRate == 0) {
    spawnRate = 1;
  }
  if (frame % spawnRate == 0 && Math.floor(frame / 60) < maxTime) {
    let vert = Math.floor(Math.random() * 5 + 1) * cellSize;
    enemies.push(new Enemy(vert));
    enemyVert.push(vert);
  }
}
//resources
//resources
const amounts = [50];
let color_array = ["green", "blue", "red", "yellow"];
class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.5;
    this.height = cellSize * 0.5;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    //randomize colors of the powerups given the colors of the array
    this.color = color_array[Math.floor(Math.random() * color_array.length)];
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.color == "yellow") {
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.fillText(this.amount, this.x + 15, this.y + 25);
    }
  }
}
function handleResources() {
  if (frame % 500 == 0 && frame != 0 && enemies[0]) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    let current_resource = resources[i];
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
      // yellow powerup is the default and has already been set.

      //for debugging
      console.log(current_resource.color);

      //if red powerup was collected, damage increased to 50 -- only for sprites when collecting red powerup -- for all spritres -- make "damage" - global var
      if (current_resource.color == "red") {
        // enemies[j].health -= projectiles[i].dmg;
        for (let unit of units) {
          unit.dmg = unit.dmg *= 2;
          unit.isBoosted = 1;
          unit.boostTime = 1000;
          floatingMessages.push(
            new floatingMessage("commence damage", unit.x, unit.y, 30, "red")
          );
        }
      }
      // if green powerup is selected, health gets reset to max
      else if (current_resource.color == "green") {
        for (let unit of units) {
          console.log(unit.health, "is the health");
          console.log(unit.maxHealth, "is the max health");
          unit.health = unit.maxHealth;
          floatingMessages.push(
            new floatingMessage("health restored", unit.x, unit.y, 30, "green")
          );
        }
      }
      // -- for future sprites -- use global var ****
      // if blue powerup is selected, enemy movement should be slower
      else if (current_resource.color == "blue") {
        for (let enemy of enemies) {
          enemy.movement *= 0.5;
          enemy.isSlowed = 1;
          enemy.slowTime = 500;
          // enemy.movement -= 0.1;
          //enemy.dmg = 20;
        }
        floatingMessages.push(
          new floatingMessage(
            "enemies slowed",
            resources[i].x,
            resources[i].y,
            30,
            "blue"
          )
        );
      } else {
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
          new floatingMessage("+" + resources[i].amount, 400, 80, 30, "gold")
        );
      }

      //check this.color and do different things based on what it was
      //yellow -> money up -- basic so dont need to change
      //red -> damage property for all -- certain amount of frames, need to revert change
      //green -> restore health
      //blue -> slow enemies

      //messages

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
  //printStuff("gold", "30px Arial", "Seconds: " + floor(frame / 60), 300, 80);
  printStuff("gold", "30px Arial", "Resources: " + money, 180, 80);
  printStuff("gold", "30px Arial", "Time: " + Math.floor(frame / 60), 180, 30);
  if (endGame) {
    score = Math.floor(frame / 60);
    ctx.fillStyle = "#e9b1a8";
    ctx.fillRect(0, 100, 900, 500);
    theme.pause();
    printStuff("black", "90px Arial", "Game OVER", 135, 330);
    printStuff(
      "black",
      "30px Arial",
      "You survived " + score + " seconds! ",
      135,
      370
    );
    printStuff("black", "30px Arial", "Press R to Restart Level!", 135, 410);
    printStuff(
      "black",
      "30px Arial",
      "Press L to go to level select!",
      135,
      450
    );

    console.log(level, " is level");
    let player = {};
    if (level == levelcap) {
      player = {
        name: currUser,
        score: score,
        level: level < lvlaval ? lvlaval : level,
      };
    } else {
      if (level == lvlaval && level < levelcap) {
        level = level + 1;
      }
      player = {
        name: currUser,
        level: level < lvlaval ? lvlaval : level,
      };
    }
    console.log(player, " is being sent");

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
  if (level != 3 && Math.floor(frame / 60) >= maxTime && enemies.length == 0) {
    theme.pause();
    score = Math.floor(frame / 60);
    ctx.fillStyle = "#e9b1a8";
    ctx.fillRect(0, 100, 900, 500);
    printStuff("black", "60px Arial", "LEVEL COMPLETE", 130, 300);
    printStuff(
      "black",
      "30px Arial",
      "You survived " + score + " seconds! ",
      135,
      340
    );
    printStuff("black", "30px Arial", "Press R to Restart Level!", 135, 380);
    printStuff(
      "black",
      "30px Arial",
      "Press L to go to level select!",
      135,
      420
    );
    console.log(level, " is level");
    let player = {};
    if (level == levelcap) {
      player = {
        name: currUser,
        score: score,
        level: level < lvlaval ? lvlaval : level,
      };
    } else {
      if (level == lvlaval && level < levelcap) {
        level = level + 1;
      }
      player = {
        name: currUser,
        level: level < lvlaval ? lvlaval : level,
      };
    }
    console.log(player, " is being sent");

    fetch(`${window.origin}/game`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(player),
      cache: "no-cache",
      headers: new Headers({
        "content-type": "application/json",
      }),
    });
    endGame = !endGame;
  }
}

canvas.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize);
  const gridPositionY = mouse.y - (mouse.y % cellSize);
  if (gridPositionY < cellSize) return;
  for (let i = 0; i < units.length; i++) {
    if (units[i].x == gridPositionX && units[i].y == gridPositionY) return;
  }
  let UnitCost = 50;

  if (chosenUnit == 1) {
    UnitCost = 50;
  }
  if (chosenUnit == 2) {
    UnitCost = 100;
  }
  if (money >= UnitCost) {
    units.push(new Unit(gridPositionX, gridPositionY));
    money -= UnitCost;
  } else {
    floatingMessages.push(
      new floatingMessage("need more resources", mouse.x, mouse.y, 20, "blue")
    );
  }
});
const fps = 60;
function animate() {
  if (!paused && !endGame) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = "blue";
    //ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
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
    ctx.fillStyle = "#e9b1a8";
    ctx.fillRect(0, 100, 900, 500);
    printStuff("black", "60px Arial", "PAUSED", 130, 300);
    printStuff("black", "30px Arial", "Press Esc to unpause!", 135, 340);
    printStuff("black", "30px Arial", "Press R to Restart Level!", 135, 380);
    printStuff("black", "30px Arial", "Press L for level select", 135, 420);
  }
  if (!endGame) {
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, 1000 / fps);
  }
}
//getMoney();
getLevel();
animate();
sendScores();

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

document.addEventListener(
  "keydown",
  (event) => {
    var name = event.key;
    if (name !== "r") {
      // Do nothing.
      return;
    }
    if (paused || endGame) {
      location.reload();
    }
  },
  false
);

document.addEventListener(
  "keydown",
  (event) => {
    var name = event.key;
    if (name !== "l") {
      // Do nothing.
      return;
    }
    if (endGame || paused) {
      location.href = "/levels";
    }
  },
  false
);


// function getMoney() {
//   fetch(`/getMoney/${currUser}`)
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (text) {
//       console.log("GET response:");
//       console.log(text);
//       if (text > 0) {
//         money = text;
//       } else {
//         money = 300;
//       }
//     });
// }

function getLevel() {
  fetch(`/getLevel/${currUser}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (text) {
      console.log("GET response:");
      console.log(text);
      lvlaval = text;
    });
}

function sendScores() {
  fetch(`/getTop`)
    .then(function (response) {
      return response.json();
    })
    .then(function (text) {
      console.log("GET response:");
      console.log(text);
    });
}
