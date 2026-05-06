// TerrainRegistry: registry of terrain type configs (Grass, etc.).

(function() {
    var _defs = {};

    function register(name, def) {
        var entry = {};
        for (var k in def) {
            if (def.hasOwnProperty(k)) entry[k] = def[k];
        }
        _defs[name] = entry;
        console.log('TerrainRegistry: registered ' + name);
    }

    function get(name) { return _defs[name] || null; }
    function has(name) { return name in _defs; }
    function entries() {
        var out = [];
        for (var n in _defs) out.push({ name: n, def: _defs[n] });
        return out;
    }

    window.TerrainRegistry = {
        register: register, get: get, has: has, entries: entries
    };
})();
