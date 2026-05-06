// Scheduler: a min-heap of (fireTimeMs, callback) pairs.
// Used for slow recurring work (grass growth, drops, decay) so we don't
// have to tick every tile at TICK_RATE_MS.

(function() {
    function Scheduler() {
        this._heap = [];
    }

    Scheduler.prototype.scheduleAt = function(fireTimeMs, callback) {
        var entry = { t: fireTimeMs, cb: callback };
        this._heap.push(entry);
        this._siftUp(this._heap.length - 1);
        return entry;
    };

    Scheduler.prototype.scheduleIn = function(delayMs, callback) {
        return this.scheduleAt(performance.now() + delayMs, callback);
    };

    Scheduler.prototype.runDue = function(nowMs) {
        while (this._heap.length > 0 && this._heap[0].t <= nowMs) {
            var top = this._popMin();
            try { top.cb(); }
            catch (err) { console.error('Scheduler callback failed:', err); }
        }
    };

    Scheduler.prototype.size = function() { return this._heap.length; };

    Scheduler.prototype._popMin = function() {
        var heap = this._heap;
        var top = heap[0];
        var last = heap.pop();
        if (heap.length > 0) {
            heap[0] = last;
            this._siftDown(0);
        }
        return top;
    };

    Scheduler.prototype._siftUp = function(i) {
        var heap = this._heap;
        while (i > 0) {
            var parent = (i - 1) >> 1;
            if (heap[parent].t <= heap[i].t) break;
            var tmp = heap[parent]; heap[parent] = heap[i]; heap[i] = tmp;
            i = parent;
        }
    };

    Scheduler.prototype._siftDown = function(i) {
        var heap = this._heap;
        var n = heap.length;
        while (true) {
            var l = i * 2 + 1, r = i * 2 + 2, smallest = i;
            if (l < n && heap[l].t < heap[smallest].t) smallest = l;
            if (r < n && heap[r].t < heap[smallest].t) smallest = r;
            if (smallest === i) break;
            var tmp = heap[smallest]; heap[smallest] = heap[i]; heap[i] = tmp;
            i = smallest;
        }
    };

    window.Scheduler = Scheduler;
})();
