// TerrainRegistry: same idea as DinoRegistry, for terrain types.
// Each file in model/terrain/ calls TerrainRegistry.register().

var TerrainRegistry = {
    _defs: {},

    register: function(name, def) {
        var entry = {};
        for (var k in def) {
            if (def.hasOwnProperty(k)) entry[k] = def[k];
        }
        this._defs[name] = entry;
        console.log('TerrainRegistry: registered ' + name);
    },

    get: function(name) {
        var def = this._defs[name];
        if (!def) console.warn('TerrainRegistry: unknown terrain ' + name);
        return def || null;
    },

    has: function(name) {
        return name in this._defs;
    }
};
