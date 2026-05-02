// WorldView: top-level renderer. Manages layers and all child views.

function WorldView(world, mountEl) {
    this.world   = world;
    this.mountEl = mountEl;

    this.layers = {
        terrain:    this._makeLayer('layer-terrain'),
        structures: this._makeLayer('layer-structures'),
        entities:   this._makeLayer('layer-entities'),
        effects:    this._makeLayer('layer-effects')
    };

    var layerKeys = ['terrain', 'structures', 'entities', 'effects'];
    for (var i = 0; i < layerKeys.length; i++) {
        this.mountEl.appendChild(this.layers[layerKeys[i]]);
    }

    this.tileViews = [];
    // Plain object used as id->view map (ES5, no Map).
    this.entityViews = {};

    this._buildTileViews();

    // Views for any entities already in the world.
    for (var j = 0; j < this.world.entities.length; j++) {
        this._addEntityView(this.world.entities[j]);
    }

    this._renderAll();

    var self = this;
    this.world.on('cameraMoved',   function()  { self._renderAll(); });
    this.world.on('tick',          function()  { self._renderDirtyEntities(); });
    this.world.on('entityAdded',   function(e) {
        self._addEntityView(e);
        self._renderEntityView(self.entityViews[e.id]);
    });
    this.world.on('entityRemoved', function(e) { self._removeEntityView(e); });
}

WorldView.prototype._makeLayer = function(className) {
    var div = document.createElement('div');
    div.className = className;
    div.style.position = 'absolute';
    div.style.left = '0';
    div.style.top = '0';
    div.style.width = '100%';
    div.style.height = '100%';
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
    this.layers.entities.appendChild(view.el);
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

WorldView.prototype._renderDirtyEntities = function() {
    var cx = this.world.camera.x;
    var cy = this.world.camera.y;
    for (var id in this.entityViews) {
        var view = this.entityViews[id];
        if (view.model.dirty) view.render(cx, cy);
    }
};

WorldView.prototype._renderAll = function() {
    var cx = this.world.camera.x;
    var cy = this.world.camera.y;
    for (var i = 0; i < this.tileViews.length; i++) {
        this.tileViews[i].render(cx, cy);
    }
    for (var id in this.entityViews) {
        this.entityViews[id].render(cx, cy);
    }
};

WorldView.prototype.destroy = function() {
    for (var i = 0; i < this.tileViews.length; i++) this.tileViews[i].destroy();
    this.tileViews = [];
    for (var id in this.entityViews) this.entityViews[id].destroy();
    this.entityViews = {};
    var layerKeys = ['terrain', 'structures', 'entities', 'effects'];
    for (var j = 0; j < layerKeys.length; j++) {
        this.layers[layerKeys[j]].parentNode.removeChild(this.layers[layerKeys[j]]);
    }
};
