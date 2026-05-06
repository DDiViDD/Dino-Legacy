// EntityView: generic renderer for any Entity.
// Reads width/height from model; centers sprite within its TILE_SIZE cell.

(function() {
    function EntityView(model) {
        BaseElementView.call(this, model);
    }

    EntityView.prototype = Object.create(BaseElementView.prototype);
    EntityView.prototype.constructor = EntityView;

    EntityView.prototype._createElement = function() {
        var img = document.createElement('img');
        img.className = 'entity';
        var src = this.model.getAssetPath();
        if (src) img.src = src;
        img.style.position = 'absolute';
        img.style.left = '0';
        img.style.top = '0';
        img.style.willChange = 'transform';
        img.style.userSelect = 'none';
        img.draggable = false;
        if (this.model.width  && this.model.width  > 0) img.style.width  = this.model.width  + 'px';
        if (this.model.height && this.model.height > 0) img.style.height = this.model.height + 'px';
        return img;
    };

    EntityView.prototype.render = function(cameraX, cameraY) {
        if (this.model.dirty) {
            var nextSrc = this.model.getAssetPath();
            if (nextSrc && this.el.src.indexOf(nextSrc) === -1) this.el.src = nextSrc;
        }
        var w = this.model.width  || 0;
        var h = this.model.height || 0;
        var offsetX = (TILE_SIZE - w) / 2;
        var offsetY = (TILE_SIZE - h) / 2;
        var screenX = this.model.x - cameraX + offsetX;
        var screenY = this.model.y - cameraY + offsetY;
        this.el.style.transform = 'translate(' + screenX + 'px, ' + screenY + 'px)';
        this.model.dirty = false;
    };

    window.EntityView = EntityView;
})();
