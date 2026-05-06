// BuyItemActions: keyed by action name. Each function takes (ctx, params)
// where ctx = { world, player, tile, x, y } and params is the item's
// configured actionParams. Returns true on success.

(function() {
    var BuyItemActions = {
        spawnDinosaur: function(ctx, params) {
            var species = params && params.species;
            if (!species || !EntityRegistry.has(species)) return false;
            if (ctx.world.hasBlockerAt(ctx.tile.gridX, ctx.tile.gridY)) return false;
            var ent = EntityFactory.create(species, ctx.tile.x, ctx.tile.y);
            if (!ent) return false;
            ctx.world.addEntity(ent);
            return true;
        },

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

    function applyBuyItemAction(item, ctx) {
        var fn = BuyItemActions[item.actionType];
        if (!fn) {
            console.warn('BuyItem ' + item.id + ' has unknown actionType: ' + item.actionType);
            return false;
        }
        return fn(ctx, item.actionParams || {});
    }

    window.BuyItemActions      = BuyItemActions;
    window.applyBuyItemAction  = applyBuyItemAction;
})();
