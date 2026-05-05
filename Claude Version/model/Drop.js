// Drop: a small clickable entity (coin, gem, item) spawned by other
// entities. Reuses the Entity machinery for position/rendering/world
// indexing, but doesn't act on its own (no AI, no movement).
//
// Reads its config from DropRegistry. Optional lifespan auto-removes the
// drop from the world if not collected in time.

function Drop(x, y, dropType) {
    Entity.call(this, x, y);
    this.dropType = dropType;
    var def = EntityRegistry.get(dropType) || {};
    this.assetPath    = def.assetPath || null;
    this.width        = def.width  || 0;
    this.height       = def.height || 0;
    this.clickCredits = def.clickCredits || 0;
    this.lifespanSec  = def.lifespanSec;     // may be null/undefined for "forever"
    this.blocksTile   = false;
    this.speed        = 0;
}

Drop.prototype = Object.create(Entity.prototype);
Drop.prototype.constructor = Drop;

Drop.prototype.getAssetPath = function() { return this.assetPath; };

// Drops don't tick. Lifespan handling is via the scheduler instead.
Drop.prototype.onTick = function() { /* no-op */ };
