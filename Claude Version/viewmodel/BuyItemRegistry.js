// BuyItemRegistry: store of all purchasable items.
// Each file in model/buyitems/ calls BuyItemRegistry.register(id, def).

(function() {
    var _defs  = {};
    var _order = [];   // insertion order, used by BuyMenuView for layout

    function register(id, def) {
        var entry = {};
        for (var k in def) {
            if (def.hasOwnProperty(k)) entry[k] = def[k];
        }
        entry.id = id;
        if (!(id in _defs)) _order.push(id);
        _defs[id] = entry;
        console.log('BuyItemRegistry: registered ' + id);
    }

    function get(id) { return _defs[id] || null; }
    function has(id) { return id in _defs; }

    function all() {
        var out = [];
        for (var i = 0; i < _order.length; i++) out.push(_defs[_order[i]]);
        return out;
    }

    function entries() {
        var out = [];
        for (var i = 0; i < _order.length; i++) {
            out.push({ name: _order[i], def: _defs[_order[i]] });
        }
        return out;
    }

    window.BuyItemRegistry = {
        register: register, get: get, has: has, all: all, entries: entries
    };
})();
