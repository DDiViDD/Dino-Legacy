// HighscoreStore: cookie-backed read/write of top scores.

(function() {
    var COOKIE_NAME = 'dinopark_highscores';
    var MAX_ENTRIES = 10;

    function readCookie() {
        var prefix = COOKIE_NAME + '=';
        var parts = document.cookie ? document.cookie.split('; ') : [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i].indexOf(prefix) === 0) {
                try { return JSON.parse(decodeURIComponent(parts[i].substring(prefix.length))) || []; }
                catch (e) { return []; }
            }
        }
        return [];
    }

    function writeCookie(scores) {
        var enc = encodeURIComponent(JSON.stringify(scores));
        document.cookie = COOKIE_NAME + '=' + enc + '; max-age=31536000';
    }

    function getAll() { return readCookie(); }

    function add(name, score) {
        var list = readCookie();
        list.push({ name: String(name).slice(0, 20), score: Math.floor(score), ts: Date.now() });
        list.sort(function(a, b) { return b.score - a.score; });
        list = list.slice(0, MAX_ENTRIES);
        writeCookie(list);
        return list;
    }

    window.HighscoreStore = { getAll: getAll, add: add };
})();
