// Dinosaur: a specific Entity. Stats and behavior flags come from DinoRegistry.

function Dinosaur(x, y, species) {
    Entity.call(this, x, y);
    this.species = species || 'Brachiosaur';

    var def = EntityRegistry.get(this.species) || {};

    this.speed         = def.speed         !== undefined ? def.speed         : 0;
    this.eatsGrass     = def.eatsGrass     !== undefined ? !!def.eatsGrass   : false;
    this.visionRange   = def.visionRange   !== undefined ? def.visionRange   : 0;
    this.spawnsOnDeath = def.spawnsOnDeath ? def.spawnsOnDeath : null;
    this.width  = def.width  || 0;
    this.height = def.height || 0;
    this.blocksTile    = def.blocksTile    !== undefined ? !!def.blocksTile  : false;

    this.satiationDecayTimeSec = def.satiationDecayTimeSec !== undefined
        ? def.satiationDecayTimeSec : DEFAULT_SATIATION_DECAY_TIME_SEC;
    this.seekFoodSatiation = def.seekFoodSatiation !== undefined
        ? def.seekFoodSatiation : DEFAULT_SEEK_FOOD_SATIATION;
    this.desperateSatiation = def.desperateSatiation !== undefined
        ? def.desperateSatiation : DEFAULT_DESPERATE_SATIATION;

    this.satiation = MAX_SATIATION;
    this.dead = false;
}

Dinosaur.prototype = Object.create(Entity.prototype);
Dinosaur.prototype.constructor = Dinosaur;

Dinosaur.prototype.getAssetPath = function() {
    var def = EntityRegistry.get(this.species);
    return def ? def.assetPath : null;
};

Dinosaur.prototype.onTick = function(deltaMs) {
    if (this.dead) return;
    Entity.prototype.onTick.call(this, deltaMs);

    if (!isNeverValue(this.satiationDecayTimeSec) && this.satiationDecayTimeSec > 0) {
        var decay = (deltaMs / 1000) * (MAX_SATIATION / this.satiationDecayTimeSec);
        this.satiation -= decay;
        if (this.satiation <= 0) {
            this.satiation = 0;
            this._die();
            return;
        }
    }
    if (this.isIdle()) this._decideNextAction();
};

Dinosaur.prototype._die = function() {
    this.dead = true;
    var w  = this.world;
    var sx = this.x, sy = this.y;
    var spawnSpecies = this.spawnsOnDeath;

    console.log(this.species + ' (#' + this.id + ') died');
    if (w) w.removeEntity(this);

    if (w && spawnSpecies && EntityRegistry.has(spawnSpecies)) {
        var corpse = EntityFactory.create(spawnSpecies, sx, sy);
        if (corpse) w.addEntity(corpse);
    }
};

Dinosaur.prototype._decideNextAction = function() {
    if (!this.world) return;

    var curGx = this.getGridX();
    var curGy = this.getGridY();

    var desperate = this.satiation <= this.desperateSatiation;
    var hungry    = this.satiation <  this.seekFoodSatiation;

    if ((hungry || desperate) && this.eatsGrass) {
        var here = this.world.tilesArray.getTile(curGx, curGy);
        if (here && here.grassLevel > GrassLevel.Level0) {
            this.setAction(new EatGrassAction(here));
            return;
        }
        var target = this._findGrassTileInVision(desperate);
        if (target) {
            var step = this._stepTileToward(curGx, curGy, target.gridX, target.gridY);
            if (step) {
                this.setAction(new MoveToTileAction(step.gx, step.gy));
                return;
            }
        }
    }
    this._wanderToRandomAdjacent(curGx, curGy);
};

// Returns true if (gx, gy) exists and isn't blocked or reserved by another
// entity. Uses world.isTileAvailableFor so we don't conflict with ourselves.
Dinosaur.prototype._isWalkable = function(gx, gy) {
    return this.world.isTileAvailableFor(gx, gy, this);
};

Dinosaur.prototype._stepTileToward = function(fromGx, fromGy, toGx, toGy) {
    var dx = toGx - fromGx;
    var dy = toGy - fromGy;
    if (dx === 0 && dy === 0) return null;

    var stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    var stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);

    var attempts = [[stepX, stepY], [stepX, 0], [0, stepY]];
    for (var i = 0; i < attempts.length; i++) {
        var ax = attempts[i][0], ay = attempts[i][1];
        if (ax === 0 && ay === 0) continue;
        var nx = fromGx + ax, ny = fromGy + ay;
        if (this._isWalkable(nx, ny)) return { gx: nx, gy: ny };
    }
    return null;
};

Dinosaur.prototype._wanderToRandomAdjacent = function(gx, gy) {
    var moves = [
        [-1, -1], [0, -1], [1, -1],
        [-1,  0],          [1,  0],
        [-1,  1], [0,  1], [1,  1]
    ];
    // Fisher-Yates shuffle (sort+random is biased on V8/SpiderMonkey).
    for (var s = moves.length - 1; s > 0; s--) {
        var r = Math.floor(Math.random() * (s + 1));
        var tmp = moves[s]; moves[s] = moves[r]; moves[r] = tmp;
    }
    for (var i = 0; i < moves.length; i++) {
        var nx = gx + moves[i][0], ny = gy + moves[i][1];
        if (this._isWalkable(nx, ny)) {
            this.setAction(new MoveToTileAction(nx, ny));
            return;
        }
    }
};

Dinosaur.prototype.getGridX = function() { return Math.round(this.x / TILE_SIZE); };
Dinosaur.prototype.getGridY = function() { return Math.round(this.y / TILE_SIZE); };

Dinosaur.prototype.findInVision = function(predicate) {
    var results = [];
    if (!this.world || this.visionRange <= 0) return results;
    var gx = this.getGridX(), gy = this.getGridY();
    var r = this.visionRange, r2 = r * r;
    for (var dy = -r; dy <= r; dy++) {
        for (var dx = -r; dx <= r; dx++) {
            var distSq = dx * dx + dy * dy;
            if (distSq > r2) continue;
            var tile = this.world.tilesArray.getTile(gx + dx, gy + dy);
            if (!tile) continue;
            if (predicate(tile, dx, dy)) {
                results.push({ tile: tile, dx: dx, dy: dy, dist: Math.sqrt(distSq) });
            }
        }
    }
    return results;
};

Dinosaur.prototype._findGrassTileInVision = function(desperate) {
    var candidates = this.findInVision(function(tile) {
        return tile.grassLevel > GrassLevel.Level0;
    });
    if (candidates.length === 0) return null;
    candidates.sort(function(a, b) {
        if (desperate) {
            if (a.dist !== b.dist) return a.dist - b.dist;
            return b.tile.grassLevel - a.tile.grassLevel;
        }
        if (a.tile.grassLevel !== b.tile.grassLevel) {
            return b.tile.grassLevel - a.tile.grassLevel;
        }
        return a.dist - b.dist;
    });
    return candidates[0].tile;
};
