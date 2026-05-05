// main.js — bootstrap. Loads all configs, then builds world + UI.

function applyMinimapColorOverrides() {
    // Any entity config with a minimapColor pins that color in the
    // SpriteColorCache so the minimap renders the entity reliably,
    // regardless of what the actual sprite averages out to.
    for (var name in EntityRegistry._defs) {
        var def = EntityRegistry._defs[name];
        if (def.minimapColor && def.assetPath) {
            SpriteColorCache.setOverride(def.assetPath, def.minimapColor);
        }
    }
}

function startGame() {
    applyMinimapColorOverrides();

    function grassPicker(gx, gy) {
        return GrassLevel.Level0;
        /*var n = (gx * 7 + gy * 13) % 5;
        if (n === 0) return GrassLevel.Level0;
        if (n === 1) return GrassLevel.Level1;
        if (n === 2) return GrassLevel.Level2;
        return GrassLevel.Level3;*/
    }

    var world  = new World(30, 20, grassPicker);
    GrassBehavior.bootstrap(world);
    DinoDropBehavior.bootstrap(world);

    var player    = new Player(500);
    var gameState = new GameState(world, GAME_DURATION_SEC);

    var viewport  = document.getElementById('game-viewport');
    var worldView = new WorldView(world, viewport);

    var app = document.getElementById('app');
    var sidebarView = new SidebarView(world, worldView, player, app);
    var hudView     = new GameHudView(gameState, document.body);
    var victoryView = new VictoryView(gameState, document.body);
    var dropPickup  = new DropPickupView(worldView, player);

    // Spawn the first registered LIVING dino species in the middle.
    var startSpecies = null;
    for (var name in EntityRegistry._defs) {
        var def = EntityRegistry._defs[name];
        if (def.kind === 'dino' && def.isLiving !== false) { startSpecies = name; break; }
    }
    if (startSpecies) {
        var startGx = Math.floor(world.tilesArray.width  / 2);
        var startGy = Math.floor(world.tilesArray.height / 2);
        var rex = EntityFactory.create(startSpecies, startGx * TILE_SIZE, startGy * TILE_SIZE);
        if (rex) world.addEntity(rex);
        window.__game_rex = rex;
    }

    // --- Camera controls (WASD / arrows) — supports diagonals -----------
    var PAN_SPEED  = 6;     // pixels per pan tick
    var PAN_TICK_MS = 16;   // ~60Hz while keys are held
    var pressed = {};

    function isPanKey(k) {
        return k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown'
            || k === 'a' || k === 'A' || k === 'd' || k === 'D'
            || k === 'w' || k === 'W' || k === 's' || k === 'S';
    }
    document.addEventListener('keydown', function(e) {
        if (!isPanKey(e.key)) return;
        pressed[e.key] = true;
    });
    document.addEventListener('keyup', function(e) {
        delete pressed[e.key];
    });
    // Lose all keys on blur so a focus change doesn't strand them as "down".
    window.addEventListener('blur', function() { pressed = {}; });

    // Scaling rules:
    //   - orthogonal pan magnitude  = PAN_SPEED * sqrt(2)
    //   - diagonal pan magnitude    = PAN_SPEED * sqrt(2) (i.e. the same)
    //   To achieve identical magnitudes, normalize the input direction
    //   then scale by (PAN_SPEED * sqrt(2)).
    var SQRT2 = Math.SQRT2;
    setInterval(function() {
        var ix = 0, iy = 0;
        if (pressed['ArrowLeft']  || pressed['a'] || pressed['A']) ix -= 1;
        if (pressed['ArrowRight'] || pressed['d'] || pressed['D']) ix += 1;
        if (pressed['ArrowUp']    || pressed['w'] || pressed['W']) iy -= 1;
        if (pressed['ArrowDown']  || pressed['s'] || pressed['S']) iy += 1;
        if (ix === 0 && iy === 0) return;
        var len = Math.sqrt(ix * ix + iy * iy);
        var mag = PAN_SPEED * SQRT2;
        world.moveCamera((ix / len) * mag, (iy / len) * mag);
    }, PAN_TICK_MS);

    world.start();
    window.__game = { world: world, worldView: worldView, sidebar: sidebarView,
                      hud: hudView, player: player, gameState: gameState,
                      victory: victoryView, dropPickup: dropPickup };
}

TerrainLoader.loadAll(function() {
    EntityLoader.loadAll(function() {
        BuyItemLoader.loadAll(startGame);
    });
});
