// MinimapView: 2px-per-tile overview of the world.
//
// Layout:
//   Fixed-size clip box (MINIMAP_VIEWPORT_PX). The full-map canvas inside
//   is translated via CSS to keep the camera centered. Clicks translate
//   through the same offset.
//
// Color cache strategy:
//   We use SpriteColorCache.peek() during the hot draw loop (no recursion).
//   When a peek returns null (the cache hasn't been populated for this
//   sprite yet), we fire-and-forget a SpriteColorCache.get() that will
//   populate the cache and trigger an overlay redraw when it resolves.
//   Without this, entity sprites that never appear as tile sources stay
//   uncached forever and fall back to the 'red dot' default.

var MINIMAP_TILE_PX             = 2;
var MINIMAP_UPDATE_INTERVAL_MS  = 2000;
var MINIMAP_VIEWPORT_PX         = 220;

function MinimapView(world, worldView, mountEl) {
    this.world     = world;
    this.worldView = worldView;

    var fullW = world.tilesArray.width  * MINIMAP_TILE_PX;
    var fullH = world.tilesArray.height * MINIMAP_TILE_PX;
    this.fullW = fullW;
    this.fullH = fullH;

    this.el = document.createElement('div');
    this.el.className = 'minimap';

    this._clip = document.createElement('div');
    this._clip.className = 'minimap-clip';
    this._clip.style.position = 'relative';
    this._clip.style.width  = MINIMAP_VIEWPORT_PX + 'px';
    this._clip.style.height = MINIMAP_VIEWPORT_PX + 'px';
    this._clip.style.overflow = 'hidden';
    this.el.appendChild(this._clip);

    this.canvas = document.createElement('canvas');
    this.canvas.width  = fullW;
    this.canvas.height = fullH;
    this.canvas.className = 'minimap-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top  = '0';
    this.canvas.style.willChange = 'transform';
    this._clip.appendChild(this.canvas);
    mountEl.appendChild(this.el);

    this.ctx = this.canvas.getContext('2d');

    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width  = fullW;
    this.terrainCanvas.height = fullH;
    this.terrainCtx = this.terrainCanvas.getContext('2d');

    this._dirtyTileIndexes = {};
    var ta = this.world.tilesArray;
    for (var i = 0; i < ta.tiles.length; i++) this._dirtyTileIndexes[i] = true;

    this._lastDrawAt   = 0;
    this._needsRedraw  = true;
    this._panOffsetX   = 0;
    this._panOffsetY   = 0;
    // URLs we've already kicked off a `get()` for, to avoid stacking
    // requests every redraw.
    this._spriteRequested = {};

    var self = this;
    this.world.on('tick',          function() { self._maybeRedraw(); });
    this.world.on('tileChanged',   function(tile) { self.markTileDirty(tile.gridX, tile.gridY); });
    this.world.on('cameraMoved',   function() { self._onCameraMoved(); });
    this.world.on('entityAdded',   function() { self._drawOverlayOnly(); });
    this.world.on('entityRemoved', function() { self._drawOverlayOnly(); });

    this._clip.addEventListener('click', function(ev) { self._onClick(ev); });
    this._clip.style.cursor = 'crosshair';

    this._maybeRedraw(true);
    this._updatePanOffset();
}

MinimapView.prototype.markTileDirty = function(gx, gy) {
    var w = this.world.tilesArray.width;
    this._dirtyTileIndexes[gy * w + gx] = true;
    this._needsRedraw = true;
};

MinimapView.prototype._updatePanOffset = function() {
    var viewportEl = document.getElementById('game-viewport');
    var vw = viewportEl ? viewportEl.clientWidth  : window.innerWidth;
    var vh = viewportEl ? viewportEl.clientHeight : window.innerHeight;

    var camCenterX_world = this.world.camera.x + vw / 2;
    var camCenterY_world = this.world.camera.y + vh / 2;
    var camCenterX_mini  = (camCenterX_world / TILE_SIZE) * MINIMAP_TILE_PX;
    var camCenterY_mini  = (camCenterY_world / TILE_SIZE) * MINIMAP_TILE_PX;

    var halfV = MINIMAP_VIEWPORT_PX / 2;
    var ox = halfV - camCenterX_mini;
    var oy = halfV - camCenterY_mini;

    if (this.fullW <= MINIMAP_VIEWPORT_PX) {
        ox = (MINIMAP_VIEWPORT_PX - this.fullW) / 2;
    } else {
        var minOx = MINIMAP_VIEWPORT_PX - this.fullW, maxOx = 0;
        if (ox > maxOx) ox = maxOx;
        if (ox < minOx) ox = minOx;
    }
    if (this.fullH <= MINIMAP_VIEWPORT_PX) {
        oy = (MINIMAP_VIEWPORT_PX - this.fullH) / 2;
    } else {
        var minOy = MINIMAP_VIEWPORT_PX - this.fullH, maxOy = 0;
        if (oy > maxOy) oy = maxOy;
        if (oy < minOy) oy = minOy;
    }

    this._panOffsetX = ox;
    this._panOffsetY = oy;
    this.canvas.style.transform =
        'translate(' + Math.round(ox) + 'px, ' + Math.round(oy) + 'px)';
};

MinimapView.prototype._onCameraMoved = function() {
    this._updatePanOffset();
    this._drawOverlayOnly();
};

MinimapView.prototype._onClick = function(ev) {
    var rect = this._clip.getBoundingClientRect();
    var clipX = ev.clientX - rect.left;
    var clipY = ev.clientY - rect.top;
    var px = clipX - this._panOffsetX;
    var py = clipY - this._panOffsetY;

    var worldX = (px / MINIMAP_TILE_PX) * TILE_SIZE;
    var worldY = (py / MINIMAP_TILE_PX) * TILE_SIZE;

    var viewportEl = document.getElementById('game-viewport');
    var vw = viewportEl ? viewportEl.clientWidth  : window.innerWidth;
    var vh = viewportEl ? viewportEl.clientHeight : window.innerHeight;
    var cx = worldX - vw / 2;
    var cy = worldY - vh / 2;

    var maxX = Math.max(0, this.world.getPixelWidth()  - vw);
    var maxY = Math.max(0, this.world.getPixelHeight() - vh);
    if (cx < 0) cx = 0; if (cx > maxX) cx = maxX;
    if (cy < 0) cy = 0; if (cy > maxY) cy = maxY;

    this.world.setCamera(cx, cy);
};

MinimapView.prototype._maybeRedraw = function(force) {
    if (!force) {
        var now = performance.now();
        if (!this._needsRedraw) return;
        if (now - this._lastDrawAt < MINIMAP_UPDATE_INTERVAL_MS) return;
        this._lastDrawAt = now;
    } else {
        this._lastDrawAt = performance.now();
    }
    this._drawTerrainAndOverlay();
    this._needsRedraw = false;
};

MinimapView.prototype._drawTerrainAndOverlay = function() {
    var p  = MINIMAP_TILE_PX;
    var ta = this.world.tilesArray;
    var w  = ta.width;
    var tctx = this.terrainCtx;
    var self = this;

    for (var key in this._dirtyTileIndexes) {
        var idx = key | 0;
        var tile = ta.tiles[idx];
        if (!tile) continue;
        var url = tile.getAssetPath();
        var color = SpriteColorCache.peek(url);
        if (!color) {
            (function(idxLocal, urlLocal) {
                self._requestSprite(urlLocal, function() {
                    self._dirtyTileIndexes[idxLocal] = true;
                    self._needsRedraw = true;
                });
            })(idx, url);
            continue;
        }
        var gx = idx % w, gy = (idx / w) | 0;
        tctx.fillStyle = color;
        tctx.fillRect(gx * p, gy * p, p, p);
        delete this._dirtyTileIndexes[idx];
    }

    this._drawOverlayOnly();
};

// Cheap repaint: clears, blits cached terrain, draws entities + camera box.
MinimapView.prototype._drawOverlayOnly = function() {
    var p = MINIMAP_TILE_PX;
    var ctx = this.ctx;
    var self = this;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.terrainCanvas, 0, 0);

    for (var i = 0; i < this.world.entities.length; i++) {
        var e = this.world.entities[i];
        var url2 = e.getAssetPath ? e.getAssetPath() : null;
        var ec = url2 ? SpriteColorCache.peek(url2) : null;
        if (!ec && url2) {
            // Kick off a real fetch so subsequent draws have a real color.
            this._requestSprite(url2, function() { self._drawOverlayOnly(); });
        }
        ctx.fillStyle = ec || 'rgb(255,80,80)';
        var ex = Math.round(e.x / TILE_SIZE) * p;
        var ey = Math.round(e.y / TILE_SIZE) * p;
        ctx.fillRect(ex, ey, p, p);
    }

    var viewportEl = document.getElementById('game-viewport');
    if (viewportEl) {
        var vx = (this.world.camera.x / TILE_SIZE) * p;
        var vy = (this.world.camera.y / TILE_SIZE) * p;
        var vwTiles = (viewportEl.clientWidth  / TILE_SIZE) * p;
        var vhTiles = (viewportEl.clientHeight / TILE_SIZE) * p;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1;
        ctx.strokeRect(vx + 0.5, vy + 0.5, vwTiles, vhTiles);
    }
};

// Ensure the cache is populated for `url`. Idempotent — only the first call
// per URL actually fires a `get()`. The callback runs once when the color
// is ready (synchronously if it was cached after we checked, async otherwise).
MinimapView.prototype._requestSprite = function(url, onResolved) {
    if (this._spriteRequested[url]) return;
    this._spriteRequested[url] = true;
    SpriteColorCache.get(url, function() { onResolved(); });
};
