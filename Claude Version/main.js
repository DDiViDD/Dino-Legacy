// main.js — composition root only. Builds the model graph, the renderers,
// and the controllers, and starts the world. Behavior lives in dedicated
// modules; this file should remain small.

function applyMinimapColorOverrides() {
    var defs = EntityRegistry._defs;
    for (var name in defs) {
        var def = defs[name];
        if (def.minimapColor && def.assetPath) {
            SpriteColorCache.setOverride(def.assetPath, def.minimapColor);
        }
    }
}

function spawnStarterDino(world) {
    var entries = EntityRegistry.entries();
    for (var entry of entries) {
        var def = entry.def;
        var name = entry.name;
        if (def.kind === 'dino' && def.isLiving !== false) {
            var gx = Math.floor(world.tilesArray.width  / 2);
            var gy = Math.floor(world.tilesArray.height / 2);
            var ent = EntityFactory.create(name, gx * TILE_SIZE, gy * TILE_SIZE);
            if (ent) world.addEntity(ent);
            return ent;
        }
    }
    return null;
}

function defaultGrassPicker(gx, gy) {
    return GrassLevel.Level0;
}

function startGame() {
    applyMinimapColorOverrides();

    var world  = new World(30, 20, defaultGrassPicker);
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

    var rex = spawnStarterDino(world);
    var camera = new CameraController(world);

    world.start();

    window.__game = {
        world: world, worldView: worldView, sidebar: sidebarView,
        hud: hudView, player: player, gameState: gameState,
        victory: victoryView, dropPickup: dropPickup,
        camera: camera, rex: rex
    };
}

// Boot sequence: load configs (terrain, entities, buy items), then preload
// every asset they reference, then start the game. Each step is sequential
// so later steps can rely on earlier ones being fully resolved.
TerrainLoader.loadAll(function() {
    EntityLoader.loadAll(function() {
        BuyItemLoader.loadAll(function() {
            AssetLoader.loadAll(startGame);
        });
    });
});
