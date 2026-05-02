// MoveToTileAction: walks an entity toward the top-left of a target tile.
// Motion is frame-rate independent: speed (px/sec) * deltaMs / 1000.

function MoveToTileAction(gridX, gridY) {
    Action.call(this);
    this.gridX   = gridX;
    this.gridY   = gridY;
    this.targetX = gridX * TILE_SIZE;
    this.targetY = gridY * TILE_SIZE;
}

MoveToTileAction.prototype = Object.create(Action.prototype);
MoveToTileAction.prototype.constructor = MoveToTileAction;

MoveToTileAction.prototype.update = function(deltaMs, entity) {
    var dx   = this.targetX - entity.x;
    var dy   = this.targetY - entity.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var step = entity.speed * (deltaMs / 1000);

    if (dist <= step || dist === 0) {
        entity.setPosition(this.targetX, this.targetY);
        this.isDone = true;
    } else {
        entity.setPosition(
            entity.x + (dx / dist) * step,
            entity.y + (dy / dist) * step
        );
    }
};
