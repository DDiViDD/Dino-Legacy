// main.js — bootstrap. Wires World (model) to WorldView (renderer) and
// hooks up input. Keep this file thin; it's the composition root only.

// Load all dino definitions first, then build the world.
DinoLoader.loadAll().then(() => {

    // --- Build a world --------------------------------------------------
    const grassPicker = (gx, gy) => {
        const n = (gx * 7 + gy * 13) % 5;
        if (n === 0) return GrassLevel.Level0;
        if (n === 1) return GrassLevel.Level1;
        if (n === 2) return GrassLevel.Level2;
        return GrassLevel.Level3;
    };

    const world = new World(40, 10, grassPicker);

    // --- Mount the view -------------------------------------------------
    const viewport = document.getElementById('game-viewport');
    const worldView = new WorldView(world, viewport);

    // --- Spawn a dinosaur from the registry -----------------------------
    // Pick the first available species so this works with any config.
    const species = DinoListConfig[0];
    const startGx = Math.floor(world.tilesArray.width  / 2);
    const startGy = Math.floor(world.tilesArray.height / 2);
    const rex = new Dinosaur(startGx * TILE_SIZE, startGy * TILE_SIZE, species);
    world.addEntity(rex);

    // Demo: when idle, wander to a random tile.
    world.on('tick', () => {
        if (rex.isIdle()) {
            const tx = Math.floor(Math.random() * world.tilesArray.width);
            const ty = Math.floor(Math.random() * world.tilesArray.height);
            rex.setAction(new MoveToTileAction(tx, ty));
        }
    });

    // --- Camera controls (WASD / arrows) --------------------------------
    const PAN_SPEED = 20;
    const hudCamera = document.getElementById('hud-camera');

    world.on('cameraMoved', cam => {
        hudCamera.textContent = `camera: ${cam.x | 0}, ${cam.y | 0}`;
    });

    document.addEventListener('keydown', e => {
        let dx = 0, dy = 0;
        switch (e.key) {
            case 'ArrowLeft':  case 'a': case 'A': dx = -PAN_SPEED; break;
            case 'ArrowRight': case 'd': case 'D': dx =  PAN_SPEED; break;
            case 'ArrowUp':    case 'w': case 'W': dy = -PAN_SPEED; break;
            case 'ArrowDown':  case 's': case 'S': dy =  PAN_SPEED; break;
            default: return;
        }
        world.moveCamera(dx, dy);
    });

    // --- Start the tick loop --------------------------------------------
    world.start();

    // Expose for debugging from the console.
    window.__game = { world, worldView, rex };

}).catch(err => {
    console.error('Failed to load game assets:', err);
});
