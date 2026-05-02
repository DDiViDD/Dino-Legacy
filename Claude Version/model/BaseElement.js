// BaseElement: root class for everything in the world.
// Terrain tiles, structures, entities all inherit from this.

var _elementIdCounter = 0;

function BaseElement(x, y, type) {
    this.id = _elementIdCounter++;
    this.x = x;
    this.y = y;
    this.type = type || ElementType.Entity;
    this.dirty = true;
}

BaseElement.prototype.onTick = function(deltaMs) {
    // no-op — override in subclasses
};

BaseElement.prototype.setPosition = function(x, y) {
    if (this.x !== x || this.y !== y) {
        this.x = x;
        this.y = y;
        this.dirty = true;
    }
};
