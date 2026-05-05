// BuyItemLoader: dynamically loads each buy-item config file listed in
// BuyMenuConfig. Same pattern as DinoLoader / TerrainLoader.

var BuyItemLoader = {
    loadAll: function(onComplete) {
        var list = BuyMenuConfig;
        var remaining = list.length;
        if (remaining === 0) { onComplete(); return; }

        function onOne() {
            remaining--;
            if (remaining === 0) onComplete();
        }

        for (var i = 0; i < list.length; i++) {
            BuyItemLoader._loadScript(list[i], onOne);
        }
    },

    _loadScript: function(id, onDone) {
        var script = document.createElement('script');
        script.src = 'model/buyitems/' + id + '.js';
        script.onload = function() {
            console.log('BuyItemLoader: loaded ' + id);
            onDone();
        };
        script.onerror = function() {
            console.error('BuyItemLoader: FAILED to load ' + id + ' (' + script.src + ')');
            onDone();
        };
        document.head.appendChild(script);
    }
};
