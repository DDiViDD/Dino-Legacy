// GameHudView: shadowed-white objectives overlay (top-left of screen).

(function() {
    function GameHudView(gameState, mountEl) {
        this.gameState = gameState;

        this.el = document.createElement('div');
        this.el.className = 'objectives-hud';

        this._scoreLine = document.createElement('div');
        this._scoreLine.className = 'objectives-line';
        this._timeLine = document.createElement('div');
        this._timeLine.className = 'objectives-line';

        this.el.appendChild(this._scoreLine);
        this.el.appendChild(this._timeLine);
        mountEl.appendChild(this.el);

        var self = this;
        gameState.on('tick', function() { self._render(); });
        this._render();
    }

    GameHudView.prototype._render = function() {
        var s = Math.floor(this.gameState.score);
        this._scoreLine.innerHTML = '<span class="obj-label">Objective: Highscore</span> &mdash; ' + s.toLocaleString();

        var totalSec = Math.max(0, Math.ceil(this.gameState.timeRemainingMs / 1000));
        var min = Math.floor(totalSec / 60);
        var sec = totalSec % 60;
        var timeStr = min + ':' + (sec < 10 ? '0' + sec : sec);
        this._timeLine.innerHTML = '<span class="obj-label">Time remaining</span>: ' + timeStr;

        if (this.gameState.timeRemainingMs <= 10000) this.el.classList.add('urgent');
        else this.el.classList.remove('urgent');
    };

    window.GameHudView = GameHudView;
})();
