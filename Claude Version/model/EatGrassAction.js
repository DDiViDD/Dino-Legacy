// EatGrassAction: eats grass on a tile over a short duration.

(function() {
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
                       ? def.satiationByLevel[oldLevel] : 20;
            entity.satiation = Math.min(MAX_SATIATION, entity.satiation + gain);
            this.tile.setGrassLevel(oldLevel - 1);
        }
        this.isDone = true;
    };

    window.EatGrassAction = EatGrassAction;
})();
