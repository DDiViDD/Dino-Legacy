// Shared constants and enums for the game.

var TILE_SIZE = 75;

var ElementType = Object.freeze({
    Terrain:   'Terrain',
    Entity:    'Entity',
    Structure: 'Structure',
    Drop:      'Drop',
    UI:        'UI',
    Effect:    'Effect'
});

var GrassLevel = Object.freeze({
    Level0: 0, Level1: 1, Level2: 2, Level3: 3
});

var TICK_RATE_MS = 100;

// --- Dinosaur survival defaults -----------------------------------------
var MAX_SATIATION                    = 100;
var DEFAULT_SATIATION_DECAY_TIME_SEC = 120;
var DEFAULT_SEEK_FOOD_SATIATION      = 50;
var DEFAULT_DESPERATE_SATIATION      = 20;

// --- Game session -------------------------------------------------------
var GAME_DURATION_SEC = 300;   // 5 minutes
var SCORE_INTERVAL_MS = 1000;  // accumulate score every 1s

// --- Camera ------------------------------------------------------------
var CAMERA_PAN_SPEED   = 6;    // base pixels per pan tick (orth/diag both
                               // scaled by sqrt(2) for equal magnitudes)
var CAMERA_TICK_MS     = 16;   // ~60Hz pan tick rate

// Helper: treat null, undefined, NaN, and negative numbers as "never".
function isNeverValue(v) {
    return v === null || v === undefined || (typeof v === 'number' && (isNaN(v) || v < 0));
}
