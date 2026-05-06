// CameraController: keyboard-driven camera panning, with held-key tracking
// and √2-normalized magnitudes (orthogonal == diagonal speed).

(function() {
    function CameraController(world, options) {
        options = options || {};
        this.world      = world;
        this.panSpeed   = options.panSpeed   || 6;
        this.tickMs     = options.tickMs     || 16;
        this._pressed   = {};
        this._timer     = null;

        var self = this;
        this._onKeyDown = function(e) {
            if (!CameraController.isPanKey(e.key)) return;
            self._pressed[e.key] = true;
        };
        this._onKeyUp = function(e) { delete self._pressed[e.key]; };
        this._onBlur  = function()  { self._pressed = {}; };

        this.attach();
    }

    CameraController.isPanKey = function(k) {
        return k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown'
            || k === 'a' || k === 'A' || k === 'd' || k === 'D'
            || k === 'w' || k === 'W' || k === 's' || k === 'S';
    };

    CameraController.prototype.attach = function() {
        if (this._timer !== null) return;
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup',   this._onKeyUp);
        window.addEventListener('blur',      this._onBlur);
        var self = this;
        this._timer = setInterval(function() { self._tick(); }, this.tickMs);
    };

    CameraController.prototype.detach = function() {
        if (this._timer === null) return;
        clearInterval(this._timer);
        this._timer = null;
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup',   this._onKeyUp);
        window.removeEventListener('blur',      this._onBlur);
    };

    CameraController.prototype._tick = function() {
        var p = this._pressed;
        var ix = 0, iy = 0;
        if (p['ArrowLeft']  || p['a'] || p['A']) ix -= 1;
        if (p['ArrowRight'] || p['d'] || p['D']) ix += 1;
        if (p['ArrowUp']    || p['w'] || p['W']) iy -= 1;
        if (p['ArrowDown']  || p['s'] || p['S']) iy += 1;
        if (ix === 0 && iy === 0) return;
        var len = Math.sqrt(ix * ix + iy * iy);
        var mag = this.panSpeed * Math.SQRT2;
        this.world.moveCamera((ix / len) * mag, (iy / len) * mag);
    };

    window.CameraController = CameraController;
})();
