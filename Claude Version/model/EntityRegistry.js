// EntityRegistry: unified registry for all entity-type configs (dinos,
// drops, and any future kinds — structures, decorations, etc.).
//
// Each registered entry must include a `kind` field that names which
// concrete class to instantiate. EntityFactory uses it to spawn the
// right object.
//
// Replaces the old separate DinoRegistry + DropRegistry.

var EntityRegistry = {
    _defs: {},

    register: function(name, def) {
        if (!def || !def.kind) {
            console.error('EntityRegistry: ' + name + ' missing required field "kind"');
            return;
        }
        var entry = {};
        for (var k in def) {
            if (def.hasOwnProperty(k)) entry[k] = def[k];
        }
        this._defs[name] = entry;
        console.log('EntityRegistry: registered ' + name + ' (' + def.kind + ')');
    },

    get:    function(name) { return this._defs[name] || null; },
    has:    function(name) { return name in this._defs; },

    // Returns the kind string, or null if not registered.
    kindOf: function(name) {
        var d = this._defs[name];
        return d ? d.kind : null;
    },

    // Convenience: is this name a registered entity of the given kind?
    isKind: function(name, kind) {
        var d = this._defs[name];
        return !!d && d.kind === kind;
    },

    // Returns all entries with the given kind.
    allOfKind: function(kind) {
        var out = [];
        for (var n in this._defs) {
            if (this._defs[n].kind === kind) out.push(this._defs[n]);
        }
        return out;
    }
};
