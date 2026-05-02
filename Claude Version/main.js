// main.js — bootstrap. Wires World to WorldView and hooks up input.

// --- Build a world -------------------------------------------------------
function grassPicker(gx, gy) {
    var n = (gx * 7 + gy * 13) % 5;
    if (n === 0) return GrassLevel.Level0;
    if (n === 1) return GrassLevel.Level1;
    if (n === 2) return GrassLevel.Level2;
    return GrassLevel.Level3;
}

var world = new World(40, 10, grassPicker);

// --- Mount the view ------------------------------------------------------
var viewport  = document.getElementById('game-viewport');
var worldView = new WorldView(world, viewport);

// --- Spawn a dinosaur ----------------------------------------------------
var species  = DinoListConfig[0];
var startGx  = Math.floor(world.tilesArray.width  / 2);
var startGy  = Math.floor(world.tilesArray.height / 2);
var rex      = new Dinosaur(startGx * TILE_SIZE, startGy * TILE_SIZE, species);
world.addEntity(rex);

// When idle, wander to a random tile.
world.on('tick', function() {
    if (rex.isIdle()) {
        var tx = Math.floor(Math.random() * world.tilesArray.width);
        var ty = Math.floor(Math.random() * world.tilesArray.height);
        rex.setAction(new MoveToTileAction(tx, ty));
    }
});

// --- Camera controls (WASD / arrows) -------------------------------------
var PAN_SPEED = 20;
var hudCamera = document.getElementById('hud-camera');

world.on('cameraMoved', function(cam) {
    hudCamera.textContent = 'camera: ' + (cam.x | 0) + ', ' + (cam.y | 0);
});

document.addEventListener('keydown', function(e) {
    var dx = 0, dy = 0;
    switch (e.key) {
        case 'ArrowLeft':  case 'a': case 'A': dx = -PAN_SPEED; break;
        case 'ArrowRight': case 'd': case 'D': dx =  PAN_SPEED; break;
        case 'ArrowUp':    case 'w': case 'W': dy = -PAN_SPEED; break;
        case 'ArrowDown':  case 's': case 'S': dy =  PAN_SPEED; break;
        default: return;
    }
    world.moveCamera(dx, dy);
});

// --- Start ---------------------------------------------------------------
world.start();

window.__game = { world: world, worldView: worldView, rex: rex };
