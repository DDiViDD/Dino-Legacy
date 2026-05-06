// World: top-level game state. Owns the map, camera, tick loop, entities,
// scheduler, and tile-occupancy/reservation indexes.

(function() {
    function World(mapWidth, mapHeight, grassPicker) {
        this.tilesArray = new TilesArray(mapWidth, mapHeight, grassPicker || null);
        this.tilesArray.attachWorld(this);
        this.camera     = { x: 0, y: 0 };
        this.entities   = [];
        this._tickables = [];
        this.scheduler  = new Scheduler();

        this._entitiesByTile = {};
        this._reservations   = {};

        this._tickHandle = null;
        this._lastTickTs = 0;
        this._tickCount  = 0;
        this._listeners = {
            cameraMoved:    [],
            tick:           [],
            entityAdded:    [],
            entityRemoved:  [],
            entityMoved:    [],
            tileChanged:    []
        };
    }

    World.prototype.getPixelWidth  = function() { return this.tilesArray.width  * TILE_SIZE; };
    World.prototype.getPixelHeight = function() { return this.tilesArray.height * TILE_SIZE; };

    World.prototype._tileKeyXY = function(gx, gy) {
        return gy * this.tilesArray.width + gx;
    };

    World.prototype.entitiesAt = function(gx, gy) {
        return this._entitiesByTile[this._tileKeyXY(gx, gy)] || [];
    };

    World.prototype.hasBlockerAt = function(gx, gy) {
        var list = this._entitiesByTile[this._tileKeyXY(gx, gy)];
        if (!list) return false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].blocksTile) return true;
        }
        return false;
    };

    World.prototype.isTileAvailableFor = function(gx, gy, self) {
        if (!this.tilesArray.getTile(gx, gy)) return false;
        var key = this._tileKeyXY(gx, gy);
        var list = this._entitiesByTile[key];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                var e = list[i];
                if (e === self) continue;
                if (e.blocksTile) return false;
            }
        }
        var resv = this._reservations[key];
        if (resv && resv !== self) return false;
        return true;
    };

    World.prototype.tryReserveTile = function(gx, gy, entity) {
        if (!this.isTileAvailableFor(gx, gy, entity)) return false;
        this._reservations[this._tileKeyXY(gx, gy)] = entity;
        return true;
    };

    World.prototype.releaseReservation = function(gx, gy, entity) {
        var key = this._tileKeyXY(gx, gy);
        if (this._reservations[key] === entity) delete this._reservations[key];
    };

    World.prototype._releaseAllReservationsFor = function(entity) {
        for (var key in this._reservations) {
            if (this._reservations[key] === entity) delete this._reservations[key];
        }
    };

    World.prototype._reindexEntity = function(entity, fromKey, toKey) {
        if (fromKey !== null && fromKey !== undefined) {
            var arr = this._entitiesByTile[fromKey];
            if (arr) {
                var idx = arr.indexOf(entity);
                if (idx !== -1) arr.splice(idx, 1);
                if (arr.length === 0) delete this._entitiesByTile[fromKey];
            }
        }
        if (toKey !== null && toKey !== undefined) {
            if (!this._entitiesByTile[toKey]) this._entitiesByTile[toKey] = [];
            this._entitiesByTile[toKey].push(entity);
        }
    };

    World.prototype.registerTickable = function(el) {
        if (this._tickables.indexOf(el) === -1) this._tickables.push(el);
    };
    World.prototype.unregisterTickable = function(el) {
        var idx = this._tickables.indexOf(el);
        if (idx !== -1) this._tickables.splice(idx, 1);
    };

    World.prototype.start = function() {
        if (this._tickHandle !== null) return;
        this._lastTickTs = performance.now();
        var self = this;
        this._tickHandle = setInterval(function() { self._tick(); }, TICK_RATE_MS);
    };

    World.prototype.stop = function() {
        if (this._tickHandle !== null) { clearInterval(this._tickHandle); this._tickHandle = null; }
    };

    World.prototype._tick = function() {
        var now = performance.now();
        var deltaMs = now - this._lastTickTs;
        this._lastTickTs = now;
        this._tickCount++;

        this.scheduler.runDue(now);

        var snapshot = this._tickables.slice();
        for (var i = 0; i < snapshot.length; i++) snapshot[i].onTick(deltaMs);

        this._emit('tick', { deltaMs: deltaMs, tickCount: this._tickCount });
    };

    World.prototype.addEntity = function(entity) {
        this.entities.push(entity);
        entity.world = this;
        this.registerTickable(entity);

        var gx = Math.round(entity.x / TILE_SIZE);
        var gy = Math.round(entity.y / TILE_SIZE);
        var key = this._tileKeyXY(gx, gy);
        entity._tileKey = key;
        this._reindexEntity(entity, null, key);

        this._emit('entityAdded', entity);
        return entity;
    };

    World.prototype.removeEntity = function(entity) {
        var idx = this.entities.indexOf(entity);
        if (idx === -1) return;

        if (entity.currentAction && !entity.currentAction.isDone) {
            entity.currentAction.isDone = true;
            try { entity.currentAction.onEnd(entity); } catch (e) {}
            entity.currentAction = null;
        }
        this._releaseAllReservationsFor(entity);

        this.entities.splice(idx, 1);
        this.unregisterTickable(entity);
        this._reindexEntity(entity, entity._tileKey, null);
        entity._tileKey = null;
        entity.world = null;
        this._emit('entityRemoved', entity);
    };

    World.prototype._onEntityMoved = function(entity) {
        var gx = Math.round(entity.x / TILE_SIZE);
        var gy = Math.round(entity.y / TILE_SIZE);
        var newKey = this._tileKeyXY(gx, gy);
        if (newKey !== entity._tileKey) {
            this._reindexEntity(entity, entity._tileKey, newKey);
            entity._tileKey = newKey;
        }
        this._emit('entityMoved', entity);
    };

    World.prototype.moveCamera = function(dx, dy) {
        this.camera.x += dx; this.camera.y += dy;
        this._emit('cameraMoved', this.camera);
    };
    World.prototype.setCamera = function(x, y) {
        this.camera.x = x; this.camera.y = y;
        this._emit('cameraMoved', this.camera);
    };

    World.prototype.on = function(event, handler) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(handler);
    };

    World.prototype._emit = function(event, payload) {
        var list = this._listeners[event];
        if (!list) return;
        for (var i = 0; i < list.length; i++) list[i](payload);
    };

    window.World = World;
})();
