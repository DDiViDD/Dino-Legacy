// MoneyView: renders the player's coin total.

(function() {
    function MoneyView(player, mountEl) {
        this.player = player;
        this.el = document.createElement('div');
        this.el.className = 'money-box';

        this._icon = document.createElement('img');
        this._icon.src = 'assets/UI/Coin.png';
        this._icon.className = 'money-icon';
        this._icon.alt = 'coins';

        this._label = document.createElement('span');
        this._label.className = 'money-label';

        this.el.appendChild(this._icon);
        this.el.appendChild(this._label);
        mountEl.appendChild(this.el);

        var self = this;
        this.player.on('coinsChanged', function() { self._render(); });
        this._render();
    }

    MoneyView.prototype._render = function() {
        this._label.textContent = this.player.coins;
    };

    window.MoneyView = MoneyView;
})();
