// Entity: base for anything that lives on terrain and performs actions.

function Entity(x, y) {
    BaseElement.call(this, x, y, ElementType.Entity);
    this.currentAction = null;
    this.speed = 30; // px/sec — subclasses override
}

Entity.prototype = Object.create(BaseElement.prototype);
Entity.prototype.constructor = Entity;

Entity.prototype.setAction = function(action) {
    if (this.currentAction && !this.currentAction.isDone) {
        this.currentAction.onEnd(this);
    }
    this.currentAction = action;
    if (action) action.onStart(this);
};

Entity.prototype.isIdle = function() {
    return this.currentAction === null || this.currentAction.isDone;
};

Entity.prototype.onTick = function(deltaMs) {
    var action = this.currentAction;
    if (!action || action.isDone) return;
    action.update(deltaMs, this);
    if (action.isDone) {
        action.onEnd(this);
        this.currentAction = null;
    }
};

Entity.prototype.getAssetPath = function() {
    return null;
};
