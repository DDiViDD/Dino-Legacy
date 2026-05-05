// BuyItemActions: keyed by action name. Each function takes (ctx, params)
// where ctx = { world, player, tile, x, y } and params comes from the
// item's config. Returns true on success (cost should be deducted) or
// false to refuse placement (no cost).
//
// To add a new placement behavior: add a new entry here and reference it
// from any buy-item config by setting `actionType: 'yourActionName'`.

var BuyItemActions = {

    // Spawn a registered Dinosaur species at the clicked tile.
    // params: { species: 'Brachiosaur' }
    spawnDinosaur: function(ctx, params) {
        var species = params && params.species;
        if (!species || !EntityRegistry.has(species)) return false;
        // Don't spawn on a tile that already has a blocker.
        if (ctx.world.hasBlockerAt(ctx.tile.gridX, ctx.tile.gridY)) return false;
        var ent = EntityFactory.create(species, ctx.tile.x, ctx.tile.y);
        if (!ent) return false;
        ctx.world.addEntity(ent);
        return true;
    },

    // Add to a tile's grass level (capped at GrassLevel.Level3).
    // params: { amount: 1 }
    addGrassLevel: function(ctx, params) {
        var tile   = ctx.tile;
        var amount = (params && params.amount) || 1;
        if (!tile) return false;
        if (tile.grassLevel >= GrassLevel.Level3) return false;
        var next = Math.min(GrassLevel.Level3, tile.grassLevel + amount);
        tile.setGrassLevel(next);
        return true;
    }
};

// Helper used by BuyMenuView to apply an item's configured action.
function applyBuyItemAction(item, ctx) {
    var fn = BuyItemActions[item.actionType];
    if (!fn) {
        console.warn('BuyItem ' + item.id + ' has unknown actionType: ' + item.actionType);
        return false;
    }
    return fn(ctx, item.actionParams || {});
}
