// EntityView: generic renderer for any Entity that has a sprite.

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
    return img;
};

EntityView.prototype.render = function(cameraX, cameraY) {
    if (this.model.dirty) {
        var nextSrc = this.model.getAssetPath();
        if (nextSrc && this.el.src.indexOf(nextSrc) === -1) {
            this.el.src = nextSrc;
        }
    }
    BaseElementView.prototype.render.call(this, cameraX, cameraY);
};
