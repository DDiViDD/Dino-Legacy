// World: top-level game state. Owns the map, camera, tick loop, and entities.

function World(mapWidth, mapHeight, grassPicker) {
    this.tilesArray = new TilesArray(mapWidth, mapHeight, grassPicker || null);
    this.camera     = { x: 0, y: 0 };
    this.entities   = [];
    this._tickables = [];   // plain array instead of Set
    this._tickHandle  = null;
    this._lastTickTs  = 0;
    this._tickCount   = 0;
    this._listeners   = {
        cameraMoved:   [],
        tick:          [],
        entityAdded:   [],
        entityRemoved: []
    };
}

World.prototype.getPixelWidth  = function() { return this.tilesArray.width  * TILE_SIZE; };
World.prototype.getPixelHeight = function() { return this.tilesArray.height * TILE_SIZE; };

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
    if (this._tickHandle !== null) {
        clearInterval(this._tickHandle);
        this._tickHandle = null;
    }
};

World.prototype._tick = function() {
    var now     = performance.now();
    var deltaMs = now - this._lastTickTs;
    this._lastTickTs = now;
    this._tickCount++;
    for (var i = 0; i < this._tickables.length; i++) {
        this._tickables[i].onTick(deltaMs);
    }
    this._emit('tick', { deltaMs: deltaMs, tickCount: this._tickCount });
};

World.prototype.addEntity = function(entity) {
    this.entities.push(entity);
    this.registerTickable(entity);
    this._emit('entityAdded', entity);
    return entity;
};

World.prototype.removeEntity = function(entity) {
    var idx = this.entities.indexOf(entity);
    if (idx === -1) return;
    this.entities.splice(idx, 1);
    this.unregisterTickable(entity);
    this._emit('entityRemoved', entity);
};

World.prototype.moveCamera = function(dx, dy) {
    this.camera.x += dx;
    this.camera.y += dy;
    this._emit('cameraMoved', this.camera);
};

World.prototype.setCamera = function(x, y) {
    this.camera.x = x;
    this.camera.y = y;
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
