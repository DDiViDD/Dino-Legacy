// TileView: renders a single Tile as an <img>.

(function() {
    function TileView(model) {
        BaseElementView.call(this, model);
    }

    TileView.prototype = Object.create(BaseElementView.prototype);
    TileView.prototype.constructor = TileView;

    TileView.prototype._createElement = function() {
        var img = document.createElement('img');
        img.className = 'tile';
        img.src = this.model.getAssetPath();
        img.width = TILE_SIZE;
        img.height = TILE_SIZE;
        img.style.position = 'absolute';
        img.style.left = '0';
        img.style.top = '0';
        img.style.willChange = 'transform';
        img.style.userSelect = 'none';
        img.draggable = false;
        return img;
    };

    TileView.prototype.render = function(cameraX, cameraY) {
        if (this.model.dirty) {
            var nextSrc = this.model.getAssetPath();
            if (this.el.src.indexOf(nextSrc) === -1) this.el.src = nextSrc;
        }
        BaseElementView.prototype.render.call(this, cameraX, cameraY);
    };

    window.TileView = TileView;
})();
