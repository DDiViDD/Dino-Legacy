// TilesArray: 2D grid of Tile objects stored as a flat row-major array.

function TilesArray(width, height, grassPicker) {
    this.width = width;
    this.height = height;
    this.tiles = new Array(width * height);

    for (var gy = 0; gy < height; gy++) {
        for (var gx = 0; gx < width; gx++) {
            var level = grassPicker ? grassPicker(gx, gy) : GrassLevel.Level3;
            this.tiles[gy * width + gx] = new Tile(gx, gy, level);
        }
    }
}

TilesArray.prototype.getTile = function(gx, gy) {
    if (gx < 0 || gy < 0 || gx >= this.width || gy >= this.height) return null;
    return this.tiles[gy * this.width + gx];
};

TilesArray.prototype.forEach = function(callback) {
    for (var i = 0; i < this.tiles.length; i++) {
        if (callback(this.tiles[i]) === false) return;
    }
};
