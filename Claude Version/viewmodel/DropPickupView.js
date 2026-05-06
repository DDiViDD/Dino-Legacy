// DropPickupView: when a Drop is clicked, pay credits and remove it.

(function() {
    function DropPickupView(worldView, player) {
        this.worldView = worldView;
        this.player    = player;

        var self = this;
        this.worldView.on('entityClicked', function(payload) {
            var ent = payload.entity;
            if (!ent || ent.type !== ElementType.Drop) return;
            if (ent.clickCredits > 0) self.player.earn(ent.clickCredits);
            if (ent.world) ent.world.removeEntity(ent);
        });
    }

    window.DropPickupView = DropPickupView;
})();
