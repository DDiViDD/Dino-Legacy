// EntityFactory: instantiates the right concrete class for a registered
// entity name, based on its `kind`.
//
// Adding a new kind: register a constructor here.

var EntityFactory = (function() {
    var _ctors = {
        dino: function(name, x, y) { return new Dinosaur(x, y, name); },
        drop: function(name, x, y) { return new Drop(x, y, name); }
    };

    return {
        register: function(kind, ctor) { _ctors[kind] = ctor; },

        // Returns a new entity instance, or null if name unknown / kind has
        // no registered constructor.
        create: function(name, x, y) {
            var kind = EntityRegistry.kindOf(name);
            if (!kind) { console.warn('EntityFactory: unknown entity ' + name); return null; }
            var ctor = _ctors[kind];
            if (!ctor)  { console.warn('EntityFactory: no ctor for kind ' + kind); return null; }
            return ctor(name, x, y);
        }
    };
})();
