// EatGrassAction: eats grass on a specific tile over a short duration.
// Lowers grass level by 1 (down to GrassLevel.Level0) and increases the
// entity's satiation based on the grass's terrain config.

var EAT_DURATION_MS = 1500;

function EatGrassAction(tile) {
    Action.call(this);
    this.tile = tile;
    this._elapsed = 0;
}

EatGrassAction.prototype = Object.create(Action.prototype);
EatGrassAction.prototype.constructor = EatGrassAction;

EatGrassAction.prototype.update = function(deltaMs, entity) {
    this._elapsed += deltaMs;
    if (this._elapsed < EAT_DURATION_MS) return;

    var oldLevel = this.tile.grassLevel;
    if (oldLevel > GrassLevel.Level0) {
        var def  = TerrainRegistry.get('Grass');
        var gain = (def && def.satiationByLevel && def.satiationByLevel[oldLevel] !== undefined)
                   ? def.satiationByLevel[oldLevel]
                   : 20;
        entity.satiation = Math.min(MAX_SATIATION, entity.satiation + gain);
        this.tile.setGrassLevel(oldLevel - 1);
    }
    this.isDone = true;
};
