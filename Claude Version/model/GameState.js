// GameState: session timer + score. Subscribes to world ticks.

(function() {
    function GameState(world, durationSec) {
        this.world           = world;
        this.timeRemainingMs = durationSec * 1000;
        this.score           = 0;
        this.ended           = false;
        this._scoreAccumMs   = 0;
        this._listeners      = { tick: [], ended: [] };

        var self = this;
        world.on('tick', function(payload) { self._onWorldTick(payload.deltaMs); });
    }

    GameState.prototype.on = function(event, handler) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(handler);
    };
    GameState.prototype._emit = function(event, payload) {
        var list = this._listeners[event];
        if (!list) return;
        for (var i = 0; i < list.length; i++) list[i](payload);
    };

    GameState.prototype.countLivingDinos = function() {
        var n = 0;
        var ents = this.world.entities;
        for (var i = 0; i < ents.length; i++) {
            var e = ents[i];
            if (!e.species || e.dead) continue;
            var def = EntityRegistry.get(e.species);
            if (def && def.isLiving === false) continue;
            n++;
        }
        return n;
    };

    // Pure score-step function. Exposed for unit tests.
    GameState.scoreIncrement = function(livingDinos) {
        if (livingDinos <= 0) return 0;
        return Math.exp(livingDinos) / 100;
    };

    GameState.prototype._onWorldTick = function(deltaMs) {
        if (this.ended) return;

        this.timeRemainingMs -= deltaMs;
        this._scoreAccumMs   += deltaMs;

        while (this._scoreAccumMs >= SCORE_INTERVAL_MS && !this.ended) {
            this._scoreAccumMs -= SCORE_INTERVAL_MS;
            this.score += GameState.scoreIncrement(this.countLivingDinos());
        }

        if (this.timeRemainingMs <= 0) {
            this.timeRemainingMs = 0;
            this.ended = true;
            this.world.stop();
            this._emit('tick', this);
            this._emit('ended', { score: this.score });
            return;
        }
        this._emit('tick', this);
    };

    window.GameState = GameState;
})();
