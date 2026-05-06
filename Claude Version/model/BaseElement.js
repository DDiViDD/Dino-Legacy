// BaseElement: root class for everything in the world.
// Terrain tiles, structures, entities all inherit from this.

(function() {
    var _idCounter = 0;

    function BaseElement(x, y, type) {
        this.id = _idCounter++;
        this.x = x;
        this.y = y;
        this.type = type || ElementType.Entity;
        this.dirty = true;
    }

    BaseElement.prototype.onTick = function(deltaMs) { /* override */ };

    BaseElement.prototype.setPosition = function(x, y) {
        if (this.x !== x || this.y !== y) {
            this.x = x;
            this.y = y;
            this.dirty = true;
        }
    };

    window.BaseElement = BaseElement;
})();
