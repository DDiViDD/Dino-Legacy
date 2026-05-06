// AssetLoader: pre-fetches every asset URL referenced by the registries.
//
// Walks EntityRegistry, TerrainRegistry, and BuyItemRegistry, collects
// every asset URL, and fetches each one ONCE. Adding a new registry =
// adding one block to _collectUrls.
//
// Eliminates first-paint flicker AND populates SpriteColorCache so the
// minimap never has to fall back to placeholder colors.

(function() {

    function _collectUrls() {
        var urls = {};
        function add(u) { if (u) urls[u] = true; }

        var i, e;

        // Entity sprites.
        var ents = EntityRegistry.entries();
        for (i = 0; i < ents.length; i++) add(ents[i].def.assetPath);

        // Terrain: one entry per level for each terrain type.
        var ters = TerrainRegistry.entries();
        for (i = 0; i < ters.length; i++) {
            var byLevel = ters[i].def.assetPathByLevel;
            if (byLevel) {
                for (var k in byLevel) add(byLevel[k]);
            }
        }

        // Buy item icons.
        var buys = BuyItemRegistry.entries();
        for (i = 0; i < buys.length; i++) add(buys[i].def.assetPath);

        var list = [];
        for (var u in urls) list.push(u);
        return list;
    }

    function _preloadOne(url, onDone) {
        var pending = 2;
        function tick() { pending--; if (pending === 0) onDone(); }

        var img = new Image();
        img.onload  = tick;
        img.onerror = function() { console.warn('AssetLoader: failed to preload', url); tick(); };
        img.src = url;

        SpriteColorCache.get(url, function() { tick(); });
    }

    function loadAll(onComplete, onProgress) {
        var urls = _collectUrls();
        var total = urls.length;
        if (total === 0) { onComplete(); return; }

        var loaded = 0;
        for (var i = 0; i < urls.length; i++) {
            (function(url) {
                _preloadOne(url, function() {
                    loaded++;
                    if (onProgress) onProgress({ loaded: loaded, total: total, url: url });
                    if (loaded === total) onComplete();
                });
            })(urls[i]);
        }
    }

    window.AssetLoader = { loadAll: loadAll };
})();
