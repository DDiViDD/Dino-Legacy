// SpriteColorCache: returns the average RGB color of an image asset.
//
// Color sources, in priority order:
//   1. Explicit override via setOverride(url, color)
//   2. Average of solidly-opaque pixels (alpha-weighted)
//   3. Hardcoded fallback by URL substring (used when canvas is tainted)

(function() {
    var ALPHA_BODY_MIN = 200;

    var cache    = {};
    var pending  = {};
    var fallback = [
        ['GrassLevel0',     'rgb(150, 110,  70)'],
        ['GrassLevel1',     'rgb(155, 165,  90)'],
        ['GrassLevel2',     'rgb(110, 150,  80)'],
        ['GrassLevel3',     'rgb( 70, 130,  60)'],
        ['Brachiosaur',     'rgb( 90,  90,  60)'],
        ['skeleton',        'rgb(220, 220, 220)'],
        ['Coin',            'rgb(255, 215,  60)']
    ];

    function fallbackFor(url) {
        for (var i = 0; i < fallback.length; i++) {
            if (url.indexOf(fallback[i][0]) !== -1) return fallback[i][1];
        }
        return 'rgb(120,120,120)';
    }

    function flush(url, color) {
        cache[url] = color;
        var queue = pending[url] || [];
        delete pending[url];
        for (var i = 0; i < queue.length; i++) queue[i](color);
    }

    function sampleAverage(data, alphaMin) {
        var rW = 0, gW = 0, bW = 0, totalA = 0;
        for (var i = 0; i < data.length; i += 4) {
            var a = data[i + 3];
            if (a < alphaMin) continue;
            rW += data[i]     * a;
            gW += data[i + 1] * a;
            bW += data[i + 2] * a;
            totalA += a;
        }
        if (totalA === 0) return null;
        return 'rgb(' + (rW / totalA | 0) + ',' + (gW / totalA | 0) + ',' + (bW / totalA | 0) + ')';
    }

    function setOverride(url, color) { cache[url] = color; }
    function peek(url) { return cache[url] || null; }

    function get(url, callback) {
        if (cache[url]) { callback(cache[url]); return; }
        if (pending[url]) { pending[url].push(callback); return; }
        pending[url] = [callback];

        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width  = img.naturalWidth  || img.width;
            canvas.height = img.naturalHeight || img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                var color = sampleAverage(data, ALPHA_BODY_MIN);
                if (!color) color = sampleAverage(data, 16);
                if (!color) {
                    console.warn('SpriteColorCache: image had no usable pixels:', url);
                    flush(url, fallbackFor(url));
                    return;
                }
                flush(url, color);
            } catch (e) {
                console.warn('SpriteColorCache: tainted canvas, using fallback for', url);
                flush(url, fallbackFor(url));
            }
        };
        img.onerror = function() {
            console.warn('SpriteColorCache: image failed to load, using fallback for', url);
            flush(url, fallbackFor(url));
        };
        img.src = url;
    }

    window.SpriteColorCache = {
        setOverride: setOverride,
        peek: peek,
        get: get
    };
})();
