// DropPickupView: glue. When the user clicks an entity that's a Drop,
// pay out clickCredits to the player and remove the drop from the world.
// Lives in the viewmodel layer because it's a UI input handler, not
// model logic.

function DropPickupView(worldView, player) {
    this.worldView = worldView;
    this.player    = player;

    var self = this;
    this.worldView.on('entityClicked', function(payload) {
        var ent = payload.entity;
        if (!(ent instanceof Drop)) return;
        if (ent.clickCredits > 0) {
            self.player.earn(ent.clickCredits);
        }
        if (ent.world) ent.world.removeEntity(ent);
    });
}
