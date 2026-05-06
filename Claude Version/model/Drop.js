// Drop: a clickable entity (coin, gem, item) spawned by other entities.

(function() {
    function Drop(x, y, dropType) {
        Entity.call(this, x, y);
        this.type = ElementType.Drop;
        this.dropType = dropType;
        var def = EntityRegistry.get(dropType) || {};
        this.assetPath    = def.assetPath || null;
        this.width        = def.width  || 0;
        this.height       = def.height || 0;
        this.clickCredits = def.clickCredits || 0;
        this.lifespanSec  = def.lifespanSec;
        this.blocksTile   = false;
        this.speed        = 0;
    }

    Drop.prototype = Object.create(Entity.prototype);
    Drop.prototype.constructor = Drop;

    Drop.prototype.getAssetPath = function() { return this.assetPath; };
    Drop.prototype.onTick = function() { /* no-op, lifespan via scheduler */ };

    window.Drop = Drop;
})();
