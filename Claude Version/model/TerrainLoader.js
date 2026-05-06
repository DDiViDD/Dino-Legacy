// TerrainLoader: dynamically injects a <script> tag for every terrain in
// TerrainListConfig.

(function() {
    function loadAll(onComplete) {
        var list = TerrainListConfig;
        var remaining = list.length;
        if (remaining === 0) { onComplete(); return; }
        function onOne() { remaining--; if (remaining === 0) onComplete(); }
        for (var i = 0; i < list.length; i++) _loadScript(list[i], onOne);
    }

    function _loadScript(name, onDone) {
        var script = document.createElement('script');
        script.src = 'model/terrain/' + name + '.js';
        script.onload  = function() { console.log('TerrainLoader: loaded ' + name); onDone(); };
        script.onerror = function() {
            console.error('TerrainLoader: FAILED to load ' + name);
            onDone();
        };
        document.head.appendChild(script);
    }

    window.TerrainLoader = { loadAll: loadAll };
})();
