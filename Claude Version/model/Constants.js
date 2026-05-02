// Shared constants and enums for the game.

var TILE_SIZE = 75;

var ElementType = Object.freeze({
    Terrain:   'Terrain',
    Entity:    'Entity',
    Structure: 'Structure',
    UI:        'UI',
    Effect:    'Effect'
});

var GrassLevel = Object.freeze({
    Level0: 0,
    Level1: 1,
    Level2: 2,
    Level3: 3
});

var TICK_RATE_MS = 100;
