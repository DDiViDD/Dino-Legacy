// EntityView: generic renderer for any Entity that has a sprite.
//
// Convention: entity.x/y is the world-space top-left of the entity's tile
// cell. The sprite is rendered centered within that TILE_SIZE-square cell,
// so smaller sprites (like coins) sit nicely in the middle, and larger
// sprites (like a 64x64 dino on a 75x75 tile) get a small visual margin.

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
        if (nextSrc && this.el.src.indexOf(nextSrc) === -1) {
            this.el.src = nextSrc;
        }
    }
    // Center the sprite inside its TILE_SIZE-square cell.
    var w = this.model.width  || 0;
    var h = this.model.height || 0;
    var offsetX = (TILE_SIZE - w) / 2;
    var offsetY = (TILE_SIZE - h) / 2;

    var screenX = this.model.x - cameraX + offsetX;
    var screenY = this.model.y - cameraY + offsetY;
    this.el.style.transform = 'translate(' + screenX + 'px, ' + screenY + 'px)';
    this.model.dirty = false;
};
