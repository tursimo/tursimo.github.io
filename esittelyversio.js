const INTEGER_SCALING = true;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;
const round = Math.round;

const enemySprite = [
    [0, 32],
    [32, 32],
    [64, 40],
    [48, 32],
    [32, 40]
];

const tileSet = [
    [0, 0, 4],
    [4, 20, 36],
    [0, 20, 36],
    [0, 0, 20]
];

layOut = [
    [
        [32, 80, 5, 0],
        [48, 96, 6, 0],

        [96, 96, 5, 0],
        [112, 80, 5, 0],

        [32, 40, 5, 0],
        [48, 24, 6, 0],

        [96, 24, 5, 0],
        [112, 40, 5, 0],
    ],
    [
        [56, 72, 21, 0],

        [72, 64, 22, 0],
        [72, 80, 22, 0],

        [88, 72, 22, 0],
    ],
    [
        [64, 64, 38, 0],
        [80, 48, 37, 0],
        [80, 64, 37, 0],
        [64, 48, 38, 0],

        [64, 80, 38, 0],
        [80, 80, 37, 0],

        [64, 96, 38, 0],
        [80, 96, 37, 0],

        [64, 32, 38, 0],
        [80, 32, 37, 0],
    ],
    [
        [32, 112, 33, 0],
        [16, 112, 33, 0],

        [112, 112, 33, 0],
        [128, 112, 33, 0],

        [64, 32, 33, 0],
        [80, 32, 33, 0],

    ],
    [
        [16, 48, 22, 0],

        [64, 48, 2, 0],
        [80, 48, 3, 0],
        [96, 48, 3, 0],

        [128, 48, 21, 0],

        [40, 96, 2, 0],
        [56, 96, 3, 0],

        [112, 96, 22, 0],
    ],
];

const world = [
    [
        [3, 3],
        [1, 1],
        [2, 2]
    ],
    [
        [1, 2],
        [0, 0],
        [3, 4]
    ],
    [
        [0, 3],
        [1, 2],
        [2, 1]
    ]
];

const spawnPoint = [[32, 24], [112, 24], [48, 64], [104, 72]];

var worldX = 1;
var worldY = 1;
var currentTileSet = [];
var currentLayout = [];
var nextTileSet = 1;

var life = 2;
var posX = 76;
var posY = 68;
var speedX = 0;
var speedY = 0;
var facing = 2;
var walkCycle = 0;
var shuffle = true;
var hit = false;
var poof = false;
var goblinMode = false;

var star = false;
var starX = -50;
var starY = -50;

var attack = false;

const enemy = [];

function resizeCanvas() {
    let scale = Math.min(
        window.innerWidth / canvas.width,
        window.innerHeight / canvas.height
    );
    if (INTEGER_SCALING) {
        scale = Math.floor(scale);
    }
    canvas.style.width = `${Math.round(scale * canvas.width)}px`;
    canvas.style.height = `${Math.round(scale * canvas.height)}px`;
}

function drawRectangle(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(round(x), round(y), round(width), round(height));
}

const resourcePromises = [];

function loadImage(url) {
    const img = new Image();
    const promise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
    img.src = url;
    resourcePromises.push(promise);
    return img;
}

function newTileSheet(image, w, h) {
    return { image, w, h };
}

function simpleDrawTile(tileSheet, tx, ty, dx, dy) {
    const { image, w, h } = tileSheet;
    const { width, height } = image;
    ty += Math.floor(tx / (width / w));
    tx %= width / w;

    ctx.drawImage(image, w * tx, h * ty, w, h, round(dx), round(dy), w, h);
}

function drawPlayer(spriteSheet, tx, ty, dx, dy) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    var speed = speedX + speedY;
    var swordX = round(dx);
    var swordY = round(dy + 8);
    switch (facing) {
        case 8:
        case 9:
            tx += 16;
            swordX = round(dx - 8);
            swordY = round(dy - 16);
            break;

        case 6:
        case 7:
            ty += 16;
            swordX = round(dx + 8);
            swordY = round(dy);
            break;

        case 4:
        case 5:
            tx += 16;
            ty += 16;
            swordX = round(dx - 16);
            swordY = round(dy);
            break;
    }
    if (facing == 9) {
        ctx.drawImage(image, tx + 96, ty, w, h, round(dx - 4), round(dy - 8), w, h);
    } else { ctx.drawImage(image, tx, ty, w, h, round(dx - 4), round(dy - 8), w, h); }

    if (facing == 3) {
        ctx.drawImage(image, tx + 104, ty, w, h, round(dx + 4), round(dy - 8), w, h);
    } else { ctx.drawImage(image, tx + 8, ty, w, h, round(dx + 4), round(dy - 8), w, h); }

    if (walkCycle == 0 && speed != 0) {
        tx += 32;
    } else if (speed != 0) {
        tx += 64;
    }

    if (facing == 9 || facing == 5) {
        tx += 96;
        ctx.drawImage(image, tx, ty + 8, w, h, round(dx - 4), round(dy), w, h);
        tx -= 96;
    } else { ctx.drawImage(image, tx, ty + 8, w, h, round(dx - 4), round(dy), w, h); }

    if (facing == 3 || facing == 5 || facing == 7) {
        tx += 96;
        ctx.drawImage(image, tx + 8, ty + 8, w, h, round(dx + 4), round(dy), w, h);
        tx -= 96;
    } else { ctx.drawImage(image, tx + 8, ty + 8, w, h, round(dx + 4), round(dy), w, h); }

    if (facing % 2 != 0) { ctx.drawImage(image, tx + 32, ty, w, h, swordX + 4, swordY, w, h); }
}

function drawLife(spriteSheet) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    var placement = 0;
    for (var i = 0; i < 3; i++) {
        if (life + 1 > i) {
            ctx.drawImage(image, 80, 0, w, h, placement, 0, w, h);
        }
        else {
            ctx.drawImage(image, 72, 0, w, h, placement, 0, w, h);
        }
        placement += 8;
    }
}

function playerAttack(amount) {
    speedX = 0;
    speedY = 0;
    window.removeEventListener("keydown", playerPress);
    window.removeEventListener("keyup", playerRelease);

    for (var i = 0; i < amount; i++) {
        if (enemy[i][1] < 3 && enemy[i][2]) {
            switch (facing) {
                case 3:
                    if (collision(posX + 4, posY, 8, 20, enemy[i][4], enemy[i][5], 8, 8)) { destroyEnemy(enemy[i][0]); }
                    break;

                case 9:
                    if (collision(posX - 4, posY - 16, 8, 20, enemy[i][4], enemy[i][5], 8, 8)) { destroyEnemy(enemy[i][0]); }
                    break;

                case 7:
                    if (collision(posX, posY - 2, 20, 8, enemy[i][4], enemy[i][5], 8, 8)) { destroyEnemy(enemy[i][0]); }
                    break;

                case 5:
                    if (collision(posX - 12, posY - 2, 20, 8, enemy[i][4], enemy[i][5], 8, 8)) { destroyEnemy(enemy[i][0]); }
                    break;
            }
        }

    }
    setTimeout(enableInput, 50);
}

function destroyEnemy(enemyId) {
    enemy[enemyId][2] = false;
    enemy[enemyId][6] = 0;
    enemy[enemyId][7] = 0;
    star = true;
    starX = enemy[enemyId][4];
    starY = enemy[enemyId][5];
    if (enemy[enemyId][1] == 2) {
        starX += 4;
        starY += 4;
    }
}

function collision(ax, ay, aw, ah, bx, by, bw, bh) {
    return (
        ax < bx + bw &&
        ax + aw > bx &&
        ay < by + bh &&
        ay + ah > by
    );
}

function enableInput() {
    window.addEventListener("keydown", playerPress);
    window.addEventListener("keyup", playerRelease);
    if (facing % 2 != 0) {
        facing -= 1;
    }
}

function drawSpider(spriteSheet, tx, ty, dx, dy, enemyId, enemyType) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;

    if (shuffle) {
        tx += 8;
    }
    switch (enemy[enemyId][3]) {
        case 8:
            ty += 8;
            break;

        case 6:
            tx += 16;
            break;

        case 4:
            tx += 16;
            ty += 8;
            break;
    }
    ctx.drawImage(image, tx, ty, w, h, round(dx), round(dy), w, h);
}

function obstaclePathing(x, y, dir) {
    var newDir;
    var shortest;
    var compare;

    if (!wallCollision(x, y - 8) && dir != 2) {
        shortest = hypotenuse(x, y - 8, posX, posY);
        newDir = 8;
    }
    if (!wallCollision(x, y + 8) && dir != 8) {
        compare = hypotenuse(x, y + 8, posX, posY);
        if (shortest == null) {
            shortest = compare;
            newDir = 2;
        }
        else if (shortest >= compare) {
            shortest = compare
            newDir = 2;
        }
    }
    if (!wallCollision(x + 8, y) && dir != 4) {
        compare = hypotenuse(x + 8, y, posX, posY);
        if (shortest == null) {
            shortest = compare;
            newDir = 6;
        } else if (shortest >= compare) {
            shortest = compare
            newDir = 6;
        }
    }
    if (!wallCollision(x - 8, y) && dir != 6) {
        compare = hypotenuse(x - 8, y, posX, posY);
        if (shortest == null) {
            shortest = compare;
            newDir = 4;
        } if (shortest >= compare) {
            shortest = compare
            newDir = 4;
        }
    }
    return newDir;
}

function moveEnemy() {
    for (var i = 0; i < enemy.length; i++) {
        switch (enemy[i][1]) {
            case 0:
                if (round(enemy[i][4]) % 8 == 0 && round(enemy[i][5]) % 8 == 0) {
                    switch (obstaclePathing(enemy[i][4], enemy[i][5], enemy[i][3])) {
                        case 2:
                            enemy[i][6] = 0;
                            enemy[i][7] = 0.1;
                            enemy[i][3] = 2;
                            break;

                        case 8:
                            enemy[i][6] = 0;
                            enemy[i][7] = -0.1;
                            enemy[i][3] = 8;
                            break;

                        case 6:
                            enemy[i][7] = 0;
                            enemy[i][6] = 0.1;
                            enemy[i][3] = 6;
                            break;

                        case 4:
                            enemy[i][7] = 0;
                            enemy[i][6] = -0.1;
                            enemy[i][3] = 4;
                            break;
                    }
                }
                break;

            case 1:
                if (posY > enemy[i][5]) {
                    enemy[i][7] = 0.075;
                } else { enemy[i][7] = -0.075; }

                if (posX > enemy[i][4]) {
                    enemy[i][6] = 0.075;
                } else { enemy[i][6] = -0.075; }
                break;

            case 2:
                if (enemy[i][2]) {
                    if (!bomb) {
                        if (poof && enemy[i][2] && !bomb) {
                            smokeX = enemy[i][4];
                            smokeY = enemy[i][5];
                            enemy[i][4] = randomPosition();
                            enemy[i][5] = randomPosition();
                            smoke = true;
                            poof = false;
                        } else if (enemy[i][4] > 144 || enemy[i][4] < 0 || enemy[i][5] > 128 || enemy[i][5] < 0) {
                            if (enemy[i][6] == 0) {
                                enemy[i][6] = enemy[i][7] * 1.5;
                            } else {
                                enemy[i][7] = enemy[i][6] * 1.5;
                            }
                            enemy[i][6] *= -1;
                            enemy[i][7] *= -1;
                        } else if ((Math.abs(posX - enemy[i][4])) < (Math.abs(posY - enemy[i][5]))) {
                            if (posY > enemy[i][5]) {
                                enemy[i][6] = 0;
                                enemy[i][7] = -0.25;
                                enemy[i][3] = 8;
                            } else {
                                enemy[i][6] = 0;
                                enemy[i][7] = 0.25;
                                enemy[i][3] = 2;
                            }
                        }
                        else if ((Math.abs(posX - enemy[i][4])) > (Math.abs(posY - enemy[i][5]))) {
                            if (posX > enemy[i][4]) {
                                enemy[i][7] = 0;
                                enemy[i][6] = -0.25;
                                enemy[i][3] = 4;
                            } else {
                                enemy[i][7] = 0;
                                enemy[i][6] = 0.25;
                                enemy[i][3] = 6;
                            }
                        }
                    } else {
                        enemy[i][7] = 0;
                        enemy[i][6] = 0;
                        if (!bombGenerated && enemy[i][2]) {
                            enemy.push([enemy.length, 5, true, 0, enemy[i][4] + 4, enemy[i][5] - 4, 0, 0, enemySprite[3][0], enemySprite[3][1], true]);
                            bombGenerated = true;
                        }
                    }

                } else {
                    enemy[i][7] = 0;
                    enemy[i][6] = 0;
                    currX = enemy[i][4];
                    currY = enemy[i][5];
                    enemy.push([enemy.length, 5, true, 0, enemy[i][4] + 4, enemy[i][5] + 4, 0, 0, enemySprite[3][0], enemySprite[3][1], false]);
                    bombGenerated = true;
                    enemy.splice(enemy[i][0], 1);
                }
                break;

            case 5:
                if (!bombChuck && enemy[i][10]) {
                    currX = posX;
                    currY = posY;
                    bombChuck = true;
                }
                var unit;


                unit = pointToPoint(currX, currY, enemy[i][4], enemy[i][5]);
                if (enemy[i][10]) {

                    enemy[i][4] += unit[0] * 0.5;
                    enemy[i][5] += unit[1] * 0.5;
                } else {
                    enemy[i][4] += unit[0] * 0.025;
                    enemy[i][5] += unit[1] * 0.025;
                }

                if (round(enemy[i][4]) == round(currX)) {
                    bomb = false;
                    bombGenerated = false;
                    explode = true;
                }
                if (explode && enemy[i][10]) {
                    enemy[i][2] = false;
                    enemy[i][10] = false;
                    bombChuck = false;
                    explode = false;
                    bomb = false;
                    bombGenerated = false;
                    explodeX = enemy[i][4];
                    explodeY = enemy[i][5];
                    explosionTime = window.performance.now();
                    enemy.splice(enemy[i][0], 1);
                } else if (explode && !enemy[i][10] && enemy[i][2]) {
                    enemy[i][2] = false;
                    bombChuck = false;
                    explode = false;
                    bomb = false;
                    bombGenerated = false;
                    explodeX = enemy[i][4];
                    explodeY = enemy[i][5];
                    explosionTime = window.performance.now();
                    enemy.splice(enemy[i][0], 1);
                }
                break;
        }
    }
}

function wallCollision(x, y) {

    if (world[worldY][worldX][2] == 1) { if (collision(round(x), round(y), 8, 8, 0, 128, 64, 16) || collision(round(x), round(y), 8, 8, 96, 128, 64, 16)) { return true; } } else if (collision(round(x), round(y), 8, 8, 0, 128, 160, 16) && world[worldY][worldX][2] == 2) { return true; }

    if (world[worldY][worldX][3] == 1) { if (collision(round(x), round(y), 8, 8, 0, 0, 64, 16) || collision(round(x), round(y), 8, 8, 96, 0, 64, 16)) { return true; } } else if (collision(round(x), round(y), 8, 8, 0, 0, 160, 16) && world[worldY][worldX][3] == 2) { return true; }

    if (world[worldY][worldX][4] == 1) { if (collision(round(x), round(y), 8, 8, 144, 0, 16, 64) || collision(round(x), round(y), 8, 8, 144, 80, 16, 64)) { return true; } } else if (collision(round(x), round(y), 8, 8, 144, 0, 16, 144) && world[worldY][worldX][4] == 2) { return true; }

    if (world[worldY][worldX][5] == 1) { if (collision(round(x), round(y), 8, 8, 0, 0, 16, 64) || collision(round(x), round(y), 8, 8, 0, 80, 16, 64)) { return true; } } else if (collision(round(x), round(y), 8, 8, 0, 0, 16, 144) && world[worldY][worldX][5] == 2) { return true; }

    for (var i = 0; i < currentLayout.length; i++) {
        if (currentLayout[i][0] - x > 8 || currentLayout[i][1] - y > 8) { continue; }
        if (collision(round(x), round(y), 8, 8, currentLayout[i][0], currentLayout[i][1], 16, 16)) { return true; }
    }
}

var explosionTime = 0;

function bombExplode(spriteSheet) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    if (flicker) {
        ctx.drawImage(image, 0, 104, w, h, round(explodeX - 8), round(explodeY - 8), w, h);
        ctx.drawImage(image, 8, 104, w, h, round(explodeX), round(explodeY - 8), w, h);
        ctx.drawImage(image, 16, 104, w, h, round(explodeX + 8), round(explodeY - 8), w, h);
        ctx.drawImage(image, 0, 112, w, h, round(explodeX - 8), round(explodeY), w, h);
        ctx.drawImage(image, 8, 112, w, h, round(explodeX), round(explodeY), w, h);
        ctx.drawImage(image, 16, 112, w, h, round(explodeX + 8), round(explodeY), w, h);
        ctx.drawImage(image, 0, 120, w, h, round(explodeX - 8), round(explodeY + 8), w, h);
        ctx.drawImage(image, 8, 120, w, h, round(explodeX), round(explodeY + 8), w, h);
        ctx.drawImage(image, 16, 120, w, h, round(explodeX + 8), round(explodeY + 8), w, h);
    }
    if (collision(posX - 4, posY, 8, 8, explodeX - 8, explodeY - 8, 24, 24) && !hit) {
        life--;
        hit = true;
        setTimeout(() => {
            hit = false;
        }, 2000);
    }
}

var currX;
var currY;
var bombChuck = false;
var bombGenerated = false;
var explodeX = -50;
var explodeY = -50;
var smokeX = -50;
var smokeY = -50;

function drawSmoke(spriteSheet) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    if (flicker && smoke) {
        ctx.drawImage(image, 96, 88, w, h, round(smokeX), round(smokeY), w, h);
        ctx.drawImage(image, 104, 88, w, h, round(smokeX + 8), round(smokeY), w, h);
        ctx.drawImage(image, 96, 96, w, h, round(smokeX), round(smokeY + 8), w, h);
        ctx.drawImage(image, 104, 96, w, h, round(smokeX + 8), round(smokeY + 8), w, h);
    }
}

function drawBomb(spriteSheet, tx, ty, dx, dy, enemyId) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    if (flicker) {
        ctx.drawImage(image, tx - 8, ty, w, h, round(dx), round(dy) - 8, w, h);
        ctx.drawImage(image, tx, ty, w, h, round(dx), round(dy), w, h);
    } else {
        ctx.drawImage(image, tx + 16, ty, w, h, round(dx), round(dy) - 8, w, h);
        ctx.drawImage(image, tx + 8, ty, w, h, round(dx), round(dy), w, h);
    }

}

function pointToPoint(ax, ay, bx, by) {
    var cx = ax - bx;
    var cy = ay - by;
    var l = Math.sqrt((cy * cy) + (cx * cx));
    var ux = cx / l;
    var uy = cy / l;
    return [ux, uy];
}

function hypotenuse(ax, ay, bx, by) {
    var cx = ax - bx;
    var cy = ay - by;
    return Math.sqrt((cy * cy) + (cx * cx));
}

function drawStar(spriteSheet, tx, ty, dx, dy) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    if (flicker) { ctx.drawImage(image, tx, ty, w, h, round(dx), round(dy), w, h); }
}

function drawSkull(spriteSheet, tx, ty, dx, dy) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    if (shuffle) { tx += 1; }
    ctx.drawImage(image, tx, ty, w, h, round(dx), round(dy), w, h);
}

function drawSkeleton(spriteSheet, tx, ty, dx, dy) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    ctx.drawImage(image, 32, 32, w, h, round(dx) + 4, round(dy) - 8, w, h);
    if (shuffle) { tx += 16; }
    ctx.drawImage(image, tx, ty, w, h, round(dx), round(dy), w, h);
    ctx.drawImage(image, tx + 8, ty, w, h, round(dx) + 8, round(dy), w, h);
    ctx.drawImage(image, tx, ty + 8, w, h, round(dx), round(dy + 8), w, h);
    ctx.drawImage(image, tx + 8, ty + 8, w, h, round(dx + 8), round(dy + 8), w, h);
}

function drawGoblin(spriteSheet, tx, ty, dx, dy, enemyId) {
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    if (!bomb) {
        if (shuffle) { ty += 32; }
        switch (enemy[enemyId][3]) {
            case 8:
                tx += 16;
                break;

            case 6:
                ty += 16;
                break;

            case 4:
                tx += 16;
                ty += 16;
                break;
        }
        if (enemy[enemyId][3] % 2 != 0) {
            ty += 40;
            tx -= 16;
            ctx.drawImage(image, tx, ty, w, h, round(dx), round(dy), w, h);
            ctx.drawImage(image, tx + 8, ty, w, h, round(dx) + 8, round(dy), w, h);
            ctx.drawImage(image, tx, ty + 8, w, h, round(dx), round(dy + 8), w, h);
            ctx.drawImage(image, tx + 8, ty + 8, w, h, round(dx + 8), round(dy + 8), w, h);
        } else {
            ctx.drawImage(image, tx, ty, w, h, round(dx), round(dy), w, h);
            ctx.drawImage(image, tx + 8, ty, w, h, round(dx) + 8, round(dy), w, h);
            ctx.drawImage(image, tx, ty + 8, w, h, round(dx), round(dy + 8), w, h);
            ctx.drawImage(image, tx + 8, ty + 8, w, h, round(dx + 8), round(dy + 8), w, h);
        }
    } else {
        ctx.drawImage(image, tx - 16, ty + 40, w, h, round(dx), round(dy), w, h);
        ctx.drawImage(image, tx - 8, ty + 40, w, h, round(dx) + 8, round(dy), w, h);
        ctx.drawImage(image, tx - 16, ty + 48, w, h, round(dx), round(dy + 8), w, h);
        ctx.drawImage(image, tx - 8, ty + 48, w, h, round(dx + 8), round(dy + 8), w, h);
    }
}

function drawSpear(spriteSheet, tx, ty, dx, dy, enemyId) {
    var spearDirX = round(dx) + 8;
    var spearDirY = round(dy) + 16;
    const { image, w, h } = spriteSheet;
    const { width, height } = image;
    switch (enemy[enemyId][3]) {
        case 8:
            tx += 16;
            spearDirX -= 8;
            spearDirY -= 24;
            break;

        case 6:
            ty += 16;
            spearDirX += 8;
            spearDirY -= 8;
            break;

        case 4:
            tx += 16;
            ty += 16;
            spearDirX -= 16;
            spearDirY -= 8;
            break;
    }
    ctx.drawImage(image, tx + 32, ty, w, h, spearDirX, spearDirY, w, h);
    ctx.drawImage(image, tx, ty, w, h, round(dx), round(dy), w, h);
    ctx.drawImage(image, tx + 8, ty, w, h, round(dx) + 8, round(dy), w, h);
    if (shuffle) { tx += 32; }
    ctx.drawImage(image, tx, ty + 8, w, h, round(dx), round(dy + 8), w, h);
    ctx.drawImage(image, tx + 8, ty + 8, w, h, round(dx + 8), round(dy + 8), w, h);
}

function shuffleEnemy() {
    shuffle = true;
    setInterval(() => {
        shuffle = false;
    }, 2000);
}

function generateEnemy(amount) {
    for (var i = 0; i < amount && amount > 0; i++) {
        type = Math.floor(Math.random() * 3);
        if (type == 2 && !goblinMode) {
            goblinMode = true;
        }
        else if (type == 2 && goblinMode) {
            type--;
        }
        enemy.push([enemy.length, type, true, 2, spawnPoint[i][0], spawnPoint[i][1], 0, 0, enemySprite[type][0], enemySprite[type][1], true]);
    }
}

function drawEnemy(spriteSheet, amount) {
    for (var i = 0; i < amount; i++) {
        if (enemy[i][2]) {
            switch (enemy[i][1]) {
                case 0:
                    drawSpider(spriteSheet, enemy[i][8], enemy[i][9], enemy[i][4], enemy[i][5], enemy[i][0]);
                    break;

                case 1:
                    drawSkull(spriteSheet, enemy[i][8], enemy[i][9], enemy[i][4], enemy[i][5]);
                    break;

                case 2:
                    drawGoblin(spriteSheet, enemy[i][8], enemy[i][9], enemy[i][4], enemy[i][5], enemy[i][0]);
                    break;

                case 5:
                    drawBomb(spriteSheet, enemy[i][8], enemy[i][9], enemy[i][4], enemy[i][5], enemy[i][0]);
                    break;

                case 6:
                    drawStar(spriteSheet, enemy[i][8], enemy[i][9], enemy[i][4], enemy[i][5]);
                    break;
            }
        }
    }
}

function enemyPosition(amount) {
    for (var i = 0; i < amount; i++) {
        enemy[i][4] += enemy[i][6];
        enemy[i][5] += enemy[i][7];
    }
}

function randomPosition() {
    return Math.floor(Math.random() * (110 - 50 + 1)) + 30;
}

function playerPress(event) {
    switch (event.key) {
        case "ArrowLeft":
            if (!collide) {
                speedX = -0.3;
            }
            speedY = 0;
            facing = 4;
            break;

        case "ArrowUp":
            if (!collide) {
                speedY = -0.3;
            }
            speedX = 0;
            facing = 8;
            break;

        case "ArrowRight":
            if (!collide) {
                speedX = 0.3;
            }
            speedY = 0;
            facing = 6;
            break;

        case "ArrowDown":
            if (!collide) {
                speedY = 0.3;
            }
            speedX = 0;
            facing = 2;
            break;

        case "z":
            if (life < 0) { location.reload(); }
            break;

        case "x":
            if (!attack) {
                facing += 1;
                playerAttack(enemy.length);
            }
            attack = true;
            break;
    }
}

function playerRelease(event) {
    switch (event.key) {
        case "ArrowLeft":
            speedX = 0;
            break;

        case "ArrowUp":
            speedY = 0;
            break;

        case "ArrowRight":
            speedX = 0;
            break;

        case "ArrowDown":
            speedY = 0;
            break;

        case "x":
            attack = false;
            break;
    }
}

function damagePlayer(amount) {
    for (var i = 0; i < amount; i++) {
        if (collision(posX - 4, posY, 8, 8, enemy[i][4], enemy[i][5], 8, 8) && !hit && enemy[i][2] && enemy[i][1] < 2 && !scrollRoom) {
            life--;
            hit = true;
            setTimeout(() => {
                hit = false;
            }, 2000);
        }
    }
}

function setRoom(room) {
    if (currentLayout.length > 0) {
        currentLayout.splice(0, currentLayout.length);
    }
    for (var i = 0; i < layOut[room].length; i++) {
        currentLayout.push(layOut[room][i]);
    }
}

function setFloor(floor) {
    if (currentTileSet.length > 0) {
        currentTileSet.splice(0, currentTileSet.length);
    }
    for (var i = 0; i < tileSet[floor].length; i++) {
        currentTileSet.push(tileSet[floor][i]);
    }
}

function setWorldLocation() {
    setRoom(world[worldY][worldX][1]);
    setFloor(world[worldY][worldX][0]);
}

var scrollDirection;
var scrollRoom = false;
function changeRoom() {
    if (posX < 0) {
        scrollRoom = true;
        scrollDirection = 4;
    } else if (posX > 160) {
        scrollRoom = true;
        scrollDirection = 6;
    } else if (posY > 140) {
        scrollRoom = true;
        scrollDirection = 2;
    } else if (posY < 0) {
        scrollRoom = true;
        scrollDirection = 8;
    }
}

var oldPosX;
var oldPosY;

var frameCount = 0;
var fps = 1000 / 60;
var tick = window.performance.now();
var start = tick;
var elapsed;

var collide;

function gameLoop(now) {
    if (!scrollRoom) {
        oldPosX = posX;
        oldPosY = posY;
        posX += speedX;
        posY += speedY;
        if (wallCollision(posX, posY)) {
            collide = true;
            posX = oldPosX;
            posY = oldPosY;
            collide = false;
        }
    }

    if (scrollRoom) {
        switch (scrollDirection) {
            case 2:
                posY -= 0.5;
                if (posY <= 8) {
                    scrollRoom = !scrollRoom;
                    worldY -= 1;
                    if (worldY < 0) {
                        worldY = 1;
                    }
                }
                break;

            case 8:
                posY += 0.5;
                if (posY >= 132) {
                    scrollRoom = !scrollRoom;
                    worldY += 1;
                    if (worldY > 2) {
                        worldY = 1;
                    }
                }
                break;

            case 6:
                posX -= 0.5;
                if (posX <= 8) {
                    scrollRoom = !scrollRoom;
                    worldX += 1;
                    if (worldX > 2) {
                        worldX = 1;
                    }
                }
                break;

            case 4:
                posX += 0.5;
                if (posX >= 152) {
                    scrollRoom = !scrollRoom;
                    worldX -= 1;
                    if (worldX < 0) {
                        worldX = 1;
                    }
                }
                break;
        }
        speedX = 0;
        speedY = 0;
        enableInput();
        goblinMode = false;
        setFloor(world[worldY][worldX][0]);
        setRoom(world[worldY][worldX][1]);
        generateEnemy(4);
    }
    if (enemy.length > 0) {
        enemyPosition(enemy.length);
        moveEnemy();
    }
    damagePlayer(enemy.length);
    setTimeout(damagePlayer, 5000);
    changeRoom();
    requestAnimationFrame(gameLoop);

    newNow = now;
    elapsed = newNow - tick;

    if (elapsed > fps) {
        tick = newNow - (elapsed % fps);
    }

    draw(tick);
}

const tileSheetUrl = "laattaarkki_esittelyversio.png"
const spriteSheetUrl = "spritearkki_esittelyversio.png"
const tileImage = loadImage(tileSheetUrl);
const tileSheet = newTileSheet(tileImage, 8, 8);

const spriteImage = loadImage(spriteSheetUrl);
const spriteSheet = newTileSheet(spriteImage, 8, 8);

function drawFloor(tileSheet) {
    const { w, h } = tileSheet;
    const tilesX = Math.ceil(canvas.width / w);
    const tilesY = Math.ceil(canvas.height / h);
    let n = 3333;
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            n = (16807 * n) % 0x7fffffff;
            let tx = {}[y];
            tx = tx || currentTileSet[n % currentTileSet.length];
            simpleDrawTile(tileSheet, tx, 0, x * w, y * h);
        }
    }
}

function drawObject(tileSheet, l) {
    for (let i = 0; i < currentLayout.length; i++) {
        if (currentLayout[i][3] == 0) {
            simpleDrawTile(tileSheet, currentLayout[i][2], 0, currentLayout[i][0], currentLayout[i][1]);
            simpleDrawTile(tileSheet, currentLayout[i][2], 0, currentLayout[i][0] + 8, currentLayout[i][1]);
            simpleDrawTile(tileSheet, currentLayout[i][2], 0, currentLayout[i][0], currentLayout[i][1] + 8);
            simpleDrawTile(tileSheet, currentLayout[i][2], 0, currentLayout[i][0] + 8, currentLayout[i][1] + 8);
        }
    }
}

function drawWall() {
    for (let i = 2; i < 6; i++) {
        let start = 0;
        switch (world[worldY][worldX][i]) {

            case 2:
            case 3:

                if (world[worldY][worldX][i] == 2) { start = 128 }
                break;

            case 4:
            case 5:
                if (world[worldY][worldX][i] == 4) { start = 144 }
                break;
        }

        if (world[worldY][worldX][i] == 1) {
            for (let i = 0; i < 6; i++) {

            }
        } else if (world[worldY][worldX][i] == 2) {
            for (let i = 0; i < 6; i++) {

            }
        }
    }
}

function scrollScreen(tileSheet) {
    var prev = currentTileSet.map(function (e) { return e; });

    switch (facing) {
        case 2:
            drawScrolling(tileSheet, currentTileSet, 2, true);
            drawScrolling(tileSheet, prev, 2, false);
            break;

        case 8:
            drawScrolling(tileSheet, currentTileSet, 8, true);
            drawScrolling(tileSheet, prev, 8, false);
            break;

        case 6:
            drawScrolling(tileSheet, currentTileSet, 6, true);
            drawScrolling(tileSheet, prev, 6, false);
            break;

        case 4:
            drawScrolling(tileSheet, currentTileSet, 4, true);
            drawScrolling(tileSheet, prev, 4, false);
            break;
    }
}

function drawScrolling(tileSheet, ts, d, curr) {
    const { w, h } = tileSheet;
    const tilesX = Math.ceil(canvas.width / w);
    const tilesY = Math.ceil(canvas.height / h);
    let n = 3333;
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            n = (16807 * n) % 0x7fffffff;
            let tx = {}[y];
            tx = tx || ts[n % ts.length];
            switch (d) {
                case 2:
                    if (curr) {
                        simpleDrawTile(tileSheet, tx, 0, x * w, y * h + posY - 8);
                    } else {
                        simpleDrawTile(tileSheet, tx, 0, x * w, y * h - 140 + posY - 8);
                    }
                    break;

                case 8:
                    if (curr) {
                        simpleDrawTile(tileSheet, tx, 0, x * w, y * h - 140 + posY + 8);
                    } else {
                        simpleDrawTile(tileSheet, tx, 0, x * w, y * h + posY + 8);
                    }
                    break;

                case 6:
                    if (curr) {
                        simpleDrawTile(tileSheet, tx, 0, x * w + posX - 8, y * h);
                    } else {
                        simpleDrawTile(tileSheet, tx, 0, x * w + posX - 168, y * h);
                    }
                    break;

                case 4:
                    if (curr) {
                        simpleDrawTile(tileSheet, tx, 0, x * w - 160 + posX + 8, y * h);
                    } else {
                        simpleDrawTile(tileSheet, tx, 0, x * w + posX + 8, y * h);
                    }
                    break;
            }
        }
    }
}

var prevStar = 0;

var bomb = false;
var smoke = false;
var flicker = false;
var explode = false;
var last = 0;
var shortW = 0;
var veryLongW = 0;
var midW = 0;
var longW = 0;
function draw(t) {
    drawRectangle(0, 0, canvas.width, canvas.height, "#9bbc0f");
    if (!scrollRoom) {
        drawFloor(tileSheet);
        drawWall();
        drawObject(tileSheet, 0);
        drawEnemy(spriteSheet, enemy.length);
        if (star) {
            if (t - prevStar > 500 && t - prevStar < 750) {
                star = false;
                prevStar = t;
            }
            drawStar(spriteSheet, 32, 40, starX, starY);
        } else { prevStar = t; }

        if (smoke) { drawSmoke(spriteSheet); }

        if (t - explosionTime < 1000) {
            bombExplode(spriteSheet);
            asd = t - explosionTime;
        }
        if (t - veryLongW >= 6000) {
            if (t - veryLongW <= 10000) { bomb = true; }
            veryLongW = t;
        }

        if (t - longW >= 2000) {
            if (t - longW <= 5000) { poof = true; }
            once = true;
            longW = t;
        }
        if (t - midW >= 1450) {
            smoke = false;
            midW = t - 450;
        }
        if (!shortW || t - shortW >= 500) {
            shuffle = !shuffle;
            shortW = t;
        }
        if (!last || t - last >= 100) {
            flicker = !flicker;
            last = t;
            switch (walkCycle) {
                case 0:
                    walkCycle = 1;
                    break;

                case 1:
                    walkCycle = 2;
                    break;

                case 2:
                    walkCycle = 0;
                    break;
            }
        }
    }

    drawLife(spriteSheet);
    if (scrollRoom) {
        window.removeEventListener("keydown", playerPress);
        window.removeEventListener("keyup", playerRelease);
        enemy.splice(0, enemy.length);
        scrollScreen(tileSheet);
        drawLife(spriteSheet);

        bomb = false;
        smoke = false;
        flicker = false;
        explode = false;
        explodeX = -50;
        explodeY = -50;
        shortW = 0;
        veryLongW = 0;
        midW = 0;
        longW = 0;
    }
    if (flicker && hit) { } else { drawPlayer(spriteSheet, 0, 0, posX, posY); }
    if (life < 0) {
        drawRectangle(0, 0, canvas.width, canvas.height, "#9bbc0f");
        document.getElementById("teksti").textContent = "[GAME OVER] press Z to restart";
    }
}

resizeCanvas();
enableInput();
setWorldLocation();
window.addEventListener("resize", resizeCanvas);
window.onload = function () {
    Promise.all(resourcePromises)
        .then(() => {
            gameLoop();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
};