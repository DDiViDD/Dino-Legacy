// BaseElementView: base for all renderers. Owns one DOM node per model.

(function() {
    function BaseElementView(model) {
        this.model = model;
        this.el = this._createElement();
    }

    BaseElementView.prototype._createElement = function() {
        throw new Error('BaseElementView._createElement() must be overridden');
    };

    BaseElementView.prototype.render = function(cameraX, cameraY) {
        var screenX = this.model.x - cameraX;
        var screenY = this.model.y - cameraY;
        this.el.style.transform = 'translate(' + screenX + 'px, ' + screenY + 'px)';
        this.model.dirty = false;
    };

    BaseElementView.prototype.destroy = function() {
        if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
        this.el = null;
    };

    window.BaseElementView = BaseElementView;
})();
