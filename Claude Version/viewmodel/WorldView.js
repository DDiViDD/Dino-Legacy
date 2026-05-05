// WorldView: top-level renderer. Manages stacked layers and child views.
//
// Layers (back -> front):
//   terrain -> structures -> entities-low -> entities-high -> effects
//
// Click handling:
//   On a viewport click, look up entities at the clicked tile. If any
//   non-blocking entity is present (a Drop, a skeleton, etc.) we emit
//   'entityClicked' with the topmost one. Otherwise we emit 'tileClicked'
//   so the buy menu (or anything else) can react. This keeps drop pickup
//   independent of buy-menu state.

function WorldView(world, mountEl) {
    this.world   = world;
    this.mountEl = mountEl;

    this.layers = {
        terrain:       this._makeLayer('layer-terrain'),
        structures:    this._makeLayer('layer-structures'),
        entitiesLow:   this._makeLayer('layer-entities-low'),
        entitiesHigh:  this._makeLayer('layer-entities-high'),
        effects:       this._makeLayer('layer-effects')
    };
    var layerOrder = ['terrain', 'structures', 'entitiesLow', 'entitiesHigh', 'effects'];
    for (var i = 0; i < layerOrder.length; i++) {
        this.mountEl.appendChild(this.layers[layerOrder[i]]);
    }

    // Map edge shadow — sits in WORLD space (sized to the map) and pans
    // along with the camera. So shadow fades inward from each edge of the
    // playable area, not the screen.
    this._edgeShadow = document.createElement('div');
    this._edgeShadow.className = 'edge-shadow';
    this._edgeShadow.style.position = 'absolute';
    this._edgeShadow.style.left = '0';
    this._edgeShadow.style.top  = '0';
    this._edgeShadow.style.width  = world.getPixelWidth()  + 'px';
    this._edgeShadow.style.height = world.getPixelHeight() + 'px';
    this._edgeShadow.style.willChange = 'transform';
    this.mountEl.appendChild(this._edgeShadow);

    this.tileViews   = [];
    this.entityViews = {};
    this._buildTileViews();
    for (var j = 0; j < this.world.entities.length; j++) {
        this._addEntityView(this.world.entities[j]);
    }
    this._renderAll();

    this._listeners = { tileClicked: [], entityClicked: [] };

    var self = this;
    this.world.on('cameraMoved',   function()  { self._renderAll(); });
    this.world.on('tick',          function()  { self._renderDirty(); });
    this.world.on('entityAdded',   function(e) {
        self._addEntityView(e);
        self._renderEntityView(self.entityViews[e.id]);
    });
    this.world.on('entityRemoved', function(e) { self._removeEntityView(e); });

    this.mountEl.addEventListener('click', function(ev) {
        var rect = self.mountEl.getBoundingClientRect();
        var screenX = ev.clientX - rect.left;
        var screenY = ev.clientY - rect.top;
        var worldX = screenX + self.world.camera.x;
        var worldY = screenY + self.world.camera.y;
        var gx = Math.floor(worldX / TILE_SIZE);
        var gy = Math.floor(worldY / TILE_SIZE);
        var tile = self.world.tilesArray.getTile(gx, gy);
        if (!tile) return;

        // Hit-test for a clickable entity. Drops can be at non-integer
        // coordinates (a dino mid-step), so check the clicked tile AND
        // its 8 neighbors and pick the closest Drop whose visual center
        // is within half a tile of the click point.
        var clicked = null;
        var bestDist = TILE_SIZE * 0.6; // generous click slop
        for (var dgy = -1; dgy <= 1; dgy++) {
            for (var dgx = -1; dgx <= 1; dgx++) {
                var ents = self.world.entitiesAt(gx + dgx, gy + dgy);
                for (var k = 0; k < ents.length; k++) {
                    var e = ents[k];
                    if (!(e instanceof Drop)) continue;
                    // Visual center: entity x/y is tile top-left of where
                    // EntityView centers it, so the visible center is at
                    // (x + TILE_SIZE/2, y + TILE_SIZE/2).
                    var cxE = e.x + TILE_SIZE / 2;
                    var cyE = e.y + TILE_SIZE / 2;
                    var d = Math.sqrt((cxE - worldX) * (cxE - worldX) + (cyE - worldY) * (cyE - worldY));
                    if (d < bestDist) { bestDist = d; clicked = e; }
                }
            }
        }
        if (clicked) {
            self._emit('entityClicked', { entity: clicked, tile: tile, gx: gx, gy: gy });
            return;
        }

        self._emit('tileClicked', { tile: tile, gx: gx, gy: gy, worldX: worldX, worldY: worldY });
    });
}

WorldView.prototype.on = function(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
};
WorldView.prototype._emit = function(event, payload) {
    var list = this._listeners[event];
    if (!list) return;
    for (var i = 0; i < list.length; i++) list[i](payload);
};

WorldView.prototype._makeLayer = function(className) {
    var div = document.createElement('div');
    div.className = className;
    div.style.position = 'absolute';
    div.style.left = '0'; div.style.top = '0';
    div.style.width = '100%'; div.style.height = '100%';
    div.style.pointerEvents = 'none';
    return div;
};

WorldView.prototype._buildTileViews = function() {
    var self = this;
    this.world.tilesArray.forEach(function(tile) {
        var view = new TileView(tile);
        self.layers.terrain.appendChild(view.el);
        self.tileViews.push(view);
    });
};

WorldView.prototype._addEntityView = function(entity) {
    var view = new EntityView(entity);
    var layer = entity.blocksTile ? this.layers.entitiesHigh : this.layers.entitiesLow;
    layer.appendChild(view.el);
    this.entityViews[entity.id] = view;
};

WorldView.prototype._removeEntityView = function(entity) {
    var view = this.entityViews[entity.id];
    if (!view) return;
    view.destroy();
    delete this.entityViews[entity.id];
};

WorldView.prototype._renderEntityView = function(view) {
    if (!view) return;
    view.render(this.world.camera.x, this.world.camera.y);
};

WorldView.prototype._renderDirty = function() {
    var cx = this.world.camera.x, cy = this.world.camera.y;
    for (var i = 0; i < this.tileViews.length; i++) {
        if (this.tileViews[i].model.dirty) this.tileViews[i].render(cx, cy);
    }
    for (var id in this.entityViews) {
        if (this.entityViews[id].model.dirty) this.entityViews[id].render(cx, cy);
    }
};

WorldView.prototype._renderAll = function() {
    var cx = this.world.camera.x, cy = this.world.camera.y;
    for (var i = 0; i < this.tileViews.length; i++) this.tileViews[i].render(cx, cy);
    for (var id in this.entityViews) this.entityViews[id].render(cx, cy);
    if (this._edgeShadow) {
        this._edgeShadow.style.transform = 'translate(' + (-cx) + 'px, ' + (-cy) + 'px)';
    }
};

WorldView.prototype.destroy = function() {
    for (var i = 0; i < this.tileViews.length; i++) this.tileViews[i].destroy();
    this.tileViews = [];
    for (var id in this.entityViews) this.entityViews[id].destroy();
    this.entityViews = {};
    var keys = ['terrain', 'structures', 'entitiesLow', 'entitiesHigh', 'effects'];
    for (var j = 0; j < keys.length; j++) this.layers[keys[j]].parentNode.removeChild(this.layers[keys[j]]);
};
