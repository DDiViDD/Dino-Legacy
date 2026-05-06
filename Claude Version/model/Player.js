// Player: holds the human player's state. Currently just coins.

(function() {
    function Player(startingCoins) {
        this.coins = startingCoins !== undefined ? startingCoins : 500;
        this._listeners = { coinsChanged: [] };
    }

    Player.prototype.on = function(event, handler) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(handler);
    };

    Player.prototype._emit = function(event, payload) {
        var list = this._listeners[event];
        if (!list) return;
        for (var i = 0; i < list.length; i++) list[i](payload);
    };

    Player.prototype.canAfford = function(cost) { return this.coins >= cost; };

    Player.prototype.spend = function(cost) {
        if (this.coins < cost) return false;
        this.coins -= cost;
        this._emit('coinsChanged', this.coins);
        return true;
    };

    Player.prototype.earn = function(amount) {
        this.coins += amount;
        this._emit('coinsChanged', this.coins);
    };

    window.Player = Player;
})();
