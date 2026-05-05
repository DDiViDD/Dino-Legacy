// MoveToTileAction: walks an entity toward the top-left of a target tile.
//
// Reservation rules:
//   onStart  : try to reserve the destination tile via world.tryReserveTile.
//              If the reservation fails, mark the action done so the AI
//              re-decides next tick (target was claimed by someone else).
//   onEnd    : always release the reservation. By the time the entity
//              arrives, occupancy by physical presence covers the same
//              ground; the reservation is no longer needed.
//   removeEntity (death): World ends the action and forces release.

function MoveToTileAction(gridX, gridY) {
    Action.call(this);
    this.gridX   = gridX;
    this.gridY   = gridY;
    this.targetX = gridX * TILE_SIZE;
    this.targetY = gridY * TILE_SIZE;
    this._reserved = false;
}

MoveToTileAction.prototype = Object.create(Action.prototype);
MoveToTileAction.prototype.constructor = MoveToTileAction;

MoveToTileAction.prototype.onStart = function(entity) {
    if (!entity.world) { this.isDone = true; return; }
    // Only reserve if the entity is a "blocker" — non-blockers don't need
    // exclusive tiles and shouldn't fight for them.
    if (entity.blocksTile) {
        var ok = entity.world.tryReserveTile(this.gridX, this.gridY, entity);
        if (!ok) { this.isDone = true; return; }
        this._reserved = true;
    }
};

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

MoveToTileAction.prototype.onEnd = function(entity) {
    if (this._reserved && entity.world) {
        entity.world.releaseReservation(this.gridX, this.gridY, entity);
        this._reserved = false;
    }
};
