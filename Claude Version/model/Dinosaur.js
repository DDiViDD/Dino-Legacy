// Dinosaur: a specific Entity. Stats come from DinoRegistry.

function Dinosaur(x, y, species) {
    Entity.call(this, x, y);
    this.species = species || 'Brachiosaur';
    var def = DinoRegistry.get(this.species);
    this.speed = def ? def.speed : 40;
}

Dinosaur.prototype = Object.create(Entity.prototype);
Dinosaur.prototype.constructor = Dinosaur;

Dinosaur.prototype.getAssetPath = function() {
    var def = DinoRegistry.get(this.species);
    return def ? def.assetPath : null;
};
