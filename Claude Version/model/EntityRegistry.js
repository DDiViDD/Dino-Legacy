// EntityRegistry: unified registry for all entity-type configs (dinos,
// drops, and any future kinds — structures, decorations, etc.).
//
// Each registered entry must include a `kind` field that names which
// concrete class to instantiate. EntityFactory uses it to spawn the
// right object.

(function() {
    var _defs = {};

    function register(name, def) {
        if (!def || !def.kind) {
            console.error('EntityRegistry: ' + name + ' missing required field "kind"');
            return;
        }
        var entry = {};
        for (var k in def) {
            if (def.hasOwnProperty(k)) entry[k] = def[k];
        }
        _defs[name] = entry;
        console.log('EntityRegistry: registered ' + name + ' (' + def.kind + ')');
    }

    function get(name)    { return _defs[name] || null; }
    function has(name)    { return name in _defs; }
    function kindOf(name) { var d = _defs[name]; return d ? d.kind : null; }
    function isKind(name, kind) {
        var d = _defs[name];
        return !!d && d.kind === kind;
    }
    function allOfKind(kind) {
        var out = [];
        for (var n in _defs) if (_defs[n].kind === kind) out.push(_defs[n]);
        return out;
    }

    // Returns [{ name, def }, ...] for callers that need to iterate
    // every registered entity (e.g. preloading assets).
    function entries() {
        var out = [];
        for (var n in _defs) out.push({ name: n, def: _defs[n] });
        return out;
    }

    window.EntityRegistry = {
        register:  register,
        get:       get,
        has:       has,
        kindOf:    kindOf,
        isKind:    isKind,
        allOfKind: allOfKind,
        entries:   entries
    };
})();
