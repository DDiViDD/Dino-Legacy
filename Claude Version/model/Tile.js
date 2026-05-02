// Tile: a single grid cell of terrain.

function Tile(gridX, gridY, grassLevel) {
    if (grassLevel === undefined) grassLevel = GrassLevel.Level3;
    BaseElement.call(this, gridX * TILE_SIZE, gridY * TILE_SIZE, ElementType.Terrain);
    this.gridX = gridX;
    this.gridY = gridY;
    this.grassLevel = grassLevel;
    this.occupant = null;
}

Tile.prototype = Object.create(BaseElement.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.getAssetPath = function() {
    return 'assets/Terrain/GrassLevel' + this.grassLevel + '.png';
};

Tile.prototype.setGrassLevel = function(level) {
    if (this.grassLevel !== level) {
        this.grassLevel = level;
        this.dirty = true;
    }
};
