// GrassBehavior: implements grass growth and spread by scheduling callbacks
// on world.scheduler. Behavior is data-driven from TerrainRegistry('Grass').
//
// Versioning rule: every (re)schedule call ALWAYS bumps the per-tile version
// first, so any pending callbacks from older states become stale and
// no-op when they fire — even if no new schedule is created. This is what
// guarantees that when a tile drops to a "never grow / never spread" level,
// previously-queued callbacks don't sneak through.

var GrassBehavior = (function() {

    function tileForbidsDiagonalSpread(tile) {
        return ((tile.gridX * 7 + tile.gridY * 11) % 7) < 2;
    }

    function getGrassDef() { return TerrainRegistry.get('Grass') || {}; }

    function configuredGrowthDelay(tile) {
        var def = getGrassDef();
        return def.growthDelaySecByLevel ? def.growthDelaySecByLevel[tile.grassLevel] : null;
    }
    function configuredSpreadDelay(tile) {
        var def = getGrassDef();
        return def.spreadDelaySecByLevel ? def.spreadDelaySecByLevel[tile.grassLevel] : null;
    }

    // ---- Growth ------------------------------------------------------
    function _scheduleGrowth(world, tile, delaySecOverride) {
        // ALWAYS bump version first to invalidate any stale pending callback.
        tile._growthVersion = (tile._growthVersion || 0) + 1;
        var version = tile._growthVersion;

        var delaySec = (delaySecOverride !== undefined && delaySecOverride !== null)
            ? delaySecOverride
            : configuredGrowthDelay(tile);
        if (isNeverValue(delaySec) || delaySec === 0) return;

        world.scheduler.scheduleIn(delaySec * 1000, function() {
            if (tile._growthVersion !== version) return;
            if (tile.grassLevel >= GrassLevel.Level3) return;
            tile.setGrassLevel(tile.grassLevel + 1);
            // tileChanged listener will reschedule from the new level.
        });
    }

    // ---- Spread ------------------------------------------------------
    function _scheduleSpread(world, tile, delaySecOverride) {
        tile._spreadVersion = (tile._spreadVersion || 0) + 1;
        var version = tile._spreadVersion;

        var delaySec = (delaySecOverride !== undefined && delaySecOverride !== null)
            ? delaySecOverride
            : configuredSpreadDelay(tile);
        if (isNeverValue(delaySec) || delaySec === 0) return;

        world.scheduler.scheduleIn(delaySec * 1000, function() {
            if (tile._spreadVersion !== version) return;
            // Defensive: only spread from the levels that have a delay set.
            if (isNeverValue(configuredSpreadDelay(tile))) return;

            attemptSpread(world, tile);
            _scheduleSpread(world, tile);
        });
    }

    function attemptSpread(world, sourceTile) {
        var noDiag = tileForbidsDiagonalSpread(sourceTile);
        var diagonalWeight = 1 / Math.sqrt(2); // ≈ 0.7071

        var candidates = [];
        var totalWeight = 0;
        var dirs = [
            { dx: -1, dy: -1, diag: true  }, { dx:  0, dy: -1, diag: false }, { dx:  1, dy: -1, diag: true  },
            { dx: -1, dy:  0, diag: false },                                   { dx:  1, dy:  0, diag: false },
            { dx: -1, dy:  1, diag: true  }, { dx:  0, dy:  1, diag: false }, { dx:  1, dy:  1, diag: true  }
        ];
        for (var i = 0; i < dirs.length; i++) {
            var d = dirs[i];
            if (d.diag && noDiag) continue;
            var nb = world.tilesArray.getTile(sourceTile.gridX + d.dx, sourceTile.gridY + d.dy);
            if (!nb) continue;
            if (nb.grassLevel !== GrassLevel.Level0) continue;
            var w = d.diag ? diagonalWeight : 1.0;
            candidates.push({ tile: nb, weight: w });
            totalWeight += w;
        }
        if (candidates.length === 0) return;

        var roll = Math.random() * totalWeight;
        for (var j = 0; j < candidates.length; j++) {
            roll -= candidates[j].weight;
            if (roll <= 0) { candidates[j].tile.setGrassLevel(GrassLevel.Level1); return; }
        }
        candidates[candidates.length - 1].tile.setGrassLevel(GrassLevel.Level1);
    }

    return {
        bootstrap: function(world) {
            var ta = world.tilesArray;
            for (var i = 0; i < ta.tiles.length; i++) {
                var t = ta.tiles[i];
                var gDelay = configuredGrowthDelay(t);
                if (!isNeverValue(gDelay) && gDelay > 0) {
                    _scheduleGrowth(world, t, gDelay * Math.random());
                }
                var sDelay = configuredSpreadDelay(t);
                if (!isNeverValue(sDelay) && sDelay > 0) {
                    _scheduleSpread(world, t, sDelay * Math.random());
                }
            }
            world.on('tileChanged', function(tile) {
                _scheduleGrowth(world, tile);
                _scheduleSpread(world, tile);
            });
        }
    };
})();
