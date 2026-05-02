// DinoRegistry: global store. Each file in model/dinos/ calls
// DinoRegistry.register() to make its species known to the game.

var DinoRegistry = {
    _defs: {},

    register: function(species, def) {
        var entry = {
            width:     def.width     !== undefined ? def.width     : 64,
            height:    def.height    !== undefined ? def.height    : 64,
            assetPath: def.assetPath,
            speed:     def.speed
        };
        this._defs[species] = entry;
        console.log('DinoRegistry: registered ' + species);
    },

    get: function(species) {
        var def = this._defs[species];
        if (!def) console.warn('DinoRegistry: unknown species ' + species);
        return def || null;
    },

    has: function(species) {
        return species in this._defs;
    }
};
