// Grass terrain definition. Pure config — no logic.
//
// satiationByLevel[N]      = satiation gained from eating grass at level N.
// growthDelaySecByLevel[N] = seconds to grow FROM level N to level N+1.
//                            null or a negative value means grass at this
//                            level NEVER grows up on its own.
// spreadDelaySecByLevel[N] = seconds before grass at level N spreads to a
//                            lower-level neighbor. null or negative = never.

TerrainRegistry.register('Grass', {
    assetPathByLevel: {
        0: 'assets/Terrain/GrassLevel0.png',
        1: 'assets/Terrain/GrassLevel1.png',
        2: 'assets/Terrain/GrassLevel2.png',
        3: 'assets/Terrain/GrassLevel3.png'
    },
    satiationByLevel: {
        1: 10,
        2: 25,
        3: 50
    },
    growthDelaySecByLevel: {
        0: null,   // dirt does not regrow on its own
        1: 20,    // level 1 -> level 2
        2: 40     // level 2 -> level 3
    },
    spreadDelaySecByLevel: {
        0: null,        
        1: null,
        2: null,     // level 2 grass does not spread (negative = never)
        3: 10      // lush grass spreads after 30s
    }
});
