// BuyItemRegistry: store of all purchasable items.
// Each file in model/buyitems/ calls BuyItemRegistry.register(id, def).

var BuyItemRegistry = {
    _defs: {},
    _order: [],

    register: function(id, def) {
        var entry = {};
        for (var k in def) {
            if (def.hasOwnProperty(k)) entry[k] = def[k];
        }
        entry.id = id;
        if (!(id in this._defs)) this._order.push(id);
        this._defs[id] = entry;
        console.log('BuyItemRegistry: registered ' + id);
    },

    get:  function(id) { return this._defs[id] || null; },
    has:  function(id) { return id in this._defs; },

    // Returns items in registration order — keeps menu ordering predictable.
    all:  function() {
        var out = [];
        for (var i = 0; i < this._order.length; i++) {
            out.push(this._defs[this._order[i]]);
        }
        return out;
    }
};
