// DinoDropBehavior: when a dinosaur is added to the world, if its config
// has dropsEntity + dropDelaySec, schedule a recurring drop spawn on
// world.scheduler. Stops automatically when the dino dies (re-checks
// dino.dead and dino.world before each spawn).
//
// This file lives apart from Dinosaur.js so dino logic stays small and
// drops are an opt-in feature configured purely via the registry.

var DinoDropBehavior = (function() {

    function _scheduleNextDrop(dino) {
        var def = EntityRegistry.get(dino.species);
        if (!def) return;
        var dropName = def.dropsEntity;
        var delaySec = def.dropDelaySec;
        if (!dropName || isNeverValue(delaySec) || delaySec <= 0) return;
        if (!EntityRegistry.has(dropName)) return;
        if (!dino.world) return;

        var version = (dino._dropVersion || 0) + 1;
        dino._dropVersion = version;

        dino.world.scheduler.scheduleIn(delaySec * 1000, function() {
            // Stale (dino died/respawned/etc)? bail.
            if (dino._dropVersion !== version) return;
            if (dino.dead || !dino.world) return;

            // Spawn at the dino's exact current position so the coin's
            // visual center aligns with the dino's visual center at the
            // moment of dropping (EntityView centers sprites within the
            // tile cell, so identical x/y => identical screen center).
            // The world indexes drops by Math.round(x/TILE_SIZE), and
            // WorldView's click hit-test scans neighboring tiles, so this
            // is robust to mid-step coordinates.
            var drop = new Drop(dino.x, dino.y, dropName);
            dino.world.addEntity(drop);

            if (drop.lifespanSec && drop.lifespanSec > 0) {
                _scheduleDropExpiry(drop);
            }

            // Schedule the next drop.
            _scheduleNextDrop(dino);
        });
    }

    function _scheduleDropExpiry(drop) {
        var version = (drop._lifeVersion || 0) + 1;
        drop._lifeVersion = version;
        drop.world.scheduler.scheduleIn(drop.lifespanSec * 1000, function() {
            if (drop._lifeVersion !== version) return;
            if (!drop.world) return;
            drop.world.removeEntity(drop);
        });
    }

    return {
        bootstrap: function(world) {
            world.on('entityAdded', function(entity) {
                if (entity.species && EntityRegistry.isKind(entity.species, 'dino')) {
                    _scheduleNextDrop(entity);
                }
            });
            // Already-present dinos at boot:
            for (var i = 0; i < world.entities.length; i++) {
                var e = world.entities[i];
                if (e.species && EntityRegistry.isKind(e.species, 'dino')) {
                    _scheduleNextDrop(e);
                }
            }
        }
    };
})();
