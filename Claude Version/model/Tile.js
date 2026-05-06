// Tile: a single grid cell of terrain.

(function() {
    function Tile(gridX, gridY, grassLevel) {
        if (grassLevel === undefined) grassLevel = GrassLevel.Level3;
        BaseElement.call(this, gridX * TILE_SIZE, gridY * TILE_SIZE, ElementType.Terrain);
        this.gridX = gridX;
        this.gridY = gridY;
        this.grassLevel = grassLevel;
        this.occupant = null;
        this.world = null;
    }

    Tile.prototype = Object.create(BaseElement.prototype);
    Tile.prototype.constructor = Tile;

    Tile.prototype.getAssetPath = function() {
        var def = TerrainRegistry.get('Grass');
        if (def && def.assetPathByLevel && def.assetPathByLevel[this.grassLevel] !== undefined) {
            return def.assetPathByLevel[this.grassLevel];
        }
        return 'assets/Terrain/GrassLevel' + this.grassLevel + '.png';
    };

    Tile.prototype.setGrassLevel = function(level) {
        if (this.grassLevel !== level) {
            this.grassLevel = level;
            this.dirty = true;
            if (this.world) this.world._emit('tileChanged', this);
        }
    };

    window.Tile = Tile;
})();
