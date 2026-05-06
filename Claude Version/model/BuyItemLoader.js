// BuyItemLoader: dynamically loads each buy-item config file from BuyMenuConfig.

(function() {
    function loadAll(onComplete) {
        var list = BuyMenuConfig;
        var remaining = list.length;
        if (remaining === 0) { onComplete(); return; }
        function onOne() { remaining--; if (remaining === 0) onComplete(); }
        for (var i = 0; i < list.length; i++) _loadScript(list[i], onOne);
    }

    function _loadScript(id, onDone) {
        var script = document.createElement('script');
        script.src = 'model/buyitems/' + id + '.js';
        script.onload  = function() { console.log('BuyItemLoader: loaded ' + id); onDone(); };
        script.onerror = function() {
            console.error('BuyItemLoader: FAILED to load ' + id);
            onDone();
        };
        document.head.appendChild(script);
    }

    window.BuyItemLoader = { loadAll: loadAll };
})();
